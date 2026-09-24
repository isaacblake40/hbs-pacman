import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveScore(name: string, score: number): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase.from('leaderboard').insert([
    {
      name,
      score,
      time: now,
    },
  ]);

  if (error) {
    console.error('Error saving score:', error);
    throw error;
  }
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}
