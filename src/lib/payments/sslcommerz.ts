import type { PaymentProviderAdapter } from './types'
import { verifyHmacSignature } from './hmac'
// TODO: REQUIRES MERCHANT CREDENTIALS — not live. Requires SSLCOMMERZ_* env secrets in Edge Functions only.
// Never call provider APIs or mark paid from frontend. Webhook handler in supabase/functions/payment-webhook verifies signature server-side.
export const sslcommerzAdapter: PaymentProviderAdapter = {
  id:'sslcommerz', displayName:'sslcommerz', isLive:false,
  async createPayment(){ throw new Error('sslcommerz integration requires merchant credentials — not live. Configure SSLCOMMERZ secrets in Supabase Edge Functions.') },
  async verifyWebhookSignature(payload, signature, secret){ return verifyHmacSignature(payload, signature, secret) },
  async handleWebhook(payload){ const p = payload as Record<string,unknown>; return { providerEventId: String(p['event_id'] ?? p['tran_id'] ?? ''), providerRef: String(p['paymentID'] ?? p['tran_id'] ?? ''), status:'pending', amountMinor:0, raw:payload } },
  async refund(){ throw new Error('sslcommerz refund requires merchant credentials — not live') },
}
