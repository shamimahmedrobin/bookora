export interface PlanDef { id:string; name:string; priceMonthlyMinor:number; priceYearlyMinor:number; staffLimit:number; monthlyBookingLimit:number; currency:string }
export const PLANS: PlanDef[] = [
  { id:'free', name:'Free', priceMonthlyMinor:0, priceYearlyMinor:0, staffLimit:1, monthlyBookingLimit:30, currency:'BDT' },
  { id:'starter', name:'Starter', priceMonthlyMinor:29900, priceYearlyMinor:299000, staffLimit:3, monthlyBookingLimit:200, currency:'BDT' },
  { id:'professional', name:'Professional', priceMonthlyMinor:69900, priceYearlyMinor:699000, staffLimit:10, monthlyBookingLimit:1000, currency:'BDT' },
  { id:'business', name:'Business', priceMonthlyMinor:149900, priceYearlyMinor:1499000, staffLimit:30, monthlyBookingLimit:10000, currency:'BDT' },
]
export function getPlan(id:string){ return PLANS.find(p=>p.id===id) ?? PLANS[0] }
export function checkPlanLimit(planId:string, resource:'staff'|'bookings', currentUsage:number): {allowed:boolean; limit:number; remaining:number; plan:PlanDef} {
  const plan=getPlan(planId); const limit= resource==='staff'? plan.staffLimit : plan.monthlyBookingLimit
  return { allowed: currentUsage < limit, limit, remaining: Math.max(0, limit-currentUsage), plan }
}
export function usagePercent(planId:string, resource:'staff'|'bookings', currentUsage:number){ const {limit}=checkPlanLimit(planId,resource,currentUsage); return Math.min(100, Math.round(currentUsage/limit*100)) }
