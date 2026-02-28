import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface VerificationBadgeProps {
  type: "aadhaar" | "pan" | "police" | "face_scan";
  status: "pending" | "approved" | "rejected" | "none";
  showLabel?: boolean;
}

const VerificationBadge = ({ type, status, showLabel = true }: VerificationBadgeProps) => {
  const labels: Record<string, string> = {
    aadhaar: "Aadhaar",
    pan: "PAN",
    police: "Police Check",
    face_scan: "Face Verified",
  };

  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          icon: ShieldCheck,
          className: "bg-success/10 text-success border-success/20",
          text: "Verified",
        };
      case "pending":
        return {
          icon: Shield,
          className: "bg-secondary/10 text-secondary border-secondary/20",
          text: "Pending",
        };
      case "rejected":
        return {
          icon: ShieldX,
          className: "bg-destructive/10 text-destructive border-destructive/20",
          text: "Rejected",
        };
      default:
        return {
          icon: ShieldAlert,
          className: "bg-muted text-muted-foreground border-muted",
          text: "Not Submitted",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      <Icon className="w-3 h-3" />
      {showLabel && <span>{labels[type]}</span>}
      <span className="opacity-75">• {config.text}</span>
    </Badge>
  );
};

export default VerificationBadge;
