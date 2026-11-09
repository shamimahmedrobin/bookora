import { describe,it,expect } from 'vitest'
import { processWebhookOnce, _resetIdempotencyForTests } from '../idempotency'
import { manualAdapter } from '../manual'
describe('payments',()=>{
  it('manual adapter creates pending, never paid', async()=>{ const r=await manualAdapter.createPayment({businessId:'b1',appointmentId:'appt123456',amountMinor:50000,currency:'BDT',returnUrl:'/'}); expect(r.status).toBe('pending') })
  it('webhook idempotency dedupes', ()=>{ _resetIdempotencyForTests(); let n=0; const a=processWebhookOnce('bkash','evt1',()=>++n); const b=processWebhookOnce('bkash','evt1',()=>++n); expect(a.duplicate).toBe(false); expect(b.duplicate).toBe(true); expect(n).toBe(1) })
})
