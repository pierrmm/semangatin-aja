import { Quote } from '../types';
import { supabase } from './supabase';

// Fetch quotes from Supabase
export const fetchQuotesFromDB = async (): Promise<Quote[]> => {
  try {
    const { data, error } = await supabase
      .from('motivational_quotes')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching quotes:', error);
    return [];
  }
};

// Add a new quote to Supabase
export const addQuote = async (quoteText: string, authorText: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('motivational_quotes')
      .insert([{ quote: quoteText, author: authorText }]);
    
    if (error) {
      console.error('Error adding quote:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error adding quote:', error);
    return false;
  }
};

// Edit an existing quote in Supabase
export const editQuote = async (id: number, quoteText: string, authorText: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('motivational_quotes')
      .update({ quote: quoteText, author: authorText })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating quote:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating quote:', error);
    return false;
  }
};

// Delete a quote from Supabase
export const deleteQuote = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('motivational_quotes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting quote:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting quote:', error);
    return false;
  }
};