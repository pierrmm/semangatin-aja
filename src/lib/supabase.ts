import { createClient } from '@supabase/supabase-js';

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Supabase tables if they don't exist or are empty
export const initializeSupabaseTables = async () => {
  try {
    // Check if motivation_stats table has data
    const { data: statsData, error: statsError } = await supabase
      .from('motivation_stats')
      .select('count')
      .limit(1);
    
    if (statsError) {
      console.error('Error checking motivation_stats table:', statsError);
    }
    
    // If no data exists, create initial record
    if (!statsData || statsData.length === 0) {
      const { error: insertError } = await supabase
        .from('motivation_stats')
        .insert([{ count: 0 }]);
      
      if (insertError) {
        console.error('Error initializing motivation_stats table:', insertError);
      } else {
        console.log('Successfully initialized motivation_stats table');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
    return false;
  }
};

// Fetch motivation count from Supabase
export const fetchMotivationCount = async (): Promise<number> => {
  try {
    // Only use Supabase data to ensure consistency
    if (isSupabaseConfigured()) {
      // Get the count from Supabase
      const { data, error } = await supabase
        .from('motivation_stats')
        .select('count')
        .eq('id', 1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          // Create initial record if none exists
          const { data: newData, error: insertError } = await supabase
            .from('motivation_stats')
            .insert([{ id: 1, count: 0 }])
            .select();
          
          if (insertError) {
            console.error('Error creating initial motivation count:', insertError);
            return 0;
          }
          
          return newData?.[0]?.count || 0;
        } else {
          console.error('Error fetching motivation count:', error);
          return 0;
        }
      }
      
      // Save to localStorage for offline access
      if (typeof window !== 'undefined' && data) {
        localStorage.setItem('motivationCount', data.count.toString());
      }
      
      return data?.count || 0;
    } else {
      // Fallback to localStorage if Supabase is not configured
      if (typeof window !== 'undefined') {
        const savedCount = localStorage.getItem('motivationCount');
        if (savedCount) {
          return parseInt(savedCount, 10);
        }
      }
      return 0;
    }
  } catch (error) {
    console.error('Error in fetchMotivationCount:', error);
    return 0;
  }
};

// Update motivation count in Supabase
export const updateMotivationCount = async (currentCount: number): Promise<number> => {
  const newCount = currentCount + 1;
  console.log('Updating motivation count to:', newCount);
  
  // Save to localStorage for offline support
  if (typeof window !== 'undefined') {
    localStorage.setItem('motivationCount', newCount.toString());
    console.log('Saved to localStorage:', newCount);
  }
  
  // Try to update in Supabase if configured
  if (isSupabaseConfigured()) {
    console.log('Supabase is configured, attempting to update...');
    
    try {
      // Use the checkTableExists function here
      const tableExists = await checkTableExists('motivation_stats');
      console.log('Table exists:', tableExists);
      
      if (tableExists) {
        // Update in Supabase
        const { error } = await supabase
          .from('motivation_stats')
          .update({ count: newCount })
          .eq('id', 1);
        
        if (error) {
          console.error('Error updating motivation count:', error);
        }
      }
    } catch (error) {
      console.error('Unexpected error when updating motivation count:', error);
    }
  }
  
  return newCount;
};

// Helper function to check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Helper function to check if a table exists
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  
  try {
    // Query the information_schema to check if the table exists
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) {
      console.error('Error checking if table exists:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkTableExists:', error);
    return false;
  }
};