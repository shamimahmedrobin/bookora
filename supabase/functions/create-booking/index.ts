// Edge Function: create-booking — server-only, uses SUPABASE_SERVICE_ROLE_KEY (never expose to client)
// Validates input, rechecks availability via create_booking() RPC (transaction + EXCLUDE constraint), checks plan limits inside DB function.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return json({ error: 'Server not configured: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing' }, 500)
  const body = await req.json().catch(() => null)
  if (!body?.businessId || !body?.staffId || !body?.serviceId || !body?.startAt || !body?.endAt || !body?.customerName) return json({ error: 'Missing required fields' }, 400)
  if (new Date(body.endAt) <= new Date(body.startAt)) return json({ error: 'endAt must be after startAt' }, 400)
  const supabase = createClient(url, key)
  const { data, error } = await supabase.rpc('create_booking', { p_business: body.businessId, p_staff: body.staffId, p_service: body.serviceId, p_start: body.startAt, p_end: body.endAt, p_customer_name: String(body.customerName).slice(0,120), p_customer_phone: body.customerPhone ?? null, p_customer_email: body.customerEmail ?? null, p_total_minor: Number.isInteger(body.totalMinor) ? body.totalMinor : 0 })
  if (error) { const code = error.message.includes('SLOT_UNAVAILABLE') ? 409 : error.message.includes('PLAN_LIMIT') ? 402 : 400; return json({ error: error.message }, code) }
  // Queue confirmation notification (job row; send-notification processes it)
  await supabase.from('notification_jobs').insert({ business_id: body.businessId, template_key: 'booking_confirmation', channel: 'email', recipient: body.customerEmail ?? body.customerPhone ?? '', payload: { ref: data.booking_reference } })
  return json({ booking: data }, 201)
  function json(obj: unknown, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } }) }
})
