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
        <h1 className="text-2xl font-bold dark:text-white">Earn by sharing Tonstores</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isAffiliate 
            ? "Share your link, see who joined and track what you earn"
            : "Earn by recommending Tonstores to sellers you know"}
        </p>
      </div>

      {isAffiliate ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AffiliateStatsCard
              title="Sellers referred"
              value={affiliateStats.totalReferrals}
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-Tonstores-green p-2 rounded-lg"
            />
            <AffiliateStatsCard
              title="Total earnings"
              value={`₦${affiliateStats.totalEarnings.toLocaleString()}`}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              color="bg-Tonstores-green p-2 rounded-lg"
            />
            <AffiliateStatsCard
              title="Active sellers"
              value={affiliateStats.activeReferrals}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              color="bg-Tonstores-green p-2 rounded-lg"
            />
            <AffiliateStatsCard
              title="Commission"
              value={`${affiliateStats.commissionRate}%`}
              change="Every month they stay subscribed"
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              color="bg-Tonstores-green p-2 rounded-lg"
            />
          </div>

          {/* How you earn */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h3 className="text-lg font-extrabold mb-1">How you earn</h3>
            <p className="text-muted-foreground">
              Share your link with sellers you know. When they subscribe, you earn 20% of what they pay, every month they stay.
            </p>
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
              <h2 className="text-xl font-extrabold">Sellers you referred</h2>
              <Link to="/affiliate/tools">
                <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                  Messages and tips
                </Button>
              </Link>
            </div>

            {referrals.length === 0 ? (
              <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-2 dark:text-white">No one has joined with your link yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Send your link to a seller you know on WhatsApp. Check "Messages and tips" for something to copy.
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
          <Card className="mb-8 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Earn by sharing Tonstores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Know a seller who still retypes prices on WhatsApp? Send them your link. When they subscribe, you earn.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                  <div className="bg-Tonstores-green/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-Tonstores-green" />
                  </div>
                  <h4 className="font-semibold mb-1">Earn every month</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You earn 20% of what each seller you refer pays, for as long as they stay subscribed.
                  </p>
                </div>

                <div className="p-4 border dark:border-gray-700 rounded-lg">
                  <div className="bg-Tonstores-green/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                    <Award className="h-5 w-5 text-Tonstores-green" />
                  </div>
                  <h4 className="font-semibold mb-1">Ready-made messages</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Copy and send WhatsApp messages instead of writing from scratch.
                  </p>
                </div>

                <div className="p-4 border dark:border-gray-700 rounded-lg">
                  <div className="bg-Tonstores-green/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                    <BarChart3 className="h-5 w-5 text-Tonstores-green" />
                  </div>
                  <h4 className="font-semibold mb-1">Track your referrals</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    See who joined with your link and what you have earned.
                  </p>
                </div>
              </div>

              <Button
                className="bg-Tonstores-green hover:bg-Tonstores-greendark text-white"
                onClick={handleApplyForAffiliate}
              >
                Join the program
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">Why share Tonstores?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                A simple way to earn from people you already know:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-2 mt-0.5">
                    <TrendingUp className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Earn 20% every month from sellers you refer</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-2 mt-0.5">
                    <Building className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Help sellers you know save time</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-2 mt-0.5">
                    <Users className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Get messages you can copy and send</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-Tonstores-green/10 rounded-full p-1 mr-2 mt-0.5">
                    <Shield className="h-4 w-4 text-Tonstores-green" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Your link works on WhatsApp, Instagram and TikTok</span>
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