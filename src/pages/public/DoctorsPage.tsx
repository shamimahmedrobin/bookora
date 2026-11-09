import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, Search, Star, X, Briefcase, Clock } from 'lucide-react'
import { useLanguage } from '../../i18n'
import { doctors, services, doctorFeeMinor, businessHoursForBooking, demoBreaks, demoHolidays, initialAppointments, type DoctorEntry } from '../../lib/demo/data'
import { generateAvailableSlots } from '../../lib/booking/availability'
import { BD_DISTRICTS, districtByName, haversineKm, nearestDistrict } from '../../lib/location/districts'
import { formatBDT } from '../../lib/utils'

const ALL = 'all'

function initials(name: string) {
  const parts = name.replace(/^Dr\.\s*/i, '').split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** Distance (km) from a reference district to the district a doctor practises in. */
function distanceFrom(refName: string | null, entry: DoctorEntry): number | null {
  if (!refName) return null
  const ref = districtByName(refName)
  const own = districtByName(entry.business.district)
  if (!ref || !own) return null
  return haversineKm(ref.lat, ref.lng, own.lat, own.lng)
}

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
function nextAvailableLabel(staff: DoctorEntry['staff']): string | null {
  const svc = services.filter(s => staff.serviceIds.includes(s.id)).sort((a, b) => a.priceMinor - b.priceMinor)[0]
  if (!svc) return null
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const slots = generateAvailableSlots({
      date: dateStr,
      service: { id: svc.id, durationMinutes: svc.durationMinutes, bufferMinutes: svc.bufferMinutes },
      staffId: staff.id,
      businessHours: businessHoursForBooking,
      breaks: demoBreaks,
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

export default function DoctorsPage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const paramDistrict = searchParams.get('district')
  const paramSpecialty = searchParams.get('specialty')
  const initialDistrict = paramDistrict && districtByName(paramDistrict) ? paramDistrict : null
  const initialSpecialty = paramSpecialty && doctors.some(d => d.staff.specialty === paramSpecialty) ? paramSpecialty : null
  const [district, setDistrict] = useState<string>(initialDistrict ?? ALL)
  const [status, setStatus] = useState(initialDistrict ? `Showing doctors in ${initialDistrict} first, then nearest districts.` : 'Showing doctors in all districts. Pick your district or use your location to see the nearest doctors first.')
  const [detecting, setDetecting] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [specialty, setSpecialty] = useState<string>(initialSpecialty ?? 'All')
  const [selected, setSelected] = useState<DoctorEntry | null>(null)

  const specialties = useMemo(() => ['All', ...Array.from(new Set(doctors.map(d => d.staff.specialty).filter(Boolean) as string[])).sort()], [])
  const refDistrict = district === ALL ? null : district

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return doctors.filter(({ staff, business }) => {
      if (specialty !== 'All' && staff.specialty !== specialty) return false
      if (!q) return true
      return staff.name.toLowerCase().includes(q) || (staff.specialty ?? '').toLowerCase().includes(q) || business.name.toLowerCase().includes(q)
    })
  }, [query, specialty])

  const inDistrict = useMemo(() => (refDistrict ? filtered.filter(d => d.business.district === refDistrict) : filtered), [filtered, refDistrict])
  const districtEmpty = !!refDistrict && inDistrict.length === 0

  const list = useMemo(() => {
    const byRating = (a: DoctorEntry, b: DoctorEntry) => (b.staff.rating ?? 0) - (a.staff.rating ?? 0) || (b.staff.reviews ?? 0) - (a.staff.reviews ?? 0)
    if (!refDistrict) return [...filtered].sort(byRating)
    if (districtEmpty) {
      // No doctors in the chosen district (after filters) — fall back to nearest doctors overall.
      const pool = filtered.length ? filtered : doctors
      return [...pool].sort((a, b) => (distanceFrom(refDistrict, a) ?? 0) - (distanceFrom(refDistrict, b) ?? 0) || byRating(a, b))
    }
    return [...filtered].sort((a, b) => {
      const aIn = a.business.district === refDistrict ? 0 : 1
      const bIn = b.business.district === refDistrict ? 0 : 1
      if (aIn !== bIn) return aIn - bIn
      if (aIn === 0) return byRating(a, b)
      return (distanceFrom(refDistrict, a) ?? 0) - (distanceFrom(refDistrict, b) ?? 0) || byRating(a, b)
    })
  }, [filtered, refDistrict, districtEmpty])

  function useMyLocation() {
    if (!('geolocation' in navigator)) { setStatus('Location unavailable — please pick your district manually.'); return }
    setDetecting(true)
    setStatus('Detecting your location…')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const d = nearestDistrict(pos.coords.latitude, pos.coords.longitude)
        setDistrict(d.name)
        setStatus(`Showing doctors near ${d.name} district (detected from your location).`)
        setDetecting(false)
      },
      () => { setStatus('Location unavailable — please pick your district manually.'); setDetecting(false) },
      { timeout: 10000, maximumAge: 600000 },
    )
  }

  function pickDistrict(value: string) {
    setDistrict(value)
    setStatus(value === ALL ? 'Showing doctors in all districts.' : `Showing doctors near ${value} district (selected by you).`)
  }

  function showNearest() {
    setQuery(''); setSpecialty('All')
    setStatus(refDistrict ? `Showing the nearest doctors to ${refDistrict} district.` : 'Showing doctors in all districts.')
  }

  // Close the profile dialog with Escape and lock body scroll while it is open.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [selected])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl font-extrabold">{t('nav.doctors')}</h1>
      <p className="text-slate-600 mt-2 text-lg">আপনার কাছের ডাক্তার খুঁজুন — Search doctors by your district, detect your location, or browse every specialist on Bookora.</p>

      {/* Location + search bar */}
      <div className="mt-8 bg-white border rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <button type="button" onClick={useMyLocation} disabled={detecting} className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60 shrink-0">
            <Navigation size={16} />{detecting ? 'Detecting…' : 'Use my location'}
          </button>
          <div className="flex-1 min-w-0">
            <label htmlFor="district-select" className="sr-only">Select your district</label>
            <select id="district-select" value={district} onChange={e => pickDistrict(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 bg-white text-sm">
              <option value={ALL}>All districts</option>
              {BD_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name} — {d.nameBn}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-0 relative">
            <label htmlFor="doctor-search" className="sr-only">Search by doctor, specialty or clinic</label>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="doctor-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search doctor, specialty or clinic…" className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm" />
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-3 flex items-start gap-1.5" role="status"><MapPin size={15} className="shrink-0 mt-0.5 text-indigo-500" />{status}</p>
        <div className="flex gap-2 flex-wrap mt-4" role="group" aria-label="Filter by specialty">
          {specialties.map(s => (
            <button key={s} type="button" onClick={() => setSpecialty(s)} aria-pressed={specialty === s} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${specialty === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:border-indigo-300'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Empty-district notice */}
      {districtEmpty && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <h2 className="font-bold text-lg">No doctors found in {refDistrict} yet.</h2>
          <p className="text-sm text-slate-600 mt-1">Clinics from {refDistrict} have not joined Bookora yet. Here are the nearest doctors to you instead:</p>
          <button type="button" onClick={showNearest} className="mt-3 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm">Show nearest doctors</button>
        </div>
      )}

      {/* Results heading */}
      <h2 className="text-xl font-bold mt-10">
        {districtEmpty ? `Nearest doctors to ${refDistrict}` : refDistrict ? `Doctors near ${refDistrict}` : 'All doctors'}
        <span className="text-sm font-normal text-slate-500 ml-2">{list.length} found</span>
      </h2>

      {list.length === 0 ? (
        <div className="mt-6 bg-white border rounded-2xl p-8 text-center text-slate-500">
          <p>No doctors match your search. Try a different name, specialty or district.</p>
          <button type="button" onClick={showNearest} className="mt-3 border px-5 py-2.5 rounded-lg font-semibold text-sm text-indigo-700">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {list.map(entry => <DoctorCard key={entry.staff.id} entry={entry} refDistrict={refDistrict} onView={() => setSelected(entry)} />)}
        </div>
      )}

      <section className="mt-12 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold">Are you a doctor?</h2>
          <p className="text-indigo-100 mt-1.5 text-sm sm:text-base">আপনি কি ডাক্তার? Join Bookora — create your profile, set your chamber schedule and start receiving online bookings from patients across Bangladesh.</p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <Link to="/register" className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg font-bold text-center">Join as a Doctor</Link>
          <Link to="/pricing" className="border border-white/60 text-white px-5 py-2.5 rounded-lg font-semibold text-center">See pricing</Link>
        </div>
      </section>

      {selected && <DoctorDialog entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function DoctorCard({ entry, refDistrict, onView }: { entry: DoctorEntry; refDistrict: string | null; onView: () => void }) {
  const { staff, business } = entry
  const nextAvail = useMemo(() => nextAvailableLabel(staff), [staff])
  const km = distanceFrom(refDistrict, entry)
  const inRef = refDistrict !== null && business.district === refDistrict
  return (
    <article className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition flex flex-col min-w-0">
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: business.color }} aria-hidden="true">{initials(staff.name)}</span>
        <div className="min-w-0">
          <h3 className="font-bold text-lg leading-snug break-words">{staff.name}</h3>
          <p className="text-sm text-indigo-700 font-medium break-words">{staff.specialty}{staff.specialtyBn ? ` • ${staff.specialtyBn}` : ''}</p>
          <p className="text-xs text-slate-500 break-words">{staff.title}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mt-3">
        {staff.experienceYears !== undefined && <span className="flex items-center gap-1"><Briefcase size={14} className="text-slate-400" />{staff.experienceYears} yrs experience</span>}
        {staff.rating !== undefined && <span className="flex items-center gap-1 font-semibold"><Star size={14} className="text-amber-500 fill-amber-500" />{staff.rating} <span className="font-normal text-slate-500">({staff.reviews} reviews)</span></span>}
      </div>
      <p className="text-sm text-slate-600 mt-2 break-words">{business.name}</p>
      <p className="flex items-start gap-1 text-sm text-slate-500 mt-1 min-w-0"><MapPin size={14} className="shrink-0 mt-0.5" /><span className="break-words">{business.district} • {business.city}</span></p>
      <div className="flex items-center justify-between gap-2 mt-3 mb-4">
        <p className="text-sm"><span className="text-slate-500">Consultation fee</span> <span className="font-bold text-indigo-700">{formatBDT(doctorFeeMinor(staff))}</span></p>
        {refDistrict && (inRef
          ? <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">In your district</span>
          : km !== null && <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full shrink-0">~{Math.round(km)} km away</span>)}
      </div>
      {nextAvail && <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 mb-3"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />Next available: {nextAvail}</p>}
      <div className="flex gap-2 pt-4 border-t mt-auto">
        <button type="button" onClick={onView} className="flex-1 border rounded-lg py-2.5 font-semibold text-sm">View Profile</button>
        <Link to={`/b/${business.slug}?staff=${staff.id}`} className="flex-1 text-center bg-indigo-600 text-white rounded-lg py-2.5 font-semibold text-sm">Book Appointment</Link>
      </div>
    </article>
  )
}

function DoctorDialog({ entry, onClose }: { entry: DoctorEntry; onClose: () => void }) {
  const { staff, business } = entry
  const ownServices = services.filter(s => staff.serviceIds.includes(s.id))
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="presentation">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={`Profile of ${staff.name}`} className="relative bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-xl">
        <button type="button" onClick={onClose} aria-label="Close profile" className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100"><X size={20} /></button>
        <div className="flex items-start gap-3 min-w-0 pr-10">
          <span className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0" style={{ background: business.color }} aria-hidden="true">{initials(staff.name)}</span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold break-words">{staff.name}</h2>
            <p className="text-indigo-700 font-medium break-words">{staff.specialty}{staff.specialtyBn ? ` • ${staff.specialtyBn}` : ''}</p>
            <p className="text-sm text-slate-500 break-words">{staff.title}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mt-4">
          {staff.experienceYears !== undefined && <span className="flex items-center gap-1"><Briefcase size={14} className="text-slate-400" />{staff.experienceYears} years experience</span>}
          {staff.rating !== undefined && <span className="flex items-center gap-1 font-semibold"><Star size={14} className="text-amber-500 fill-amber-500" />{staff.rating} ({staff.reviews} reviews)</span>}
        </div>
        {(() => { const na = nextAvailableLabel(staff); return na ? <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 mt-4"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />Next available: {na}</p> : null })()}
        <div className="mt-5 border-t pt-4">
          <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Clinic</h3>
          <p className="font-semibold mt-1">{business.name}</p>
          <p className="flex items-start gap-1 text-sm text-slate-500 mt-1 min-w-0"><MapPin size={14} className="shrink-0 mt-0.5" /><span className="break-words">{business.address} • {business.district}</span></p>
        </div>
        <div className="mt-5 border-t pt-4">
          <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Services &amp; fees</h3>
          <ul className="mt-2 space-y-2">
            {ownServices.map(s => (
              <li key={s.id} className="flex items-center justify-between gap-3 border rounded-xl px-3 py-2.5">
                <span className="min-w-0"><span className="font-medium text-sm block break-words">{s.name}</span><span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} />{s.durationMinutes} min</span></span>
                <span className="font-bold text-indigo-700 shrink-0">{formatBDT(s.priceMinor)}</span>
              </li>
            ))}
            {ownServices.length === 0 && <li className="text-sm text-slate-500">Services are listed on the clinic booking page.</li>}
          </ul>
        </div>
        <Link to={`/b/${business.slug}?staff=${staff.id}`} className="mt-6 block text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold">Book Appointment with {staff.name}</Link>
        <p className="text-xs text-slate-400 mt-2 text-center">Consultation fee from {formatBDT(doctorFeeMinor(staff))} • Pay at the clinic or online after booking.</p>
      </div>
    </div>
  )
}
