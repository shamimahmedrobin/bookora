export interface TimeRange { start: string; end: string } // "HH:mm"
export interface BusinessHours { dayOfWeek: number; open: string; close: string; isClosed: boolean }
export interface BreakPeriod { start: string; end: string }
export interface StaffBreak extends BreakPeriod { staffId: string; dayOfWeek?: number; date?: string }
export interface Holiday { date: string; name: string }
export interface StaffLeave { staffId: string; startDate: string; endDate: string }
export interface ExistingAppointment { staffId: string; startAt: Date; endAt: Date; status: string }
export interface BookingHold { staffId: string; startAt: Date; endAt: Date; expiresAt: Date }
export interface ServiceDef { id: string; durationMinutes: number; bufferMinutes: number }
export interface Slot { startAt: Date; endAt: Date; label: string }
export const ACTIVE_STATUSES = ['pending','confirmed','hold'] as const
