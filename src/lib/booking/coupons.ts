export interface CouponDef { code:string; percentOff:number; minSpendMinor:number; active:boolean; expiresAt?:string }
export const DEMO_COUPONS: CouponDef[] = [
  { code:'WELCOME10', percentOff:10, minSpendMinor:0, active:true },
  { code:'BOOKORA20', percentOff:20, minSpendMinor:100000, active:true },
]
export function applyCoupon(code:string, subtotalMinor:number, coupons=DEMO_COUPONS): {ok:boolean; discountMinor:number; message:string; coupon?:CouponDef} {
  const c = coupons.find(x=>x.code===code.trim().toUpperCase())
  if (!c || !c.active) return {ok:false, discountMinor:0, message:'Invalid or inactive coupon'}
  if (subtotalMinor < c.minSpendMinor) return {ok:false, discountMinor:0, message:`Minimum spend ৳${c.minSpendMinor/100} required for ${c.code}`}
  return {ok:true, discountMinor: Math.floor(subtotalMinor*c.percentOff/100), message:`${c.percentOff}% off applied`, coupon:c}
}
