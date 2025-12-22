#!/usr/bin/env node

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import { testAllSubaccounts, testSubaccountForUser } from './test_subaccount_verification.js';

async function main() {
  console.log('Environment variables check:');
  console.log('- SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('- SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('- PAYSTACK_SECRET_KEY:', process.env.VITE_PAYSTACK_SECRET_KEY ? 'SET' : 'NOT SET');

  console.log('\nStarting subaccount verification test...\n');

  // Test all subaccounts
  await testAllSubaccounts();

  console.log('\nTest completed.');
}

// Run the script
main().catch(console.error);