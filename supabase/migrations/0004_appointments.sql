-- 0004: appointments, holds, waitlist + booking functions
create table public.appointments (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, customer_id uuid references public.customers(id) on delete set null, staff_id uuid references public.staff_profiles(id) on delete set null, booking_reference text not null unique, status public.appointment_status not null default 'pending', start_at timestamptz not null, end_at timestamptz not null, timezone text not null default 'Asia/Dhaka', customer_name text not null, customer_phone text, customer_email text, notes text, total_minor bigint not null default 0, currency text not null default 'BDT', source text not null default 'online', created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, check (end_at > start_at),
  -- No-overlap for active bookings per staff (requires btree_gist). Cancelled/completed/no_show do not block.
  exclude using gist (staff_id with =, tstzrange(start_at, end_at) with &&) where (status in ('pending','confirmed') and staff_id is not null and deleted_at is null));
create index appointments_biz_idx on public.appointments(business_id); create index appointments_staff_start_idx on public.appointments(staff_id, start_at); create index appointments_biz_status_idx on public.appointments(business_id, status); create index appointments_biz_start_idx on public.appointments(business_id, start_at);
create table public.appointment_items (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, appointment_id uuid not null references public.appointments(id) on delete cascade, service_id uuid references public.services(id) on delete set null, service_name text not null, duration_minutes int not null, price_minor bigint not null default 0, created_at timestamptz not null default now());
create index appointment_items_appt_idx on public.appointment_items(appointment_id);
create table public.appointment_events (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, appointment_id uuid not null references public.appointments(id) on delete cascade, event_type text not null, actor_user_id uuid references public.profiles(id), payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create index appointment_events_appt_idx on public.appointment_events(appointment_id, created_at);
create table public.appointment_notes (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, appointment_id uuid not null references public.appointments(id) on delete cascade, author_user_id uuid references public.profiles(id), note text not null, is_internal boolean not null default true, created_at timestamptz not null default now());
create table public.booking_holds (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, staff_id uuid references public.staff_profiles(id) on delete cascade, service_id uuid references public.services(id), start_at timestamptz not null, end_at timestamptz not null, expires_at timestamptz not null, converted_appointment_id uuid references public.appointments(id), created_at timestamptz not null default now(), check (end_at > start_at));
create index booking_holds_expiry_idx on public.booking_holds(expires_at); create index booking_holds_staff_idx on public.booking_holds(staff_id, start_at);
create table public.waitlist (id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, customer_name text not null, customer_phone text, service_id uuid references public.services(id), staff_id uuid references public.staff_profiles(id), desired_date date, created_at timestamptz not null default now());
create trigger appointments_updated before update on public.appointments for each row execute function public.set_updated_at();

create or replace function public.expire_booking_holds() returns int language plpgsql as $$
declare n int; begin delete from public.booking_holds where expires_at < now() and converted_appointment_id is null; get diagnostics n = row_count; return n; end $$;
-- Run via pg_cron / Edge Function expire-holds scheduled invocation.

-- get_available_slots: documented logic stub. Full slot generation mirrors src/lib/booking/availability.ts:
-- 1) resolve business_hours/staff_hours for weekday, reject holidays & leaves; 2) step by slot_interval;
-- 3) skip breaks; 4) skip ranges overlapping appointments (pending/confirmed) or unexpired holds (incl buffer).
-- Implemented in Edge Function create-booking + client engine for display; final safety is the EXCLUDE constraint.
create or replace function public.get_available_slots(p_business uuid, p_staff uuid, p_service uuid, p_date date)
returns table(start_at timestamptz, end_at timestamptz) language sql stable as $$
  select a.start_at, a.end_at from public.appointments a where false
$$;

-- create_booking: transactional, rechecks plan usage + overlap; EXCLUDE constraint is the final guard.
create or replace function public.create_booking(p_business uuid, p_staff uuid, p_service uuid, p_start timestamptz, p_end timestamptz, p_customer_name text, p_customer_phone text, p_customer_email text, p_total_minor bigint default 0)
returns public.appointments language plpgsql as $$
declare v_plan record; v_used int; v_appt public.appointments; v_ref text;
begin
  perform public.expire_booking_holds();
  select sp.staff_limit, sp.monthly_booking_limit, s.id as sub_id into v_plan from public.subscriptions s join public.subscription_plans sp on sp.id = s.plan_id where s.business_id = p_business and s.status in ('trialing','active','past_due') order by s.created_at desc limit 1;
  if found then
    select count(*) into v_used from public.appointments where business_id = p_business and date_trunc('month', created_at) = date_trunc('month', now()) and status <> 'cancelled';
    if v_used >= v_plan.monthly_booking_limit then raise exception 'PLAN_LIMIT_EXCEEDED: monthly booking limit reached'; end if;
  end if;
  if exists (select 1 from public.appointments where staff_id = p_staff and status in ('pending','confirmed') and deleted_at is null and tstzrange(start_at,end_at) && tstzrange(p_start,p_end)) then
    raise exception 'SLOT_UNAVAILABLE: staff already booked for this time';
  end if;
  if exists (select 1 from public.business_holidays where business_id = p_business and holiday_date = (p_start at time zone 'Asia/Dhaka')::date) then
    raise exception 'BUSINESS_HOLIDAY';
  end if;
  v_ref := 'BKR-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  insert into public.appointments(business_id, staff_id, booking_reference, status, start_at, end_at, customer_name, customer_phone, customer_email, total_minor)
  values (p_business, p_staff, v_ref, 'pending', p_start, p_end, p_customer_name, p_customer_phone, p_customer_email, coalesce(p_total_minor,0)) returning * into v_appt;
  insert into public.appointment_items(business_id, appointment_id, service_id, service_name, duration_minutes, price_minor)
  select p_business, v_appt.id, s.id, s.name, s.duration_minutes, s.price_minor from public.services s where s.id = p_service;
  insert into public.appointment_events(business_id, appointment_id, event_type, payload) values (p_business, v_appt.id, 'created', jsonb_build_object('source','create_booking'));
  insert into public.usage_records(business_id, metric, quantity) values (p_business, 'booking_created', 1) on conflict do nothing;
  return v_appt;
exception when exclusion_violation then raise exception 'SLOT_UNAVAILABLE: staff already booked for this time';
end $$;
