# Bookora Architecture
## Tenancy
Central Supabase Postgres; every tenant table carries business_id. Isolation = RLS policies using is_business_member()/has_business_role() (security-definer helpers) + platform-admin bypass via user_roles. Public reads only for published businesses and availability-safe fields (services, staff display names, business hours/holidays). No staff_hours/breaks/leaves exposed publicly.
## Booking integrity (defence in depth)
1. Client engine (src/lib/booking/availability.ts) for display only. 2. Edge Function create-booking validates input. 3. DB create_booking() rechecks holiday, overlap and plan usage in a transaction. 4. EXCLUDE USING gist constraint on appointments(staff_id, tstzrange) for pending/confirmed — even racing transactions cannot double-book. 5. booking_holds with expires_at + expire_booking_holds() (scheduled Edge Function). 6. appointment_events / payment_events are immutable (UPDATE/DELETE revoked).
## Money
bigint minor units everywhere (price_minor, amount_minor). Never floats.
## Time
timestamptz stored in UTC; businesses carry timezone (default Asia/Dhaka) for display; appointments store timezone snapshot.
## Payments
Adapter interface in src/lib/payments. Webhook Edge Function verifies HMAC server-side, dedupes on webhook_deliveries(provider, provider_event_id) + payment_transactions unique(provider, provider_event_id). Frontend callbacks never set paid.
## Notifications
notification_jobs queue → send-notification Edge Function (Resend) with attempts/backoff + notification_logs.
## Auth & roles
Supabase Auth. Platform roles in user_roles (super_admin, support_admin); business roles in business_members (owner, manager, receptionist, staff); customers are profiles optionally linked to per-business customers rows. Customer/guest booking never requires membership.
## Frontend
React+Vite+TS strict, TanStack Query, RHF+Zod, Tailwind. Demo mode when VITE_SUPABASE_* absent: demo data + same booking-engine code path locally.
