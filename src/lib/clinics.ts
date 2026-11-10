/**
 * Clinic listings — managed by the Super Admin, mirroring directory doctors.
 *
 *  - Linked (businessId set): the clinic runs online booking at /b/<slug>.
 *  - Listing-only (businessId null): added by the Super Admin; patients call the
 *    clinic phone number to book (tel: link opens the dialer).
 *
 * Demo persistence: localStorage on this device. Production: Supabase tables.
 */
import { businesses } from './demo/data'
import { slugify } from './directory'

export interface ClinicListing {
  id: string
  slug: string
  businessId: string | null
  name: string
  nameBn?: string
  industry: string
  description: string
  address: string
  district: string
  city: string
  phone: string
  photo: string | null
  color: string
  rating?: number
  reviews?: number
}

const KEY = 'bookora.clinics.v1'

function seedClinics(): ClinicListing[] {
  return businesses.map(b => ({
    id: `clinic-${b.id}`,
    slug: b.slug,
    businessId: b.id,
    name: b.name,
    nameBn: b.nameBn,
    industry: b.industry,
    description: b.description,
    address: b.address,
    district: b.district,
    city: b.city,
    phone: b.phone,
    photo: null,
    color: b.color,
    rating: b.rating,
    reviews: b.reviews,
  }))
}

type Store = Record<string, ClinicListing>

function readStore(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch { /* corrupted storage → reseed */ }
  const seeded: Store = {}
  for (const c of seedClinics()) seeded[c.id] = c
  try { localStorage.setItem(KEY, JSON.stringify(seeded)) } catch { /* storage full/blocked */ }
  return seeded
}

function writeStore(store: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* storage full/blocked */ }
}

export function listClinics(): ClinicListing[] {
  return Object.values(readStore())
}

export function saveClinic(input: ClinicListing): ClinicListing {
  const store = readStore()
  const taken = new Set(Object.values(store).filter(c => c.id !== input.id).map(c => c.slug))
  let slug = slugify(input.slug || input.name)
  if (taken.has(slug)) { let n = 2; while (taken.has(`${slug}-${n}`)) n++; slug = `${slug}-${n}` }
  const saved = { ...input, slug }
  store[saved.id] = saved
  writeStore(store)
  return saved
}

export function deleteClinic(id: string) {
  const store = readStore()
  delete store[id]
  writeStore(store)
}
