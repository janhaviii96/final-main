import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PoliceVerificationTagProps {
  status: "pending" | "approved" | "rejected" | "none";
  compact?: boolean;
}

const PoliceVerificationTag = ({ status, compact = false }: PoliceVerificationTagProps) => {
  const isVerified = status === "approved";
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`gap-1 ${
        isVerified 
          ? "bg-success/10 text-success border-success/30" 
          : "bg-amber-500/10 text-amber-600 border-amber-500/30"
      }`}
    >
      {isVerified ? (
        <ShieldCheck className="w-3 h-3" />
      ) : (
        <ShieldAlert className="w-3 h-3" />
      )}
      {!compact && (
        <span className="text-xs">
          {isVerified ? "Police Verified" : "Unverified"}
        </span>
      )}
    </Badge>
  );

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>{isVerified ? "Police Verification Complete" : "Police Verification Pending"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};

export default PoliceVerificationTag;
