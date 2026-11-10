import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Plus, Pencil, Trash2, ExternalLink, X } from 'lucide-react'
import { BD_DISTRICTS } from '../../lib/location/districts'
import {
  listDirectoryDoctors, saveDirectoryDoctor, deleteDirectoryDoctor, slugify,
  type DirectoryDoctor,
} from '../../lib/directory'
import { DoctorAvatar } from '../public/DoctorsPage'

const COLORS = ['#4f46e5', '#0891b2', '#059669', '#7c3aed', '#2563eb', '#0d9488', '#9333ea', '#0284c7', '#ea580c', '#db2777']

function emptyDraft(): DirectoryDoctor {
  return {
    id: `dir-${Date.now()}`,
    slug: '',
    staffId: null,
    name: '',
    specialty: '',
    specialtyBn: '',
    degrees: '',
    experienceYears: undefined,
    rating: undefined,
    reviews: undefined,
    photo: null,
    phone: '',
    clinicName: '',
    address: '',
    district: 'Dhaka',
    city: 'Dhaka',
    feeNewMinor: null,
    feeFollowupMinor: null,
    about: '',
    color: COLORS[0],
  }
}

/** Downscale an uploaded photo to a 480×480 JPEG data URL so local storage stays small. */
export function fileToPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const size = 480
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('canvas unavailable')); return }
      const scale = Math.max(size / img.width, size / img.height)
      const w = img.width * scale, h = img.height * scale
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')) }
    img.src = url
  })
}

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm bg-white'
const labelCls = 'block text-sm font-medium text-slate-700'

