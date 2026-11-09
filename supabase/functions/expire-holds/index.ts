// Edge Function: expire-holds — invoke on a schedule (e.g. every minute via cron / Supabase scheduled function)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
Deno.serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data, error } = await supabase.rpc('expire_booking_holds')
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  return new Response(JSON.stringify({ expired: data }), { headers: { 'Content-Type': 'application/json' } })
})
