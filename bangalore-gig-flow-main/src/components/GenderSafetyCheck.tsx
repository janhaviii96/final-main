import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

interface GenderSafetyCheckProps {
  taskerGender?: string;
  helperGender?: string;
  isBlocked: boolean;
}

const GenderSafetyCheck = ({ taskerGender, helperGender, isBlocked }: GenderSafetyCheckProps) => {
  if (!isBlocked) return null;

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Safety Restriction Active
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          For safety reasons, opposite-gender task assignments are restricted after 7:00 PM local time.
        </p>
        <p className="text-xs opacity-80">
          This policy helps ensure the safety of both Taskers and Helpers during evening hours.
          An admin can override this restriction if necessary.
        </p>
      </AlertDescription>
    </Alert>
  );
};

// Utility function to check if gender safety rule applies
export const checkGenderSafetyRule = (
  taskerGender?: string | null,
  helperGender?: string | null
): boolean => {
  if (!taskerGender || !helperGender) return false;

  const now = new Date();
  const hour = now.getHours();

  // After 7 PM (19:00)
  if (hour >= 19 || hour < 6) {
    // Check if opposite gender
    const isOppositeGender =
      (taskerGender === "male" && helperGender === "female") ||
      (taskerGender === "female" && helperGender === "male");

    return isOppositeGender;
  }

  return false;
};

export default GenderSafetyCheck;
