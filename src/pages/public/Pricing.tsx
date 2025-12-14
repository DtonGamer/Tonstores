import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
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

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free";
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

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
      sessionStorage.setItem("selectedPlanId", plan.id);
      sessionStorage.setItem("selectedBillingCycle", billingCycle);
      navigate("/register");
      return;
    }
    setSelectedPlan(plan);
  };

  if (isLoading) return <LoadingState text="Loading pricing..." fullPage />;
  if (error || !plans || plans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          title="Failed to load pricing" 
          message="Please try again later." 
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <>
      <main className="flex-grow">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green z-0"></div>
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-block mb-4">
              <span className="bg-Tonstores-green/20 text-Tonstores-green text-sm font-medium px-4 py-2 rounded-full border border-Tonstores-green/30">
                Investment, Not Extraction
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Plans That Grow <span className="text-Tonstores-green">With Your Business</span>
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Choose your stage. Pay for infrastructure you control, not platform dependency.
            </p>
            
            <div className="mt-10">
              <Tabs defaultValue={billingCycle} className="w-full max-w-xs mx-auto" onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}>
                <TabsList className="w-full bg-white/20 backdrop-blur-sm rounded-full p-1">
                  <TabsTrigger value="monthly" className="flex-1 rounded-full text-white data-[state=active]:bg-white data-[state=active]:text-Tonstores-darkblue">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" className="flex-1 rounded-full text-white data-[state=active]:bg-white data-[state=active]:text-Tonstores-darkblue">
                    Yearly
                    <span className="ml-2 px-2 py-0.5 bg-Tonstores-green text-white text-xs rounded-full">Save 20%</span>
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
              {plans.map((plan) => {
                const isFreePlan = plan.monthly_price === 0;
                const stageLabels: Record<string, { label: string; description: string }> = {
                  'Free': {
                    label: 'Just Starting',
                    description: 'Testing products, building first customers, proving your concept.'
                  },
                  'Pro': {
                    label: 'Building Real Business',
                    description: 'Past proof-of-concept. Ready to professionalize and scale.'
                  },
                  'Business': {
                    label: 'Established Professional',
                    description: 'Running real operations. Need serious infrastructure.'
                  }
                };
                
                const stage = stageLabels[plan.name] || { label: plan.name, description: plan.description };
                
                return (
                  <div 
                    key={plan.id} 
                    className={`bg-white rounded-2xl shadow-lg border transition-all transform hover:-translate-y-2 ${
                      plan.is_popular ? 'border-Tonstores-green ring-4 ring-Tonstores-green/20' : 'border-gray-200'
                    }`}
                  >
                    {plan.is_popular && (
                      <div className="bg-Tonstores-green py-2 text-white text-center text-sm font-bold rounded-t-2xl">
                        Most Builders Choose This
                      </div>
                    )}
                    
                    <div className="p-8">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-Tonstores-darkblue">{plan.name}</h3>
                        <p className="text-sm font-medium text-Tonstores-green mt-1">{stage.label}</p>
                      </div>
                      <p className="text-gray-600 h-16 text-sm leading-relaxed">{stage.description}</p>
                      
                      <div className="mt-6">
                        <span className="text-4xl font-bold text-Tonstores-darkblue">
                          {formatCurrency(billingCycle === "monthly" ? plan.monthly_price : plan.yearly_price)}
                        </span>
                        {plan.monthly_price > 0 && (
                          <span className="text-gray-600 ml-2">
                            /{billingCycle === "monthly" ? "month" : "year"}
                          </span>
                        )}
                      </div>
                      
                      {billingCycle === "yearly" && calculateSavings(plan.monthly_price, plan.yearly_price) && (
                        <div className="mt-2 text-sm text-Tonstores-green font-medium">
                          Save {calculateSavings(plan.monthly_price, plan.yearly_price)} per year
                        </div>
                      )}
                      
                      {isFreePlan && (
                        <div className="mt-2 text-sm text-gray-600">
                          Free forever • No credit card needed
                        </div>
                      )}
                      
                      <div className="h-px bg-gray-200 my-6"></div>
                      
                      <ul className="space-y-3">
                        {plan.features.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <div className="bg-Tonstores-green/10 p-1 rounded-full mr-3 flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-Tonstores-green" />
                            </div>
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-8">
                        <Button 
                          className={`w-full py-6 text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium ${
                            plan.is_popular 
                              ? 'bg-Tonstores-green hover:bg-Tonstores-darkblue text-white' 
                              : 'bg-white border-2 border-gray-300 hover:border-Tonstores-green text-Tonstores-darkblue'
                          }`}
                          onClick={() => handlePlanSelect(plan)}
                        >
                          {isFreePlan ? "Start Building Free" : `Choose ${plan.name}`}
                          {plan.is_popular && <ArrowRight className="ml-2" size={20} />}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Why Pricing Different */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4 inline-block">
                  WHY THIS PRICING EXISTS
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue mb-6">
                  Investment vs. Extraction
                </h2>
                <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
              </div>
              
              <div className="bg-gray-50 p-8 md:p-12 rounded-2xl border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                      <X size={20} className="mr-2" />
                      Platform Extraction Model
                    </h3>
                    <ul className="space-y-3 text-gray-700 text-sm">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        <span>Free to hook you, extract value once dependent</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        <span>Take your customers, own the relationship</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        <span>Change rules whenever they want</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        <span>You build, they profit from your dependence</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-Tonstores-green mb-4 flex items-center">
                      <Check size={20} className="mr-2" />
                      Infrastructure Investment
                    </h3>
                    <ul className="space-y-3 text-gray-700 text-sm">
                      <li className="flex items-start">
                        <span className="text-Tonstores-green mr-2 mt-1">•</span>
                        <span>Small upfront commitment, you own the results</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-Tonstores-green mr-2 mt-1">•</span>
                        <span>You keep customers, data, control</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-Tonstores-green mr-2 mt-1">•</span>
                        <span>We earn your business by serving you</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-Tonstores-green mr-2 mt-1">•</span>
                        <span>We succeed only if you succeed—aligned interests</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-10 p-6 bg-Tonstores-darkblue text-white rounded-xl">
                  <p className="text-center leading-relaxed">
                    When you pay ₦15,000/month for Pro, you're not buying features. You're declaring: <span className="font-bold text-Tonstores-green">"I'm serious enough to invest in infrastructure I control."</span> That's the transformation—from excluded to self-sufficient.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Comparison Table */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue">
                What You Get at Each Stage
              </h2>
              <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-4 px-6 text-left text-gray-700 font-bold">What You Control</th>
                    <th className="py-4 px-6 text-center text-gray-700 font-bold">Free</th>
                    <th className="py-4 px-6 text-center text-gray-700 font-bold">Pro</th>
                    <th className="py-4 px-6 text-center text-gray-700 font-bold">Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Your data ownership</td>
                    <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-Tonstores-green mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-Tonstores-green mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-Tonstores-green mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Products you can manage</td>
                    <td className="py-4 px-6 text-center text-sm">10</td>
                    <td className="py-4 px-6 text-center text-sm">100</td>
                    <td className="py-4 px-6 text-center text-sm">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Active catalogs</td>
                    <td className="py-4 px-6 text-center text-sm">1</td>
                    <td className="py-4 px-6 text-center text-sm">3</td>
                    <td className="py-4 px-6 text-center text-sm">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Platform independence</td>
                    <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-Tonstores-green mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-Tonstores-green mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-Tonstores-green mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Sales intelligence</td>
                    <td className="py-4 px-6 text-center text-sm">Basic</td>
                    <td className="py-4 px-6 text-center text-sm">Platform-specific</td>
                    <td className="py-4 px-6 text-center text-sm">Full business intel</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700 font-medium">Custom branding</td>
                    <td className="py-4 px-6 text-center text-sm">-</td>
                    <td className="py-4 px-6 text-center text-sm">-</td>
                    <td className="py-4 px-6 text-center"><Check className="h-5 w-5 text-Tonstores-green mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* FAQ */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-Tonstores-darkblue">
                Common Questions
              </h2>
              <div className="w-24 h-1 bg-Tonstores-green mx-auto my-6 rounded-full"></div>
            </div>
            
            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-Tonstores-darkblue mb-3">Can I switch plans?</h3>
                <p className="text-gray-600 text-sm">Yes, anytime. Upgrade when you outgrow your current stage. Downgrade if you need to. Changes apply next billing cycle.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-Tonstores-darkblue mb-3">Is the Free plan really free forever?</h3>
                <p className="text-gray-600 text-sm">Yes. 10 products, 1 catalog, your data ownership. Forever. No credit card needed. Upgrade only when you're ready.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-Tonstores-darkblue mb-3">What if I cancel?</h3>
                <p className="text-gray-600 text-sm">Export your data anytime—it's yours. Cancel whenever. No lock-in, no penalties. We earn your business by serving you.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-Tonstores-darkblue mb-3">How is this different from Jumia/Konga?</h3>
                <p className="text-gray-600 text-sm">They own your customers. We give you infrastructure. Big difference: you control everything, not a marketplace.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-Tonstores-darkblue via-purple-900 to-Tonstores-green">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Building Without Permission
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              10 products free. No credit card. Own your infrastructure in 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="px-8 py-6 bg-white text-Tonstores-darkblue hover:bg-Tonstores-green hover:text-white text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 font-medium">
                  Start Free Now
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" className="px-8 py-6 text-lg border-white text-white bg-transparent hover:bg-white/10 rounded-xl font-medium">
                  See All Features
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