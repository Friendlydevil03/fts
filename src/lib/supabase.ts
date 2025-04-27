import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function for transaction subscriptions
export const subscribeToTransaction = (
  transactionId: string,
  callback: (transaction: any) => void
) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // In demo mode, simulate subscription with setTimeout
    setTimeout(() => {
      callback({
        id: transactionId,
        status: 'confirmed',
        // Add other fields as needed
      });
    }, 3000);
    return {
      unsubscribe: () => {}
    };
  }

  return supabase
    .channel(`transaction-${transactionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `id=eq.${transactionId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};