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
import { FriendlyError } from '@/components/ui/FriendlyError';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { unifiedPaystackService } from '@/services/UnifiedPaystackService';
import { useEventTracker } from '@/hooks/useEventTracker';
import { paymentConfig } from '@/lib/config';
import { safeTrack } from '@/utils/errorHandling';
import { Badge } from '@/components/ui/badge';

interface Bank {
  id: string;
  code: string;
  name: string;
}

const formSchema = z.object({
  bankName: z.string().min(1, "Please select your bank"),
  accountNumber: z
    .string()
    .length(10, "Account number must be 10 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  accountName: z.string().min(2, "Please enter the account holder name"),
  idType: z.literal("BVN"),
  idNumber: z
    .string()
    .length(11, "BVN must be 11 digits")
    .regex(/^\d+$/, "BVN must contain only digits")
});

type FormValues = z.infer<typeof formSchema>;

const FALLBACK_BANKS: Bank[] = [
  { id: "1", code: "044", name: "Access Bank" },
  { id: "2", code: "063", name: "Access Bank (Diamond)" },
  { id: "3", code: "050", name: "Ecobank Nigeria" },
  { id: "4", code: "070", name: "Fidelity Bank" },
  { id: "5", code: "011", name: "First Bank of Nigeria" },
  { id: "6", code: "214", name: "First City Monument Bank" },
  { id: "7", code: "058", name: "Guaranty Trust Bank" },
  { id: "8", code: "030", name: "Heritage Bank" },
  { id: "9", code: "301", name: "Jaiz Bank" },
  { id: "10", code: "082", name: "Keystone Bank" },
  { id: "11", code: "076", name: "Polaris Bank" },
  { id: "12", code: "221", name: "Stanbic IBTC Bank" },
  { id: "13", code: "232", name: "Sterling Bank" },
  { id: "14", code: "032", name: "Union Bank of Nigeria" },
  { id: "15", code: "033", name: "United Bank for Africa" },
  { id: "16", code: "215", name: "Unity Bank" },
  { id: "17", code: "035", name: "Wema Bank" },
  { id: "18", code: "057", name: "Zenith Bank" },
  { id: "19", code: "090267", name: "Kuda Microfinance Bank" },
  { id: "20", code: "100033", name: "PalmPay" },
  { id: "21", code: "090405", name: "Moniepoint Microfinance Bank" },
  { id: "22", code: "100026", name: "Carbon" },
  { id: "23", code: "090551", name: "FairMoney Microfinance Bank" },
  { id: "24", code: "000031", name: "PremiumTrust Bank" }
];

const KYC_STATUS_CONFIG = {
  verified: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Verified'
  },
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Pending Review'
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Failed'
  }
};

