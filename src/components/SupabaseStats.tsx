import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseStats() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [quotesCount, setQuotesCount] = useState<number>(0);

  // Fetch current count from Supabase
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if the tables exist and get quotes count
      const { count: quotesCount, error: quotesError } = await supabase
        .from('motivational_quotes')
        .select('*', { count: 'exact' });
      
      if (quotesError) {
        console.log('Error checking quotes table:', quotesError);
      } else {
        setQuotesCount(quotesCount || 0);
      }
      
      // Get stats count
      const { data: statsData, error: statsError } = await supabase
        .from('motivation_stats')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.log('Error fetching stats:', statsError);
      } else if (statsData) {
        setCount(statsData.count || 0);
        setSuccess('Data berhasil dimuat dari Supabase');
      } else {
        // Create initial record if it doesn't exist
        await initializeStats();
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use effect to fetch stats on component mount
  useEffect(() => {
    fetchStats();
    
    // Set up a listener for changes to the quotes table
    const quotesSubscription = supabase
      .channel('quotes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'motivational_quotes' }, () => {
        fetchStats(); // Refresh stats when quotes change
      })
      .subscribe();
    
    return () => {
      quotesSubscription.unsubscribe();
    };
  }, [fetchStats]);

  // Initialize stats table with a record if it doesn't exist
  const initializeStats = async () => {
    try {
      const { error } = await supabase
        .from('motivation_stats')
        .insert([{ id: 1, count: 0 }]);
      
      if (error) {
        console.error('Error initializing stats:', error);
        setError('Failed to initialize stats table');
      } else {
        setCount(0);
        setSuccess('Stats table initialized successfully');
      }
    } catch (err) {
      console.error('Error in initializeStats:', err);
      setError('Failed to initialize stats table');
    }
  };

  // Function to increment count
  const incrementCount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newCount = count + 1;
      
      // Update the stats record
      const { error } = await supabase
        .from('motivation_stats')
        .update({ count: newCount })
        .eq('id', 1);
      
      if (error) {
        throw new Error(`Error updating stats: ${error.message}`);
      }
      
      setCount(newCount);
      setSuccess('Statistik berhasil diperbarui');
    } catch (err) {
      console.error('Error incrementing count:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset count
  const resetCount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update the stats record to reset count
      const { error } = await supabase
        .from('motivation_stats')
        .update({ count: 0 })
        .eq('id', 1);
      
      if (error) {
        throw new Error(`Error resetting stats: ${error.message}`);
      }
      
      setCount(0);
      setSuccess('Statistik berhasil direset');
    } catch (err) {
      console.error('Error resetting count:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh stats
  const refreshStats = () => {
    fetchStats();
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200 rounded-lg">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
      
      {success && !error && (
        <div className="p-4 bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200 rounded-lg">
          <p className="font-medium">{success}</p>
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Statistik Motivasi</h4>
          <button 
            onClick={refreshStats}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Refresh statistik"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Klik Motivasi</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{isLoading ? '...' : count}</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Quote</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{isLoading ? '...' : quotesCount}</p>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={incrementCount}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memperbarui...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Tambah Klik
            </>
          )}
        </button>
        <button
          onClick={resetCount}
          disabled={isLoading || count === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mereset...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Reset Klik
            </>
          )}
        </button>
      </div>
    </div>
  );
}