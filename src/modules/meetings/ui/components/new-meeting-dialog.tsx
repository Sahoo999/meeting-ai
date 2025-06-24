import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { useRouter } from "next/navigation";


interface NewMeetingDialog {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const NewMeetingDialog = ({
    open,
    onOpenChange,
}: NewMeetingDialog)=> {
    const router = useRouter();


    return (
        <ResponsiveDialog
        title="New Meeting"
        description="create a new meeting"
        open={open}
    onOpenChange={onOpenChange}
        >
           <MeetingForm
           onSuccess={(id) => {
            onOpenChange(false);
            router.push(`/meetings/${id}`);
           }}
           onCancel={() => onOpenChange}
           />
        </ResponsiveDialog>
    );
}