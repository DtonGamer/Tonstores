import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import useForceLightMode from "@/hooks/useForceLightMode";

const PrivacyPolicy = () => {
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
          <h1 className={`text-3xl font-bold ${textClasses.heading} mb-8`}>Privacy Policy</h1>
          
          <div className={textClasses.prose}>
            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>Introduction</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                At Tonstores, we take your privacy seriously. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>Information We Collect</h2>
              <ul className={`list-disc pl-6 ${textClasses.text} space-y-2`}>
                <li>Personal identification information (Name, email address, phone number)</li>
                <li>Business information</li>
                <li>Payment information</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>How We Use Your Information</h2>
              <ul className={`list-disc pl-6 ${textClasses.text} space-y-2`}>
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>Data Security</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                We implement appropriate technical and organizational security measures to protect
                your personal information. However, please note that no method of transmission over
                the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>Third-Party Services</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                We may employ third-party companies and individuals to facilitate our service,
                provide service-related services, or assist us in analyzing how our service is used.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>Changes to This Policy</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the
                "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${textClasses.subheading}`}>Contact Us</h2>
              <p className={`mb-4 ${textClasses.text}`}>
                If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy; 