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
import { unifiedPaystackService } from '@/services/UnifiedPaystackService';
import { useEventTracker } from '@/hooks/useEventTracker';
import { paymentConfig } from '@/lib/config';
import { safeTrack } from '@/utils/errorHandling';

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
  idType: z.literal("BVN"),
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
      safeTrack(trackKYCEvent('kyc_form_viewed', {
        profile_id: profile.id,
        kyc_status: profile.kyc_verified ? 'verified' : 'not_verified'
      }));
    }
  }, [profile?.id, profile?.kyc_verified]);

  // Watch bank code and account number to verify account
  const bankCode = form.watch("bankName");
  const accountNumber = form.watch("accountNumber");

  // Effect to verify account when both bank and account number are entered
  useEffect(() => {
    if (bankCode && accountNumber && accountNumber.length === 10) {
      verifyBankAccount(bankCode, accountNumber);
    }
  }, [bankCode, accountNumber]);

  // Function to verify bank account and get account name
  const verifyBankAccount = async (bankCode: string, accountNumber: string) => {
    if (isVerifyingAccount || isSubmitting) return;

    setIsVerifyingAccount(true);
    try {
      const result = await unifiedPaystackService.verifyAccount({
        account_number: accountNumber,
        bank_code: bankCode
      });

      if (result && result.status === true && result.data && result.data.account_name) {
        form.setValue("accountName", result.data.account_name);
        toast({
          title: "Account Verified",
          description: `Account name: ${result.data.account_name}`,
        });
      } else {
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

  // Load banks from Paystack API via Supabase function
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        // Try to get from localStorage first for better UX
        const cachedBanks = localStorage.getItem('nigerian_banks');
        const cacheTimestamp = localStorage.getItem('nigerian_banks_timestamp');
        const oneDay = 24 * 60 * 60 * 1000; // Cache for 24 hours
        
        if (cachedBanks && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < oneDay) {
            setBanks(JSON.parse(cachedBanks));
            setIsLoadingBanks(false);
            return;
          }
        }

        // Fetch from API
        const data = await unifiedPaystackService.getBanks();
        
        if (data && data.data && Array.isArray(data.data)) {
          // Map the Paystack response to our Bank interface
          const mappedBanks: Bank[] = data.data.map((bank: any, index: number) => ({
            id: String(index + 1),
            code: bank.code,
            name: bank.name
          }));
          
          setBanks(mappedBanks);
          // Cache for future use
          localStorage.setItem('nigerian_banks', JSON.stringify(mappedBanks));
          localStorage.setItem('nigerian_banks_timestamp', Date.now().toString());
        } else {
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
      const fallbackBanks: Bank[] = [
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
        { id: "15", code: "032", name: "Union Bank of Nigeria" },
        { id: "16", code: "033", name: "United Bank for Africa" },
        { id: "17", code: "215", name: "Unity Bank" },
        { id: "18", code: "035", name: "Wema Bank" },
        { id: "19", code: "057", name: "Zenith Bank" },
        { id: "20", code: "090267", name: "Kuda Microfinance Bank" },
        { id: "21", code: "100033", name: "PalmPay" },
        { id: "22", code: "090405", name: "Moniepoint Microfinance Bank" },
        { id: "23", code: "090110", name: "VFD Microfinance Bank" },
        { id: "24", code: "090325", name: "Sparkle Microfinance Bank" },
        { id: "25", code: "100026", name: "Carbon" },
        { id: "26", code: "090551", name: "FairMoney Microfinance Bank" },
        { id: "27", code: "000031", name: "PremiumTrust Bank" },
        { id: "28", code: "000027", name: "Globus Bank" },
        { id: "29", code: "000026", name: "TAJ Bank" },
        { id: "30", code: "000025", name: "Titan Trust Bank" }
      ];
      setBanks(fallbackBanks);
      localStorage.setItem('nigerian_banks', JSON.stringify(fallbackBanks));
      localStorage.setItem('nigerian_banks_timestamp', Date.now().toString());
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
      safeTrack(trackError(new Error("User not authenticated for KYC"), 'KYCForm', 'onSubmit'));
      return;
    }

    trackFormSubmit('kyc-form', {
      bankCode: values.bankName,
      hasAccountNumber: !!values.accountNumber,
      hasAccountName: !!values.accountName,
      hasIdNumber: !!values.idNumber
    }, 'KYCForm');

    setIsSubmitting(true);
    try {
      let subaccountCode: string | undefined;

      try {
        const result = await unifiedPaystackService.createSubaccount({
          userId: profile.id,
          business_name: profile.business_name,
          account_number: values.accountNumber,
          bank_code: values.bankName,
          percentage_charge: profile.paystack_percentage_charge || (paymentConfig.paystack.percentageFee * 100),
          contact_email: profile.email_support || profile.contact_email || "",
          contact_name: values.accountName,
          contact_phone: profile.phone_number || "00000000000",
          bvn: values.idNumber
        });

        console.log("Subaccount creation result:", result);

        if (result.status !== true && result.success !== true) {
          console.error('Error creating subaccount:', result);
          throw new Error(result.message || 'Failed to create subaccount. Invalid response received.');
        }

        const subaccountData = result.data || {};
        subaccountCode = result.data?.subaccount_code || result.data?.subaccount?.subaccount_code || subaccountData.subaccount_code;

        const verificationDate = new Date().toISOString();

        await updateProfile({
          // @ts-ignore
          paystack_subaccount_code: subaccountCode,
          paystack_bvn: values.idNumber,
          paystack_kyc_status: 'pending',
          paystack_kyc_submitted_at: verificationDate,
          kyc_verified: false,
          kyc_verified_at: null
        });

      } catch (subaccountError: any) {
        console.error('Subaccount creation error:', subaccountError);
        throw new Error(`Failed to create subaccount: ${subaccountError.message || 'Unknown error'}`);
      }

      if (subaccountCode) {
        try {
          const verificationResult = await unifiedPaystackService.customerVerification({
            userId: profile.id,
            firstName: profile.business_name,
            lastName: 'Merchant',
            email: profile.email_support || profile.contact_email || "unknown@example.com",
            phoneNumber: profile.phone_number || "+2348000000000",
            bvn: values.idNumber
          });

          console.log("Customer verification result:", verificationResult);

          let kycStatus = 'pending';
          let kycVerified = false;
          let kycVerifiedAt: string | null = null;

          if (verificationResult.status === true || verificationResult.success === true) {
            kycStatus = 'verified';
            kycVerified = true;
            kycVerifiedAt = new Date().toISOString();
          } else if (verificationResult.status === 'failed' || verificationResult.status === 'rejected') {
            kycStatus = verificationResult.message || 'failed';
          }

          await updateProfile({
            // @ts-ignore
            paystack_kyc_status: kycStatus,
            kyc_verified: kycVerified,
            kyc_verified_at: kycVerifiedAt
          });

        } catch (verificationError: any) {
          console.error("Customer verification error:", verificationError);
          await updateProfile({
            // @ts-ignore
            paystack_kyc_status: 'failed',
            kyc_verified: false
          });

          toast({
            title: "Verification Incomplete",
            description: "Subaccount created but verification needs manual review. Please contact support if issues persist.",
            variant: "destructive"
          });
        }
      }

      trackKYCEvent('kyc_submitted', {
        profile_id: profile.id,
        subaccount_code: subaccountCode,
        success: true,
        bvn_provided: !!values.idNumber
      });

      // Save bank details to payment_accounts table
      try {
        const { data: existingAccount, error: checkError } = await supabase
          .from('payment_accounts')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing payment account:', checkError);
        }

        if (existingAccount?.id) {
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
      }

      toast({
        title: "Success",
        description: "Your payment account has been verified successfully!",
      });
    } catch (error: any) {
      console.error('Error in KYC submission:', error);
      safeTrack(trackError(error, 'KYCForm', 'onSubmit'));
      trackKYCEvent('kyc_failed', {
        profile_id: profile?.id,
        error_message: error.message
      });

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
          <Loader2 className="h-8 w-8 animate-spin text-Tonstores-green mx-auto mb-4" />
          <p className="text-gray-500">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">KYC Verification</CardTitle>
        {profile?.paystack_kyc_status && (
          <div className={`text-sm p-2 rounded-md ${
            profile.paystack_kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
            profile.paystack_kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            KYC Status: <span className="font-semibold">{profile.paystack_kyc_status}</span>
            {profile.paystack_kyc_submitted_at && (
              <div className="text-xs mt-1">Submitted: {new Date(profile.paystack_kyc_submitted_at).toLocaleDateString()}</div>
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
              disabled={isSubmitting || isVerifyingAccount || (profile?.kyc_verified && profile?.paystack_kyc_status === 'verified')}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (profile?.kyc_verified && profile?.paystack_kyc_status === 'verified') ? (
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
