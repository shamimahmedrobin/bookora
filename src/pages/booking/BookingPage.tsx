import { useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { businesses, services, staffMembers, businessHoursForBooking, demoBreaks, demoHolidays, initialAppointments } from '../../lib/demo/data'
import { generateAvailableSlots } from '../../lib/booking/availability'
import { applyCoupon } from '../../lib/booking/coupons'
import { genBookingRef, formatBDT } from '../../lib/utils'
import { MapPin, Phone, Star, Clock } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

function nextDays(n: number) {
  const out: string[] = []
  const d = new Date()
  for (let i = 0; i < n; i++) { const x = new Date(d); x.setDate(d.getDate() + i); out.push(x.toISOString().slice(0, 10)) }
  return out
}
function parseTimeLabel(t: string) {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return [9, 0]
  let h = parseInt(m[1])
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
  return [h, parseInt(m[2])]
}

export default function BookingPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const biz = businesses.find(b => b.slug === slug)
  // Preselect a doctor when arriving from /doctors via /b/:slug?staff=<staffId> (must belong to this business).
  const requestedStaff = searchParams.get('staff')
  const preselectedStaffId = biz && requestedStaff && staffMembers.some(s => s.id === requestedStaff && s.businessId === biz.id) ? requestedStaff : 'auto'
  const [serviceId, setServiceId] = useState('')
  const [staffId, setStaffId] = useState(preselectedStaffId)
  const [date, setDate] = useState(nextDays(14)[1])
  const [slot, setSlot] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponMsg, setCouponMsg] = useState('')
  const [discount, setDiscount] = useState(0)
  const [payment, setPayment] = useState('manual')
  const [confirmed, setConfirmed] = useState<{ ref: string } | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const bizServices = useMemo(() => services.filter(s => biz && s.businessId === biz.id), [biz])
  const service = bizServices.find(s => s.id === serviceId)
  const eligibleStaff = useMemo(
    () => staffId === 'auto'
      ? staffMembers.filter(s => biz && s.businessId === biz.id && (!service || s.serviceIds.includes(service.id)))
      : staffMembers.filter(s => s.id === staffId),
    [staffId, biz, service],
  )
  const effectiveStaffId = eligibleStaff[0]?.id ?? ''
  const slots = useMemo(() => {
    if (!service || !effectiveStaffId) return []
    return generateAvailableSlots({
      date,
      service: { id: service.id, durationMinutes: service.durationMinutes, bufferMinutes: service.bufferMinutes },
      staffId: effectiveStaffId,
      businessHours: businessHoursForBooking,
      breaks: demoBreaks,
      holidays: demoHolidays,
      existingAppointments: initialAppointments.filter(a => a.businessId === biz?.id).map(a => {
        const [h, m] = parseTimeLabel(a.time)
        const s = new Date(a.date + 'T00:00:00'); s.setHours(h, m)
        return { staffId: a.staffId, startAt: s, endAt: new Date(s.getTime() + 30 * 60000), status: a.status }
      }),
      now: new Date(), minAdvanceMinutes: 60, maxAdvanceDays: 30,
    })
  }, [service, effectiveStaffId, date, biz])

  if (!biz) return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center">
      <h1 className="text-2xl font-bold">Business not found</h1>
      <p className="text-slate-500 mt-2">Check the booking link or browse demo businesses.</p>
      <Link to="/" className="text-indigo-600 font-semibold mt-4 inline-block">← Home</Link>
      <div className="mt-6 grid gap-2">{businesses.map(b => <Link key={b.id} to={`/b/${b.slug}`} className="border rounded-lg py-2 px-3 break-words">{b.name}</Link>)}</div>
    </div>
  )

  if (confirmed) return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="text-2xl sm:text-3xl font-bold mt-4">Booking confirmed!</h1>
      <p className="mt-2 text-slate-600">Your booking reference is</p>
      <div className="mt-3 inline-block max-w-full break-all bg-indigo-50 text-indigo-800 font-mono font-bold text-lg sm:text-xl px-4 sm:px-6 py-3 rounded-xl">{confirmed.ref}</div>
      <p className="text-sm text-slate-500 mt-4 max-w-md mx-auto">A confirmation would be sent by email/SMS in production (notification job queued). Payment status: <strong>{payment === 'manual' ? 'Pay at business (pending)' : 'Gateway demo — pending verification, NOT marked paid'}</strong>. Never trust a frontend callback alone.</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/my-bookings" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-center">View My Bookings</Link>
        <button onClick={() => { setConfirmed(null); setSlot(''); setServiceId('') }} className="border px-5 py-2.5 rounded-lg font-semibold">Book another</button>
      </div>
    </div>
  )

  const subtotal = service?.priceMinor ?? 0
  const total = subtotal - discount

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <header className="border rounded-2xl p-4 sm:p-6 bg-white min-w-0" style={{ borderTop: `4px solid ${biz.color}` }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold break-words">{biz.name}</h1>
            <p className="text-slate-500 break-words">{biz.nameBn} • {biz.industry}</p>
            <p className="text-sm text-slate-600 mt-2 max-w-xl break-words">{biz.description}</p>
          </div>
          <span className="flex items-center gap-1 font-semibold shrink-0"><Star className="text-amber-500 fill-amber-500 shrink-0" size={18} />{biz.rating} ({biz.reviews} reviews)</span>
        </div>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2 text-sm text-slate-500 mt-3 min-w-0">
          <span className="flex items-start gap-1.5 min-w-0"><MapPin size={16} className="shrink-0 mt-0.5" /><span className="break-words min-w-0">{biz.address}</span></span>
          <span className="flex items-start gap-1.5 min-w-0"><Phone size={16} className="shrink-0 mt-0.5" /><span className="break-words">{biz.phone}</span></span>
          <span className="flex items-start gap-1.5 min-w-0"><Clock size={16} className="shrink-0 mt-0.5" /><span className="break-words">9 AM – 8 PM • {biz.timezone}</span></span>
        </div>
      </header>

      <form
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mt-6 items-start"
        onSubmit={handleSubmit(() => { if (!service || !slot) { alert('Please select a service and a time slot'); return } setConfirmed({ ref: genBookingRef() }) })}
      >
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0 w-full">
          <section className="bg-white border rounded-2xl p-4 sm:p-5 min-w-0">
            <h2 className="font-bold">1. Select service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {bizServices.map(s => (
                <button type="button" key={s.id} onClick={() => { setServiceId(s.id); setSlot('') }} className={`w-full min-w-0 text-left border rounded-xl p-4 ${serviceId === s.id ? 'ring-2 ring-indigo-600 bg-indigo-50' : 'hover:bg-slate-50'}`} aria-pressed={serviceId === s.id}>
                  <div className="font-semibold break-words">{s.name}</div>
                  <div className="text-sm text-slate-500 break-words">{s.nameBn} • {s.durationMinutes} min</div>
                  <div className="font-bold text-indigo-700 mt-1">{formatBDT(s.priceMinor)}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border rounded-2xl p-4 sm:p-5 min-w-0">
            <h2 className="font-bold">2. Select staff</h2>
            {staffId !== 'auto' && (() => { const sel = staffMembers.find(s => s.id === staffId); return sel ? (
              <p className="mt-3 bg-indigo-50 text-indigo-900 text-sm rounded-lg px-3 py-2.5 break-words" role="status">
                Selected doctor: <strong>{sel.name}</strong>{sel.specialty ? ` — ${sel.specialty}` : ` — ${sel.title}`} <span className="text-indigo-600">(change using the list below)</span>
              </p>
            ) : null })()}
            <select value={staffId} onChange={e => { setStaffId(e.target.value); setSlot('') }} className="mt-3 w-full min-w-0 border rounded-lg px-3 py-2 bg-white" aria-label="Select staff">
              <option value="auto">Any available (auto-assign)</option>
              {staffMembers.filter(s => s.businessId === biz.id && (!service || s.serviceIds.includes(service.id))).map(s => <option key={s.id} value={s.id}>{s.name} — {s.title}</option>)}
            </select>
            {effectiveStaffId && <p className="text-xs text-slate-500 mt-2 break-words">Availability shown for: {staffMembers.find(s => s.id === effectiveStaffId)?.name}</p>}
          </section>

          <section className="bg-white border rounded-2xl p-4 sm:p-5 min-w-0">
            <h2 className="font-bold">3. Select date &amp; time</h2>
            <div className="flex gap-2 overflow-x-auto max-w-full pb-2 pt-3 snap-x" role="listbox" aria-label="Choose a date">
              {nextDays(14).map(d => {
                const dt = new Date(d + 'T12:00:00')
                return (
                  <button type="button" key={d} onClick={() => { setDate(d); setSlot('') }} className={`shrink-0 snap-start border rounded-xl px-3 py-2 text-center text-sm ${date === d ? 'bg-indigo-600 text-white' : 'bg-white'}`} aria-pressed={date === d}>
                    <div className="font-bold">{dt.toLocaleDateString('en-GB', { day: 'numeric' })}</div>
                    <div>{dt.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                  </button>
                )
              })}
            </div>
            {!service
              ? <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">Select a service first to see slots.</p>
              : slots.length === 0
                ? <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">No slots available on this date (closed, holiday, break or fully booked).</p>
                : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
                    {slots.map(s => (
                      <button type="button" key={s.label + s.startAt.toISOString()} onClick={() => setSlot(s.label)} className={`w-full min-w-0 border rounded-lg px-1 py-2 text-xs sm:text-sm font-medium text-center truncate ${slot === s.label ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50'}`} aria-pressed={slot === s.label}>{s.label}</button>
                    ))}
                  </div>
                )}
            <p className="text-xs text-slate-400 mt-3">Slots computed by the availability engine (duration + buffer, breaks 1–2 PM, holidays, existing bookings). Final confirmation re-checks on the server.</p>
          </section>

          <section className="bg-white border rounded-2xl p-4 sm:p-5 min-w-0">
            <h2 className="font-bold">4. Your details (guest booking allowed)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="min-w-0"><label className="text-sm font-medium block">Full name *<input className="mt-1 w-full min-w-0 border rounded-lg px-3 py-2" {...register('name')} placeholder="Your name" /></label>{errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}</div>
              <div className="min-w-0"><label className="text-sm font-medium block">Phone *<input className="mt-1 w-full min-w-0 border rounded-lg px-3 py-2" {...register('phone')} placeholder="+8801XXXXXXXXX" /></label>{errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}</div>
              <div className="sm:col-span-2 min-w-0"><label className="text-sm font-medium block">Email<input className="mt-1 w-full min-w-0 border rounded-lg px-3 py-2" {...register('email')} placeholder="you@example.com" /></label>{errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}</div>
              <div className="sm:col-span-2 min-w-0"><label className="text-sm font-medium block">Notes<textarea className="mt-1 w-full min-w-0 border rounded-lg px-3 py-2" rows={2} {...register('notes')} /></label></div>
            </div>
          </section>
        </div>

        <aside className="bg-white border rounded-2xl p-4 sm:p-5 w-full min-w-0 lg:sticky lg:top-6">
          <h2 className="font-bold">Booking summary</h2>
          <dl className="text-sm space-y-2 mt-3">
            <div className="flex justify-between gap-3"><dt className="text-slate-500 shrink-0">Business</dt><dd className="font-medium text-right break-words min-w-0">{biz.name}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500 shrink-0">Service</dt><dd className="font-medium text-right break-words min-w-0">{service?.name ?? '—'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500 shrink-0">Date</dt><dd className="font-medium">{date}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500 shrink-0">Time</dt><dd className="font-medium">{slot || '—'}</dd></div>
          </dl>
          <div className="border-t mt-4 pt-4">
            <label className="text-sm font-medium" htmlFor="coupon">Coupon code</label>
            <div className="flex gap-2 mt-1 min-w-0">
              <input id="coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="flex-1 w-full min-w-0 border rounded-lg px-3 py-2 text-sm uppercase" placeholder="WELCOME10" />
              <button type="button" className="border px-3 rounded-lg font-semibold text-sm shrink-0" onClick={() => { if (!service) { setCouponMsg('Select a service first'); return } const r = applyCoupon(couponCode, subtotal); setCouponMsg(r.message); setDiscount(r.ok ? r.discountMinor : 0) }}>Apply</button>
            </div>
            {couponMsg && <p className="text-xs mt-2 text-slate-600 break-words">{couponMsg}</p>}
            <p className="text-xs text-slate-400 mt-1">Demo: WELCOME10 = 10% off • BOOKORA20 = 20% off over ৳1,000</p>
          </div>
          <div className="border-t mt-4 pt-4">
            <span className="text-sm font-medium">Payment method</span>
            <div className="space-y-2 mt-2">
              {([['manual', 'Pay at business (cash / offline)'], ['bkash', 'bKash — demo, requires merchant credentials'], ['nagad', 'Nagad — demo, requires merchant credentials'], ['sslcommerz', 'SSLCommerz — demo, requires merchant credentials']] as const).map(([v, l]) => (
                <label key={v} className="flex gap-2 items-start border rounded-lg px-3 py-2 text-sm cursor-pointer min-w-0">
                  <input type="radio" name="pay" checked={payment === v} onChange={() => setPayment(v)} className="mt-0.5 shrink-0" />
                  <span className="break-words min-w-0">{l}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="border-t mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between gap-3"><span>Subtotal</span><span>{formatBDT(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between gap-3 text-emerald-700"><span>Discount</span><span>−{formatBDT(discount)}</span></div>}
            <div className="flex justify-between gap-3 font-bold text-base"><span>Total</span><span>{formatBDT(total)}</span></div>
          </div>
          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold mt-5 disabled:opacity-50" disabled={!service || !slot}>Confirm Booking</button>
          <p className="text-xs text-slate-400 mt-2 text-center">By confirming you agree to this business's cancellation policy (free cancellation up to 2 hours before).</p>
        </aside>
      </form>
    </div>
  )
}
