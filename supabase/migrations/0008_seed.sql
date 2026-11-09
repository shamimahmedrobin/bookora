-- 0008: seed (development-safe, idempotent)
insert into public.subscription_plans(code,name,price_monthly_minor,price_yearly_minor,staff_limit,monthly_booking_limit,features) values
('free','Free',0,0,1,30,'{"booking_page":true}'::jsonb),
('starter','Starter',29900,299000,3,200,'{"booking_page":true,"coupons":true}'::jsonb),
('professional','Professional',69900,699000,10,1000,'{"booking_page":true,"coupons":true,"custom_branding":true,"reports":true}'::jsonb),
('business','Business',149900,1499000,30,10000,'{"booking_page":true,"coupons":true,"custom_branding":true,"reports":true,"custom_domain":true,"api":true}'::jsonb)
on conflict (code) do update set price_monthly_minor=excluded.price_monthly_minor, price_yearly_minor=excluded.price_yearly_minor, staff_limit=excluded.staff_limit, monthly_booking_limit=excluded.monthly_booking_limit;
insert into public.platform_settings(key,value) values
('platform_name','"Bookora"'::jsonb),('default_currency','"BDT"'::jsonb),('default_timezone','"Asia/Dhaka"'::jsonb),('commission','{"free":0,"starter":0,"professional":0,"business":0}'::jsonb)
on conflict (key) do nothing;
insert into public.notification_templates(business_id,template_key,channel,locale,subject,body) values
(null,'booking_confirmation','email','en','Booking confirmed — {ref}','Hi {name}, your booking {ref} at {business} is confirmed for {date} {time}.'),
(null,'booking_confirmation','email','bn','বুকিং নিশ্চিত — {ref}','হ্যালো {name}, {business}-এ আপনার বুকিং {ref} নিশ্চিত হয়েছে — {date} {time}।'),
(null,'booking_cancellation','email','en','Booking cancelled — {ref}','Hi {name}, your booking {ref} was cancelled.'),
(null,'booking_cancellation','email','bn','বুকিং বাতিল — {ref}','হ্যালো {name}, আপনার বুকিং {ref} বাতিল হয়েছে।'),
(null,'booking_reschedule','email','en','Booking rescheduled — {ref}','Hi {name}, your booking {ref} moved to {date} {time}.'),
(null,'booking_reschedule','email','bn','বুকিং পুনঃনির্ধারিত — {ref}','হ্যালো {name}, আপনার বুকিং {ref} এখন {date} {time}।'),
(null,'payment_confirmation','email','en','Payment received — {ref}','We received your payment for booking {ref}. Amount: {amount}.'),
(null,'payment_confirmation','email','bn','পেমেন্ট গৃহীত — {ref}','বুকিং {ref}-এর পেমেন্ট গৃহীত হয়েছে। পরিমাণ: {amount}।'),
(null,'appointment_reminder','email','en','Reminder: appointment tomorrow','Hi {name}, reminder: {service} tomorrow at {time} with {staff}.'),
(null,'appointment_reminder','email','bn','রিমাইন্ডার: আগামীকাল অ্যাপয়েন্টমেন্ট','হ্যালো {name}, রিমাইন্ডার: আগামীকাল {time}-এ {staff}-এর সাথে {service}।'),
(null,'subscription_expiry','email','en','Your Bookora plan renews soon','Hi, your plan renews on {date}. Manage it in Subscription settings.'),
(null,'subscription_expiry','email','bn','আপনার বুকোরা প্ল্যান শীঘ্রই নবায়ন হবে','হ্যালো, আপনার প্ল্যান {date}-এ নবায়ন হবে।')
on conflict do nothing;
-- Demo businesses are provided in the frontend demo layer (src/lib/demo/data.ts), not seeded into production tables,
-- to avoid fake tenants in a real deployment. For local Supabase dev, create a business via /register then set is_published=true.
