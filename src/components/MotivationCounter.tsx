import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchMotivationCount } from '../lib/supabase';

interface MotivationCounterProps {
  count: number;
  onCountUpdated?: (newCount: number) => void;
}

export default function MotivationCounter({ count: initialCount, onCountUpdated }: MotivationCounterProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch the latest count from Supabase when component mounts
  useEffect(() => {
    const getLatestCount = async () => {
      setIsLoading(true);
      try {
        const latestCount = await fetchMotivationCount();
        setCount(latestCount);
        if (onCountUpdated) {
          onCountUpdated(latestCount);
        }
      } catch (error) {
        console.error('Error fetching motivation count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getLatestCount();

    // Set up a subscription to listen for changes to the motivation_stats table
    const subscription = supabase
      .channel('motivation-stats-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'motivation_stats' }, 
        async (payload) => {
          if (payload.new && typeof payload.new.count === 'number') {
            setCount(payload.new.count);
            if (onCountUpdated) {
              onCountUpdated(payload.new.count);
            }
          } else {
            // If we can't get the count from the payload, fetch it
            const latestCount = await fetchMotivationCount();
            setCount(latestCount);
            if (onCountUpdated) {
              onCountUpdated(latestCount);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [onCountUpdated]);

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm shadow-lg">
      {isLoading ? (
        <span className="inline-block animate-pulse">Memuat...</span>
      ) : (
        <>
          <span className="font-bold">{count.toLocaleString()}</span> orang telah termotivasi hari ini!
        </>
      )}
    </div>
  );
}