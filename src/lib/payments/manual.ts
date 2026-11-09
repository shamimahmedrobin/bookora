import type { PaymentProviderAdapter } from './types'
export const manualAdapter: PaymentProviderAdapter = {
  id:'manual', displayName:'Pay at business / Cash', isLive:true,
  async createPayment(input){ return { providerRef:`MANUAL-${input.appointmentId.slice(0,8)}`, status:'pending' } },
  async verifyWebhookSignature(){ return false }, // manual has no webhooks
  async handleWebhook(){ throw new Error('Manual payments have no webhooks — staff confirms receipt in dashboard') },
  async refund(providerRef){ return { refundRef:`REF-${providerRef}`, status:'pending_manual_refund' } },
}
