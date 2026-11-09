import { createClient, type SupabaseClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const isDemoMode = !url || !anon
// Never hardcode secrets. Service role key is NEVER used in client code.
export const supabase: SupabaseClient | null = isDemoMode ? null : createClient(url!, anon!)
export function requireSupabase(): SupabaseClient { if (!supabase) throw new Error('Supabase not configured — running in demo mode'); return supabase }
