import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Plus, Trash2, Clock, Ticket, CalendarRange, RotateCcw, Check } from 'lucide-react'
import { staffMembers, isDoctor } from '../../lib/demo/data'
import {
  getDoctorSettings, saveDoctorSettings, resetDoctorSettings,
  DAY_ORDER, DAY_NAMES, DAY_NAMES_BN, sessionsOn, ticketLimitOn,
  type DoctorSettings, type Chamber,
} from '../../lib/doctor-settings'

const inputCls = 'border rounded-lg px-2.5 py-1.5 text-sm bg-white disabled:opacity-40 disabled:bg-slate-50'
const numCls = 'border rounded-lg px-2 py-1.5 text-sm w-20 bg-white disabled:opacity-40 disabled:bg-slate-50'

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${on ? 'bg-indigo-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

export default function DoctorSchedulePage() {
  const [params] = useSearchParams()
  const doctors = useMemo(() => staffMembers.filter(s => s.businessId === 'biz-clinic' && isDoctor(s)), [])
  const [doctorId, setDoctorId] = useState(() => {
    const p = params.get('doctor')
    return p && doctors.some(d => d.id === p) ? p : doctors[0]?.id ?? ''
  })
  const [settings, setSettings] = useState<DoctorSettings>(() => getDoctorSettings(doctorId))
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const doctor = doctors.find(d => d.id === doctorId)

  const pickDoctor = (id: string) => { setDoctorId(id); setSettings(getDoctorSettings(id)); setSavedAt(null) }
  const update = (fn: (s: DoctorSettings) => DoctorSettings) => { setSettings(prev => fn(structuredClone(prev))); setSavedAt(null) }
  const updateChamber = (chamberId: string, fn: (c: Chamber) => Chamber) =>
    update(s => ({ ...s, chambers: s.chambers.map(c => (c.id === chamberId ? fn(c) : c)) }))

  const weeklyCapacity = DAY_ORDER.reduce((sum, d) => sum + ticketLimitOn(settings, d), 0)

  const save = () => { saveDoctorSettings(settings); setSavedAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })) }
  const reset = () => { if (confirm('Reset this doctor\'s schedule to the defaults?')) { setSettings(resetDoctorSettings(doctorId)); setSavedAt(null) } }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chamber &amp; Schedule</h1>
        <p className="text-slate-500 mt-1">কোন দিন কোন চেম্বারে বসবেন, কয়টা টিকিট, কখন রিসেট — সব এখান থেকে ঠিক করুন। Set weekly chamber days &amp; hours, daily ticket limits, reset time and the advance booking window. Changes drive the public booking page.</p>
      </div>

      {/* Doctor picker */}
      <div className="bg-white border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-semibold shrink-0" htmlFor="doctor-picker">Doctor</label>
        <select id="doctor-picker" value={doctorId} onChange={e => pickDoctor(e.target.value)} className="border rounded-lg px-3 py-2 bg-white text-sm font-medium flex-1 min-w-0">
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty ?? d.title}</option>)}
        </select>
        <Link to={`/b/dhaka-care-clinic?staff=${doctorId}`} className="text-sm text-indigo-600 font-semibold shrink-0">View public booking page →</Link>
      </div>

      {/* Booking settings */}
      <div className="bg-white border rounded-2xl p-4 sm:p-5 mt-5">
        <h2 className="font-bold flex items-center gap-2"><Ticket size={18} className="text-indigo-600" />Booking settings — {doctor?.name}</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <label className="block">
            <span className="text-sm font-medium flex items-center gap-1.5"><CalendarRange size={15} className="text-slate-400" />Advance booking window</span>
            <span className="flex items-center gap-2 mt-1.5">
              <input type="number" min={1} max={60} value={settings.advanceBookingDays} onChange={e => update(s => ({ ...s, advanceBookingDays: Math.max(1, Math.min(60, Number(e.target.value) || 1)) }))} className={numCls} />
              <span className="text-sm text-slate-500">days ahead</span>
            </span>
            <span className="text-xs text-slate-400 block mt-1">কতদিন আগে পর্যন্ত টিকিট কাটা যাবে</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium flex items-center gap-1.5"><Clock size={15} className="text-slate-400" />Daily ticket reset time</span>
            <input type="time" value={settings.ticketResetTime} onChange={e => update(s => ({ ...s, ticketResetTime: e.target.value || '00:00' }))} className={`${inputCls} mt-1.5 block`} />
            <span className="text-xs text-slate-400 block mt-1">প্রতিদিন কয়টায় টিকিট কাউন্টার রিসেট হবে — ওই সময়ের আগে আজকের বুকিং খুলবে না</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium flex items-center gap-1.5"><Ticket size={15} className="text-slate-400" />Default daily ticket limit</span>
            <span className="flex items-center gap-2 mt-1.5">
              <input type="number" min={1} max={500} value={settings.defaultTicketLimit} onChange={e => update(s => ({ ...s, defaultTicketLimit: Math.max(1, Number(e.target.value) || 1) }))} className={numCls} />
              <span className="text-sm text-slate-500">patients / day</span>
            </span>
            <span className="text-xs text-slate-400 block mt-1">নতুন দিনের সারিতে এই লিমিট বসবে; প্রতিদিনের লিমিট আলাদা করেও বদলানো যায়</span>
          </label>
        </div>
      </div>

      {/* Chambers */}
      {settings.chambers.map((chamber, ci) => (
        <div key={chamber.id} className="bg-white border rounded-2xl p-4 sm:p-5 mt-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><MapPin size={18} /></span>
            <div className="flex-1 grid sm:grid-cols-2 gap-2 min-w-0">
              <input value={chamber.name} onChange={e => updateChamber(chamber.id, c => ({ ...c, name: e.target.value }))} className="border rounded-lg px-3 py-2 font-semibold text-sm w-full min-w-0" aria-label="Chamber name" placeholder="Chamber name" />
              <input value={chamber.address} onChange={e => updateChamber(chamber.id, c => ({ ...c, address: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm text-slate-600 w-full min-w-0" aria-label="Chamber address" placeholder="Chamber address" />
            </div>
            {settings.chambers.length > 1 && (
              <button type="button" onClick={() => update(s => ({ ...s, chambers: s.chambers.filter(c => c.id !== chamber.id) }))} className="text-red-600 text-sm font-semibold inline-flex items-center gap-1 shrink-0"><Trash2 size={15} />Remove</button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide py-1.5">Quick set:</span>
            {([['Sat–Thu', [6, 0, 1, 2, 3, 4]], ['Every day', [0, 1, 2, 3, 4, 5, 6]], ['Weekdays only', [0, 1, 2, 3, 4]], ['Clear', []]] as const).map(([label, days]) => (
              <button key={label} type="button" onClick={() => updateChamber(chamber.id, c => ({ ...c, days: c.days.map(d => ({ ...d, enabled: (days as readonly number[]).includes(d.dayOfWeek) })) }))} className="text-xs border rounded-full px-3 py-1.5 font-semibold hover:bg-slate-50">{label}</button>
            ))}
          </div>

          <div className="mt-3 divide-y">
            {DAY_ORDER.map(dow => {
              const day = chamber.days.find(d => d.dayOfWeek === dow)!
              const setDay = (patch: Partial<typeof day>) => updateChamber(chamber.id, c => ({ ...c, days: c.days.map(d => (d.dayOfWeek === dow ? { ...d, ...patch } : d)) }))
              return (
                <div key={dow} className={`flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 ${day.enabled ? '' : 'opacity-60'}`}>
                  <Toggle on={day.enabled} onChange={v => setDay({ enabled: v })} label={`${DAY_NAMES[dow]} at ${chamber.name}`} />
                  <span className="w-32 text-sm font-medium">{DAY_NAMES[dow]} <span className="text-slate-400 font-normal">{DAY_NAMES_BN[dow]}</span></span>
                  <span className="flex items-center gap-1.5">
                    <input type="time" value={day.start} disabled={!day.enabled} onChange={e => setDay({ start: e.target.value || '09:00' })} className={inputCls} aria-label={`${DAY_NAMES[dow]} start time`} />
                    <span className="text-slate-400">–</span>
                    <input type="time" value={day.end} disabled={!day.enabled} onChange={e => setDay({ end: e.target.value || '20:00' })} className={inputCls} aria-label={`${DAY_NAMES[dow]} end time`} />
                  </span>
                  <span className="flex items-center gap-1.5 ml-auto">
                    <Ticket size={14} className="text-slate-400" />
                    <input type="number" min={1} max={500} value={day.ticketLimit} disabled={!day.enabled} onChange={e => setDay({ ticketLimit: Math.max(1, Number(e.target.value) || 1) })} className={numCls} aria-label={`${DAY_NAMES[dow]} ticket limit`} />
                    <span className="text-xs text-slate-500">tickets</span>
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 mt-2">Chamber {ci + 1} of {settings.chambers.length} — weekly capacity here: {DAY_ORDER.reduce((s, d) => s + (chamber.days.find(x => x.dayOfWeek === d)?.enabled ? chamber.days.find(x => x.dayOfWeek === d)!.ticketLimit : 0), 0)} tickets</p>
        </div>
      ))}

      <button type="button" onClick={() => update(s => ({ ...s, chambers: [...s.chambers, { id: `${doctorId}-ch-${Date.now()}`, name: 'New Chamber', address: '', days: [0, 1, 2, 3, 4, 5, 6].map(d => ({ dayOfWeek: d, enabled: false, start: '17:00', end: '21:00', ticketLimit: s.defaultTicketLimit })) }] }))}
        className="mt-5 inline-flex items-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-700 rounded-2xl px-5 py-3.5 font-semibold w-full justify-center hover:bg-indigo-50">
        <Plus size={18} /> Add another chamber
      </button>

      {/* Week at a glance */}
      <div className="bg-white border rounded-2xl p-4 sm:p-5 mt-5">
        <h2 className="font-bold">Week at a glance</h2>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-4">
          {DAY_ORDER.map(dow => {
            const sessions = sessionsOn(settings, dow)
            return (
              <div key={dow} className={`rounded-xl border p-2 min-h-[92px] ${sessions.length ? 'bg-indigo-50/60 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{DAY_NAMES[dow].slice(0, 3)}</div>
                {sessions.length === 0 ? <div className="text-[11px] text-slate-400 mt-1.5">Off</div> : sessions.map((s, i) => (
                  <div key={i} className="text-[11px] font-medium text-indigo-800 mt-1.5 leading-tight">{s.start}–{s.end}<br /><span className="text-slate-500">{s.ticketLimit} tickets</span></div>
                ))}
              </div>
            )
          })}
        </div>
        <p className="text-sm text-slate-600 mt-3">Total weekly capacity: <strong>{weeklyCapacity} tickets</strong> across {settings.chambers.length} chamber{settings.chambers.length > 1 ? 's' : ''}. Booking opens {settings.advanceBookingDays} days ahead; each day's counter resets at {settings.ticketResetTime}.</p>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 mt-6 bg-slate-900 text-white rounded-2xl px-4 sm:px-5 py-3.5 flex flex-wrap items-center gap-3 shadow-lg">
        <span className="text-sm flex-1 min-w-[180px]">{savedAt ? <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold"><Check size={16} />Saved at {savedAt} — the booking page now uses this schedule.</span> : 'Unsaved changes are kept only on this screen until you save.'}</span>
        <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 border border-white/30 rounded-lg px-3.5 py-2 text-sm font-semibold"><RotateCcw size={14} />Reset defaults</button>
        <button type="button" onClick={save} className="bg-indigo-500 hover:bg-indigo-400 rounded-lg px-5 py-2 text-sm font-bold">Save schedule</button>
      </div>
      <p className="text-xs text-slate-400 mt-3">Demo note: settings are stored on this device (localStorage). In production they are saved per doctor in the database and drive booking for every patient, everywhere.</p>
    </div>
  )
}
