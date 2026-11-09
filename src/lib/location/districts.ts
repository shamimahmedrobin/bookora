/**
 * Bangladesh district reference data + small geo helpers.
 * Coordinates are district-town centroids (best-known values) — good enough for
 * "nearest district" detection and approximate distance badges, not navigation.
 */
export interface District { name: string; nameBn: string; lat: number; lng: number }

export const BD_DISTRICTS: District[] = [
  { name: 'Bagerhat', nameBn: 'বাগেরহাট', lat: 22.6516, lng: 89.7859 },
  { name: 'Bandarban', nameBn: 'বান্দরবান', lat: 22.1953, lng: 92.2184 },
  { name: 'Barguna', nameBn: 'বরগুনা', lat: 22.0953, lng: 90.1121 },
  { name: 'Barishal', nameBn: 'বরিশাল', lat: 22.7010, lng: 90.3535 },
  { name: 'Bhola', nameBn: 'ভোলা', lat: 22.6859, lng: 90.6482 },
  { name: 'Bogura', nameBn: 'বগুড়া', lat: 24.8465, lng: 89.3773 },
  { name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', lat: 23.9608, lng: 91.1115 },
  { name: 'Chandpur', nameBn: 'চাঁদপুর', lat: 23.2333, lng: 90.6713 },
  { name: 'Chapai Nawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', lat: 24.5965, lng: 88.2775 },
  { name: 'Chattogram', nameBn: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832 },
  { name: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', lat: 23.6401, lng: 88.8412 },
  { name: "Cox's Bazar", nameBn: 'কক্সবাজার', lat: 21.9162, lng: 92.0158 },
  { name: 'Cumilla', nameBn: 'কুমিল্লা', lat: 23.4607, lng: 91.1809 },
  { name: 'Dhaka', nameBn: 'ঢাকা', lat: 23.8103, lng: 90.4125 },
  { name: 'Dinajpur', nameBn: 'দিনাজপুর', lat: 25.6217, lng: 88.6355 },
  { name: 'Faridpur', nameBn: 'ফরিদপুর', lat: 23.6022, lng: 89.8406 },
  { name: 'Feni', nameBn: 'ফেনী', lat: 23.0159, lng: 91.3976 },
  { name: 'Gaibandha', nameBn: 'গাইবান্ধা', lat: 25.3288, lng: 89.5281 },
  { name: 'Gazipur', nameBn: 'গাজীপুর', lat: 24.0022, lng: 90.4264 },
  { name: 'Gopalganj', nameBn: 'গোপালগঞ্জ', lat: 23.0487, lng: 89.8292 },
  { name: 'Habiganj', nameBn: 'হবিগঞ্জ', lat: 24.4771, lng: 91.4504 },
  { name: 'Jamalpur', nameBn: 'জামালপুর', lat: 24.9375, lng: 89.9378 },
  { name: 'Jashore', nameBn: 'যশোর', lat: 23.1697, lng: 89.2135 },
  { name: 'Jhalokati', nameBn: 'ঝালকাঠি', lat: 22.6406, lng: 90.1987 },
  { name: 'Jhenaidah', nameBn: 'ঝিনাইদহ', lat: 23.5449, lng: 89.1539 },
  { name: 'Joypurhat', nameBn: 'জয়পুরহাট', lat: 25.0968, lng: 89.0228 },
  { name: 'Khagrachari', nameBn: 'খাগড়াছড়ি', lat: 23.1193, lng: 92.0079 },
  { name: 'Khulna', nameBn: 'খুলনা', lat: 22.8456, lng: 89.5403 },
  { name: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', lat: 24.4449, lng: 90.7821 },
  { name: 'Kurigram', nameBn: 'কুড়িগ্রাম', lat: 25.8072, lng: 89.6362 },
  { name: 'Kushtia', nameBn: 'কুষ্টিয়া', lat: 23.8907, lng: 89.1099 },
  { name: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', lat: 22.9444, lng: 90.8282 },
  { name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', lat: 25.9166, lng: 89.4500 },
  { name: 'Madaripur', nameBn: 'মাদারীপুর', lat: 23.1641, lng: 90.1897 },
  { name: 'Magura', nameBn: 'মাগুরা', lat: 23.4873, lng: 89.4198 },
  { name: 'Manikganj', nameBn: 'মানিকগঞ্জ', lat: 23.8617, lng: 90.0003 },
  { name: 'Meherpur', nameBn: 'মেহেরপুর', lat: 23.7623, lng: 88.6318 },
  { name: 'Moulvibazar', nameBn: 'মৌলভীবাজার', lat: 24.4829, lng: 91.7708 },
  { name: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', lat: 23.5422, lng: 90.5305 },
  { name: 'Mymensingh', nameBn: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203 },
  { name: 'Naogaon', nameBn: 'নওগাঁ', lat: 24.9132, lng: 88.7530 },
  { name: 'Narail', nameBn: 'নড়াইল', lat: 23.1725, lng: 89.5127 },
  { name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', lat: 23.6238, lng: 90.5000 },
  { name: 'Narsingdi', nameBn: 'নরসিংদী', lat: 23.9229, lng: 90.7171 },
  { name: 'Natore', nameBn: 'নাটোর', lat: 24.4206, lng: 89.0005 },
  { name: 'Netrokona', nameBn: 'নেত্রকোণা', lat: 24.8809, lng: 90.7279 },
  { name: 'Nilphamari', nameBn: 'নীলফামারী', lat: 25.9318, lng: 88.8463 },
  { name: 'Noakhali', nameBn: 'নোয়াখালী', lat: 22.8749, lng: 91.0973 },
  { name: 'Pabna', nameBn: 'পাবনা', lat: 24.0064, lng: 89.2372 },
  { name: 'Panchagarh', nameBn: 'পঞ্চগড়', lat: 26.3411, lng: 88.5542 },
  { name: 'Patuakhali', nameBn: 'পটুয়াখালী', lat: 22.3596, lng: 90.3298 },
  { name: 'Pirojpur', nameBn: 'পিরোজপুর', lat: 22.5841, lng: 89.9720 },
  { name: 'Rajbari', nameBn: 'রাজবাড়ী', lat: 23.7574, lng: 89.6444 },
  { name: 'Rajshahi', nameBn: 'রাজশাহী', lat: 24.3745, lng: 88.6042 },
  { name: 'Rangamati', nameBn: 'রাঙ্গামাটি', lat: 22.7324, lng: 92.2985 },
  { name: 'Rangpur', nameBn: 'রংপুর', lat: 25.7439, lng: 89.2752 },
  { name: 'Satkhira', nameBn: 'সাতক্ষীরা', lat: 22.7185, lng: 89.0705 },
  { name: 'Shariatpur', nameBn: 'শরীয়তপুর', lat: 23.2423, lng: 90.4348 },
  { name: 'Sherpur', nameBn: 'শেরপুর', lat: 25.0189, lng: 90.0175 },
  { name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', lat: 24.4534, lng: 89.7006 },
  { name: 'Sunamganj', nameBn: 'সুনামগঞ্জ', lat: 25.0658, lng: 91.3953 },
  { name: 'Sylhet', nameBn: 'সিলেট', lat: 24.9045, lng: 91.8699 },
  { name: 'Tangail', nameBn: 'টাঙ্গাইল', lat: 24.2513, lng: 89.9167 },
  { name: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', lat: 26.0337, lng: 88.4617 },
]

/** Great-circle distance in kilometres between two lat/lng points. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Closest district centroid to a coordinate (e.g. from browser geolocation). */
export function nearestDistrict(lat: number, lng: number): District {
  let best = BD_DISTRICTS[0]
  let bestKm = Infinity
  for (const d of BD_DISTRICTS) {
    const km = haversineKm(lat, lng, d.lat, d.lng)
    if (km < bestKm) { bestKm = km; best = d }
  }
  return best
}

/** Look up a district by its English name (case-insensitive). */
export function districtByName(name: string): District | undefined {
  return BD_DISTRICTS.find(d => d.name.toLowerCase() === name.trim().toLowerCase())
}
