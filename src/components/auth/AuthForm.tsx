import { useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import useAuth from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Turnstile } from '@marsidev/react-turnstile';
import { TURNSTILE_SITE_KEY } from "@/utils/env";
import { AffiliateService } from "@/services/AffiliateService";
import { handleChange } from "@/utils/formUtils";

type AuthFormProps = {
  type: "login" | "register";
};

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const location = useLocation();
  const turnstileRef = useRef<any>(null);

  const resetCaptcha = () => {
    if (turnstileRef.current?.reset) {
      turnstileRef.current.reset();
      setCaptchaToken(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form fields
      if (!email || !password) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!captchaToken) {
        toast({
          title: "Verification Required",
          description: "Please complete the security verification",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (type === "login") {
        try {
          await signIn(email, password, captchaToken);
          
          // Get redirect path from location state or sessionStorage, or default to dashboard
          const from = 
            location.state?.from || 
            sessionStorage.getItem("redirectAfterLogin") || 
            "/dashboard";
            
          // Clear the redirect path from sessionStorage
          sessionStorage.removeItem("redirectAfterLogin");
          
          // Navigate to the redirect path
          navigate(from, { replace: true });
        } catch (error) {
          // Error is already handled in the AuthContext
          // Reset captcha on error
          resetCaptcha();
        }
      } else {
        // For registration
        if (!businessName) {
          toast({
            title: "Missing Information",
            description: "Please provide your business name",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        try {
          await signUp(email, password, businessName, captchaToken);
          // Navigation to dashboard is handled in the AuthContext after signup
        } catch (error) {
          // Error is already handled in the AuthContext
          // Reset captcha on error
          resetCaptcha();
        }
      }
    } catch (error: any) {
      // This is a fallback for any unhandled errors
      toast({
        title: "Authentication Error",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive",
      });
      // Reset captcha on error
      resetCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md px-4">
      <div className="mb-4 sm:mb-6 flex items-center">
        <Link to="/" className="flex items-center text-Tonstores-darkblue hover:text-Tonstores-green transition-colors text-sm sm:text-base">
          <ArrowLeft className="mr-1 sm:mr-2" size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
      <Card className="w-full shadow-md bg-white">
        <CardHeader className="px-5 sm:px-6 py-5 sm:py-6">
          <CardTitle className="text-xl sm:text-2xl text-center text-black">
          {type === "login" ? "Login to Your Account" : "Create Your Store Account"}
        </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base mt-1 sm:mt-2 text-gray-600">
          {type === "login" 
            ? "Enter your credentials to access your dashboard" 
            : "Sign up to start creating your product catalog"}
        </CardDescription>
      </CardHeader>
        <CardContent className="px-5 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {type === "register" && (
            <>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="businessName" className="text-sm text-black">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="h-9 sm:h-10 text-sm sm:text-base bg-white text-black"
                />
              </div>
            </>
          )}

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-sm text-black">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 sm:h-10 text-sm sm:text-base bg-white text-black"
            />
          </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-sm text-black">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 sm:h-10 text-sm sm:text-base bg-white text-black"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={togglePasswordVisibility}
              >
                  {showPassword ? <EyeOff size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
              </button>
            </div>
          </div>

          {type === "register" && (
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="referralCode" className="text-sm text-black">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                type="text"
                placeholder="Enter referral code (if any)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-9 sm:h-10 text-sm sm:text-base bg-white text-black"
              />
              <p className="text-xs text-gray-500">If someone referred you to Tonstores, enter their referral code here</p>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <div className="w-full min-h-[65px] flex items-center justify-center border border-gray-200 rounded-md p-2 bg-white">
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                options={{
                  refreshExpired: "auto",
                  theme: "light",
                  size: "normal"
                }}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                }}
                onError={() => {
                  setCaptchaToken(null);
                  toast({
                    title: "Verification Error",
                    description: "Security verification failed. Please refresh and try again.",
                    variant: "destructive",
                  });
                }}
                onExpire={() => {
                  setCaptchaToken(null);
                  resetCaptcha();
                }}
              />
            </div>
          </div>
          
            <div className="pt-2 sm:pt-3">
          <Button
            type="submit"
            className="w-full bg-Tonstores-green hover:bg-Tonstores-darkblue transition-colors h-9 sm:h-10 text-sm sm:text-base"
            disabled={isLoading || !captchaToken}
          >
            {isLoading ? "Processing..." : type === "login" ? "Login" : "Create Account"}
          </Button>
            </div>

            {type === "login" && (
              <div className="pt-3 text-center">
                <Link to="/auth/recovery" className="text-sm text-Tonstores-blue hover:underline">
                  Forgot your password?
                </Link>
              </div>
            )}
        </form>
      </CardContent>
        <CardFooter className="flex justify-center px-5 sm:px-6 py-4 sm:py-5 border-t">
          <p className="text-xs sm:text-sm text-gray-500">
          {type === "login" ? (
            <>
                Don't have an account? <Link to="/register" className="text-Tonstores-blue hover:underline font-medium">Sign up</Link>
            </>
          ) : (
            <>
                Already have an account? <Link to="/login" className="text-Tonstores-blue hover:underline font-medium">Login</Link>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
    </div>
  );
};

export default AuthForm;
