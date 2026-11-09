-- 0001: extensions, enums, helpers
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

do $$ begin create type public.platform_role as enum ('super_admin','support_admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.business_role as enum ('owner','manager','receptionist','staff'); exception when duplicate_object then null; end $$;
do $$ begin create type public.appointment_status as enum ('pending','confirmed','completed','cancelled','rejected','no_show'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('pending','processing','paid','failed','refunded','partially_refunded','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_provider as enum ('manual','bkash','nagad','sslcommerz','stripe'); exception when duplicate_object then null; end $$;
do $$ begin create type public.business_status as enum ('pending','active','suspended','closed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.subscription_status as enum ('trialing','active','past_due','cancelled','expired'); exception when duplicate_object then null; end $$;
do $$ begin create type public.notification_channel as enum ('email','sms','push','in_app'); exception when duplicate_object then null; end $$;
do $$ begin create type public.notification_status as enum ('queued','sending','sent','failed'); exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Helpers (security definer, stable) — defined fully in 0007 after tables exist; stubs here are replaced there.
-- is_platform_admin / is_business_member / has_business_role are created in 0007 once profiles/business_members exist.
