import { staffMembers, businessById, demoBreaks } from './demo/data'

/**
 * Per-doctor chamber & schedule configuration.
 * Demo persistence: values are seeded from the demo data and saved to
 * localStorage on this device. In production this lives in Postgres
 * (chambers, chamber_schedules, doctor_booking_settings) behind RLS.
 */

export interface DaySchedule {
  dayOfWeek: number // 0=Sunday .. 6=Saturday (JS convention)
  enabled: boolean
  start: string // 'HH:MM'
  end: string // 'HH:MM'
  ticketLimit: number // max patients (tickets) that day at this chamber
}

export interface Chamber {
  id: string
  name: string
  address: string
  days: DaySchedule[]
}

export interface DoctorSettings {
  doctorId: string
  chambers: Chamber[]
  /** Time of day when the daily ticket counter resets and that day's booking opens, 'HH:MM'. */
  ticketResetTime: string
  /** How many days ahead patients may book. */
  advanceBookingDays: number
  /** Default daily ticket limit applied to new schedule rows. */
  defaultTicketLimit: number
}

export const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5] // Saturday first (BD week)
export const DAY_NAMES: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday',
}
export const DAY_NAMES_BN: Record<number, string> = {
  0: 'রবিবার', 1: 'সোমবার', 2: 'মঙ্গলবার', 3: 'বুধবার', 4: 'বৃহস্পতিবার', 5: 'শুক্রবার', 6: 'শনিবার',
}

const KEY = 'bookora.doctorSettings.v1'

function week(enabledDays: number[], start: string, end: string, limit: number): DaySchedule[] {
  return [0, 1, 2, 3, 4, 5, 6].map(d => ({
    dayOfWeek: d,
    enabled: enabledDays.includes(d),
    start, end, ticketLimit: limit,
  }))
}

function seedFor(doctorId: string): DoctorSettings {
  const staff = staffMembers.find(s => s.id === doctorId)
  const biz = staff ? businessById(staff.businessId) : undefined
  const chambers: Chamber[] = [{
    id: `${doctorId}-main`,
    name: biz?.name ?? 'Main Chamber',
    address: biz?.address ?? '',
    // Sat–Thu 09:00–20:00, Friday closed (BD weekend) — mirrors the previous fixed hours.
    days: week([6, 0, 1, 2, 3, 4], '09:00', '20:00', 30),
  }]
  if (doctorId === 'staff-1') {
    // Demo of a second, evening chamber for Dr. Farhana Rahman.
    chambers.push({
      id: 'staff-1-evening',
      name: 'Popular Chamber — Dhanmondi',
      address: 'Road 8/A, Dhanmondi, Dhaka 1209',
      days: week([6, 1, 3], '17:00', '21:00', 15),
    })
  }
  return { doctorId, chambers, ticketResetTime: '00:00', advanceBookingDays: 30, defaultTicketLimit: 30 }
}

type Store = Record<string, DoctorSettings>

function readStore(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch { /* corrupted storage falls back to seeds */ }
  return {}
}

export function getDoctorSettings(doctorId: string): DoctorSettings {
  const store = readStore()
  return store[doctorId] ?? seedFor(doctorId)
}

export function saveDoctorSettings(settings: DoctorSettings): void {
  const store = readStore()
  store[settings.doctorId] = settings
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* storage full/blocked: demo keeps in-page state */ }
}

export function resetDoctorSettings(doctorId: string): DoctorSettings {
  const store = readStore()
  delete store[doctorId]
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* ignore */ }
  return seedFor(doctorId)
}

/** Sessions (start/end) a doctor has on a given weekday across all chambers. */
export function sessionsOn(settings: DoctorSettings, dayOfWeek: number): DaySchedule[] {
  const out: DaySchedule[] = []
  for (const ch of settings.chambers) {
    const d = ch.days.find(x => x.dayOfWeek === dayOfWeek)
    if (d?.enabled) out.push(d)
  }
  return out.sort((a, b) => a.start.localeCompare(b.start))
}

/** Total ticket capacity for a weekday = sum of per-chamber limits that day. */
export function ticketLimitOn(settings: DoctorSettings, dayOfWeek: number): number {
  return sessionsOn(settings, dayOfWeek).reduce((sum, d) => sum + d.ticketLimit, 0)
}

/** Engine-ready weekly hours derived from chamber sessions (earliest start → latest end per day). */
export function engineHoursFor(settings: DoctorSettings) {
  return [0, 1, 2, 3, 4, 5, 6].map(dow => {
    const ss = sessionsOn(settings, dow)
    if (!ss.length) return { dayOfWeek: dow, open: '09:00', close: '20:00', isClosed: true }
    return { dayOfWeek: dow, open: ss[0].start, close: ss[ss.length - 1].end, isClosed: false }
  })
}

/** Breaks for one date: the daily lunch break plus gaps between that weekday's chamber sessions. */
export function breaksForDate(settings: DoctorSettings, dateStr: string) {
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  const ss = sessionsOn(settings, dow)
  const gaps: { start: string; end: string }[] = []
  for (let i = 0; i < ss.length - 1; i++) {
    if (ss[i].end < ss[i + 1].start) gaps.push({ start: ss[i].end, end: ss[i + 1].start })
  }
  return [...demoBreaks, ...gaps]
}

/** 'HH:MM' → 'h:MM AM/PM' for patient-facing messages. */
export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}
