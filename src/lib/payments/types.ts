export type PaymentProviderId = 'manual'|'bkash'|'nagad'|'sslcommerz'|'stripe'
export type PaymentStatus = 'pending'|'processing'|'paid'|'failed'|'refunded'|'partially_refunded'|'cancelled'
export interface CreatePaymentInput { businessId:string; appointmentId:string; amountMinor:number; currency:string; customerPhone?:string; customerEmail?:string; returnUrl:string }
export interface CreatePaymentResult { providerRef:string; redirectUrl?:string; status:PaymentStatus; raw?:unknown }
export interface WebhookEvent { providerEventId:string; providerRef:string; status:PaymentStatus; amountMinor:number; raw:unknown }
export interface PaymentProviderAdapter {
  id: PaymentProviderId; displayName: string; isLive: boolean
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>
  verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean>
  handleWebhook(payload: unknown): Promise<WebhookEvent>
  refund(providerRef: string, amountMinor: number): Promise<{refundRef:string; status:string}>
}
