import { describe, it, expect } from 'vitest'
import { BD_DISTRICTS, haversineKm, nearestDistrict, districtByName } from '../districts'

describe('BD_DISTRICTS', () => {
  it('contains all 64 districts with unique names', () => {
    expect(BD_DISTRICTS).toHaveLength(64)
    expect(new Set(BD_DISTRICTS.map(d => d.name)).size).toBe(64)
  })
  it('every district has a Bangla name and plausible BD coordinates', () => {
    for (const d of BD_DISTRICTS) {
      expect(d.nameBn.length).toBeGreaterThan(0)
      expect(d.lat).toBeGreaterThan(20.5); expect(d.lat).toBeLessThan(26.7)
      expect(d.lng).toBeGreaterThan(88.0); expect(d.lng).toBeLessThan(92.7)
    }
  })
})

describe('nearestDistrict', () => {
  it('maps Sylhet coords to Sylhet', () => {
    expect(nearestDistrict(24.9045, 91.8699).name).toBe('Sylhet')
    expect(nearestDistrict(24.88, 91.88).name).toBe('Sylhet')
  })
  it('maps Dhaka coords to Dhaka', () => {
    expect(nearestDistrict(23.8103, 90.4125).name).toBe('Dhaka')
    expect(nearestDistrict(23.75, 90.39).name).toBe('Dhaka')
  })
  it('maps Chattogram coords to Chattogram', () => {
    expect(nearestDistrict(22.3569, 91.7832).name).toBe('Chattogram')
  })
})

describe('haversineKm', () => {
  it('is 0 for the same point and symmetric', () => {
    expect(haversineKm(23.8103, 90.4125, 23.8103, 90.4125)).toBe(0)
    const ab = haversineKm(23.8103, 90.4125, 24.9045, 91.8699)
    const ba = haversineKm(24.9045, 91.8699, 23.8103, 90.4125)
    expect(ab).toBeCloseTo(ba, 6)
  })
  it('Dhaka–Sylhet is between 180 and 260 km', () => {
    const dhaka = districtByName('Dhaka')!
    const sylhet = districtByName('Sylhet')!
    const km = haversineKm(dhaka.lat, dhaka.lng, sylhet.lat, sylhet.lng)
    expect(km).toBeGreaterThan(180)
    expect(km).toBeLessThan(260)
  })
})

describe('districtByName', () => {
  it('finds districts case-insensitively and returns undefined for unknown names', () => {
    expect(districtByName('cumilla')?.name).toBe('Cumilla')
    expect(districtByName("Cox's Bazar")?.nameBn).toBe('কক্সবাজার')
    expect(districtByName('Atlantis')).toBeUndefined()
  })
})
