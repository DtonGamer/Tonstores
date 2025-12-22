import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import useForceLightMode from "@/hooks/useForceLightMode";

const TermsOfService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use the custom hook to force light mode for logged-out users
  useForceLightMode();

  // Dynamic text classes based on user login state
  const textClasses = user ? {
    heading: "text-foreground",
    subheading: "text-foreground",
    text: "text-muted-foreground",
    prose: "prose prose-blue max-w-none dark:prose-invert"
  } : {
    heading: "text-Tonstores-darkblue",
    subheading: "text-Tonstores-darkblue", 
    text: "text-gray-600",
    prose: "prose prose-blue max-w-none"
  };
  
  // Set container class based on login status
  const containerClass = user ? 
    "min-h-screen flex flex-col" : 
    "min-h-screen flex flex-col bg-white";
  
  return (
    <div className={containerClass}>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
        {user && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </Button>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto">
          <h1 className={`text-3xl font-bold ${textClasses.heading} mb-8`}>Terms of Service</h1>
          
          <div className={textClasses.prose}>
            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>1. Acceptance of Terms</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                By accessing and using Tonstores, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>2. Description of Service</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                Tonstores provides a platform for creating and managing digital catalogs and
                processing orders. We reserve the right to modify, suspend, or discontinue any
                aspect of the service at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>3. User Responsibilities</h2>
              <ul className={`list-disc pl-6 ${textClasses.text} space-y-2`}>
                <li>Maintain accurate and up-to-date account information</li>
                <li>Protect account credentials and maintain security</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in any fraudulent or harmful activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>4. Content Guidelines</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                Users are responsible for all content they upload and must ensure it:
              </p>
              <ul className={`list-disc pl-6 ${textClasses.text} space-y-2`}>
                <li>Does not infringe on intellectual property rights</li>
                <li>Is not illegal, harmful, or offensive</li>
                <li>Does not contain malware or viruses</li>
                <li>Complies with our content policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>5. Payment Terms</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                Users agree to pay all applicable fees and charges for using our services.
                All payments are non-refundable unless otherwise specified in our refund policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>6. Limitation of Liability</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                Tonstores shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>7. Termination</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                We reserve the right to terminate or suspend access to our service immediately,
                without prior notice or liability, for any reason whatsoever.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>8. Changes to Terms</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                We reserve the right to modify these terms at any time. We will notify users
                of any changes by posting the new terms on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>9. Contact Information</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                For any questions about these Terms, please contact us at:
              </p>
              <ul className={`list-disc pl-6 ${textClasses.text} space-y-2`}>
                <li>Email: tonshopdev@proton.me</li>
                <li>Phone: +2349038650178</li>
              </ul>
            </section>

            <div className={`text-sm mt-8 ${textClasses.text}`}>
              Last Updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;