import { supabase } from './client';

// Test database connectivity and table existence
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Auth connection:', user ? 'Connected' : 'Not authenticated');
    
    // Test tables existence
    const tables = ['profiles', 'doctors', 'appointments', 'hospitals', 'health_metrics', 'medications'] as const;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table as any)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table ${table} error:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists and accessible`);
        }
      } catch (err) {
        console.error(`❌ Table ${table} failed:`, err);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};
