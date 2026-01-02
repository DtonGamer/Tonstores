import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Calendar, DollarSign, Wallet, ArrowDown, ArrowUp, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { getPaystackSellerBalance, getPaystackSellerLedgerHistory, PaystackLedgerEntry, getPaystackSellerPayoutHistory, PaystackPayoutHistoryResponse } from "@/services/PaystackPaymentService";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PayoutHistory {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  created_at: string;
  reference: string;
}

export function PaymentDashboard() {
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState<PaystackPayoutHistoryResponse['payouts']>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [ledgerHistory, setLedgerHistory] = useState<PaystackLedgerEntry[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [ledgerSummary, setLedgerSummary] = useState({
    total_credits: 0,
    total_debits: 0,
    balance: 0
  });
  // Load seller balance
  useEffect(() => {
    const loadBalance = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoadingBalance(true);
        console.log("Loading balance for user ID:", profile.id);
        const sellerBalance = await getPaystackSellerBalance(profile.id);
        console.log("Balance received:", sellerBalance);
        setBalance(sellerBalance);
      } catch (error: any) {
        console.error("Error loading balance:", error);
        toast({
          title: "Error loading balance",
          description: error.message || "Failed to load your current balance",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadBalance();
  }, [profile?.id, toast]);

  // Load payout history from Supabase
  useEffect(() => {
    const loadPayoutHistory = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoadingHistory(true);
        
        console.log("Loading payout history for user ID:", profile.id);
        const payoutData = await getPaystackSellerPayoutHistory(profile.id, 10, 0);
        console.log("Payout history received:", payoutData);

        if (payoutData.payouts) {
          setPayoutHistory(payoutData.payouts);
        }
      } catch (error: any) {
        console.error("Error loading payout history:", error);
        toast({
          title: "Error loading payout history",
          description: error.message || "Failed to load your payout history",
          variant: "destructive",
        });
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadPayoutHistory();
  }, [profile?.id, toast]);

  // Load ledger history
  useEffect(() => {
    const loadLedgerHistory = async () => {
      if (!profile?.id) return;

      console.log("Loading ledger history for user ID:", profile.id);
      try {
        setIsLoadingLedger(true);
        setLedgerError(null);
        const ledgerData = await getPaystackSellerLedgerHistory(profile.id, 20, 0);
        console.log("Ledger data received:", ledgerData);

        if (!ledgerData.entries || ledgerData.entries.length === 0) {
          // Still show the ledger tab, but with a message
          setLedgerHistory([]);
        } else {
          setLedgerHistory(ledgerData.entries);
        }

        setLedgerSummary(ledgerData.summary);
      } catch (error: any) {
        console.error("Error loading ledger history:", error);
        setLedgerError(error.message || "Failed to load transaction history");
        toast({
          title: "Error loading transaction history",
          description: error.message || "Failed to load your transaction history",
          variant: "destructive",
        });
      } finally {
        setIsLoadingLedger(false);
      }
    };

    loadLedgerHistory();
  }, [profile?.id, toast]);


  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If KYC is not verified, show a message
  if (!profile?.kyc_verified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Dashboard</CardTitle>
          <CardDescription>
            View your sales, balance, and payout history.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              You need to set up your payment account before you can view your payment dashboard.
            </p>
            <Button asChild>
              <a href="/settings">
                Set Up Payment Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">
                  ₦{balance !== null ? (balance / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) : "0.00"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Payout */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Next Payout</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.next_payout_available_at ? (
              <>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-lg font-medium">
                    {new Date(profile.next_payout_available_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(profile.next_payout_available_at) > new Date()
                    ? `Available in ${Math.ceil((new Date(profile.next_payout_available_at).getTime() - Date.now()) / (1000 * 60 * 60))} hours`
                    : 'Available now'
                  }
                </p>
              </>
            ) : (
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-lg font-medium">Ready</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Paid Out */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-2xl font-bold">
                ₦{(payoutHistory.reduce((sum, payout) => sum + payout.net_amount, 0) / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Transaction History Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View your transaction history and payout details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ledger">
            <TabsList className="mb-4">
              <TabsTrigger value="ledger">Ledger History</TabsTrigger>
              <TabsTrigger value="payouts">Payout History</TabsTrigger>
            </TabsList>

            <TabsContent value="ledger">
              {isLoadingLedger ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : ledgerError ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-red-500 font-medium">Error loading ledger data</p>
                  <p className="text-sm mt-2">Please try refreshing the page</p>
                </div>
              ) : ledgerHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-right py-3 px-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerHistory.map((entry) => (
                        <tr key={entry.id} className="border-b">
                          <td className="py-3 px-4">
                            {format(new Date(entry.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="py-3 px-4">
                            {entry.type === 'credit' ? (
                              <span className="inline-flex items-center text-green-600">
                                <ArrowDown className="h-4 w-4 mr-1" />
                                Credit
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600">
                                <ArrowUp className="h-4 w-4 mr-1" />
                                Debit
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">{entry.description}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            <span className={entry.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                              {entry.type === 'credit' ? '+' : '-'}₦
                              {(entry.amount / 100).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={3} className="py-3 px-4 text-right font-semibold">
                          Current Balance:
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          ₦{(ledgerSummary.balance / 100).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No transaction history available yet.</p>
                  <p className="text-sm mt-2">Transactions will appear here once you make sales</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payouts">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : payoutHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Reference</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-right py-3 px-4">Fee</th>
                        <th className="text-right py-3 px-4">Net Amount</th>
                        <th className="text-right py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutHistory.map((payout) => (
                        <tr key={payout.id} className="border-b">
                          <td className="py-3 px-4">
                            {format(new Date(payout.created_at), "MMM d, yyyy")}
                          </td>
                          <td className="py-3 px-4">{payout.reference}</td>
                          <td className="py-3 px-4 text-right">
                            ₦{(payout.amount / 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                          <td className="py-3 px-4 text-right text-red-600">
                            -₦{(payout.fee / 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            ₦{(payout.net_amount / 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payout.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No payout history available yet.</p>
                  <p className="text-sm mt-2">Your payouts will appear here once processed</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentDashboard; 