import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import {
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
} from "@stream-io/node-sdk";
import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

function verifySignatureWithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json(
            { error: "missing signature or api key" },
            { status: 400 }
        );
    }

    const body = await req.text();

    if (!verifySignatureWithSDK(body, signature)) {
        return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
    }

    const eventType = (payload as Record<string, unknown>)?.type;

    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }

        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id, meetingId),
                    not(eq(meetings.status, "completed")),
                    not(eq(meetings.status, "active")),
                    not(eq(meetings.status, "cancelled")),
                    not(eq(meetings.status, "processing")),
                )
            );

        if (!existingMeeting) {
            return NextResponse.json({ error: "MEETING NOT FOUND" }, { status: 404 });
        }

        await db
            .update(meetings)
            .set({
                status: "active",
                startedAt: new Date(),
            })
            .where(eq(meetings.id, existingMeeting.id));

        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, existingMeeting.agentId));

        if (!existingAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 400 });
        }

        // Validate OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is not configured");
            return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
        }

        const call = streamVideo.video.call("default", meetingId);

        // FIX: Add proper error handling for WebSocket connection
        try {
            console.log("Attempting to connect OpenAI agent for meeting:", meetingId);
            
            const realtimeClient = await streamVideo.video.connectOpenAi({
                call,
                openAiApiKey: process.env.OPENAI_API_KEY!,
                agentUserId: existingAgent.id,
            });

            // Update session with agent instructions
            if (existingAgent.instructions) {
                await realtimeClient.updateSession({
                    instructions: existingAgent.instructions,
                });
            }

            console.log("OpenAI agent connected successfully");

        } catch (error) {
            console.error("Failed to connect OpenAI agent:", error);
            
            // Update meeting status to indicate failure
            await db
                .update(meetings)
                .set({
                    status: "cancelled",
                })
                .where(eq(meetings.id, existingMeeting.id));

            return NextResponse.json(
                { error: "Failed to connect AI agent" },
                { status: 500 }
            );
        }

    } else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }

        // Update meeting status to completed
        await db
            .update(meetings)
            .set({
                status: "completed",
                endedAt: new Date(),
            })
            .where(eq(meetings.id, meetingId));

        const call = streamVideo.video.call("default", meetingId);
        await call.end();
    }

    return NextResponse.json({ status: "ok" });
}