import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Plus, Pencil, Trash2, X } from 'lucide-react'
import { BD_DISTRICTS } from '../../lib/location/districts'
import { listClinics, saveClinic, deleteClinic, type ClinicListing } from '../../lib/clinics'
import { slugify } from '../../lib/directory'
import { fileToPhoto } from './DirectoryDoctorsPage'

const COLORS = ['#4f46e5', '#0891b2', '#059669', '#7c3aed', '#2563eb', '#0d9488', '#9333ea', '#0284c7', '#ea580c', '#db2777']
const INDUSTRIES = ['Clinic', 'Dentist', 'Hospital', 'Specialist Chamber', 'Diagnostic Centre']

function emptyDraft(): ClinicListing {
  return {
    id: `clinic-${Date.now()}`, slug: '', businessId: null,
    name: '', nameBn: '', industry: 'Clinic', description: '',
    address: '', district: 'Dhaka', city: 'Dhaka', phone: '',
    photo: null, color: COLORS[0], rating: undefined, reviews: undefined,
  }
}

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm bg-white'
const labelCls = 'block text-sm font-medium text-slate-700'

export default function AdminClinicsPage() {
  const [rows, setRows] = useState<ClinicListing[]>(() => listClinics())
  const [draft, setDraft] = useState<ClinicListing | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof ClinicListing>(key: K, value: ClinicListing[K]) {
    setDraft(prev => (prev ? { ...prev, [key]: value } : prev))
  }

  async function onPhotoFile(file: File | undefined) {
    if (!file || !draft) return
    try { set('photo', await fileToPhoto(file)) } catch { setError('Could not read that image — try a JPG or PNG.') }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    if (!draft.name.trim()) { setError('Clinic name is required.'); return }
    if (!draft.phone.trim()) { setError('Clinic phone number is required — patients will call this number.'); return }
    const saved = saveClinic({ ...draft, name: draft.name.trim(), phone: draft.phone.trim(), slug: draft.slug.trim() || slugify(draft.name) })
    setRows(listClinics())
    setDraft(null)
    setNotice(`${saved.name} saved — now listed on the public Clinics page.`)
  }

  function remove(c: ClinicListing) {
    if (!window.confirm(`Remove ${c.name} from the clinic listings?`)) return
    deleteClinic(c.id)
    setRows(listClinics())
    setNotice(`${c.name} removed.`)
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clinics</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">ডাক্তারের মতোই — সুপার অ্যাডমিন থেকে ক্লিনিক যোগ করুন ছবি আর ফোন নম্বরসহ। Clinics added here are listing-only: they appear on the public Clinics page with a Call button (no online booking page). Clinics with their own Bookora account keep their online booking.</p>
        </div>
        {!draft && <button onClick={() => { setError(''); setNotice(''); setDraft(emptyDraft()) }} className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shrink-0"><Plus size={16} />Add clinic</button>}
      </div>

      {notice && <p className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3" role="status">{notice}</p>}

      {draft ? (
        <form onSubmit={submit} className="bg-white border rounded-2xl p-5 mt-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{rows.some(r => r.id === draft.id) ? `Edit — ${draft.name || 'clinic'}` : 'Add a clinic'}</h2>
            <button type="button" onClick={() => setDraft(null)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Close form"><X size={18} /></button>
          </div>
          {error && <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">{error}</p>}

          <div className="flex flex-wrap items-center gap-4">
            {draft.photo
              ? <img src={draft.photo} alt="" className="w-24 h-24 rounded-2xl object-cover border" />
              : <span className="w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-white text-xl" style={{ background: draft.color }}>{draft.name.replace(/^Dr\.\s*/i, '').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'C'}</span>}
            <div className="space-y-2 min-w-[240px] flex-1 max-w-md">
              <span className={labelCls}>Clinic photo / logo</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="border rounded-lg px-3 py-2 text-sm font-semibold">Upload photo</button>
                {draft.photo && <button type="button" onClick={() => set('photo', null)} className="border rounded-lg px-3 py-2 text-sm font-semibold text-red-600">Remove</button>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => onPhotoFile(e.target.files?.[0])} />
              <input value={draft.photo && !draft.photo.startsWith('data:') ? draft.photo : ''} onChange={e => set('photo', e.target.value || null)} placeholder="…or paste a photo URL (https://…)" className={inputCls} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className={labelCls}>Clinic name *<input value={draft.name} onChange={e => { set('name', e.target.value); if (!rows.some(r => r.id === draft.id)) set('slug', slugify(e.target.value)) }} className={`${inputCls} mt-1`} required /></label>
            <label className={labelCls}>Listing slug<span className="flex items-center gap-1 mt-1"><span className="text-xs text-slate-400 whitespace-nowrap">clinics/</span><input value={draft.slug} onChange={e => set('slug', e.target.value)} className={inputCls} /></span></label>
            <label className={labelCls}>Type
              <select value={draft.industry} onChange={e => set('industry', e.target.value)} className={`${inputCls} mt-1`}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select>
            </label>
            <label className={labelCls}>Phone number *
              <span className="flex items-center gap-2 mt-1"><Phone size={15} className="text-slate-400 shrink-0" /><input value={draft.phone} onChange={e => set('phone', e.target.value)} placeholder="+8801XXXXXXXXX" className={inputCls} required /></span>
              <span className="text-xs text-slate-400 font-normal">রোগী এই নম্বরে কল করে অ্যাপয়েন্টমেন্ট নেবে।</span>
            </label>
            <label className={labelCls}>Name (বাংলা)<input value={draft.nameBn ?? ''} onChange={e => set('nameBn', e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>Address<input value={draft.address} onChange={e => set('address', e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>District
              <select value={draft.district} onChange={e => set('district', e.target.value)} className={`${inputCls} mt-1`}>{BD_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name} — {d.nameBn}</option>)}</select>
            </label>
            <label className={labelCls}>City / area<input value={draft.city} onChange={e => set('city', e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className={labelCls}>Card colour
              <span className="flex gap-1.5 mt-2 flex-wrap">{COLORS.map(c => <button key={c} type="button" onClick={() => set('color', c)} aria-label={`Colour ${c}`} className={`w-7 h-7 rounded-full border-2 ${draft.color === c ? 'border-slate-900' : 'border-transparent'}`} style={{ background: c }} />)}</span>
            </label>
          </div>
          <label className={labelCls}>Description<textarea value={draft.description} onChange={e => set('description', e.target.value)} rows={3} className={`${inputCls} mt-1`} placeholder="What this clinic is known for, facilities, opening hours…" /></label>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-900">
            {draft.businessId
              ? <>This clinic has its own Bookora account — its <strong>online booking page stays live</strong>; edits here update the public listing only.</>
              : <><strong>Listing only:</strong> clinics added from Super Admin show a <strong>Call</strong> button on the public Clinics page — no online booking page is created.</>}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold text-sm">Save clinic</button>
            <button type="button" onClick={() => setDraft(null)} className="border px-5 py-2.5 rounded-lg font-semibold text-sm">Cancel</button>
          </div>
          <p className="text-xs text-slate-400">Demo mode: listings are saved on this device only. In production they are stored in Supabase and go live for everyone instantly.</p>
        </form>
      ) : (
        <div className="bg-white border rounded-2xl mt-5 divide-y">
          {rows.length === 0 && <p className="p-5 text-sm text-slate-500">No clinics listed yet. Add the first one.</p>}
          {rows.map(c => (
            <div key={c.id} className="p-4 flex flex-wrap items-center gap-3">
              {c.photo
                ? <img src={c.photo} alt="" className="w-12 h-12 rounded-xl object-cover border shrink-0" />
                : <span className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0" style={{ background: c.color }}>{c.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()}</span>}
              <div className="min-w-0 flex-1 basis-48">
                <p className="font-semibold break-words">{c.name} <span className={`ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full align-middle ${c.businessId ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>{c.businessId ? 'Online booking' : 'Call only'}</span></p>
                <p className="text-sm text-slate-500 break-words">{c.industry} • {c.city} • {c.district}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={11} />{c.phone}</p>
              </div>
              {c.businessId && <Link to={`/b/${c.slug}`} className="text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-lg px-3 py-1.5">/b/{c.slug}</Link>}
              <button onClick={() => { setError(''); setNotice(''); setDraft(structuredClone(c)) }} className="inline-flex items-center gap-1 text-sm font-semibold border rounded-lg px-3 py-1.5"><Pencil size={13} />Edit</button>
              <button onClick={() => remove(c)} className="inline-flex items-center gap-1 text-sm font-semibold border border-red-200 text-red-600 rounded-lg px-3 py-1.5"><Trash2 size={13} />Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
