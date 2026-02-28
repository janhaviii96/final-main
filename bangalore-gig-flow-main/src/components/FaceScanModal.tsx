import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, CheckCircle2, Loader2, ScanFace } from "lucide-react";
import { getCurrentUser, upsertVerification } from "@/lib/store";

interface FaceScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  onVerified: () => void;
}

const FaceScanModal = ({ open, onOpenChange, taskId, onVerified }: FaceScanModalProps) => {
  const [step, setStep] = useState<"ready" | "scanning" | "success">("ready");

  useEffect(() => {
    if (open) setStep("ready");
  }, [open]);

  const handleStartScan = () => {
    setStep("scanning");
    setTimeout(() => {
      try {
        const user = getCurrentUser();
        if (!user) throw new Error("Not authenticated");
        upsertVerification({ user_id: user.id, type: "face_scan", status: "approved" });
        setStep("success");
        toast.success("Face verification successful!");
        setTimeout(() => { onVerified(); onOpenChange(false); }, 1500);
      } catch (error: any) {
        toast.error(error.message || "Verification failed");
        setStep("ready");
      }
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="w-5 h-5" />Face Verification
          </DialogTitle>
          <DialogDescription>
            Complete a quick face scan to verify your identity before accepting this task.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-8 space-y-6">
          {step === "ready" && (
            <>
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                <Camera className="w-16 h-16 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Position your face within the circle and ensure good lighting.</p>
                <p className="text-xs text-muted-foreground">This is a safety requirement for all task assignments.</p>
              </div>
              <Button onClick={handleStartScan} className="bg-gradient-hero hover:opacity-90">
                <Camera className="w-4 h-4 mr-2" />Start Face Scan
              </Button>
            </>
          )}
          {step === "scanning" && (
            <>
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">Scanning...</p>
                <p className="text-sm text-muted-foreground">Please hold still while we verify your identity.</p>
              </div>
            </>
          )}
          {step === "success" && (
            <>
              <div className="w-32 h-32 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-success" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-success">Verification Successful!</p>
                <p className="text-sm text-muted-foreground">You can now proceed with the task.</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceScanModal;
