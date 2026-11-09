export interface Business { id:string; slug:string; name:string; nameBn:string; industry:string; description:string; city:string; district:string; address:string; phone:string; timezone:string; currency:string; rating:number; reviews:number; color:string; planId:string }
export interface Service { id:string; businessId:string; category:string; name:string; nameBn:string; durationMinutes:number; bufferMinutes:number; priceMinor:number }
export interface Staff { id:string; businessId:string; name:string; title:string; serviceIds:string[]; specialty?:string; specialtyBn?:string; experienceYears?:number; rating?:number; reviews?:number }
export type ApptStatus='pending'|'confirmed'|'completed'|'cancelled'|'rejected'|'no_show'
export interface Appointment { id:string; businessId:string; ref:string; customerName:string; customerPhone:string; serviceId:string; staffId:string; date:string; time:string; status:ApptStatus; priceMinor:number; paymentStatus:string; paymentMethod:string }

export const businesses: Business[] = [
  { id:'biz-clinic', slug:'dhaka-care-clinic', name:'Dhaka Care Clinic', nameBn:'ঢাকা কেয়ার ক্লিনিক', industry:'Clinic', description:'Trusted family clinic in Dhanmondi with experienced doctors, same-day appointments and digital prescriptions.', city:'Dhaka', district:'Dhaka', address:'House 12, Road 5, Dhanmondi, Dhaka 1205', phone:'+8801711000001', timezone:'Asia/Dhaka', currency:'BDT', rating:4.8, reviews:324, color:'#4f46e5', planId:'professional' },
  { id:'biz-dental', slug:'smile-dental-chattogram', name:'Smile Dental Care', nameBn:'স্মাইল ডেন্টাল কেয়ার', industry:'Dentist', description:'Modern dental care in Chattogram — cleaning, root canal, braces and implants with gentle care.', city:'Chattogram', district:'Chattogram', address:'GEC Circle, Chattogram 4000', phone:'+8801711000003', timezone:'Asia/Dhaka', currency:'BDT', rating:4.7, reviews:189, color:'#0891b2', planId:'professional' },
  { id:'biz-khulna', slug:'khulna-health-care', name:'Khulna Health Care', nameBn:'খুলনা হেলথ কেয়ার', industry:'Clinic', description:'Multi-specialty clinic in Khulna with experienced gynecology and medicine doctors.', city:'Khulna', district:'Khulna', address:'KDA Avenue, Khulna 9100', phone:'+8801711000004', timezone:'Asia/Dhaka', currency:'BDT', rating:4.7, reviews:208, color:'#059669', planId:'starter' },
  { id:'biz-rajshahi', slug:'rajshahi-medical-point', name:'Rajshahi Medical Point', nameBn:'রাজশাহী মেডিকেল পয়েন্ট', industry:'Clinic', description:'Specialist medical point in Rajshahi — cardiology consultation, ECG and heart checkups.', city:'Rajshahi', district:'Rajshahi', address:'Laxmipur, Rajshahi 6000', phone:'+8801711000005', timezone:'Asia/Dhaka', currency:'BDT', rating:4.6, reviews:156, color:'#7c3aed', planId:'professional' },
  { id:'biz-rangpur', slug:'rangpur-care-clinic', name:'Rangpur Care Clinic', nameBn:'রংপুর কেয়ার ক্লিনিক', industry:'Clinic', description:'Friendly care clinic in Rangpur specialising in child health and vaccination.', city:'Rangpur', district:'Rangpur', address:'Jahaj Company Mor, Rangpur 5400', phone:'+8801711000006', timezone:'Asia/Dhaka', currency:'BDT', rating:4.8, reviews:174, color:'#2563eb', planId:'starter' },
  { id:'biz-barishal', slug:'barishal-family-clinic', name:'Barishal Family Clinic', nameBn:'বরিশাল ফ্যামিলি ক্লিনিক', industry:'Clinic', description:'Family medicine clinic in Barishal for everyday care, follow-ups and health advice.', city:'Barishal', district:'Barishal', address:'Sadar Road, Barishal 8200', phone:'+8801711000007', timezone:'Asia/Dhaka', currency:'BDT', rating:4.5, reviews:121, color:'#0d9488', planId:'starter' },
  { id:'biz-mymensingh', slug:'mymensingh-health-clinic', name:'Mymensingh Health Clinic', nameBn:'ময়মনসিংহ হেলথ ক্লিনিক', industry:'Clinic', description:'Health clinic in Mymensingh with dedicated skin and dermatology care.', city:'Mymensingh', district:'Mymensingh', address:'Charpara, Mymensingh 2200', phone:'+8801711000008', timezone:'Asia/Dhaka', currency:'BDT', rating:4.7, reviews:143, color:'#9333ea', planId:'starter' },
  { id:'biz-cumilla', slug:'cumilla-medical-care', name:'Cumilla Medical Care', nameBn:'কুমিল্লা মেডিকেল কেয়ার', industry:'Clinic', description:'Medical care centre in Cumilla for general medicine, diabetes and follow-up visits.', city:'Cumilla', district:'Cumilla', address:'Kandirpar, Cumilla 3500', phone:'+8801711000009', timezone:'Asia/Dhaka', currency:'BDT', rating:4.6, reviews:98, color:'#0284c7', planId:'starter' },
  { id:'biz-sylhet', slug:'sylhet-health-care', name:'Sylhet Health Care', nameBn:'সিলেট হেলথ কেয়ার', industry:'Clinic', description:'Trusted multi-specialty clinic in Sylhet — medicine, gynecology and orthopedics with same-day serial booking.', city:'Sylhet', district:'Sylhet', address:'Ambarkhana, Sylhet 3100', phone:'+8801711000010', timezone:'Asia/Dhaka', currency:'BDT', rating:4.8, reviews:264, color:'#ea580c', planId:'professional' },
]
export const services: Service[] = [
  {id:'svc-1',businessId:'biz-clinic',category:'General',name:'General Consultation',nameBn:'সাধারণ পরামর্শ',durationMinutes:30,bufferMinutes:5,priceMinor:50000},
  {id:'svc-2',businessId:'biz-clinic',category:'General',name:'Follow-up Visit',nameBn:'ফলো-আপ ভিজিট',durationMinutes:20,bufferMinutes:5,priceMinor:30000},
  {id:'svc-3',businessId:'biz-clinic',category:'Pediatrics',name:'Child Consultation',nameBn:'শিশু পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:60000},
  {id:'svc-7',businessId:'biz-dental',category:'Dental',name:'Dental Cleaning',nameBn:'ডেন্টাল ক্লিনিং',durationMinutes:45,bufferMinutes:10,priceMinor:120000},
  {id:'svc-8',businessId:'biz-dental',category:'Dental',name:'Root Canal Consultation',nameBn:'রুট ক্যানেল পরামর্শ',durationMinutes:30,bufferMinutes:5,priceMinor:80000},
  {id:'svc-9',businessId:'biz-khulna',category:'Gynecology',name:'Gynecology Consultation',nameBn:'গাইনী পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:80000},
  {id:'svc-10',businessId:'biz-khulna',category:'Medicine',name:'General Medicine Consultation',nameBn:'সাধারণ মেডিসিন পরামর্শ',durationMinutes:20,bufferMinutes:5,priceMinor:50000},
  {id:'svc-11',businessId:'biz-rajshahi',category:'Cardiology',name:'Cardiology Consultation',nameBn:'কার্ডিওলজি পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:100000},
  {id:'svc-12',businessId:'biz-rajshahi',category:'Cardiology',name:'ECG & Heart Checkup',nameBn:'ইসিজি ও হার্ট চেকআপ',durationMinutes:20,bufferMinutes:5,priceMinor:70000},
  {id:'svc-13',businessId:'biz-rangpur',category:'Pediatrics',name:'Child Consultation',nameBn:'শিশু পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:60000},
  {id:'svc-14',businessId:'biz-rangpur',category:'Pediatrics',name:'Vaccination Visit',nameBn:'টিকা ভিজিট',durationMinutes:15,bufferMinutes:5,priceMinor:30000},
  {id:'svc-15',businessId:'biz-barishal',category:'General',name:'Family Medicine Consultation',nameBn:'পরিবার চিকিৎসা পরামর্শ',durationMinutes:30,bufferMinutes:5,priceMinor:50000},
  {id:'svc-16',businessId:'biz-barishal',category:'General',name:'Follow-up Visit',nameBn:'ফলো-আপ ভিজিট',durationMinutes:20,bufferMinutes:5,priceMinor:30000},
  {id:'svc-17',businessId:'biz-mymensingh',category:'Dermatology',name:'Dermatology Consultation',nameBn:'চর্মরোগ পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:70000},
  {id:'svc-18',businessId:'biz-mymensingh',category:'Dermatology',name:'Skin Treatment Session',nameBn:'ত্বকের চিকিৎসা সেশন',durationMinutes:45,bufferMinutes:10,priceMinor:120000},
  {id:'svc-19',businessId:'biz-cumilla',category:'Medicine',name:'General Medicine Consultation',nameBn:'সাধারণ মেডিসিন পরামর্শ',durationMinutes:20,bufferMinutes:5,priceMinor:50000},
  {id:'svc-20',businessId:'biz-cumilla',category:'Medicine',name:'Diabetes & Medicine Follow-up',nameBn:'ডায়াবেটিস ও মেডিসিন ফলো-আপ',durationMinutes:30,bufferMinutes:5,priceMinor:60000},
  {id:'svc-21',businessId:'biz-sylhet',category:'Medicine',name:'Medicine Consultation',nameBn:'মেডিসিন পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:70000},
  {id:'svc-22',businessId:'biz-sylhet',category:'Gynecology',name:'Gynecology Consultation',nameBn:'গাইনী পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:80000},
  {id:'svc-23',businessId:'biz-sylhet',category:'Orthopedics',name:'Orthopedic Consultation',nameBn:'অর্থোপেডিক পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:90000},
]
export const staffMembers: Staff[] = [
  {id:'staff-1',businessId:'biz-clinic',name:'Dr. Farhana Rahman',title:'MBBS, Family Medicine',serviceIds:['svc-1','svc-2','svc-3'],specialty:'Family Medicine',specialtyBn:'পরিবার চিকিৎসা',experienceYears:10,rating:4.9,reviews:486},
  {id:'staff-2',businessId:'biz-clinic',name:'Dr. Tanvir Hasan',title:'MBBS, Pediatrics',serviceIds:['svc-1','svc-3'],specialty:'Pediatrics',specialtyBn:'শিশু',experienceYears:6,rating:4.7,reviews:203},
  {id:'staff-5',businessId:'biz-dental',name:'Dr. Arif Chowdhury',title:'BDS, Dental Surgeon',serviceIds:['svc-7','svc-8'],specialty:'Dentistry',specialtyBn:'দন্ত চিকিৎসা',experienceYears:9,rating:4.8,reviews:178},
  {id:'staff-6',businessId:'biz-khulna',name:'Dr. Sharmin Sultana',title:'MBBS, FCPS (Gynecology & Obstetrics)',serviceIds:['svc-9'],specialty:'Gynecology & Obstetrics',specialtyBn:'গাইনী ও প্রসূতি',experienceYears:12,rating:4.9,reviews:412},
  {id:'staff-7',businessId:'biz-khulna',name:'Dr. Mahmudul Karim',title:'MBBS, Medicine',serviceIds:['svc-10'],specialty:'Medicine',specialtyBn:'মেডিসিন',experienceYears:9,rating:4.7,reviews:268},
  {id:'staff-8',businessId:'biz-rajshahi',name:'Dr. Rashedul Islam',title:'MBBS, MD (Cardiology)',serviceIds:['svc-11','svc-12'],specialty:'Cardiology',specialtyBn:'কার্ডিওলজি',experienceYears:14,rating:4.8,reviews:356},
  {id:'staff-9',businessId:'biz-rangpur',name:'Dr. Nilufa Yasmin',title:'MBBS, DCH (Pediatrics)',serviceIds:['svc-13','svc-14'],specialty:'Pediatrics',specialtyBn:'শিশু',experienceYears:8,rating:4.8,reviews:231},
  {id:'staff-10',businessId:'biz-barishal',name:'Dr. Kamrul Hasan',title:'MBBS, Family Medicine',serviceIds:['svc-15','svc-16'],specialty:'Family Medicine',specialtyBn:'পরিবার চিকিৎসা',experienceYears:10,rating:4.6,reviews:187},
  {id:'staff-11',businessId:'biz-mymensingh',name:'Dr. Taslima Khatun',title:'MBBS, DDV (Skin & Dermatology)',serviceIds:['svc-17','svc-18'],specialty:'Skin & Dermatology',specialtyBn:'চর্মরোগ',experienceYears:11,rating:4.7,reviews:294},
  {id:'staff-12',businessId:'biz-cumilla',name:'Dr. Shakil Ahmed',title:'MBBS, Medicine',serviceIds:['svc-19','svc-20'],specialty:'Medicine',specialtyBn:'মেডিসিন',experienceYears:7,rating:4.6,reviews:159},
  {id:'staff-13',businessId:'biz-sylhet',name:'Dr. Faruk Ahmed',title:'MBBS, FCPS (Medicine)',serviceIds:['svc-21'],specialty:'Medicine',specialtyBn:'মেডিসিন',experienceYears:14,rating:4.8,reviews:356},
  {id:'staff-14',businessId:'biz-sylhet',name:'Dr. Shirin Akter',title:'MBBS, FCPS (Gynecology & Obstetrics)',serviceIds:['svc-22'],specialty:'Gynecology & Obstetrics',specialtyBn:'গাইনী ও প্রসূতি',experienceYears:9,rating:4.7,reviews:289},
  {id:'staff-15',businessId:'biz-sylhet',name:'Dr. Imran Chowdhury',title:'MBBS, MS (Orthopedics)',serviceIds:['svc-23'],specialty:'Orthopedics',specialtyBn:'অর্থোপেডিক্স',experienceYears:11,rating:4.9,reviews:402},
]
export const defaultBusinessHours = [0,1,2,3,4,5,6].map(d=>({dayOfWeek:d, open:'09:00', close:'20:00', isClosed:d===5})) // Friday closed demo for clinic pattern varies; booking page uses 09-20 all days except Fri closed note
export const businessHoursForBooking = [0,1,2,3,4,5,6].map(d=>({dayOfWeek:d, open:'09:00', close:'20:00', isClosed:false}))
export const demoBreaks = [{start:'13:00',end:'14:00'}]
export const demoHolidays = [{date:'2026-12-16',name:'Victory Day'},{date:'2026-12-25',name:'Christmas Day'}]

const today = new Date(); const iso=(d:Date)=>d.toISOString().slice(0,10); const add=(n:number)=>{const d=new Date(today); d.setDate(d.getDate()+n); return iso(d)}
export const initialAppointments: Appointment[] = [
  {id:'a1',businessId:'biz-clinic',ref:'BKR-DEMO01',customerName:'Rahim Uddin',customerPhone:'+8801712000001',serviceId:'svc-1',staffId:'staff-1',date:add(0),time:'10:00 AM',status:'confirmed',priceMinor:50000,paymentStatus:'pending',paymentMethod:'manual'},
  {id:'a2',businessId:'biz-clinic',ref:'BKR-DEMO02',customerName:'Fatema Begum',customerPhone:'+8801712000002',serviceId:'svc-3',staffId:'staff-2',date:add(0),time:'11:30 AM',status:'pending',priceMinor:60000,paymentStatus:'pending',paymentMethod:'bkash'},
  {id:'a3',businessId:'biz-clinic',ref:'BKR-DEMO03',customerName:'Karim Islam',customerPhone:'+8801712000003',serviceId:'svc-2',staffId:'staff-1',date:add(1),time:'09:30 AM',status:'confirmed',priceMinor:30000,paymentStatus:'paid',paymentMethod:'manual'},
  {id:'a4',businessId:'biz-clinic',ref:'BKR-DEMO04',customerName:'Ayesha Siddiqua',customerPhone:'+8801712000004',serviceId:'svc-1',staffId:'staff-1',date:add(-2),time:'10:00 AM',status:'completed',priceMinor:50000,paymentStatus:'paid',paymentMethod:'sslcommerz'},
  {id:'a5',businessId:'biz-clinic',ref:'BKR-DEMO05',customerName:'Imran Hossain',customerPhone:'+8801712000005',serviceId:'svc-1',staffId:'staff-2',date:add(-1),time:'12:00 PM',status:'cancelled',priceMinor:50000,paymentStatus:'refunded',paymentMethod:'bkash'},
]
export function businessById(id:string){ return businesses.find(b=>b.id===id) }
/** A staff member counts as a doctor when their business is a clinic or a dentist. Only clinic and dentist staff are listed as doctors. */
export function isDoctor(staff:Staff, business?:Business){ const biz = business ?? businessById(staff.businessId); return !!biz && (biz.industry==='Clinic' || biz.industry==='Dentist') }
export interface DoctorEntry { staff:Staff; business:Business }
/** All doctors on the platform, each paired with the clinic/dental practice they belong to. */
export const doctors: DoctorEntry[] = staffMembers.flatMap(s=>{ const business=businessById(s.businessId); return business && isDoctor(s,business) ? [{staff:s,business}] : [] })
/** Consultation fee shown for a doctor: the cheapest service they offer. */
export function doctorFeeMinor(staff:Staff){ const prices=services.filter(s=>staff.serviceIds.includes(s.id)).map(s=>s.priceMinor); return prices.length?Math.min(...prices):0 }
export function serviceName(id:string){ return services.find(s=>s.id===id)?.name ?? id }
export function staffName(id:string){ return staffMembers.find(s=>s.id===id)?.name ?? 'Auto-assign' }
export const demoCustomers = initialAppointments.map((a,i)=>({id:`c${i+1}`,name:a.customerName,phone:a.customerPhone,email:`customer${i+1}@example.com`,visits:i+1,totalSpentMinor:a.priceMinor,lastVisit:a.date}))
