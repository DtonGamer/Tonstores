import { useState } from "react";
import { Button } from "@/components/ui/button";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

interface VerificationEmailButtonProps {
  email: string;
  variant?: "link" | "outline" | "default";
  size?: "sm" | "default";
}

export function VerificationEmailButton({ 
  email, 
  variant = "link",
  size = "default"
}: VerificationEmailButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const result = await emailService.sendVerificationEmail(email);
      
      if (result.success) {
        toast.success("Verification email sent! Please check your inbox");
      } else {
        toast.error(result.error || "Failed to send verification email");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      type="button"
      onClick={handleResendEmail}
      disabled={isLoading || !email.trim()}
      className="flex items-center gap-1.5"
    >
      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
      <span>Resend verification email</span>
    </Button>
  );
} 