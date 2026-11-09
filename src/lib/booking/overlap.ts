export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd
}
export function hasStaffOverlap(staffId: string, startAt: Date, endAt: Date, existing: {staffId:string;startAt:Date;endAt:Date;status:string}[]): boolean {
  const active = new Set(['pending','confirmed','hold'])
  return existing.some(a => a.staffId===staffId && active.has(a.status) && rangesOverlap(startAt,endAt,a.startAt,a.endAt))
}
export function validateNoOverlap(staffId: string, startAt: Date, endAt: Date, existing: {staffId:string;startAt:Date;endAt:Date;status:string}[]): {ok:boolean; reason?:string} {
  if (endAt <= startAt) return {ok:false, reason:'End must be after start'}
  if (hasStaffOverlap(staffId,startAt,endAt,existing)) return {ok:false, reason:'Staff already has an appointment overlapping this time'}
  return {ok:true}
}
/** Simulate concurrent booking: only first succeeds for same staff/slot */
export function attemptConcurrentBookings(requests: {id:string;staffId:string;startAt:Date;endAt:Date}[]) {
  const accepted: typeof requests = []; const rejected: {id:string;reason:string}[] = []
  for (const r of requests) {
    const v = validateNoOverlap(r.staffId, r.startAt, r.endAt, accepted.map(a=>({...a,status:'confirmed'})))
    if (v.ok) accepted.push(r); else rejected.push({id:r.id, reason:v.reason!})
  }
  return {accepted, rejected}
}
