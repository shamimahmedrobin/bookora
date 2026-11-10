import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Star, Briefcase, Phone, Clock, ArrowLeft, CalendarCheck } from 'lucide-react'
import { staffMembers, businessById, services, doctorFeeMinor } from '../../lib/demo/data'
import { getDirectoryDoctorBySlug } from '../../lib/directory'
import { getDoctorSettings, formatTime12, DAY_ORDER, DAY_NAMES } from '../../lib/doctor-settings'
import { nextAvailableLabel } from '../../lib/next-available'
import { DoctorAvatar } from './DoctorsPage'
import { formatBDT } from '../../lib/utils'

export default function DoctorProfilePage() {
  const { slug } = useParams()
  const dir = useMemo(() => (slug ? getDirectoryDoctorBySlug(slug) : null), [slug])
  const staff = dir?.staffId ? staffMembers.find(s => s.id === dir.staffId) ?? null : null
  const business = staff ? businessById(staff.businessId) ?? null : null
  const nextAvail = useMemo(() => (staff ? nextAvailableLabel(staff) : null), [staff])

  if (!dir) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Doctor not found</h1>
        <p className="text-slate-500 mt-2">This doctor profile does not exist or may have been removed.</p>
        <Link to="/doctors" className="inline-block mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm">Browse all doctors</Link>
      </div>
    )
  }

  const tel = `tel:${dir.phone.replace(/[^+\d]/g, '')}`
  const ownServices = staff ? services.filter(s => staff.serviceIds.includes(s.id)) : []
  const settings = staff ? getDoctorSettings(staff.id) : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 pb-28 sm:pb-12">
      <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700"><ArrowLeft size={16} />All doctors</Link>

      {/* Header */}
      <div className="bg-white border rounded-3xl p-5 sm:p-8 mt-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-5">
          <DoctorAvatar dir={dir} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold break-words">{dir.name}</h1>
            <p className="text-indigo-700 font-semibold mt-1 break-words">{dir.specialty}{dir.specialtyBn ? ` • ${dir.specialtyBn}` : ''}</p>
            <p className="text-sm text-slate-500 break-words">{dir.degrees}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mt-3">
              {dir.experienceYears !== undefined && <span className="flex items-center gap-1"><Briefcase size={14} className="text-slate-400" />{dir.experienceYears} years experience</span>}
              {dir.rating !== undefined && <span className="flex items-center gap-1 font-semibold"><Star size={14} className="text-amber-500 fill-amber-500" />{dir.rating} <span className="font-normal text-slate-500">({dir.reviews} patient reviews)</span></span>}
              <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" />{dir.district}</span>
            </div>
            {nextAvail && <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 mt-3"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />Next available: {nextAvail}</p>}
            <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
              {staff && business && (
                <Link to={`/b/${business.slug}?staff=${staff.id}`} className="flex-1 text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2"><CalendarCheck size={17} />Book Appointment Online</Link>
              )}
              <a href={tel} className={`flex-1 text-center py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 ${staff ? 'border border-emerald-600 text-emerald-700' : 'bg-emerald-600 text-white'}`}>
                <Phone size={17} />Call for Appointment
              </a>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {staff
                ? `অ্যাপয়েন্টমেন্টের জন্য কল করুন: ${dir.phone} — or book online above.`
                : `এই ডাক্তার এখনো Bookora-তে অনলাইন বুকিং চালু করেননি — অ্যাপয়েন্টমেন্টের জন্য সরাসরি চেম্বারে কল করুন: ${dir.phone}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">
        {/* Chamber */}
        <section className="bg-white border rounded-3xl p-5 sm:p-6">
          <h2 className="font-bold">Chamber</h2>
          <p className="font-semibold mt-2">{dir.clinicName}</p>
          <p className="flex items-start gap-1 text-sm text-slate-500 mt-1 min-w-0"><MapPin size={14} className="shrink-0 mt-0.5" /><span className="break-words">{dir.address}</span></p>
          <a href={tel} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 mt-3"><Phone size={14} />{dir.phone}</a>
          {settings && (
            <div className="mt-4 space-y-3">
              {settings.chambers.map(ch => {
                const activeDays = DAY_ORDER.map(dow => ({ dow, s: ch.days.find(d => d.dayOfWeek === dow) })).filter(x => x.s?.enabled)
                return (
                  <div key={ch.id} className="border rounded-xl p-3">
                    <p className="text-sm font-semibold">{ch.name}</p>
                    {activeDays.length === 0
                      ? <p className="text-xs text-slate-400 mt-1">No sitting days set</p>
                      : <ul className="mt-1.5 space-y-1">
                          {activeDays.map(({ dow, s }) => (
                            <li key={dow} className="text-xs text-slate-600 flex justify-between gap-2"><span>{DAY_NAMES[dow]}</span><span className="font-medium">{formatTime12(s!.start)} – {formatTime12(s!.end)}</span></li>
                          ))}
                        </ul>}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Fees */}
        <section className="bg-white border rounded-3xl p-5 sm:p-6">
          <h2 className="font-bold">Consultation fees</h2>
          {ownServices.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {ownServices.map(s => (
                <li key={s.id} className="flex items-center justify-between gap-3 border rounded-xl px-3 py-2.5">
                  <span className="min-w-0"><span className="font-medium text-sm block break-words">{s.name}</span><span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} />{s.durationMinutes} min</span></span>
                  <span className="font-bold text-indigo-700 shrink-0">{formatBDT(s.priceMinor)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {dir.feeNewMinor !== null && <li className="flex justify-between border rounded-xl px-3 py-2.5"><span>New patient</span><span className="font-bold text-indigo-700">{formatBDT(dir.feeNewMinor)}</span></li>}
              {dir.feeFollowupMinor !== null && <li className="flex justify-between border rounded-xl px-3 py-2.5"><span>Follow-up visit</span><span className="font-bold text-indigo-700">{formatBDT(dir.feeFollowupMinor)}</span></li>}
              {dir.feeNewMinor === null && dir.feeFollowupMinor === null && <li className="text-slate-500">Fee confirmed when you call the chamber.</li>}
            </ul>
          )}
          {staff && <p className="text-xs text-slate-400 mt-3">Consultation fee from {formatBDT(doctorFeeMinor(staff))} • Pay at the clinic or online after booking.</p>}
          {dir.about && <><h3 className="font-bold mt-6">About</h3><p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{dir.about}</p></>}
        </section>
      </div>

      {/* Sticky mobile call bar — stacked label + number so long numbers never overflow */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t px-3 pt-2.5 flex gap-2 sm:hidden" style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}>
        <a href={tel} className="flex-1 min-w-0 bg-emerald-600 text-white rounded-xl px-2 py-2 flex items-center justify-center gap-2">
          <Phone size={18} className="shrink-0" />
          <span className="min-w-0 leading-tight text-left">
            <span className="block text-[11px] font-medium text-emerald-100">Call for Appointment</span>
            <span className="block font-bold text-sm truncate">{dir.phone}</span>
          </span>
        </a>
        {staff && business && (
          <Link to={`/b/${business.slug}?staff=${staff.id}`} className="flex-1 min-w-0 bg-indigo-600 text-white rounded-xl px-2 py-2 flex items-center justify-center gap-2">
            <CalendarCheck size={18} className="shrink-0" />
            <span className="font-bold text-sm whitespace-nowrap">Book Online</span>
          </Link>
        )}
      </div>
    </div>
  )
}
