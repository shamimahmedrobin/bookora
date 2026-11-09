// Edge Function: payment-webhook — verify signature server-side, idempotent by (provider, provider_event_id).
// NEVER mark paid from a frontend callback. Secrets: BKASH_*, NAGAD_*, SSLCOMMERZ_*, SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
async function hmacHex(secret: string, payload: string) { const enc = new TextEncoder(); const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); const s = await crypto.subtle.sign('HMAC', k, enc.encode(payload)); return [...new Uint8Array(s)].map(b => b.toString(16).padStart(2, '0')).join('') }
Deno.serve(async (req) => {
  const provider = new URL(req.url).searchParams.get('provider')
  if (!['bkash','nagad','sslcommerz'].includes(provider ?? '')) return new Response('Unknown provider', { status: 400 })
  const raw = await req.text()
  const secret = Deno.env.get(`${provider!.toUpperCase()}_WEBHOOK_SECRET`) ?? ''
  const signature = req.headers.get('x-signature') ?? ''
  if (!secret) return new Response('Webhook secret not configured — REQUIRES MERCHANT CREDENTIALS', { status: 500 })
  const expected = await hmacHex(secret, raw)
  if (expected !== signature.toLowerCase()) return new Response('Invalid signature', { status: 401 })
  let payload: Record<string, unknown>; try { payload = JSON.parse(raw) } catch { return new Response('Invalid JSON', { status: 400 }) }
  const eventId = String(payload.event_id ?? payload.tran_id ?? payload.paymentID ?? '')
  if (!eventId) return new Response('Missing event id', { status: 400 })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { error: dupErr } = await supabase.from('webhook_deliveries').insert({ provider, provider_event_id: eventId, event_type: 'payment', payload, status: 'processing' })
  if (dupErr) return new Response(JSON.stringify({ duplicate: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }) // idempotent: already processed
  // TODO: map provider-specific status fields after merchant onboarding; only a verified provider success status may set payment_transactions.status='paid' + insert payment_events.
  await supabase.from('webhook_deliveries').update({ status: 'processed' }).eq('provider', provider).eq('provider_event_id', eventId)
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
