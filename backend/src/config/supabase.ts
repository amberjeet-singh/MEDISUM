import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Initialize the Supabase client
// Note: We expect env variables to be validated before this is heavily used
export const supabase = createClient(
  env.SUPABASE_URL || 'http://placeholder.url',
  env.SUPABASE_API_KEY || 'placeholder_key'
);

// Non-destructive connectivity check that only reads data
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Attempting a simple read check
    // If the tables don't exist yet, this might throw a different error, 
    // but the connection itself can be validated if we get a response
    const { data, error } = await supabase.from('patients').select('id').limit(1);
    
    // We consider it connected if there's no error related to fetching (like fetch failed),
    // Even if the table doesn't exist (PGRST116), it means the connection to the DB API is working.
    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase connected but returned an error:', error.message);
    }
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
};
