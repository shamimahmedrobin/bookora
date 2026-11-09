export interface Business { id:string; slug:string; name:string; nameBn:string; industry:string; description:string; city:string; address:string; phone:string; timezone:string; currency:string; rating:number; reviews:number; color:string; planId:string }
export interface Service { id:string; businessId:string; category:string; name:string; nameBn:string; durationMinutes:number; bufferMinutes:number; priceMinor:number }
export interface Staff { id:string; businessId:string; name:string; title:string; serviceIds:string[] }
export type ApptStatus='pending'|'confirmed'|'completed'|'cancelled'|'rejected'|'no_show'
export interface Appointment { id:string; businessId:string; ref:string; customerName:string; customerPhone:string; serviceId:string; staffId:string; date:string; time:string; status:ApptStatus; priceMinor:number; paymentStatus:string; paymentMethod:string }

export const businesses: Business[] = [
  { id:'biz-clinic', slug:'dhaka-care-clinic', name:'Dhaka Care Clinic', nameBn:'ঢাকা কেয়ার ক্লিনিক', industry:'Clinic', description:'Trusted family clinic in Dhanmondi with experienced doctors, same-day appointments and digital prescriptions.', city:'Dhaka', address:'House 12, Road 5, Dhanmondi, Dhaka 1205', phone:'+8801711000001', timezone:'Asia/Dhaka', currency:'BDT', rating:4.8, reviews:324, color:'#4f46e5', planId:'professional' },
  { id:'biz-salon', slug:'glow-studio-salon', name:'Glow Studio Salon', nameBn:'গ্লো স্টুডিও সেলুন', industry:'Salon & Beauty', description:'Premium salon & beauty parlour in Sylhet — hair, facial, bridal and spa by expert beauticians.', city:'Sylhet', address:'Zindabazar, Sylhet 3100', phone:'+8801711000002', timezone:'Asia/Dhaka', currency:'BDT', rating:4.9, reviews:512, color:'#db2777', planId:'starter' },
  { id:'biz-dental', slug:'smile-dental-chattogram', name:'Smile Dental Care', nameBn:'স্মাইল ডেন্টাল কেয়ার', industry:'Dentist', description:'Modern dental care in Chattogram — cleaning, root canal, braces and implants with gentle care.', city:'Chattogram', address:'GEC Circle, Chattogram 4000', phone:'+8801711000003', timezone:'Asia/Dhaka', currency:'BDT', rating:4.7, reviews:189, color:'#0891b2', planId:'professional' },
]
export const services: Service[] = [
  {id:'svc-1',businessId:'biz-clinic',category:'General',name:'General Consultation',nameBn:'সাধারণ পরামর্শ',durationMinutes:30,bufferMinutes:5,priceMinor:50000},
  {id:'svc-2',businessId:'biz-clinic',category:'General',name:'Follow-up Visit',nameBn:'ফলো-আপ ভিজিট',durationMinutes:20,bufferMinutes:5,priceMinor:30000},
  {id:'svc-3',businessId:'biz-clinic',category:'Pediatrics',name:'Child Consultation',nameBn:'শিশু পরামর্শ',durationMinutes:30,bufferMinutes:10,priceMinor:60000},
  {id:'svc-4',businessId:'biz-salon',category:'Hair',name:'Hair Cut & Styling',nameBn:'হেয়ার কাট ও স্টাইলিং',durationMinutes:45,bufferMinutes:10,priceMinor:80000},
  {id:'svc-5',businessId:'biz-salon',category:'Facial',name:'Signature Facial',nameBn:'সিগনেচার ফেসিয়াল',durationMinutes:60,bufferMinutes:10,priceMinor:150000},
  {id:'svc-6',businessId:'biz-salon',category:'Bridal',name:'Bridal Makeup Trial',nameBn:'ব্রাইডাল মেকআপ ট্রায়াল',durationMinutes:90,bufferMinutes:15,priceMinor:300000},
  {id:'svc-7',businessId:'biz-dental',category:'Dental',name:'Dental Cleaning',nameBn:'ডেন্টাল ক্লিনিং',durationMinutes:45,bufferMinutes:10,priceMinor:120000},
  {id:'svc-8',businessId:'biz-dental',category:'Dental',name:'Root Canal Consultation',nameBn:'রুট ক্যানেল পরামর্শ',durationMinutes:30,bufferMinutes:5,priceMinor:80000},
]
export const staffMembers: Staff[] = [
  {id:'staff-1',businessId:'biz-clinic',name:'Dr. Farhana Rahman',title:'MBBS, Family Medicine',serviceIds:['svc-1','svc-2','svc-3']},
  {id:'staff-2',businessId:'biz-clinic',name:'Dr. Tanvir Hasan',title:'MBBS, Pediatrics',serviceIds:['svc-1','svc-3']},
  {id:'staff-3',businessId:'biz-salon',name:'Sharmin Akter',title:'Senior Hair Stylist',serviceIds:['svc-4','svc-6']},
  {id:'staff-4',businessId:'biz-salon',name:'Nusrat Jahan',title:'Beauty Expert',serviceIds:['svc-5','svc-6']},
  {id:'staff-5',businessId:'biz-dental',name:'Dr. Arif Chowdhury',title:'BDS, Dental Surgeon',serviceIds:['svc-7','svc-8']},
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
export function serviceName(id:string){ return services.find(s=>s.id===id)?.name ?? id }
export function staffName(id:string){ return staffMembers.find(s=>s.id===id)?.name ?? 'Auto-assign' }
export const demoCustomers = initialAppointments.map((a,i)=>({id:`c${i+1}`,name:a.customerName,phone:a.customerPhone,email:`customer${i+1}@example.com`,visits:i+1,totalSpentMinor:a.priceMinor,lastVisit:a.date}))
