// This file helps ensure the build process works correctly for Vercel deployment with Supabase Edge Functions
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting build process for Vercel with Supabase Edge Functions...');

// Run the main build process
try {
  console.log('Running the Vercel build process...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully!');

  // After successful build, prepare to deploy Supabase Edge Functions
  console.log('Preparing to deploy Supabase Edge Functions...');

  // Check if supabase CLI exists
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    console.log('Supabase CLI found. Attempting to deploy functions...');

    // Run supabase functions deploy
    execSync('supabase functions deploy', {
      stdio: 'inherit',
      cwd: __dirname
    });

    console.log('Supabase Edge Functions deployed successfully!');
  } catch (funcError) {
    console.log('Supabase CLI not found or other issue occurred, skipping function deployment.');
    console.log('To deploy functions manually, ensure you have the Supabase CLI installed and run: supabase functions deploy');
    console.log('For more info: https://supabase.com/docs/guides/functions/getting-started');
  }

} catch (error) {
  console.error('Build failed:', error.message || error);
  process.exit(1);
}

console.log('Build and deployment preparation completed successfully!');