import { describe, it, expect } from 'vitest'
import { generateAvailableSlots } from '../availability'
import { validateNoOverlap, attemptConcurrentBookings, rangesOverlap } from '../overlap'
import { checkPlanLimit, PLANS } from '../plans'
import { applyCoupon } from '../coupons'

const hours = [0,1,2,3,4,5,6].map(d=>({dayOfWeek:d, open:'09:00', close:'17:00', isClosed:false}))
// Use a future Monday: 2026-11-16 is Monday
const DATE = '2026-11-16'
const now = new Date('2026-11-09T08:00:00')
const base = { date: DATE, service:{id:'s1', durationMinutes:30, bufferMinutes:0}, staffId:'staff1', businessHours:hours, now }

describe('availability', ()=>{
  it('generates slots within business hours', ()=>{ const s=generateAvailableSlots(base); expect(s.length).toBeGreaterThan(0); expect(s[0].label).toContain('9:00') })
  it('excludes break time', ()=>{ const s=generateAvailableSlots({...base, breaks:[{start:'13:00',end:'14:00'}]}); expect(s.some(x=>x.startAt.getHours()===13)).toBe(false) })
  it('excludes overlapping existing appointment', ()=>{ const appt=[{staffId:'staff1', startAt:new Date(DATE+'T10:00:00'), endAt:new Date(DATE+'T10:30:00'), status:'confirmed'}]; const s=generateAvailableSlots({...base, existingAppointments:appt}); expect(s.some(x=>x.startAt.getHours()===10 && x.startAt.getMinutes()===0)).toBe(false); expect(s.some(x=>x.startAt.getHours()===11)).toBe(true) })
  it('returns empty on holiday', ()=>{ expect(generateAvailableSlots({...base, holidays:[{date:DATE,name:'Eid'}]})).toHaveLength(0) })
  it('returns empty on staff leave', ()=>{ expect(generateAvailableSlots({...base, leaves:[{staffId:'staff1',startDate:DATE,endDate:DATE}]})).toHaveLength(0) })
  it('respects buffer: slot ending+buffer overlapping next appt is blocked', ()=>{
    // Existing at 10:30-11:00. A 30min slot at 10:00 with 15min buffer ends 10:30 + buffer overlaps? endWithBuffer 10:45 overlaps 10:30 start => blocked
    const appt=[{staffId:'staff1', startAt:new Date(DATE+'T10:30:00'), endAt:new Date(DATE+'T11:00:00'), status:'confirmed'}]
    const s=generateAvailableSlots({...base, existingAppointments:appt, bufferMinutes:15})
    expect(s.some(x=>x.startAt.getHours()===10 && x.startAt.getMinutes()===0)).toBe(false)
    const s2=generateAvailableSlots({...base, existingAppointments:appt, bufferMinutes:0})
    expect(s2.some(x=>x.startAt.getHours()===10 && x.startAt.getMinutes()===0)).toBe(true)
  })
  it('respects max advance window', ()=>{ expect(generateAvailableSlots({...base, maxAdvanceDays:3})).toHaveLength(0) })
  it('expired holds do not block, active holds do', ()=>{
    const hold=[{staffId:'staff1', startAt:new Date(DATE+'T09:00:00'), endAt:new Date(DATE+'T09:30:00'), expiresAt:new Date('2026-11-09T07:00:00')}]
    expect(generateAvailableSlots({...base, holds:hold}).some(x=>x.startAt.getHours()===9 && x.startAt.getMinutes()===0)).toBe(true)
    const hold2=[{...hold[0], expiresAt:new Date('2026-12-01T00:00:00')}]
    expect(generateAvailableSlots({...base, holds:hold2}).some(x=>x.startAt.getHours()===9 && x.startAt.getMinutes()===0)).toBe(false)
  })
  it('different staff not blocked by other staff appointment', ()=>{
    const appt=[{staffId:'other', startAt:new Date(DATE+'T10:00:00'), endAt:new Date(DATE+'T10:30:00'), status:'confirmed'}]
    expect(generateAvailableSlots({...base, existingAppointments:appt}).some(x=>x.startAt.getHours()===10)).toBe(true)
  })
  it('cancelled appointments do not block', ()=>{
    const appt=[{staffId:'staff1', startAt:new Date(DATE+'T10:00:00'), endAt:new Date(DATE+'T10:30:00'), status:'cancelled'}]
    expect(generateAvailableSlots({...base, existingAppointments:appt}).some(x=>x.startAt.getHours()===10)).toBe(true)
  })
})

describe('overlap / concurrency', ()=>{
  it('rangesOverlap works', ()=>{ expect(rangesOverlap(new Date(0),new Date(10),new Date(5),new Date(15))).toBe(true); expect(rangesOverlap(new Date(0),new Date(5),new Date(5),new Date(10))).toBe(false) })
  it('validateNoOverlap rejects second booking same staff/time', ()=>{
    const existing=[{staffId:'s1',startAt:new Date(DATE+'T10:00:00'),endAt:new Date(DATE+'T10:30:00'),status:'confirmed'}]
    expect(validateNoOverlap('s1',new Date(DATE+'T10:00:00'),new Date(DATE+'T10:30:00'),existing).ok).toBe(false)
    expect(validateNoOverlap('s2',new Date(DATE+'T10:00:00'),new Date(DATE+'T10:30:00'),existing).ok).toBe(true)
  })
  it('concurrent double-booking: only first accepted', ()=>{
    const req=[{id:'a',staffId:'s1',startAt:new Date(DATE+'T10:00:00'),endAt:new Date(DATE+'T10:30:00')},{id:'b',staffId:'s1',startAt:new Date(DATE+'T10:00:00'),endAt:new Date(DATE+'T10:30:00')},{id:'c',staffId:'s2',startAt:new Date(DATE+'T10:00:00'),endAt:new Date(DATE+'T10:30:00')}]
    const r=attemptConcurrentBookings(req); expect(r.accepted.map(x=>x.id)).toEqual(['a','c']); expect(r.rejected.map(x=>x.id)).toEqual(['b'])
  })
})

describe('plans', ()=>{
  it('has exact spec prices and limits', ()=>{
    expect(PLANS.find(p=>p.id==='free')).toMatchObject({priceMonthlyMinor:0, staffLimit:1, monthlyBookingLimit:30})
    expect(PLANS.find(p=>p.id==='starter')).toMatchObject({priceMonthlyMinor:29900, staffLimit:3, monthlyBookingLimit:200})
    expect(PLANS.find(p=>p.id==='professional')).toMatchObject({priceMonthlyMinor:69900, staffLimit:10, monthlyBookingLimit:1000})
    expect(PLANS.find(p=>p.id==='business')).toMatchObject({priceMonthlyMinor:149900, staffLimit:30})
  })
  it('enforces plan limits', ()=>{ expect(checkPlanLimit('free','staff',1).allowed).toBe(false); expect(checkPlanLimit('free','staff',0).allowed).toBe(true); expect(checkPlanLimit('starter','bookings',200).allowed).toBe(false); expect(checkPlanLimit('starter','bookings',199).allowed).toBe(true) })
})

describe('coupons', ()=>{
  it('WELCOME10 works, BOOKORA20 needs min spend', ()=>{ expect(applyCoupon('WELCOME10',50000).discountMinor).toBe(5000); expect(applyCoupon('BOOKORA20',50000).ok).toBe(false); expect(applyCoupon('BOOKORA20',200000).discountMinor).toBe(40000); expect(applyCoupon('NOPE',50000).ok).toBe(false) })
})
