import { supabase } from '../lib/supabase';
import { KARMA_RULES, KarmaEvent } from '../config/karma';

/**
 * Applies a karma event to a specific user profile in Supabase.
 * @param userId The ID of the user receiving the karma.
 * @param event The karma event that occurred.
 */
export async function applyKarmaEvent(userId: string, event: KarmaEvent): Promise<void> {
  if (!userId) return;

  const pointsToAdd = KARMA_RULES[event];

  try {
    // We use a stored procedure (RPC) for atomic updates if possible, 
    // but since we only have a basic table, we fetch, calculate, and update.
    // In a full production environment with high concurrency, use an RPC.
    
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('karma_points')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch profile for karma update:', fetchError);
      return;
    }

    const currentKarma = profile?.karma_points || 0;
    const newKarma = Math.max(0, currentKarma + pointsToAdd);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ karma_points: newKarma, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update karma:', updateError);
    }
  } catch (err) {
    console.error('Unexpected error during karma update:', err);
  }
}
