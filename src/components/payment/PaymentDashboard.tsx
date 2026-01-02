import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Calendar, DollarSign, Wallet, ArrowDown, ArrowUp, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { getPaystackSellerLedgerHistory, getPaystackSellerPayoutHistory, requestManualPayout } from "@/services/PaystackPaymentService";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PaymentDashboard() {
  const { profile, loading } = useProfile();
  const { toast } = useToast();
  
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [ledgerHistory, setLedgerHistory] = useState<any[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  


  // Load ledger history (which includes balance)
  useEffect(() => {
    const loadLedgerHistory = async () => {
      if (!profile?.id) return;

      try {
        setIsLoadingLedger(true);
        setIsLoadingBalance(true);
        setLedgerError(null);
        
        const ledgerData = await getPaystackSellerLedgerHistory(profile.id, 20, 0);
        
        if (ledgerData.entries) {
          setLedgerHistory(ledgerData.entries);
        } else {
          setLedgerHistory([]);
        }

        // Set balance from ledger summary
        if (ledgerData.summary) {
          setBalance(ledgerData.summary.balance || 0);
        }
      } catch (error: any) {
        console.error("Error loading ledger history:", error);
        setLedgerError(error.message || "Failed to load transaction history");
        setBalance(0);
      } finally {
        setIsLoadingLedger(false);
        setIsLoadingBalance(false);
      }
    };

    loadLedgerHistory();
  }, [profile?.id]);

  // Load payout history
  useEffect(() => {
    const loadPayoutHistory = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoadingHistory(true);
        const payoutData = await getPaystackSellerPayoutHistory(profile.id, 10, 0);

        if (payoutData.payouts) {
          setPayoutHistory(payoutData.payouts);
        }
      } catch (error: any) {
        console.error("Error loading payout history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadPayoutHistory();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
      {/* Balance Card - Display Only */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Balance</span>
            {profile.last_payout_at && (
              <span className="text-sm font-normal text-gray-500">
                Last payout: {new Date(profile.last_payout_at).toLocaleDateString()}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Your current balance from completed orders. Go to Settings → Payment Settings to request payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              {isLoadingBalance ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <p className="text-4xl font-bold text-green-600">
                  ₦{(balance / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDown className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">
                ₦{(ledgerHistory
                  .filter(e => e.type === 'credit')
                  .reduce((sum, e) => sum + e.amount, 0) / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">All time income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Withdrawn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUp className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold">
                ₦{(payoutHistory.reduce((sum, p) => sum + p.net_amount, 0) / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">All time payouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Payout Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">Every 48h</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum waiting period</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View your transaction history and payout details.</CardDescription>
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
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-red-500 font-medium">Error loading ledger data</p>
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
                              {entry.type === 'credit' ? '+' : '-'}₦{(entry.amount / 100).toFixed(2)}
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
                          ₦{(balance / 100).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions yet</p>
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
                        <th className="text-right py-3 px-4">Net</th>
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
                            ₦{(payout.amount / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-red-600">
                            -₦{(payout.fee / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            ₦{(payout.net_amount / 100).toFixed(2)}
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
                  <p>No payouts yet</p>
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