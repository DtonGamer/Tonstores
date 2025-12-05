import { PaymentDashboard } from "@/components/payment/PaymentDashboard";

const Finances = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finances</h1>
        <p className="text-muted-foreground">
          Manage your payments, view your balance and transaction history.
        </p>
      </div>

      <PaymentDashboard />
    </div>
  );
};

export default Finances; 