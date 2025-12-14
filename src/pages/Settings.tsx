import { useState, useEffect, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import useAuth from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Save,
  Camera,
  Upload,
  X,
  Info,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Key,
  Link,
  Percent,
  Copy,
  Download,
} from "lucide-react";
import PaymentSettings from "@/components/payment/PaymentSettings";
import { VerificationEmailButton } from "@/components/auth/VerificationEmailButton";
import CustomerExportForm from "@/components/export/CustomerExportForm";

// TikTok icon component
const TikTokIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
    <path d="M15 8h.01"></path>
    <path d="M15 2v10a4 4 0 0 1-4 4H9"></path>
    <path d="M4 16v-2a2 2 0 0 1 2-2h10"></path>
  </svg>
);

const Settings = () => {
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    uploadAvatar,
    isUploading,
    uploadProgress,
  } = useProfile();
  const { user } = useAuth();

  // Profile form state
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Contact methods state
  const [emailSupport, setEmailSupport] = useState("");
  const [whatsappSupport, setWhatsappSupport] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [facebookHandle, setFacebookHandle] = useState("");
  const [tikTokHandle, setTikTokHandle] = useState("");
  const [isSavingContacts, setIsSavingContacts] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || "");
      setBusinessAddress(profile.business_address || "");
      setPhoneNumber(profile.phone_number || "");
      setBusinessDescription(profile.business_description || "");
      setEmailSupport(profile.email_support || "");
      setWhatsappSupport(profile.whatsapp_support || "");
      setTwitterHandle(profile.twitter_handle || "");
      setInstagramHandle(profile.instagram_handle || "");
      setFacebookHandle(profile.facebook_handle || "");
      setTikTokHandle(profile.tiktok_handle || "");
    }
    if (user) {
      setIsEmailVerified(!!user.email_confirmed_at);
    }
  }, [profile, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    try {
      setIsSaving(true);
      await updateProfile({
        business_name: businessName,
        business_address: businessAddress,
        phone_number: phoneNumber,
        business_description: businessDescription,
      });
      toast({
        title: "Settings updated",
        description: "Your profile settings have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update settings. " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContactMethodsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    try {
      setIsSavingContacts(true);
      await updateProfile({
        email_support: emailSupport,
        whatsapp_support: whatsappSupport,
        twitter_handle: twitterHandle,
        instagram_handle: instagramHandle,
        facebook_handle: facebookHandle,
        tiktok_handle: tikTokHandle,
      });
      toast({
        title: "Contact methods updated",
        description: "Your contact methods have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update contact methods. " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingContacts(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const cancelFileSelection = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadAvatar(selectedFile);
      setSelectedFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const getInitials = () => {
    if (!profile?.business_name) return "TS";
    return profile.business_name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-Tonstores-green" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
        </TabsList>

        {/* PROFILE */}
        <TabsContent value="profile">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Avatar column */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload a photo for your business profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
  <div className="relative mb-4 group">
    <Avatar className="h-32 w-32 border-2 border-gray-200">
      {avatarPreview ? (
        <AvatarImage src={avatarPreview} />
      ) : (
        <>
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="text-2xl bg-Tonstores-green text-white">
            {getInitials()}
          </AvatarFallback>
        </>
      )}
    </Avatar>

                  <button 
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-Tonstores-darkblue text-white flex items-center justify-center shadow-md"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    <Camera size={16} />
                  </button>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {selectedFile && (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate max-w-[150px]">
                        {selectedFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={cancelFileSelection}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    
                    <Button 
                      type="button" 
                      size="sm"
                      className="w-full flex items-center justify-center"
                      onClick={handleAvatarUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                    
                    {isUploading && (
                      <Progress value={uploadProgress} className="h-2 w-full" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business info column */}
            <Card className="md:col-span-2">
              <form onSubmit={handleProfileSubmit}>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your business details visible to your customers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* ...business form inputs... */}
 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your Business Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Your Phone Number"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input
                      id="businessAddress"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Your Business Address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessDescription">Business Description</Label>
                    <Textarea
                      id="businessDescription"
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Describe your business"
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isSaving || !businessName.trim()}
                    className="flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>

        {/* ACCOUNT */}
        <TabsContent value="account">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Account info */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and login information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ...email & password info... */}
 <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">Your email address cannot be changed.</p>
                    {!isEmailVerified && user?.email && (
                      <div className="flex items-center">
                        <span className="text-xs text-amber-600 mr-2">Not verified</span>
                        <VerificationEmailButton 
                          email={user.email}
                          variant="outline" 
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                
                
                <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Password Management</h4>
                    <p className="text-xs text-blue-600 mt-1">
                      To reset your password, please log out and use the "Forgot Password" option on the login page.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0"></CardFooter>
            </Card>

            {/* Contact methods */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Contact Methods</CardTitle>
                <CardDescription>
                  Configure your contact details that will be shown to customers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleContactMethodsSubmit}
                  className="space-y-4"
                >
                  {/* ...contact form inputs... */}
<Label htmlFor="emailSupport" className="flex items-center gap-2">
                        <Mail size={16} />
                        Support Email
                      </Label>
                      <Input
                        id="emailSupport"
                        type="email"
                        value={emailSupport}
                        onChange={(e) => setEmailSupport(e.target.value)}
                        placeholder="support@yourbusiness.com"
                      />
                    
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsappSupport" className="flex items-center gap-2">
                        <Phone size={16} />
                        WhatsApp Support
                      </Label>
                      <Input
                        id="whatsappSupport"
                        value={whatsappSupport}
                        onChange={(e) => setWhatsappSupport(e.target.value)}
                        placeholder="+2347012345678"
                      />
                      <p className="text-xs text-gray-500">Include country code (e.g., +234 for Nigeria)</p>
                    </div>
                 
                  
                  <div className="space-y-2">
                    <Label className="block mb-2">Social Media Handles</Label>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Twitter className="h-5 w-5 text-blue-500 mr-2" />
                        <Input
                          value={twitterHandle}
                          onChange={(e) => setTwitterHandle(e.target.value)}
                          placeholder="Twitter handle or URL"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <Instagram className="h-5 w-5 text-pink-500 mr-2" />
                        <Input
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          placeholder="Instagram handle or URL"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                        <Input
                          value={facebookHandle}
                          onChange={(e) => setFacebookHandle(e.target.value)}
                          placeholder="Facebook page URL"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <TikTokIcon className="h-5 w-5 text-gray-800 dark:text-gray-200 mr-2" />
                        <Input
                          value={tikTokHandle}
                          onChange={(e) => setTikTokHandle(e.target.value)}
                          placeholder="TikTok handle or URL"
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={isSavingContacts}>
                    {isSavingContacts ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>Save Contact Methods</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      {/* PAYMENT */}
<TabsContent value="payment">
  <div className="grid md:grid-cols-2 gap-6">
    {/* PaymentSettings in first column */}
    <div className="md:col-span-1 space-y-6">
      <PaymentSettings />
    </div>

    {/* Payment gateway in second column */}
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>Payment Gateway</CardTitle>
        <CardDescription>
          Configure your payment gateway settings for processing transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">

          {/* Processing Fee */}
          <div className="space-y-2">
            <Label htmlFor="processingFee" className="flex items-center gap-2">
              <Percent size={16} />
              Processing Fee
            </Label>
            <Input
              id="processingFee"
              type="text"
              value="1.5%"
              readOnly
            />
            <p className="text-xs text-gray-500">
              Standard processing fee for all transactions.
            </p>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                Payment Integration
              </h4>
              <p className="text-xs text-blue-600 mt-1">
                Your payment gateway is powered by Monnify. To change advanced settings,
                please contact support.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</TabsContent>

        {/* DATA EXPORT */}
        <TabsContent value="export">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Export Customer Data</h3>
              <p className="text-sm text-muted-foreground">
                Download your customer information for record-keeping or analytics
              </p>
            </div>

            <CustomerExportForm
              onExportStart={() => console.log("Export started")}
              onExportComplete={() => {
                console.log("Export completed");
                toast({
                  title: "Export completed",
                  description: "Your customer data has been exported successfully.",
                });
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
