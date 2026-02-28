import { BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const VerifiedBadge = ({ 
  isVerified, 
  size = "md", 
  showTooltip = true,
  className 
}: VerifiedBadgeProps) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const badge = (
    <BadgeCheck 
      className={cn(
        "text-blue-500 fill-blue-500/20 shrink-0",
        sizeClasses[size],
        className
      )} 
    />
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">{badge}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">Identity Verified</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;