export default function DirectoryDoctorsPage() {
  const [rows, setRows] = useState<DirectoryDoctor[]>(() => listDirectoryDoctors())
  const [draft, setDraft] = useState<DirectoryDoctor | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)


  function refresh() { setRows(listDirectoryDoctors()) }

  function startAdd() { setError(''); setNotice(''); setDraft(emptyDraft()) }
  function startEdit(d: DirectoryDoctor) { setError(''); setNotice(''); setDraft(structuredClone(d)) }

  function set<K extends keyof DirectoryDoctor>(key: K, value: DirectoryDoctor[K]) {
    setDraft(prev => (prev ? { ...prev, [key]: value } : prev))
  }

  async function onPhotoFile(file: File | undefined) {
    if (!file || !draft) return
    try { set('photo', await fileToPhoto(file)) } catch { setError('Could not read that image — try a JPG or PNG.') }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    if (!draft.name.trim()) { setError('Doctor name is required.'); return }
    if (!draft.phone.trim()) { setError('Appointment phone number is required — patients will call this number.'); return }
    if (!draft.specialty.trim()) { setError('Specialty is required.'); return }
    if (!draft.clinicName.trim()) { setError('Clinic / chamber name is required.'); return }
    const saved = saveDirectoryDoctor({ ...draft, slug: draft.slug.trim() || slugify(draft.name), name: draft.name.trim(), phone: draft.phone.trim() })
    refresh()
    setDraft(null)
    setNotice(`${saved.name} saved — profile live at /doctors/${saved.slug}`)
  }

  function remove(d: DirectoryDoctor) {
    if (!window.confirm(`Remove ${d.name} from the directory? Their public profile page will stop working.`)) return
    deleteDirectoryDoctor(d.id)
    refresh()
    setNotice(`${d.name} removed from the directory.`)
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Directory Doctors</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">যেসব ডাক্তারের Bookora অ্যাকাউন্ট নেই, তাদের এখানে ছবিসহ যুক্ত করুন — রোগী প্রোফাইল পেজ থেকে সরাসরি চেম্বারের নম্বরে কল করে অ্যাপয়েন্টমেন্ট নেবে (কল বাটনে চাপ দিলে ফোনের ডায়ালার খুলবে)। Doctors added here appear instantly on the public directory.</p>
        </div>
        {!draft && <button onClick={startAdd} className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shrink-0"><Plus size={16} />Add doctor</button>}
      </div>

      {notice && <p className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3" role="status">{notice}</p>}

      {draft ? (
        <form onSubmit={submit} className="bg-white border rounded-2xl p-5 mt-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{rows.some(r => r.id === draft.id) ? `Edit — ${draft.name || 'doctor'}` : 'Add a directory doctor'}</h2>
            <button type="button" onClick={() => setDraft(null)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Close form"><X size={18} /></button>
          </div>
          {error && <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">{error}</p>}

          {/* Photo */}
          <div className="flex flex-wrap items-center gap-4">
            <DoctorAvatar dir={draft} size="lg" />
            <div className="space-y-2 min-w-[240px] flex-1 max-w-md">
              <span className={labelCls}>Doctor photo</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="border rounded-lg px-3 py-2 text-sm font-semibold">Upload photo</button>
                {draft.photo && <button type="button" onClick={() => set('photo', null)} className="border rounded-lg px-3 py-2 text-sm font-semibold text-red-600">Remove</button>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => onPhotoFile(e.target.files?.[0])} />
              <input value={draft.photo && !draft.photo.startsWith('data:') ? draft.photo : ''} onChange={e => set('photo', e.target.value || null)} placeholder="…or paste a photo URL (https://…)" className={inputCls} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className={labelCls}>Full name *<input value={draft.name} onChange={e => { set('name', e.target.value); if (!rows.some(r => r.id === draft.id)) set('slug', slugify(e.target.value)) }} placeholder="Dr. …" className={`${inputCls} mt-1`} required /></label>
            <label className={labelCls}>Profile link (slug)
              <span className="flex items-center gap-1 mt-1"><span className="text-xs text-slate-400 whitespace-nowrap">/doctors/</span><input value={draft.slug} onChange={e => set('slug', e.target.value)} placeholder="dr-name" className={inputCls} /></span>
            </label>
            <label className={labelCls}>Specialty *<input value={draft.specialty} onChange={e => set('specialty', e.target.value)} placeholder="Cardiology" className={`${inputCls} mt-1`} required /></label>
            <label className={labelCls}>Specialty (বাংলা)<input value={draft.specialtyBn ?? ''} onChange={e => set('specialtyBn', e.target.value)} placeholder="কার্ডিওলজি" className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>Degrees / title<input value={draft.degrees} onChange={e => set('degrees', e.target.value)} placeholder="MBBS, MD (Cardiology)" className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>Appointment phone number *
              <span className="flex items-center gap-2 mt-1"><Phone size={15} className="text-slate-400 shrink-0" /><input value={draft.phone} onChange={e => set('phone', e.target.value)} placeholder="+8801XXXXXXXXX" className={inputCls} required /></span>
              <span className="text-xs text-slate-400 font-normal">রোগী এই নম্বরে কল করে সিরিয়াল নেবে — profile page-এর Call button এই নম্বরেই যাবে।</span>
            </label>
            <label className={labelCls}>Clinic / chamber name *<input value={draft.clinicName} onChange={e => set('clinicName', e.target.value)} className={`${inputCls} mt-1`} required /></label>
            <label className={labelCls}>Chamber address<input value={draft.address} onChange={e => set('address', e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>District
              <select value={draft.district} onChange={e => set('district', e.target.value)} className={`${inputCls} mt-1`}>
                {BD_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name} — {d.nameBn}</option>)}
              </select>
            </label>
            <label className={labelCls}>City / area<input value={draft.city} onChange={e => set('city', e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>New-patient fee (৳)<input type="number" min="0" value={draft.feeNewMinor !== null ? draft.feeNewMinor / 100 : ''} onChange={e => set('feeNewMinor', e.target.value === '' ? null : Math.round(Number(e.target.value) * 100))} placeholder="1000" className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>Follow-up fee (৳)<input type="number" min="0" value={draft.feeFollowupMinor !== null ? draft.feeFollowupMinor / 100 : ''} onChange={e => set('feeFollowupMinor', e.target.value === '' ? null : Math.round(Number(e.target.value) * 100))} placeholder="500" className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>Experience (years)<input type="number" min="0" max="60" value={draft.experienceYears ?? ''} onChange={e => set('experienceYears', e.target.value === '' ? undefined : Number(e.target.value))} className={`${inputCls} mt-1`} /></label>
            <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-900">
              {draft.staffId
                ? <>This doctor has their own Bookora account, so <strong>online booking stays on</strong> alongside the call button (managed from their own dashboard, not here).</>
                : <><strong>Call only:</strong> doctors added from Super Admin do not get online booking — their profile shows only the <strong>Call for Appointment</strong> button with the number above. সুপার অ্যাডমিন থেকে যোগ করা ডাক্তারের পেজে শুধু কল অপশনই দেখাবে।</>}
            </div>
            <label className={labelCls}>Avatar colour
              <span className="flex gap-1.5 mt-2 flex-wrap">{COLORS.map(c => <button key={c} type="button" onClick={() => set('color', c)} aria-label={`Colour ${c}`} className={`w-7 h-7 rounded-full border-2 ${draft.color === c ? 'border-slate-900' : 'border-transparent'}`} style={{ background: c }} />)}</span>
            </label>
          </div>
          <label className={labelCls}>About the doctor (optional)<textarea value={draft.about ?? ''} onChange={e => set('about', e.target.value)} rows={3} className={`${inputCls} mt-1`} placeholder="Education, hospital affiliations, special interests…" /></label>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold text-sm">Save doctor</button>
            <button type="button" onClick={() => setDraft(null)} className="border px-5 py-2.5 rounded-lg font-semibold text-sm">Cancel</button>
          </div>
          <p className="text-xs text-slate-400">Demo mode: directory changes are saved on this device only. In production they are stored in Supabase and go live for everyone instantly.</p>
        </form>
      ) : (
        <div className="bg-white border rounded-2xl mt-5 divide-y">
          {rows.length === 0 && <p className="p-5 text-sm text-slate-500">No directory doctors yet. Add the first one.</p>}
          {rows.map(d => (
            <div key={d.id} className="p-4 flex flex-wrap items-center gap-3">
              <DoctorAvatar dir={d} />
              <div className="min-w-0 flex-1 basis-48">
                <p className="font-semibold break-words">{d.name} <span className={`ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full align-middle ${d.staffId ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>{d.staffId ? 'Online booking' : 'Call only'}</span></p>
                <p className="text-sm text-slate-500 break-words">{d.specialty} • {d.clinicName} • {d.district}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={11} />{d.phone}</p>
              </div>
              <Link to={`/doctors/${d.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-lg px-3 py-1.5"><ExternalLink size={13} />/doctors/{d.slug}</Link>
              <button onClick={() => startEdit(d)} className="inline-flex items-center gap-1 text-sm font-semibold border rounded-lg px-3 py-1.5"><Pencil size={13} />Edit</button>
              <button onClick={() => remove(d)} className="inline-flex items-center gap-1 text-sm font-semibold border border-red-200 text-red-600 rounded-lg px-3 py-1.5"><Trash2 size={13} />Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
