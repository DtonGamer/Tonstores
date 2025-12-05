#!/usr/bin/env node

/**
 * Script to deploy the test_guest_id function to Supabase
 * 
 * Usage: 
 * node scripts/deploy-test-guest-id.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read the SQL file
const sqlFilePath = path.join(__dirname, '../supabase/migrations/test_guest_id_function.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

async function deployFunction() {
  try {
    console.log('Deploying test_guest_id function to Supabase...');
    
    // Execute the SQL directly using the REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Error deploying function:', error);
      process.exit(1);
    }
    
    console.log('Function deployed successfully!');
    console.log('You can now use supabase.rpc("test_guest_id") to verify guest sessions');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Execute the deployment
deployFunction(); 