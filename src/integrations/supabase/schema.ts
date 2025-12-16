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
        // Instead of selecting all columns at once which might cause URL length issues,
        // check for individual columns that are most critical
        const criticalColumns = ['id', 'email', 'business_name', 'role', 'created_at', 'updated_at'];

        for (const column of criticalColumns) {
          const { error: columnError } = await supabase
            .from('profiles')
            .select(column)
            .limit(1);

          if (columnError) {
            missing.push(`column "${column}" in profiles table`);
          }
        }

        // Additional check for specific Paystack-related columns
        const paystackColumns = ['paystack_subaccount_code', 'kyc_verified', 'kyc_verified_at'];
        for (const column of paystackColumns) {
          const { error: columnError } = await supabase
            .from('profiles')
            .select(column)
            .limit(1);

          if (columnError) {
            missing.push(`column "${column}" in profiles table`);
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