import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle, Wallet, CreditCard, Building, DollarSign, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileBase } from "@/types/profile";
import { getPaystackSellerLedgerHistory, requestManualPayout } from "@/services/PaystackPaymentService";
import { formatCurrency } from "@/utils/format";

interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  created_at: string;
}

interface ConnectedAccountInfoProps {
  profile: ProfileBase;
}

export default function ConnectedAccountInfo({ profile }: ConnectedAccountInfoProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accountDetails, setAccountDetails] = useState<BankAccount | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [canRequestPayout, setCanRequestPayout] = useState(false);

  // Calculate time remaining until next payout
  useEffect(() => {
    if (!profile?.next_payout_available_at) {
      setCanRequestPayout(true);
      setTimeRemaining("");
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const nextPayout = new Date(profile.next_payout_available_at);
      const diff = nextPayout.getTime() - now.getTime();

      if (diff <= 0) {
        setCanRequestPayout(true);
        setTimeRemaining("");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setCanRequestPayout(false);
      setTimeRemaining(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [profile?.next_payout_available_at]);

  // Fetch bank account details
  useEffect(() => {
    async function fetchAccountDetails() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("payment_accounts")
          .select("*")
          .eq("profile_id", profile.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching account details:", error);
        } else if (data) {
          setAccountDetails(data);
        } else {
          if (profile.kyc_verified) {
            const mockAccountDetails: BankAccount = {
              id: 'mock-id',
              account_name: profile.business_name || 'Account Holder',
              account_number: '**********',
              bank_name: 'Bank details pending',
              bank_code: '',
              created_at: profile.kyc_verified_at || new Date().toISOString()
            };
            setAccountDetails(mockAccountDetails);
          }
        }
      } catch (error) {
        console.error("Could not load account details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (profile?.id) {
      fetchAccountDetails();
    }
  }, [profile?.id]);

  // Fetch seller balance from ledger
  useEffect(() => {
    async function fetchBalance() {
      if (!profile?.id || !profile?.kyc_verified) return;

      try {
        setIsLoadingBalance(true);
        const ledgerData = await getPaystackSellerLedgerHistory(profile.id, 1, 0);
        setBalance(ledgerData.summary.balance);
      } catch (error: any) {
        console.error("Error loading balance:", error);
        setBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    }

    fetchBalance();
  }, [profile?.id, profile?.kyc_verified]);

  // Handle manual payout request
  const handleRequestPayout = async () => {
    if (!profile?.id || balance === null || balance <= 0 || !canRequestPayout) return;

    setIsRequestingPayout(true);
    
    try {
      const result = await requestManualPayout(profile.id);
      
      toast({
        title: "Payout Successful!",
        description: `₦${(result.data.amount / 100).toFixed(2)} transferred to your bank account.`,
      });
      
      // Refresh balance
      const ledgerData = await getPaystackSellerLedgerHistory(profile.id, 1, 0);
      setBalance(ledgerData.summary.balance);
      
    } catch (error: any) {
      console.error('Payout error:', error);
      
      let errorMessage = "Failed to request payout. Please try again.";
      
      if (error.message?.includes("404") && error.message?.includes("function was not found")) {
        errorMessage = "Payout service is temporarily unavailable. Please contact support or try again later.";
      } else if (error.message?.includes("Payout not available yet")) {
        errorMessage = error.message;
      } else if (error.message?.includes("Insufficient balance")) {
        errorMessage = "You don't have enough funds available for payout.";
      } else if (error.message?.includes("Bank account not found")) {
        errorMessage = "Please set up your bank account details first.";
      }
      
      toast({
        title: "Payout Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRequestingPayout(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Account</CardTitle>
        <CardDescription>
          Your payment account is set up and ready to receive payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-500 mb-4">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Verified</span>
        </div>
        
        <div className="space-y-6">
          {/* Account information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Details</h3>
              <div className="space-y-1">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification Date:</span>
                  <span className="ml-2 text-sm dark:text-gray-300">
                    {profile.kyc_verified_at 
                      ? new Date(profile.kyc_verified_at).toLocaleDateString() 
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Balance</h3>
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-Tonstores-green" />
                {isLoadingBalance ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-Tonstores-green" />
                    <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <span className="text-lg font-semibold dark:text-white">
                    {balance !== null ? formatCurrency(balance / 100) : "₦0.00"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Available balance from completed orders.
              </p>
            </div>
          </div>
          
          {/* Bank account details */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Bank Account Details</h3>
            
            {accountDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-start space-x-3">
                  <Building className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Bank Name</span>
                    <span className="font-medium dark:text-white">{accountDetails.bank_name}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Account Number</span>
                    <span className="font-medium font-mono dark:text-white">{accountDetails.account_number}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Account Name</span>
                    <span className="font-medium dark:text-white">{accountDetails.account_name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-500">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Bank account details not available</span>
              </div>
            )}
          </div>

          {/* Payout Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Payout Schedule</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  You can request a payout every 48 hours. Funds are held in escrow for security 
                  and will be transferred to your bank account within minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {!canRequestPayout && timeRemaining ? (
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-500">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Next payout available in: {timeRemaining}
              </span>
            </div>
          ) : balance && balance > 0 ? (
            <p className="text-green-600 dark:text-green-500 font-medium">
              ✓ Payout available now
            </p>
          ) : (
            <p>No funds available for payout</p>
          )}
        </div>
        
        <Button
          onClick={handleRequestPayout}
          disabled={isRequestingPayout || !canRequestPayout || balance === null || balance <= 0}
          size="lg"
          className="w-full sm:w-auto min-w-[200px]"
        >
          {isRequestingPayout ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : !canRequestPayout ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Payout Locked
            </>
          ) : balance === null || balance <= 0 ? (
            "No Funds Available"
          ) : (
            <>
              Request Payout
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}