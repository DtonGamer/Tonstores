import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import KYCForm from "./KYCForm";
import { LoadingState } from "@/components/ui/loading-state";
import ConnectedAccountInfo from "./ConnectedAccountInfo";

export function PaymentSettings() {
  const { profile, loading } = useProfile();
  
  if (loading) {
    return <LoadingState text="Loading payment settings..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment Settings</h2>
        <p className="text-muted-foreground">
          Configure your payment account settings to receive payouts from your sales.
        </p>
      </div>

      <div className="space-y-4">
        {profile?.kyc_verified ? (
          <ConnectedAccountInfo profile={profile} />
        ) : (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Payment Account Setup</CardTitle>
              <CardDescription>
                Provide your bank details to receive payouts from your sales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KYCForm />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PaymentSettings; 