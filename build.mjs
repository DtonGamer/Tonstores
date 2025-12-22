// This file helps ensure the build process works correctly for Vercel deployment with Supabase Edge Functions
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting build process for Vercel...');

// Run the main build process
try {
  console.log('Running the Vercel build process...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully!');

} catch (error) {
  console.error('Build failed:', error.message || error);
  process.exit(1);
}

console.log('Build completed successfully!');