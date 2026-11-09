import type { PaymentProviderAdapter } from './types'
import { verifyHmacSignature } from './hmac'
// TODO: REQUIRES MERCHANT CREDENTIALS — not live. Requires NAGAD_* env secrets in Edge Functions only.
// Never call provider APIs or mark paid from frontend. Webhook handler in supabase/functions/payment-webhook verifies signature server-side.
export const nagadAdapter: PaymentProviderAdapter = {
  id:'nagad', displayName:'nagad', isLive:false,
  async createPayment(){ throw new Error('nagad integration requires merchant credentials — not live. Configure NAGAD secrets in Supabase Edge Functions.') },
  async verifyWebhookSignature(payload, signature, secret){ return verifyHmacSignature(payload, signature, secret) },
  async handleWebhook(payload){ const p = payload as Record<string,unknown>; return { providerEventId: String(p['event_id'] ?? p['tran_id'] ?? ''), providerRef: String(p['paymentID'] ?? p['tran_id'] ?? ''), status:'pending', amountMinor:0, raw:payload } },
  async refund(){ throw new Error('nagad refund requires merchant credentials — not live') },
}
