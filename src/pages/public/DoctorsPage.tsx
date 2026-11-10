import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, Search, Star, Briefcase, Phone } from 'lucide-react'
import { useLanguage } from '../../i18n'
import { staffMembers, businessById, doctorFeeMinor, type Staff, type Business } from '../../lib/demo/data'
import { listDirectoryDoctors, type DirectoryDoctor } from '../../lib/directory'
import { nextAvailableLabel } from '../../lib/next-available'
import { BD_DISTRICTS, districtByName, haversineKm, nearestDistrict } from '../../lib/location/districts'
import { formatBDT } from '../../lib/utils'

const ALL = 'all'

export function initials(name: string) {
  const parts = name.replace(/^Dr\.\s*/i, '').split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** A directory listing joined with its online-booking records, when the doctor has an account. */
export interface DoctorView {
  dir: DirectoryDoctor
  staff: Staff | null
  business: Business | null
}

export function directoryViews(): DoctorView[] {
  return listDirectoryDoctors().map(dir => {
    const staff = dir.staffId ? staffMembers.find(s => s.id === dir.staffId) ?? null : null
    const business = staff ? businessById(staff.businessId) ?? null : null
    return { dir, staff, business }
  })
}

/** Distance (km) from a reference district to the district a doctor practises in. */
function distanceFrom(refName: string | null, view: DoctorView): number | null {
  if (!refName) return null
  const ref = districtByName(refName)
  const own = districtByName(view.dir.district)
  if (!ref || !own) return null
  return haversineKm(ref.lat, ref.lng, own.lat, own.lng)
}

export default function DoctorsPage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const views = useMemo(() => directoryViews(), [])
  const paramDistrict = searchParams.get('district')
  const paramSpecialty = searchParams.get('specialty')
  const initialDistrict = paramDistrict && districtByName(paramDistrict) ? paramDistrict : null
  const initialSpecialty = paramSpecialty && views.some(v => v.dir.specialty === paramSpecialty) ? paramSpecialty : null
  const [district, setDistrict] = useState<string>(initialDistrict ?? ALL)
  const [status, setStatus] = useState(initialDistrict ? `Showing doctors in ${initialDistrict} first, then nearest districts.` : 'Showing doctors in all districts. Pick your district or use your location to see the nearest doctors first.')
  const [detecting, setDetecting] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [specialty, setSpecialty] = useState<string>(initialSpecialty ?? 'All')

  const specialties = useMemo(() => ['All', ...Array.from(new Set(views.map(v => v.dir.specialty).filter(Boolean))).sort()], [views])
  const refDistrict = district === ALL ? null : district

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return views.filter(({ dir }) => {
      if (specialty !== 'All' && dir.specialty !== specialty) return false
      if (!q) return true
      return dir.name.toLowerCase().includes(q) || dir.specialty.toLowerCase().includes(q) || dir.clinicName.toLowerCase().includes(q)
    })
  }, [views, query, specialty])

  const inDistrict = useMemo(() => (refDistrict ? filtered.filter(v => v.dir.district === refDistrict) : filtered), [filtered, refDistrict])
  const districtEmpty = !!refDistrict && inDistrict.length === 0

  const list = useMemo(() => {
    const byRating = (a: DoctorView, b: DoctorView) => (b.dir.rating ?? 0) - (a.dir.rating ?? 0) || (b.dir.reviews ?? 0) - (a.dir.reviews ?? 0)
    if (!refDistrict) return [...filtered].sort(byRating)
    if (districtEmpty) {
      // No doctors in the chosen district (after filters) — fall back to nearest doctors overall.
      const pool = filtered.length ? filtered : views
      return [...pool].sort((a, b) => (distanceFrom(refDistrict, a) ?? 0) - (distanceFrom(refDistrict, b) ?? 0) || byRating(a, b))
    }
    return [...filtered].sort((a, b) => {
      const aIn = a.dir.district === refDistrict ? 0 : 1
      const bIn = b.dir.district === refDistrict ? 0 : 1
      if (aIn !== bIn) return aIn - bIn
      if (aIn === 0) return byRating(a, b)
      return (distanceFrom(refDistrict, a) ?? 0) - (distanceFrom(refDistrict, b) ?? 0) || byRating(a, b)
    })
  }, [views, filtered, refDistrict, districtEmpty])

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
          {list.map(view => <DoctorCard key={view.dir.id} view={view} refDistrict={refDistrict} />)}
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
    </div>
  )
}