export default function KYCForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const { trackKYCEvent, trackFormSubmit, trackError } = useEventTracker();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      idType: "BVN",
      idNumber: ""
    }
  });

  const bankCode = form.watch("bankName");
  const accountNumber = form.watch("accountNumber");

  // Track KYC form view
  useEffect(() => {
    if (profile?.id) {
      safeTrack(trackKYCEvent('kyc_form_viewed', {
        profile_id: profile.id,
        kyc_status: profile.kyc_verified ? 'verified' : 'not_verified'
      }));
    }
  }, [profile?.id]);

  // Load banks
  useEffect(() => {
    loadBanks();
  }, []);

  // Auto-verify account when bank and account number are entered
  useEffect(() => {
    if (bankCode && accountNumber?.length === 10) {
      verifyBankAccount(bankCode, accountNumber);
    }
  }, [bankCode, accountNumber]);

  const loadBanks = async () => {
    try {
      // Check cache first (24 hour TTL)
      const cached = getCachedBanks();
      if (cached) {
        setBanks(cached);
        setIsLoadingBanks(false);
        return;
      }

      // Fetch from API
      const data = await unifiedPaystackService.getBanks();
      
      if (data?.data && Array.isArray(data.data)) {
        const mappedBanks = data.data.map((bank: any, index: number) => ({
          id: String(index + 1),
          code: bank.code,
          name: bank.name
        }));
        
        setBanks(mappedBanks);
        cacheBanks(mappedBanks);
      } else {
        throw new Error('Invalid bank data format');
      }
    } catch (error) {
      console.error("Error loading banks:", error);
      setBanks(FALLBACK_BANKS);
      cacheBanks(FALLBACK_BANKS);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const getCachedBanks = (): Bank[] | null => {
    try {
      const cached = localStorage.getItem('nigerian_banks');
      const timestamp = localStorage.getItem('nigerian_banks_timestamp');
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (age < oneDay) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.error('Error reading bank cache:', error);
    }
    return null;
  };

  const cacheBanks = (banks: Bank[]) => {
    try {
      localStorage.setItem('nigerian_banks', JSON.stringify(banks));
      localStorage.setItem('nigerian_banks_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error caching banks:', error);
    }
  };

  const verifyBankAccount = async (bankCode: string, accountNumber: string) => {
    if (isVerifyingAccount || isSubmitting) return;

    setIsVerifyingAccount(true);
    try {
      const result = await unifiedPaystackService.verifyAccount({
        account_number: accountNumber,
        bank_code: bankCode
      });

      const accountName = result?.data?.account_name || result?.data?.accountName;

      if (accountName) {
        form.setValue("accountName", accountName);
        toast({
          title: "Account Verified",
          description: `Account name: ${accountName}`,
        });
      } else {
        toast({
          title: "Verification Incomplete",
          description: "Please enter account name manually.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Account verification error:", error);
      toast({
        title: "Verification Error",
        description: "Could not verify account. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const savePaymentAccount = async (values: FormValues) => {
    try {
      const { data: existingAccount } = await supabase
        .from('payment_accounts')
        .select('id')
        .eq('profile_id', profile!.id)
        .maybeSingle();

      const accountData = {
        profile_id: profile!.id,
        account_name: values.accountName,
        account_number: values.accountNumber,
        bank_name: banks.find(b => b.code === values.bankName)?.name || 'Unknown Bank',
        bank_code: values.bankName,
        ...(existingAccount ? { updated_at: new Date().toISOString() } : { created_at: new Date().toISOString() })
      };

      if (existingAccount) {
        await supabase
          .from('payment_accounts')
          .update(accountData)
          .eq('id', existingAccount.id);
      } else {
        await supabase
          .from('payment_accounts')
          .insert(accountData);
      }
    } catch (error) {
      console.error('Error saving payment account:', error);
      // Don't throw - this is a non-critical operation
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!profile?.id) {
      setError("You need to be logged in to complete KYC verification.");
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
    setError(null);

    try {
      // Step 1: Create Paystack subaccount
      const subaccountResult = await unifiedPaystackService.createSubaccount({
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

      if (!subaccountResult?.status && !subaccountResult?.success) {
        throw new Error(subaccountResult?.message || 'Failed to create payment account');
      }

      const subaccountCode = 
        subaccountResult.subaccount_code || 
        subaccountResult.data?.subaccount_code || 
        subaccountResult.data?.subaccount?.subaccount_code;

      if (!subaccountCode) {
        throw new Error('No subaccount code received from payment provider');
      }

      // Step 2: Update profile with subaccount
      await updateProfile({
        // @ts-ignore
        paystack_subaccount_code: subaccountCode,
        paystack_bvn: values.idNumber,
        paystack_kyc_status: 'pending',
        paystack_kyc_submitted_at: new Date().toISOString(),
        kyc_verified: false,
        kyc_verified_at: null
      });

      // Step 3: Attempt customer verification
      try {
        const verificationResult = await unifiedPaystackService.customerVerification({
          userId: profile.id,
          firstName: profile.business_name,
          lastName: 'Merchant',
          email: profile.email_support || profile.contact_email || "unknown@example.com",
          phoneNumber: profile.phone_number || "+2348000000000",
          bvn: values.idNumber
        });

        const isVerified = 
          verificationResult?.status === true ||
          verificationResult?.success === true ||
          verificationResult?.data?.verification_status === 'initiated';

        await updateProfile({
          // @ts-ignore
          paystack_kyc_status: isVerified ? 'verified' : 'pending',
          kyc_verified: isVerified,
          kyc_verified_at: isVerified ? new Date().toISOString() : null
        });
      } catch (verificationError) {
        console.error("Customer verification error:", verificationError);
        // Continue - subaccount is created, verification can be done later
      }

      // Step 4: Save payment account details
      await savePaymentAccount(values);

      // Step 5: Track success
      trackKYCEvent('kyc_submitted', {
        profile_id: profile.id,
        subaccount_code: subaccountCode,
        success: true,
        bvn_provided: !!values.idNumber
      });

      toast({
        title: "Success",
        description: "Your payment account has been verified successfully!",
      });

      form.reset();
    } catch (error: any) {
      console.error('KYC submission error:', error);
      
      safeTrack(trackError(error, 'KYCForm', 'onSubmit'));
      trackKYCEvent('kyc_failed', {
        profile_id: profile?.id,
        error_message: error.message
      });

      setError(error.message || 'Failed to complete KYC verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-Tonstores-green mx-auto" />
          <p className="text-sm text-gray-500">Loading profile information...</p>
        </div>
      </div>
    );
  }

  const kycStatus = profile?.paystack_kyc_status as keyof typeof KYC_STATUS_CONFIG | undefined;
  const statusConfig = kycStatus ? KYC_STATUS_CONFIG[kycStatus] : null;
  const StatusIcon = statusConfig?.icon;
  const isVerified = profile?.kyc_verified && kycStatus === 'verified';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">KYC Verification</CardTitle>
          {statusConfig && (
            <Badge variant="outline" className={`${statusConfig.color} border`}>
              {StatusIcon && <StatusIcon className="h-3.5 w-3.5 mr-1" />}
              {statusConfig.label}
            </Badge>
          )}
        </div>
        {profile?.paystack_kyc_submitted_at && (
          <p className="text-xs text-gray-500 mt-2">
            Submitted: {new Date(profile.paystack_kyc_submitted_at).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <FriendlyError
            message={error}
            onRetry={() => setError(null)}
            retryText="Dismiss"
          />
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingBanks || isVerified}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingBanks ? "Loading banks..." : "Select your bank"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
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
                      placeholder="0123456789"
                      maxLength={10}
                      inputMode="numeric"
                      disabled={isVerified}
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
                  <div className="flex items-center justify-between mb-2">
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
                      placeholder="John Doe"
                      disabled={isVerifyingAccount || isVerified}
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
                  <FormLabel>BVN (Bank Verification Number)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="12345678901"
                      maxLength={11}
                      inputMode="numeric"
                      disabled={isVerified}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">
                    Your BVN is required for payment processing verification
                  </p>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isVerifyingAccount || isVerified}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isVerified ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  KYC Verified
                </>
              ) : (
                "Submit for Verification"
              )}
            </Button>

            {isVerified && (
              <p className="text-xs text-center text-green-600">
                Your account is verified and ready to receive payments
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}