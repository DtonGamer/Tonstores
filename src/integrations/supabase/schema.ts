import { supabase } from './client';

/**
 * Checks if the required database tables and columns exist
 * @returns Array of missing items or empty array if all required items exist
 */
export async function verifyDatabaseSchema(): Promise<string[]> {
  const missing: string[] = [];
  
  try {
    // Check if profiles table exists and has required columns
    const { data: profilesTableInfo, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      missing.push('profiles table');
    } else {
      // Check for required columns in profiles table
      try {
        // This will throw an error if any column is missing
        // Using limit 1 instead of 0 to avoid the limit(0) error
        const { error: columnsError } = await supabase
          .from('profiles')
          .select('id, email, business_name, role, created_at, updated_at, paystack_subaccount_id, kyc_verified, kyc_verified_at')
          .limit(1);

        if (columnsError) {
          const missingColumns = columnsError.message.match(/column "(.*?)" does not exist/g);
          if (missingColumns) {
            missing.push(...missingColumns);
          }
        }
      } catch (e) {
        missing.push('columns in profiles table');
      }
    }

    // Add checks for other required tables/columns as needed
    
  } catch (e) {
    console.error('Error verifying database schema:', e);
    missing.push('database connection failed');
  }
  
  return missing;
}

/**
 * Attempts to create missing tables/columns
 * Note: This requires appropriate database privileges
 */
export async function setupMissingSchema(): Promise<boolean> {
  try {
    // Try to create profiles table if missing
    const { error: createProfilesError } = await supabase.rpc('create_profiles_if_not_exists');
    
    if (createProfilesError) {
      console.error('Error creating profiles table:', createProfilesError);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error setting up schema:', e);
    return false;
  }
} 