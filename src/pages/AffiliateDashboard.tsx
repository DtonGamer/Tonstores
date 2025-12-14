import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, TrendingUp, DollarSign, BarChart3, Award, Building, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AffiliateCard from "@/components/affiliate/AffiliateCard";
import AffiliateInviteCard from "@/components/affiliate/AffiliateInviteCard";
import AffiliateStatsCard from "@/components/affiliate/AffiliateStatsCard";
import AffiliateReferralCard from "@/components/affiliate/AffiliateReferralCard";

type Affiliate = {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  total_spent: number;
  commission_earned: number;
  commission_rate: number;
  user: {
    business_name: string;
    email: string;
    created_at: string;
  };
};

type Referral = {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  total_spent: number;
  commission_earned: number;
  commission_rate: number;
  referred_user_business_name: string;
  referred_user_created_at: string;
};

const AffiliateDashboard = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateStats, setAffiliateStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    commissionRate: 0,
    activeReferrals: 0
  });

  useEffect(() => {
    if (!user) return;

    const fetchAffiliateData = async () => {
      try {
        setLoading(true);

        // Check if user is an affiliate from their profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_affiliate, affiliate_status')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile data:', profileError);
        } else if (profileData?.is_affiliate) {
          setIsAffiliate(true);
        }

        // Fetch referrals if user is an affiliate
        if (profileData?.is_affiliate) {
          const { data: referralsData, error: referralsError } = await supabase
            .from('affiliate_with_profile_view')
            .select(`
              id,
              referrer_id,
              referred_user_id,
              status,
              joined_at,
              total_spent,
              commission_earned,
              commission_rate,
              referred_user_business_name,
              referred_user_created_at
            `)
            .eq('referrer_id', user.id)
            .order('joined_at', { ascending: false });

          if (referralsError) throw referralsError;

          setReferrals(referralsData || []);

          // Calculate stats
          const totalReferrals = referralsData?.length || 0;
          const totalEarnings = referralsData?.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0) || 0;
          const activeReferrals = referralsData?.filter(ref => ref.status === 'active').length || 0;

          setAffiliateStats({
            totalReferrals,
            totalEarnings,
            commissionRate: 20, // Default commission rate
            activeReferrals
          });
        }
      } catch (error: any) {
        console.error('Error fetching affiliate data:', error);
        toast({
          title: "Error loading affiliate data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateData();
  }, [user]);

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-Tonstores-green" />
      </div>
    );
  }

  const handleApplyForAffiliate = async () => {
    if (!user) return;

    try {
      // Create an affiliate application record by updating the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_affiliate: true,
          affiliate_status: 'pending'
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setIsAffiliate(true);
      toast({
        title: "Application submitted",
        description: "Your affiliate application has been submitted for review",
      });
    } catch (error: any) {
      console.error('Error applying for affiliate:', error);
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const affiliateLink = user
    ? `${window.location.origin}/register?ref=${profile?.referral_code || user.id}`
    : `${window.location.origin}/register`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Affiliate Program</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isAffiliate 
            ? "Manage your affiliate activities and track your earnings" 
            : "Join the affiliate program and start earning by referring other builders"}
        </p>
      </div>

      {isAffiliate ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AffiliateStatsCard
              title="Total Referrals"
              value={affiliateStats.totalReferrals}
              change="+5 this month"
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-Tonstores-green p-2 rounded-lg"
            />
            <AffiliateStatsCard
              title="Total Earnings"
              value={`₦${affiliateStats.totalEarnings.toLocaleString()}`}
              change="+15% from last month"
              icon={<DollarSign className="h-6 w-6 text-white" />}
              color="bg-Tonstores-green p-2 rounded-lg"
            />
            <AffiliateStatsCard
              title="Active Referrals"
              value={affiliateStats.activeReferrals}
              change="+3 this month"
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              color="bg-Tonstores-green p-2 rounded-lg"
            />
            <AffiliateStatsCard
              title="Commission Rate"
              value={`${affiliateStats.commissionRate}%`}
              change="Recurring commission"
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              color="bg-Tonstores-green p-2 rounded-lg"
            />
          </div>

          {/* Infrastructure Advocate Message */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-Tonstores-green/10 to-blue-500/10 border-0 shadow-lg dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="bg-Tonstores-green/20 p-3 rounded-full mr-4">
                    <Building className="h-6 w-6 text-Tonstores-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white">You're Building Infrastructure</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      As an infrastructure advocate, you're not just earning commissions—you're building parallel
                      infrastructure alongside Tonstores. When you help another builder professionalize, we all benefit:
                      you through commission, them through better infrastructure, all of us through a stronger community
                      of professional builders who aren't dependent on exploitative platforms.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Affiliate Invite Card */}
          <div className="mb-8">
            <AffiliateInviteCard
              affiliateLink={affiliateLink}
              onShare={() => {
                // Share functionality will be implemented
              }}
            />
          </div>

          {/* Referrals Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">Your Referrals</h2>
              <Link to="/affiliate/tools">
                <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                  View Tools
                </Button>
              </Link>
            </div>

            {referrals.length === 0 ? (
              <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-2 dark:text-white">No referrals yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Continue sharing your affiliate link to start building the ecosystem
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {referrals.map((referral) => (
                  <AffiliateReferralCard
                    key={referral.id}
                    id={referral.id}
                    referrerName={profile?.business_name || "You"}
                    businessName={referral.referred_user_business_name || "Unknown"}
                    joinDate={referral.joined_at}
                    status={referral.status}
                    totalSpent={referral.total_spent || 0}
                    commissionEarned={referral.commission_earned || 0}
                    commissionRate={referral.commission_rate || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Join the Infrastructure Advocate Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                As a builder promoting infrastructure to other builders, you'll be part of something larger.
                You're not just earning commissions—you're building the ecosystem.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                  <div className="bg-Tonstores-green/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-Tonstores-green" />
                  </div>
                  <h4 className="font-medium dark:text-white mb-1">Shared Success</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    When you help another builder professionalize, we all benefit.
                  </p>
                </div>

                <div className="p-4 border dark:border-gray-700 rounded-lg">
                  <div className="bg-Tonstores-green/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                    <Award className="h-5 w-5 text-Tonstores-green" />
                  </div>
                  <h4 className="font-medium dark:text-white mb-1">Recognition</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Top affiliates get recognized as infrastructure advocates in the community.
                  </p>
                </div>

                <div className="p-4 border dark:border-gray-700 rounded-lg">
                  <div className="bg-Tonstores-green/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                    <BarChart3 className="h-5 w-5 text-Tonstores-green" />
                  </div>
                  <h4 className="font-medium dark:text-white mb-1">Builder Tools</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get templates, case studies, and comparison documents to help other builders.
                  </p>
                </div>
              </div>

              <Button
                className="bg-Tonstores-green hover:bg-Tonstores-darkblue text-white"
                onClick={handleApplyForAffiliate}
              >
                Apply to Build Infrastructure
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Why Become an Infrastructure Advocate?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You're not just promoting software—you're promoting independence and infrastructure ownership:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-2 mt-0.5">
                    <TrendingUp className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Earn 20% recurring commission from builders you refer</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-2 mt-0.5">
                    <Building2 className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Build the parallel infrastructure ecosystem</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-2 mt-0.5">
                    <Users className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Join a community of builders helping builders</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-2 mt-0.5">
                    <Shield className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Help others avoid platform dependency</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AffiliateDashboard;