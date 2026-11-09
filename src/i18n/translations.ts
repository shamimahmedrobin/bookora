export type Locale = 'en' | 'bn'
export const translations = {
  en: {
    'nav.features':'Features','nav.industries':'Industries','nav.doctors':'Find a Doctor','nav.clinics':'Clinics','nav.pricing':'Pricing','nav.about':'About','nav.contact':'Contact','nav.login':'Log in','nav.register':'Get Started','nav.dashboard':'Dashboard','nav.myBookings':'My Bookings',
    'hero.title':'Find a doctor. Book in minutes.','hero.subtitle':'Search doctors by name, specialty or district anywhere in Bangladesh. Compare fees and ratings, then book your appointment online — in Bangla & English.','hero.cta':'Start Free','hero.demo':'View Live Demo',
    'common.bookNow':'Book Now','common.book':'Book Appointment','common.services':'Services','common.staff':'Staff','common.selectService':'Select a service','common.selectStaff':'Select staff','common.anyStaff':'Any available (auto-assign)','common.selectDate':'Select date','common.availableSlots':'Available slots','common.noSlots':'No slots available on this date','common.customerDetails':'Your details','common.name':'Full name','common.phone':'Phone','common.email':'Email','common.coupon':'Coupon code','common.apply':'Apply','common.payment':'Payment method','common.confirm':'Confirm Booking','common.total':'Total','common.search':'Search','common.save':'Save','common.cancel':'Cancel','common.loading':'Loading…',
    'pricing.title':'Simple pricing in BDT','pricing.monthly':'Monthly','pricing.yearly':'Yearly',
    'dashboard.overview':'Overview','dashboard.appointments':'Appointments','dashboard.calendar':'Calendar','dashboard.customers':'Customers','dashboard.payments':'Payments','dashboard.reports':'Reports','dashboard.settings':'Settings','dashboard.subscription':'Subscription',
    'booking.confirmed':'Booking confirmed!','booking.reference':'Booking reference',
    'footer.tagline':'Multi-tenant appointment booking SaaS for Bangladesh & international markets.',
  },
  bn: {
    'nav.features':'ফিচারসমূহ','nav.industries':'ইন্ডাস্ট্রি','nav.doctors':'ডাক্তার খুঁজুন','nav.clinics':'ক্লিনিক','nav.pricing':'মূল্য','nav.about':'আমাদের সম্পর্কে','nav.contact':'যোগাযোগ','nav.login':'লগ ইন','nav.register':'শুরু করুন','nav.dashboard':'ড্যাশবোর্ড','nav.myBookings':'আমার বুকিং',
    'hero.title':'ডাক্তার খুঁজুন। মিনিটেই বুক করুন।','hero.subtitle':'সারা বাংলাদেশে নাম, স্পেশালিটি বা জেলা দিয়ে ডাক্তার খুঁজুন। ফি ও রেটিং তুলনা করে অনলাইনেই অ্যাপয়েন্টমেন্ট বুক করুন — বাংলা ও ইংরেজিতে।','hero.cta':'ফ্রি শুরু করুন','hero.demo':'লাইভ ডেমো দেখুন',
    'common.bookNow':'এখনই বুক করুন','common.book':'অ্যাপয়েন্টমেন্ট বুক করুন','common.services':'সেবাসমূহ','common.staff':'স্টাফ','common.selectService':'একটি সেবা বেছে নিন','common.selectStaff':'স্টাফ বেছে নিন','common.anyStaff':'যেকোনো উপলব্ধ (অটো-অ্যাসাইন)','common.selectDate':'তারিখ বেছে নিন','common.availableSlots':'উপলব্ধ স্লট','common.noSlots':'এই তারিখে কোনো স্লট নেই','common.customerDetails':'আপনার তথ্য','common.name':'পুরো নাম','common.phone':'ফোন','common.email':'ইমেইল','common.coupon':'কুপন কোড','common.apply':'প্রয়োগ করুন','common.payment':'পেমেন্ট পদ্ধতি','common.confirm':'বুকিং নিশ্চিত করুন','common.total':'মোট','common.search':'খুঁজুন','common.save':'সংরক্ষণ করুন','common.cancel':'বাতিল','common.loading':'লোড হচ্ছে…',
    'pricing.title':'BDT-তে সহজ মূল্য','pricing.monthly':'মাসিক','pricing.yearly':'বার্ষিক',
    'dashboard.overview':'ওভারভিউ','dashboard.appointments':'অ্যাপয়েন্টমেন্ট','dashboard.calendar':'ক্যালেন্ডার','dashboard.customers':'কাস্টমার','dashboard.payments':'পেমেন্ট','dashboard.reports':'রিপোর্ট','dashboard.settings':'সেটিংস','dashboard.subscription':'সাবস্ক্রিপশন',
    'booking.confirmed':'বুকিং নিশ্চিত হয়েছে!','booking.reference':'বুকিং রেফারেন্স',
    'footer.tagline':'বাংলাদেশ ও আন্তর্জাতিক বাজারের জন্য মাল্টি-টেন্যান্ট অ্যাপয়েন্টমেন্ট বুকিং SaaS।',
  }
} as const
export type TranslationKey = keyof typeof translations.en
