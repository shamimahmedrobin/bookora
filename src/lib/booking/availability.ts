import type { BusinessHours, Holiday, StaffLeave, ExistingAppointment, BookingHold, ServiceDef, Slot } from './types'
import { rangesOverlap } from './overlap'

function parseTime(dateStr: string, hhmm: string): Date {
  const [h,m] = hhmm.split(':').map(Number)
  const d = new Date(dateStr + 'T00:00:00')
  d.setHours(h, m, 0, 0)
  return d
}
function fmtLabel(d: Date): string { return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true}) }

export interface GenerateSlotsParams {
  date: string // YYYY-MM-DD
  service: ServiceDef
  staffId: string
  businessHours: BusinessHours[]
  breaks?: {start:string;end:string}[]
  holidays?: Holiday[]
  leaves?: StaffLeave[]
  existingAppointments?: ExistingAppointment[]
  holds?: BookingHold[]
  now?: Date
  timezone?: string
  minAdvanceMinutes?: number
  maxAdvanceDays?: number
  bufferMinutes?: number
  slotIntervalMinutes?: number
}

/**
 * Server-mirror availability engine. In production the same logic runs in
 * Postgres (get_available_slots + create_booking recheck). Never rely on
 * frontend alone — create_booking re-validates inside a transaction and
 * the EXCLUDE constraint prevents overlap at DB level.
 */
export function generateAvailableSlots(p: GenerateSlotsParams): Slot[] {
  const now = p.now ?? new Date()
  const dateStr = p.date
  // Holiday check
  if (p.holidays?.some(h=>h.date===dateStr)) return []
  // Leave check
  if (p.leaves?.some(l=> l.staffId===p.staffId && dateStr>=l.startDate && dateStr<=l.endDate)) return []
  // Booking windows
  const dayStart = parseTime(dateStr,'00:00')
  const diffDays = Math.floor((dayStart.getTime() - new Date(now.toDateString()).getTime())/86400000)
  if (p.maxAdvanceDays !== undefined && diffDays > p.maxAdvanceDays) return []
  if (diffDays < 0) return []

  const dow = dayStart.getDay()
  const hours = p.businessHours.find(h=>h.dayOfWeek===dow)
  if (!hours || hours.isClosed) return []

  const open = parseTime(dateStr, hours.open)
  const close = parseTime(dateStr, hours.close)
  const duration = p.service.durationMinutes
  const buffer = p.bufferMinutes ?? p.service.bufferMinutes ?? 0
  const interval = p.slotIntervalMinutes ?? 30
  const minAdvance = p.minAdvanceMinutes ?? 0
  const earliest = new Date(now.getTime() + minAdvance*60000)

  const slots: Slot[] = []
  for (let cur = new Date(open); ; cur = new Date(cur.getTime()+interval*60000)) {
    const start = new Date(cur)
    const end = new Date(start.getTime()+duration*60000)
    const endWithBuffer = new Date(end.getTime()+buffer*60000)
    if (end > close) break
    if (start < earliest && start.toDateString()===now.toDateString()) continue
    if (diffDays===0 && start < earliest) continue
    // Breaks
    const inBreak = (p.breaks??[]).some(b=> rangesOverlap(start,end, parseTime(dateStr,b.start), parseTime(dateStr,b.end)))
    if (inBreak) continue
    // Existing appointments (active only) incl buffer: appointment occupies until its end; our end+buffer must not overlap start, and our start must not be inside [apptStart, apptEnd+buffer)
    const blockedByAppt = (p.existingAppointments??[]).filter(a=>a.staffId===p.staffId && ['pending','confirmed','hold'].includes(a.status))
      .some(a=> rangesOverlap(start, endWithBuffer, a.startAt, a.endAt))
    if (blockedByAppt) continue
    // Holds not expired
    const blockedByHold = (p.holds??[]).filter(h=>h.staffId===p.staffId && h.expiresAt>now)
      .some(h=> rangesOverlap(start, endWithBuffer, h.startAt, h.endAt))
    if (blockedByHold) continue
    slots.push({ startAt:start, endAt:end, label: fmtLabel(start) })
  }
  return slots
}

export function isSlotAvailable(params: GenerateSlotsParams & {startAt: Date}): boolean {
  const slots = generateAvailableSlots(params)
  return slots.some(s=>s.startAt.getTime()===params.startAt.getTime())
}
