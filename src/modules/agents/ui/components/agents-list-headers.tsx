 "use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { NewAgentDialog } from "./new-agent-dialog";
import { useState } from "react";

export const AgentsListHeaders = ()=> {
    const [iSDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
        <NewAgentDialog open={iSDialogOpen} onOpenChange={setIsDialogOpen}/>
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
           <div className="flex items-center justify-between">
            <h5 className="font-medium text-xl">my agents</h5>
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusIcon/>
                new agent
            </Button>
           </div>
        </div>
        </>
    );
};