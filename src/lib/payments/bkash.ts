import type { PaymentProviderAdapter } from './types'
import { verifyHmacSignature } from './hmac'
// TODO: REQUIRES MERCHANT CREDENTIALS — not live. Requires BKASH_* env secrets in Edge Functions only.
// Never call provider APIs or mark paid from frontend. Webhook handler in supabase/functions/payment-webhook verifies signature server-side.
export const bkashAdapter: PaymentProviderAdapter = {
  id:'bkash', displayName:'bkash', isLive:false,
  async createPayment(){ throw new Error('bkash integration requires merchant credentials — not live. Configure BKASH secrets in Supabase Edge Functions.') },
  async verifyWebhookSignature(payload, signature, secret){ return verifyHmacSignature(payload, signature, secret) },
  async handleWebhook(payload){ const p = payload as Record<string,unknown>; return { providerEventId: String(p['event_id'] ?? p['tran_id'] ?? ''), providerRef: String(p['paymentID'] ?? p['tran_id'] ?? ''), status:'pending', amountMinor:0, raw:payload } },
  async refund(){ throw new Error('bkash refund requires merchant credentials — not live') },
}
