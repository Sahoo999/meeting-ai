import { Button } from "@/components/ui/button";
import { MAX_FREE_AGENTS, MAX_FREE_MEETINGS } from "@/modules/premium/constants";
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query";
import { RocketIcon } from "lucide-react";
import Link from "next/link";


export const DashboardTrail = () => {
    const trpc = useTRPC();
    const { data, isLoading, error } = useQuery(trpc.premium.getFreeUsage.queryOptions());

    if (isLoading) {
        return (
            <div className="border border-border/10 rounded-lg w-full bg-white/5 flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="border border-border/10 rounded-lg w-full bg-white/5 flex items-center justify-center p-8">
                <p className="text-sm text-red-500">Failed to load usage data</p>
            </div>
        );
    }

    const agentProgress = (data.agentCount / MAX_FREE_AGENTS) * 100;
    const meetingProgress = (data.meetingCount / MAX_FREE_MEETINGS) * 100;

    return (
        <div className="border border-border/10 rounded-lg w-full bg-white/5 flex flex-col gap-y-2">
            <div className="p-3 flex flex-col gap-y-4">
                <div className="flex items-center gap-2">
                    <RocketIcon className="size-4" />
                    <p className="text-sm font-medium">Free Trial</p>
                </div>
                <div className="flex flex-col gap-y-2">
                    <p className="text-xs">
                        {data.agentCount}/{MAX_FREE_AGENTS} Agents
                    </p>
                    <progress 
                        value={agentProgress} 
                        max={100}
                        className="w-full h-2"
                    />
                </div>
                <div className="flex flex-col gap-y-2">
                    <p className="text-xs">
                        {data.meetingCount}/{MAX_FREE_MEETINGS} Meetings
                    </p>
                    <progress 
                        value={meetingProgress} 
                        max={100}
                        className="w-full h-2"
                    />
                </div>
            </div>
            <Button
                className="bg-transparent border-t border-border/10 hover:bg-white/10 rounded-t-none"
                asChild
            >
                <Link href="/upgrade">
                    Upgrade
                </Link>
            </Button>
        </div>
    );
};