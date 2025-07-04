import { StreamTheme, useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useState, useEffect } from "react";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { Callended } from "./call-endded";

interface Props {
    meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
    const call = useCall();
    const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
    const callEndedAt = useCallEndedAt();
    const callStartsAt = useCallStartsAt();
    
    const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle call state changes
    useEffect(() => {
        if (callEndedAt) {
            setShow("ended");
        }
    }, [callEndedAt]);

    const handleJoin = async () => {
        if (!call || isJoining) return;

        setIsJoining(true);
        setError(null);

        try {
            // Check if call exists, if not create it
            const callExists = await call.get();
            if (!callExists) {
                await call.getOrCreate();
            }
            
            // Join the call
            await call.join();
            
            setShow("call");
        } catch (error) {
            console.error("Failed to join call:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to join call";
            setError(errorMessage);
        } finally {
            setIsJoining(false);
        }
    };

   const handleLeave = async () => {
        if (!call) return;

        try {
            // Only leave if we're actually in the call
            if (call.state.callingState === 'joined') {
                await call.leave();
            }
            await call.endCall();
            setShow("ended");
        } catch (error) {
            console.error("Failed to leave call:", error);
            // Always show ended state even if there's an error
            setShow("ended");
        }
    };

    // Handle case where call is not available
    if (!call) {
        return (
            <StreamTheme className="h-full">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Loading call...</h2>
                        <p className="text-gray-600">Please wait while we prepare your meeting.</p>
                    </div>
                </div>
            </StreamTheme>
        );
    }

    return (
        <StreamTheme className="h-full">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        className="float-right font-bold text-red-700 hover:text-red-900"
                    >
                        ×
                    </button>
                </div>
            )}
            
            {show === "lobby" && (
                <CallLobby 
                    onJoin={handleJoin} 
                />
            )}
            
            {show === "call" && (
                <CallActive 
                    onLeave={handleLeave} 
                    meetingName={meetingName}
                />
            )}
            
            {show === "ended" && <Callended />}
        </StreamTheme>
    );
};