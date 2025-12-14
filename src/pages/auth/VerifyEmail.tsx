import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { VerificationEmailButton } from "@/components/auth/VerificationEmailButton";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyEmail = async () => {
      // Get the URL fragment containing the token
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const type = hashParams.get("type");
      const token = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const email = hashParams.get("email") || "";
      
      setEmail(email);
      
      if (!token) {
        setStatus("error");
        setErrorMessage("Verification token is missing. Please try again or request a new verification email.");
        return;
      }
      
      try {
        // Set session from the tokens in the URL
        if (token && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refreshToken,
          });
          
          if (error) throw error;
        }
        
        // For direct OTP verification (if needed)
        if (type === "signup" && token) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          });
          
          if (error) throw error;
        }
        
        setStatus("success");
        
        // Redirect to dashboard after a brief delay to show success message
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } catch (error: any) {
        console.error("Email verification error:", error);
        setStatus("error");
        setErrorMessage(error.message || "Failed to verify your email. Please try again.");
      }
    };
    
    verifyEmail();
  }, [location.hash, navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center p-6">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-Tonstores-green animate-spin" />
              <p className="text-lg font-medium">Verifying your email...</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <p className="text-lg font-medium">Email verified successfully!</p>
                <p className="text-gray-500">You will be redirected to the dashboard shortly.</p>
              </div>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <p className="text-lg font-medium text-red-700">Verification failed</p>
                <p className="text-gray-600">{errorMessage}</p>
                {email && (
                  <div className="mt-4">
                    <VerificationEmailButton email={email} variant="default" />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {status !== "loading" && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth/login")}
            >
              Return to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 