/**
 * Directory doctors — public doctor listings managed by the Super Admin.
 *
 * Two kinds:
 *  - Linked (staffId set): the doctor also takes online bookings on Bookora.
 *  - Call-only (staffId null): the doctor has NO Bookora account — patients book by
 *    phoning the chamber number shown on the profile; tapping it opens the phone dialer.
 *
 * Demo persistence: localStorage on this device. Production: a `directory_doctors`
 * table in Supabase, edited from the same Super Admin screens.
 */
import { doctors, doctorFeeMinor, services } from './demo/data'

export interface DirectoryDoctor {
  id: string
  slug: string
  staffId: string | null
  name: string
  specialty: string
  specialtyBn?: string
  degrees: string
  experienceYears?: number
  rating?: number
  reviews?: number
  photo: string | null
  /** Appointment phone number — tel: link opens the device dialer. */
  phone: string
  clinicName: string
  address: string
  district: string
  city: string
  feeNewMinor: number | null
  feeFollowupMinor: number | null
  about?: string
  color: string
}

const KEY = 'bookora.directory.v1'

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'doctor'
}

function seedDirectory(): DirectoryDoctor[] {
  return doctors.map(({ staff, business }) => {
    const followup = services.find(s => staff.serviceIds.includes(s.id) && /follow/i.test(s.name))
    return {
      id: `dir-${staff.id}`,
      slug: slugify(staff.name),
      staffId: staff.id,
      name: staff.name,
      specialty: staff.specialty ?? staff.title,
      specialtyBn: staff.specialtyBn,
      degrees: staff.title,
      experienceYears: staff.experienceYears,
      rating: staff.rating,
      reviews: staff.reviews,
      photo: null,
      phone: business.phone,
      clinicName: business.name,
      address: business.address,
      district: business.district,
      city: business.city,
      feeNewMinor: doctorFeeMinor(staff) || null,
      feeFollowupMinor: followup ? followup.priceMinor : null,
      color: business.color,
    }
  })
}

type Store = Record<string, DirectoryDoctor>

function readStore(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch { /* corrupted storage → reseed */ }
  const seeded: Store = {}
  for (const d of seedDirectory()) seeded[d.id] = d
  try { localStorage.setItem(KEY, JSON.stringify(seeded)) } catch { /* storage full/blocked */ }
  return seeded
}

function writeStore(store: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* storage full/blocked */ }
}

export function listDirectoryDoctors(): DirectoryDoctor[] {
  return Object.values(readStore())
}

export function getDirectoryDoctor(id: string): DirectoryDoctor | null {
  return readStore()[id] ?? null
}

export function getDirectoryDoctorBySlug(slug: string): DirectoryDoctor | null {
  return Object.values(readStore()).find(d => d.slug === slug) ?? null
}

export function getDirectoryDoctorByStaff(staffId: string): DirectoryDoctor | null {
  return Object.values(readStore()).find(d => d.staffId === staffId) ?? null
}

/** Make a slug unique within the store (optionally ignoring one record). */
export function uniqueSlug(base: string, store: Store, ignoreId?: string): string {
  const taken = new Set(Object.values(store).filter(d => d.id !== ignoreId).map(d => d.slug))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

export function saveDirectoryDoctor(input: DirectoryDoctor): DirectoryDoctor {
  const store = readStore()
  const slug = uniqueSlug(slugify(input.slug || input.name), store, input.id)
  const saved = { ...input, slug }
  store[saved.id] = saved
  writeStore(store)
  return saved
}

export function deleteDirectoryDoctor(id: string) {
  const store = readStore()
  delete store[id]
  writeStore(store)
}

export function resetDirectory() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  readStore()
}
