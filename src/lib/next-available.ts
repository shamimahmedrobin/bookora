/** Shared "next available" computation for doctor cards and profile pages. */
import { services, demoHolidays, initialAppointments, type Staff } from './demo/data'
import { getDoctorSettings, engineHoursFor, breaksForDate } from './doctor-settings'
import { generateAvailableSlots } from './booking/availability'

function parseTimeLabel(t: string): [number, number] {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return [9, 0]
  let h = parseInt(m[1])
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
  return [h, parseInt(m[2])]
}

const busyAppointments = initialAppointments.map(a => {
  const [h, m] = parseTimeLabel(a.time)
  const s = new Date(a.date + 'T00:00:00'); s.setHours(h, m)
  return { staffId: a.staffId, startAt: s, endAt: new Date(s.getTime() + 30 * 60000), status: a.status }
})

/** Earliest bookable slot for this doctor within the next 7 days, from the real availability engine. */
export function nextAvailableLabel(staff: Staff): string | null {
  const svc = services.filter(s => staff.serviceIds.includes(s.id)).sort((a, b) => a.priceMinor - b.priceMinor)[0]
  if (!svc) return null
  const settings = getDoctorSettings(staff.id)
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const slots = generateAvailableSlots({
      date: dateStr,
      service: { id: svc.id, durationMinutes: svc.durationMinutes, bufferMinutes: svc.bufferMinutes },
      staffId: staff.id,
      businessHours: engineHoursFor(settings),
      breaks: breaksForDate(settings, dateStr),
      holidays: demoHolidays,
      existingAppointments: busyAppointments,
      now, minAdvanceMinutes: 60, maxAdvanceDays: 30,
    })
    const first = slots.find(s => s.startAt > now)
    if (first) {
      const day = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : first.startAt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
      return `${day}, ${first.label}`
    }
  }
  return null
}
