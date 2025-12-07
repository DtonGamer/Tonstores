import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorMessage } from "@/components/ui/error-message";
import useAuth from "@/contexts/AuthContext";
import { SubscriptionDialog } from "@/components/subscription/SubscriptionDialog";
import { PricingPlan } from "@/hooks/usePricingPlans";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const { data: plans = [], isLoading, error, refetch } = usePricingPlans();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Log the plans data to troubleshoot
   // console.log("Pricing plans loaded:", plans);
  }, [plans]);

  // Format currency in Naira
  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free";
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100); // Convert from kobo to naira
  };

  // Calculate savings for yearly billing
  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    if (monthlyPrice === 0) return null;
    
    const monthlyCost = monthlyPrice * 12;
    const yearlyCost = yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    
    if (savings <= 0) return null;
    
    return formatCurrency(savings);
  };

  const handlePlanSelect = (plan: PricingPlan) => {
    if (!user) {
      // Store the plan selection in session storage for after login
      sessionStorage.setItem("selectedPlanId", plan.id);
      sessionStorage.setItem("selectedBillingCycle", billingCycle);
      navigate("/register");
      return;
    }

    setSelectedPlan(plan);
  };

  if (isLoading) {
    return <LoadingState text="Loading pricing plans..." fullPage />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          title="Failed to load pricing plans" 
          message="We couldn't load the pricing information at this time." 
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // If plans array is empty or undefined but not loading, show error
  if (!plans || plans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          title="No pricing plans available" 
          message="We couldn't find any pricing plans at this time. Please try again later." 
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-tonstores-darkblue via-purple-900 to-tonstores-green z-0"></div>
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 inline-block mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Simple, Transparent Pricing</h1>
            </div>
            <p className="mt-6 text-xl text-white max-w-3xl mx-auto">
              Choose the plan that's right for your business. Start with our free plan and upgrade as you grow.
            </p>
            
            {/* Billing Toggle */}
            <div className="mt-10">
              <Tabs defaultValue={billingCycle} className="w-full max-w-xs mx-auto" onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}>
                <TabsList className="w-full bg-white/20 backdrop-blur-sm rounded-full p-1">
                  <TabsTrigger value="monthly" className="flex-1 rounded-full text-white data-[state=active]:bg-white data-[state=active]:text-tonstores-darkblue">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" className="flex-1 rounded-full text-white data-[state=active]:bg-white data-[state=active]:text-tonstores-darkblue">
                    Yearly
                    <span className="ml-2 px-2 py-0.5 bg-tonstores-green text-white text-xs rounded-full">Save 20%</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </section>
        
        {/* Pricing Cards */}
        <section className="py-20 bg-white relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`bg-white rounded-2xl shadow-lg border transition-all transform hover:-translate-y-2 ${
                    plan.is_popular ? 'border-tonstores-green ring-4 ring-tonstores-green/20' : 'border-gray-200'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="bg-tonstores-green py-2 text-white text-center text-sm font-bold rounded-t-2xl">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-tonstores-darkblue">{plan.name}</h3>
                    <p className="mt-2 text-gray-600 h-12">{plan.description}</p>
                    
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-tonstores-darkblue">
                        {formatCurrency(billingCycle === "monthly" ? plan.monthly_price : plan.yearly_price)}
                      </span>
                      {plan.monthly_price > 0 && (
                        <span className="text-gray-600 ml-2">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      )}
                    </div>
                    
                    {billingCycle === "yearly" && calculateSavings(plan.monthly_price, plan.yearly_price) && (
                      <div className="mt-2 text-sm text-tonstores-green font-medium">
                        Save {calculateSavings(plan.monthly_price, plan.yearly_price)} per year
                      </div>
                    )}
                    
                    <div className="h-px bg-gray-200 my-6"></div>
                    
                    <ul className="space-y-4">
                      {/* Product and Catalog Limits */}
                      <li className="flex items-start">
                        <div className="bg-tonstores-green/10 p-1 rounded-full mr-3 flex-shrink-0">
                          <Check className="h-4 w-4 text-tonstores-green" />
                        </div>
                        <span className="text-gray-700">
                          {plan.features.product_limit === -1 
                            ? "Unlimited products" 
                            : `Up to ${plan.features.product_limit} products`}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-tonstores-green/10 p-1 rounded-full mr-3 flex-shrink-0">
                          <Check className="h-4 w-4 text-tonstores-green" />
                        </div>
                        <span className="text-gray-700">
                          {plan.features.catalog_limit === -1 
                            ? "Unlimited catalogs" 
                            : `${plan.features.catalog_limit} active catalog${plan.features.catalog_limit > 1 ? 's' : ''}`}
                        </span>
                      </li>
                      
                      {/* Analytics and Support Level */}
                      <li className="flex items-start">
                        <div className="bg-tonstores-green/10 p-1 rounded-full mr-3 flex-shrink-0">
                          <Check className="h-4 w-4 text-tonstores-green" />
                        </div>
                        <span className="text-gray-700">{plan.features.analytics}</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-tonstores-green/10 p-1 rounded-full mr-3 flex-shrink-0">
                          <Check className="h-4 w-4 text-tonstores-green" />
                        </div>
                        <span className="text-gray-700">{plan.features.support_level}</span>
                      </li>
                      
                      {/* Additional Features */}
                      {plan.features.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="bg-tonstores-green/10 p-1 rounded-full mr-3 flex-shrink-0">
                            <Check className="h-4 w-4 text-tonstores-green" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-8">
                      <Button 
                        className={`w-full py-6 text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium ${
                          plan.is_popular 
                            ? 'bg-tonstores-green hover:bg-tonstores-darkblue text-white' 
                            : 'bg-white border-2 border-gray-300 hover:border-tonstores-green text-tonstores-darkblue'
                        }`}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        {plan.name === "Free" ? "Get Started" : 
                         plan.name === "Enterprise" ? "Contact Sales" : 
                         `Choose ${plan.name}`}
                        
                        {plan.is_popular && <ArrowRight className="ml-2" size={20} />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Feature Comparison Table */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                DETAILED COMPARISON
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue">
                Compare Plan Features
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                See what's included in each plan to find the perfect fit for your business
              </p>
              <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-4 px-6 text-left text-gray-700">Feature</th>
                    <th className="py-4 px-6 text-center text-gray-700">Free</th>
                    <th className="py-4 px-6 text-center text-gray-700">Pro</th>
                    <th className="py-4 px-6 text-center text-gray-700">Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Number of Products</td>
                    <td className="py-4 px-6 text-center">10</td>
                    <td className="py-4 px-6 text-center">50</td>
                    <td className="py-4 px-6 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Active Catalogs</td>
                    <td className="py-4 px-6 text-center">1</td>
                    <td className="py-4 px-6 text-center">3</td>
                    <td className="py-4 px-6 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">WhatsApp Integration</td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-tonstores-green mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-tonstores-green mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-tonstores-green mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Analytics</td>
                    <td className="py-4 px-6 text-center">Basic</td>
                    <td className="py-4 px-6 text-center">Advanced</td>
                    <td className="py-4 px-6 text-center">Full</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Custom Domain</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-tonstores-green mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-tonstores-green mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Priority Support</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center">-</td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-tonstores-green mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="bg-tonstores-green/10 text-tonstores-green text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                QUESTIONS ANSWERED
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-tonstores-darkblue">
                Frequently Asked Questions
              </h2>
              <div className="w-24 h-1 bg-tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-tonstores-darkblue">Can I switch plans later?</h3>
                <p className="mt-3 text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-tonstores-darkblue">Do you offer a free trial?</h3>
                <p className="mt-3 text-gray-600">Our Free plan is available indefinitely. You can use it to explore the basic features and upgrade when you need more capabilities.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-tonstores-darkblue">What payment methods do you accept?</h3>
                <p className="mt-3 text-gray-600">We accept all major credit cards, debit cards, and bank transfers in Nigerian Naira.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-tonstores-darkblue">Is there a setup fee?</h3>
                <p className="mt-3 text-gray-600">No, there are no setup fees for any of our plans. You only pay the advertised price.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-tonstores-darkblue via-purple-900 to-tonstores-green">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join thousands of Nigerian businesses already using TonStores to sell through WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="px-8 py-6 bg-white text-tonstores-darkblue hover:bg-tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                  Create Free Account
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" className="px-8 py-6 text-lg border-white text-white bg-transparent hover:bg-white/10 rounded-xl font-medium">
                  Explore Features
                  </Button>
                </Link>
            </div>
          </div>
        </section>
      </main>

      {selectedPlan && (
        <SubscriptionDialog
          isOpen={!!selectedPlan}
          plan={selectedPlan}
          billingCycle={billingCycle}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </>
  );
};

export default Pricing; 