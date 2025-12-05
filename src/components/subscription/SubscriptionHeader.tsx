import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { SubscriptionDialog } from './SubscriptionDialog';

export function SubscriptionHeader() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { subscription } = useSubscription();
  const { data: plans } = usePricingPlans();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Find the next tier plan (if any)
  const currentPlanIndex = plans?.findIndex(plan => 
    plan.id === subscription?.plan_id
  ) ?? -1;
  
  const nextTierPlan = currentPlanIndex >= 0 && currentPlanIndex < (plans?.length ?? 0) - 1
    ? plans?.[currentPlanIndex + 1]
    : null;

  const handleUpgradeClick = () => {
    if (nextTierPlan) {
      setSelectedPlanId(nextTierPlan.id);
      setDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedPlanId(null);
  };

  const selectedPlan = plans?.find(plan => plan.id === selectedPlanId);

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 py-2 px-4 flex justify-end items-center border-b dark:border-gray-800">
      <Button 
        onClick={handleUpgradeClick}
        className="bg-tonstores-green hover:bg-tonstores-darkblue text-white flex items-center gap-2"
        disabled={!nextTierPlan}
      >
        <ArrowUpCircle size={18} />
        <span className="text-white">Upgrade Subscription</span>
      </Button>

      {selectedPlan && (
        <SubscriptionDialog
          isOpen={dialogOpen}
          onClose={closeDialog}
          plan={selectedPlan}
          billingCycle={billingCycle}
        />
      )}
    </div>
  );
} 