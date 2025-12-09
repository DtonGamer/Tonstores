import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { monnifyApi } from '@/services/monnifyApi';
import { useEventTracker } from '@/hooks/useEventTracker';
import { paymentConfig } from '@/lib/config';

// Define bank interface
interface Bank {
  id: string;
  code: string;
  name: string;
}

// Define form schema with proper validation
const formSchema = z.object({
  bankName: z.string().min(1, { message: "Please select a bank" }),
  accountNumber: z
    .string()
    .min(10, { message: "Account number must be at least 10 digits" })
    .max(10, { message: "Account number must not exceed 10 digits" })
    .regex(/^\d+$/, { message: "Account number must contain only digits" }),
  accountName: z.string().min(2, { message: "Please enter account name" }),
  // Updated to only allow BVN as ID type
  idType: z.literal("BVN"),
  // Updated to enforce 11-digit numeric BVN
  idNumber: z
    .string()
    .length(11, { message: "BVN must be exactly 11 digits" })
    .regex(/^\d+$/, { message: "BVN must contain only digits" })
});

export default function KYCForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const { trackKYCEvent, trackButtonClick, trackFormSubmit, trackError } = useEventTracker();

  // Use form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      idType: "BVN",
      idNumber: ""
    }
  });

  // Track when KYC form is viewed
  useEffect(() => {
    if (profile?.id) {
      trackKYCEvent('kyc_form_viewed', {
        profile_id: profile.id,
        kyc_status: profile.kyc_verified ? 'verified' : 'not_verified'
      }).catch(console.error);
    }
  }, [profile?.id, profile?.kyc_verified]);

  // Watch bank code and account number to verify account
  const bankCode = form.watch("bankName");
  const accountNumber = form.watch("accountNumber");

  // Effect to verify account when both bank and account number are entered
  useEffect(() => {
    // Only proceed if both fields have valid values
    if (bankCode && accountNumber && accountNumber.length === 10) {
      verifyBankAccount(bankCode, accountNumber);
    }
  }, [bankCode, accountNumber]);

  // Function to verify bank account and get account name
  const verifyBankAccount = async (bankCode: string, accountNumber: string) => {
    // Don't verify if we're already verifying or submitting
    if (isVerifyingAccount || isSubmitting) return;

    setIsVerifyingAccount(true);
    try {
      // console.log(`Verifying account: ${accountNumber} with bank code: ${bankCode}`);

      const result = await monnifyApi.verifyAccount({
        account_number: accountNumber,
        bank_code: bankCode,
        dev_mode: import.meta.env.MODE === 'development' || import.meta.env.DEV_MODE === 'true'
      });

      // console.log("Account verification result:", result);

      // Correctly handle the response structure
      if (result && result.status === true && result.data && result.data.accountName) {
        // Update the account name field with the verified name
        form.setValue("accountName", result.data.accountName);
        toast({
          title: "Account Verified",
          description: `Account name: ${result.data.accountName}`,
        });
      } else if (result && result.accountName) {
        // Handle response format if present
        form.setValue("accountName", result.accountName);
        toast({
          title: "Account Verified",
          description: `Account name: ${result.accountName}`,
        });
      } else {
        // If API response doesn't have the expected structure
        console.warn("Unexpected response structure:", result);
        toast({
          title: "Could not verify account",
          description: "Please enter account name manually",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error verifying account:", error);
      toast({
        title: "Verification Error",
        description: error.message || "Could not verify account automatically. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  // Load banks from Monnify API via Supabase function
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        // Try to get from localStorage first for better UX
        const cachedBanks = localStorage.getItem('nigerian_banks');
        if (cachedBanks) {
          setBanks(JSON.parse(cachedBanks));
          setIsLoadingBanks(false);
          return;
        }
        
        const data = await monnifyApi.getBanks({ dev_mode: import.meta.env.MODE === 'development' || import.meta.env.DEV_MODE === 'true' });
        if (data && data.data && Array.isArray(data.data)) {
          setBanks(data.data);
          // Cache for future use
          localStorage.setItem('nigerian_banks', JSON.stringify(data.data));
        } else {
          // Fallback to default banks if API fails
          console.error('Invalid bank data format:', data);
          useFallbackBanks();
        }
      } catch (error: any) {
        console.error("Error fetching banks:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load bank list. Using default banks instead.",
          variant: "destructive"
        });
        useFallbackBanks();
      } finally {
        setIsLoadingBanks(false);
      }
    };
    
    // Helper function to use fallback banks
    const useFallbackBanks = () => {
      const fallbackBanks = [
        { id: "1", code: "044", name: "Access Bank" },
        { id: "2", code: "023", name: "Citibank Nigeria" },
        { id: "3", code: "063", name: "Access Bank (Diamond)" },
        { id: "4", code: "050", name: "Ecobank Nigeria" },
        { id: "5", code: "070", name: "Fidelity Bank" },
        { id: "6", code: "011", name: "First Bank of Nigeria" },
        { id: "7", code: "214", name: "First City Monument Bank" },
        { id: "8", code: "058", name: "Guaranty Trust Bank" },
        { id: "9", code: "030", name: "Heritage Bank" },
        { id: "10", code: "082", name: "Keystone Bank" },
        { id: "11", code: "301", name: "Jaiz Bank" },
        { id: "12", code: "076", name: "Polaris Bank" },
        { id: "13", code: "221", name: "Stanbic IBTC Bank" },
        { id: "14", code: "232", name: "Sterling Bank" },
        { id: "15", code: "100", name: "SunTrust Bank Nigeria" }, // Verified
        { id: "16", code: "032", name: "Union Bank of Nigeria" },
        { id: "17", code: "033", name: "United Bank for Africa" },
        { id: "18", code: "215", name: "Unity Bank" },
        { id: "19", code: "035", name: "Wema Bank" },
        { id: "20", code: "057", name: "Zenith Bank" },
        { id: "21", code: "090267", name: "Kuda Microfinance Bank" },
        { id: "22", code: "100004", name: "OPay" }, // Official code
        { id: "23", code: "100033", name: "PalmPay" }, // Verified
        { id: "24", code: "090405", name: "Moniepoint Microfinance Bank" },
        { id: "25", code: "090110", name: "VFD Microfinance Bank" },
        { id: "26", code: "090325", name: "Sparkle Microfinance Bank" },
        { id: "27", code: "100026", name: "Carbon (Paylater)" },
        { id: "28", code: "090551", name: "FairMoney Microfinance Bank" },
        { id: "29", code: "105", name: "PremiumTrust Bank" } // Corrected code
      ];
      setBanks(fallbackBanks);
      localStorage.setItem('nigerian_banks', JSON.stringify(fallbackBanks));
    };
    
    fetchBanks();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You need to be logged in to complete KYC",
        variant: "destructive"
      });
      trackError(new Error("User not authenticated for KYC"), 'KYCForm', 'onSubmit').catch(console.error);
      return;
    }

    // Track form submission
    trackFormSubmit('kyc-form', {
      bankCode: values.bankName,
      hasAccountNumber: !!values.accountNumber,
      hasAccountName: !!values.accountName,
      hasIdNumber: !!values.idNumber
    }, 'KYCForm').catch(console.error);

    setIsSubmitting(true);
    try {
      let subaccountCode: string | undefined;

      try {
        const result = await monnifyApi.createSubaccount({
          userId: profile.id,
          accountName: profile.business_name,
          bankCode: values.bankName,
          accountNumber: values.accountNumber,
          currencyCode: "NGN", // Required field
          percentageCharge: profile.monnify_percentage_charge || (paymentConfig.monnify.percentageFee * 100), // Required field - Use user-specific percentage or default
          contactEmail: profile.email_support || profile.contact_email || profile.email || "",
          contactName: values.accountName,
          contactPhone: profile.phone_number || "00000000000",
          additionalInformation: `Subaccount for ${profile.business_name}`,
          bvn: values.idNumber // Add BVN to the payload
        });

        console.log("Subaccount creation result:", result);

        // Fix the response validation to check for either status or success
        if (result.status !== true && result.success !== true) {
          console.error('Error creating subaccount:', result);
          throw new Error(result.responseMessage || 'Failed to create subaccount. Invalid response received.');
        }

        // Properly extract all fields from the response (Monnify format)
        const subaccountData = result.data || {};
        subaccountCode = subaccountData.subaccountCode || result.subaccountCode;
        const bankDetails = subaccountData.bank || {};
        const bankName = bankDetails.name || banks.find(bank => bank.code === values.bankName)?.name || 'Unknown Bank';

        // Current timestamp for verification date
        const verificationDate = new Date().toISOString();

        // Update local profile state with Monnify subaccount code and KYC status
        await updateProfile({
          // @ts-ignore - These fields are declared in the module augmentation
          monnify_subaccount_code: subaccountCode,
          monnify_bvn: values.idNumber,            // Store the BVN provided by the user
          monnify_kyc_status: 'pending',          // Set KYC status to pending initially
          monnify_kyc_submitted_at: verificationDate, // Store when KYC was submitted
          kyc_verified: false,                    // Set to false initially, will update after Monnify verification
          kyc_verified_at: null                   // Set to null initially
        });

      } catch (subaccountError: any) {
        console.error('Subaccount creation error:', subaccountError);
        throw new Error(`Failed to create subaccount: ${subaccountError.message || 'Unknown error'}`);
      }

      // Perform Monnify customer verification only if subaccount was created successfully
      if (subaccountCode) {
        try {
          const verificationResult = await monnifyApi.customerVerification({
            userId: profile.id,
            firstName: profile.business_name, // Using business name as first name
            lastName: 'Merchant',             // Using 'Merchant' as last name
            email: profile.email_support || profile.email || "unknown@example.com", // Use support email or fallback
            phoneNumber: profile.phone_number || "+2348000000000", // Use phone number or fallback
            bvn: values.idNumber,             // Include BVN for verification
            dev_mode: import.meta.env.MODE === 'development' || import.meta.env.DEV_MODE === 'true'
          });

          console.log("Customer verification result:", verificationResult);

          // Update KYC status based on Monnify response
          let kycStatus = 'pending';
          let kycVerified = false;
          let kycVerifiedAt: string | null = null;

          if (verificationResult.status === true || verificationResult.success === true) {
            kycStatus = 'verified';
            kycVerified = true;
            kycVerifiedAt = new Date().toISOString();
          } else if (verificationResult.status === 'failed' || verificationResult.status === 'rejected') {
            kycStatus = verificationResult.status;
          }

          // Update profile with final KYC status
          await updateProfile({
            // @ts-ignore - These fields are declared in the module augmentation
            monnify_kyc_status: kycStatus,
            kyc_verified: kycVerified,
            kyc_verified_at: kycVerifiedAt
          });

        } catch (verificationError: any) {
          console.error("Customer verification error:", verificationError);
          // Even if Monnify verification fails, we still store the KYC information locally
          await updateProfile({
            // @ts-ignore - These fields are declared in the module augmentation
            monnify_kyc_status: 'failed',
            kyc_verified: false
          });

          // Don't throw error here since subaccount was created; allow the process to continue
          toast({
            title: "Verification Incomplete",
            description: "Subaccount created but verification needs manual review. Please contact support if issues persist.",
            variant: "destructive"
          });
        }
      }

      // Track KYC verification completion
      trackKYCEvent('kyc_submitted', {
        profile_id: profile.id,
        subaccount_code: subaccountCode,
        success: true,
        bvn_provided: !!values.idNumber
      }).catch(console.error);

      // Also save bank details to payment_accounts table
      try {
        // First check if a record already exists
        const { data: existingAccount, error: checkError } = await supabase
          .from('payment_accounts')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing payment account:', checkError);
        }

        // Use insert or update based on whether a record exists
        if (existingAccount?.id) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('payment_accounts')
            .update({
              account_name: values.accountName,
              account_number: values.accountNumber,
              bank_name: banks.find(bank => bank.code === values.bankName)?.name || 'Unknown Bank',
              bank_code: values.bankName,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAccount.id);

          if (updateError) {
            console.error('Error updating payment account details:', updateError);
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('payment_accounts')
            .insert({
              profile_id: profile.id,
              account_name: values.accountName,
              account_number: values.accountNumber,
              bank_name: banks.find(bank => bank.code === values.bankName)?.name || 'Unknown Bank',
              bank_code: values.bankName,
              created_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error inserting payment account details:', insertError);
          }
        }
      } catch (err) {
        console.error('Error saving payment account:', err);
        // Continue with success message even if this part fails
      }

      toast({
        title: "Success",
        description: "Your payment account has been verified successfully!",
      });
    } catch (error: any) {
      console.error('Error in KYC submission:', error);
      trackError(error, 'KYCForm', 'onSubmit').catch(console.error);
      trackKYCEvent('kyc_failed', {
        profile_id: profile?.id,
        error_message: error.message
      }).catch(console.error);

      toast({
        title: "Error",
        description: error.message || "Failed to verify your payment account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-tonstores-green mx-auto mb-4" />
          <p className="text-gray-500">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">KYC Verification</CardTitle>
        {/* Show KYC status if already verified */}
        {profile?.monnify_kyc_status && (
          <div className={`text-sm p-2 rounded-md ${
            profile.monnify_kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
            profile.monnify_kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            KYC Status: <span className="font-semibold">{profile.monnify_kyc_status}</span>
            {profile.monnify_kyc_submitted_at && (
              <div className="text-xs mt-1">Submitted: {new Date(profile.monnify_kyc_submitted_at).toLocaleDateString()}</div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingBanks}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={
                            isLoadingBanks ? "Loading banks..." : "Select your bank"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[50vh] overflow-y-auto" position="popper" sideOffset={8}>
                        {banks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter 10-digit account number"
                          maxLength={10}
                          inputMode="numeric"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Account Name</FormLabel>
                        {isVerifyingAccount && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Verifying...
                          </span>
                        )}
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter account holder name"
                          disabled={isVerifyingAccount}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            <FormField
              control={form.control}
              name="idType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Type</FormLabel>
                  <FormControl>
                    <Input
                      value="BVN"
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BVN Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter 11-digit BVN"
                      maxLength={11}
                      inputMode="numeric"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isVerifyingAccount || (profile?.kyc_verified && profile?.monnify_kyc_status === 'verified')}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (profile?.kyc_verified && profile?.monnify_kyc_status === 'verified') ? (
                "KYC Already Verified"
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}