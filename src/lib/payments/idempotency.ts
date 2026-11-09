// Webhook idempotency: dedupe by provider + provider event id. In production backed by
// payment_events unique constraint (provider, provider_event_id) + webhook_deliveries table.
const seen = new Set<string>()
export function idempotencyKey(provider: string, eventId: string){ return `${provider}:${eventId}` }
export function isDuplicateWebhook(provider: string, eventId: string): boolean { return seen.has(idempotencyKey(provider,eventId)) }
export function markWebhookProcessed(provider: string, eventId: string): void { seen.add(idempotencyKey(provider,eventId)) }
export function processWebhookOnce<T>(provider: string, eventId: string, fn: ()=>T): {duplicate:boolean; result?:T} {
  if (isDuplicateWebhook(provider,eventId)) return {duplicate:true}
  const result = fn(); markWebhookProcessed(provider,eventId); return {duplicate:false, result}
}
export function _resetIdempotencyForTests(){ seen.clear() }