export function DoctorAvatar({ dir, size = 'md' }: { dir: DirectoryDoctor; size?: 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-12 h-12'
  if (dir.photo) return <img src={dir.photo} alt={`Photo of ${dir.name}`} className={`${cls} rounded-full object-cover shrink-0 border`} />
  return <span className={`${cls} rounded-full flex items-center justify-center font-bold text-white shrink-0`} style={{ background: dir.color }} aria-hidden="true">{initials(dir.name)}</span>
}

function DoctorCard({ view, refDistrict }: { view: DoctorView; refDistrict: string | null }) {
  const { dir, staff, business } = view
  const nextAvail = useMemo(() => (staff ? nextAvailableLabel(staff) : null), [staff])
  const km = distanceFrom(refDistrict, view)
  const inRef = refDistrict !== null && dir.district === refDistrict
  const fee = staff ? doctorFeeMinor(staff) : dir.feeNewMinor ?? 0
  return (
    <article className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition flex flex-col min-w-0">
      <div className="flex items-start gap-3 min-w-0">
        <DoctorAvatar dir={dir} />
        <div className="min-w-0">
          <h3 className="font-bold text-lg leading-snug break-words"><Link to={`/doctors/${dir.slug}`} className="hover:text-indigo-700">{dir.name}</Link></h3>
          <p className="text-sm text-indigo-700 font-medium break-words">{dir.specialty}{dir.specialtyBn ? ` • ${dir.specialtyBn}` : ''}</p>
          <p className="text-xs text-slate-500 break-words">{dir.degrees}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mt-3">
        {dir.experienceYears !== undefined && <span className="flex items-center gap-1"><Briefcase size={14} className="text-slate-400" />{dir.experienceYears} yrs experience</span>}
        {dir.rating !== undefined && <span className="flex items-center gap-1 font-semibold"><Star size={14} className="text-amber-500 fill-amber-500" />{dir.rating} <span className="font-normal text-slate-500">({dir.reviews} reviews)</span></span>}
      </div>
      <p className="text-sm text-slate-600 mt-2 break-words">{dir.clinicName}</p>
      <p className="flex items-start gap-1 text-sm text-slate-500 mt-1 min-w-0"><MapPin size={14} className="shrink-0 mt-0.5" /><span className="break-words">{dir.district} • {dir.city}</span></p>
      <div className="flex items-center justify-between gap-2 mt-3 mb-4">
        <p className="text-sm"><span className="text-slate-500">Consultation fee</span> <span className="font-bold text-indigo-700">{formatBDT(fee)}</span></p>
        {refDistrict && (inRef
          ? <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">In your district</span>
          : km !== null && <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full shrink-0">~{Math.round(km)} km away</span>)}
      </div>
      {nextAvail && <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 mb-3"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />Next available: {nextAvail}</p>}
      {!staff && <p className="text-xs font-semibold text-slate-500 mb-3">Appointment by phone — call the chamber to book your serial.</p>}
      <div className="flex gap-2 pt-4 border-t mt-auto">
        <Link to={`/doctors/${dir.slug}`} className="flex-1 text-center border rounded-lg py-2.5 font-semibold text-sm">View Profile</Link>
        {staff && business
          ? <Link to={`/b/${business.slug}?staff=${staff.id}`} className="flex-1 text-center bg-indigo-600 text-white rounded-lg py-2.5 font-semibold text-sm">Book Appointment</Link>
          : <a href={`tel:${dir.phone.replace(/[^+\d]/g, '')}`} className="flex-1 text-center bg-emerald-600 text-white rounded-lg py-2.5 font-semibold text-sm inline-flex items-center justify-center gap-1.5"><Phone size={15} />Call Now</a>}
      </div>
    </article>
  )
}
