import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FriendlyErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  network: "Network error. Please check your internet connection and try again.",
  timeout: "Request timed out. Please try again.",
  subaccount: "Failed to create payment account. Please verify your details and try again.",
  verification: "Verification failed. Please check your details and try again.",
  'account not found': "Account not found. Please verify your bank details.",
  invalid: "Invalid input. Please check your details.",
  required: "Required field is missing. Please fill in all required fields.",
  duplicate: "This item already exists. Please try a different value.",
  'already exists': "This item already exists. Please try a different value.",
  unauthorized: "You don't have permission to perform this action.",
  forbidden: "Access denied. Please contact support if you believe this is an error.",
  'not found': "The requested resource was not found.",
  server: "Server error. Please try again later or contact support.",
};

export function FriendlyError({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try again",
  className = ""
}: FriendlyErrorProps) {
  const getFriendlyMessage = (error: string): string => {
    const lowerError = error.toLowerCase();
    
    // Check for known error patterns
    for (const [key, friendlyMsg] of Object.entries(ERROR_MESSAGES)) {
      if (lowerError.includes(key)) {
        return friendlyMsg;
      }
    }
    
    // Return original message if no pattern matches
    return error;
  };

  const friendlyMessage = getFriendlyMessage(message);

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{friendlyMessage}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            {retryText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default FriendlyError;