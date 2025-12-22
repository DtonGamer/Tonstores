// For ES module environment, we need to import the modules properly
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySubaccountInPaystack(subaccountCode) {
  const PAYSTACK_SECRET_KEY = process.env.VITE_PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Missing Paystack secret key');
  }

  try {
    const response = await fetch(`https://api.paystack.co/subaccount/${subaccountCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.status) {
      console.log('Subaccount found in Paystack:', result.data);
      return { exists: true, data: result.data };
    } else {
      console.log('Subaccount not found in Paystack:', result.message);
      return { exists: false, error: result.message };
    }
  } catch (error) {
    console.error('Error verifying subaccount:', error);
    return { exists: false, error: error };
  }
}

async function testSubaccountForUser(userId) {
  console.log(`Testing subaccount for user: ${userId}`);

  // Get user profile from Supabase
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('paystack_subaccount_code, business_name, kyc_verified, paystack_kyc_status')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return;
  }

  console.log('Profile data:', profile);

  if (!profile.paystack_subaccount_code) {
    console.log('No Paystack subaccount code found for this user');
    return;
  }

  // Verify the subaccount exists in Paystack
  const verification = await verifySubaccountInPaystack(profile.paystack_subaccount_code);

  console.log(`Subaccount ${profile.paystack_subaccount_code} verification result:`, verification);

  return verification;
}

async function testAllSubaccounts() {
  console.log('Testing all user subaccounts...');

  // Get all profiles with Paystack subaccount codes
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, business_name, paystack_subaccount_code, kyc_verified, paystack_kyc_status')
    .not('paystack_subaccount_code', 'is', null);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`Found ${profiles.length} profiles with Paystack subaccount codes`);

  for (const profile of profiles) {
    console.log(`\nTesting profile: ${profile.business_name} (${profile.id})`);

    if (!profile.paystack_subaccount_code) {
      console.log('No subaccount code for this profile');
      continue;
    }

    const verification = await verifySubaccountInPaystack(profile.paystack_subaccount_code);

    console.log(`Result: ${verification.exists ? '✓ EXISTS' : '✗ MISSING'} - ${profile.paystack_subaccount_code}`);

    if (!verification.exists) {
      console.log(`  - KYC Verified: ${profile.kyc_verified}`);
      console.log(`  - KYC Status: ${profile.paystack_kyc_status}`);
    }
  }
}

// Run the test
async function runTest() {
  console.log('Starting Paystack subaccount verification test...\n');

  // Example: Test a specific user
  // await testSubaccountForUser('f4e30c3d-6cd7-4d71-887f-975abc91faf7');

  // Or test all users
  await testAllSubaccounts();

  console.log('\nTest completed.');
}

// Execute the test
runTest().catch(console.error);

export { testSubaccountForUser, testAllSubaccounts, verifySubaccountInPaystack, runTest };