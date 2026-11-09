-- 0007: helpers + RLS on ALL tables (tenant isolation)
create or replace function public.is_platform_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id = auth.uid() and role in ('super_admin','support_admin')) $$;
create or replace function public.is_business_member(p_business uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.business_members where business_id = p_business and user_id = auth.uid() and is_active = true) or public.is_platform_admin() $$;
create or replace function public.has_business_role(p_business uuid, variadic p_roles public.business_role[]) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.business_members where business_id = p_business and user_id = auth.uid() and is_active = true and role = any(p_roles)) or public.is_platform_admin() $$;

-- Enable RLS everywhere
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.business_invitations enable row level security;
alter table public.business_settings enable row level security;
alter table public.business_domains enable row level security;
alter table public.business_hours enable row level security;
alter table public.business_holidays enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.staff_services enable row level security;
alter table public.staff_hours enable row level security;
alter table public.staff_breaks enable row level security;
alter table public.staff_leaves enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_items enable row level security;
alter table public.appointment_events enable row level security;
alter table public.appointment_notes enable row level security;
alter table public.booking_holds enable row level security;
alter table public.waitlist enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.payment_events enable row level security;
alter table public.refunds enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_invoices enable row level security;
alter table public.usage_records enable row level security;
alter table public.notification_templates enable row level security;
alter table public.notification_logs enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.audit_logs enable row level security;
alter table public.platform_settings enable row level security;
alter table public.api_keys enable row level security;
alter table public.webhook_endpoints enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.custom_pages enable row level security;

-- Profiles: own row or platform admin
create policy profiles_own on public.profiles for all using (id = auth.uid() or public.is_platform_admin()) with check (id = auth.uid() or public.is_platform_admin());
create policy user_roles_admin on public.user_roles for all using (public.is_platform_admin()) with check (public.is_platform_admin());
-- Businesses: public can read published+active profile-safe rows; members manage own
create policy businesses_public_read on public.businesses for select using (is_published = true and status = 'active');
create policy businesses_member_all on public.businesses for all using (public.is_business_member(id)) with check (public.is_business_member(id));
create policy businesses_admin on public.businesses for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Generic tenant pattern, repeated explicitly per table (no dynamic SQL in migrations for auditability):
create policy bm_member on public.business_members for all using (public.is_business_member(business_id)) with check (public.has_business_role(business_id,'owner','manager'));
create policy bi_member on public.business_invitations for all using (public.is_business_member(business_id)) with check (public.has_business_role(business_id,'owner','manager'));
create policy bs_member on public.business_settings for all using (public.is_business_member(business_id)) with check (public.has_business_role(business_id,'owner','manager'));
create policy bd_member on public.business_domains for all using (public.is_business_member(business_id)) with check (public.has_business_role(business_id,'owner'));
create policy bh_public on public.business_hours for select using (exists(select 1 from public.businesses b where b.id=business_id and b.is_published and b.status='active'));
create policy bh_member on public.business_hours for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy bhol_public on public.business_holidays for select using (exists(select 1 from public.businesses b where b.id=business_id and b.is_published and b.status='active'));
create policy bhol_member on public.business_holidays for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy sc_public on public.service_categories for select using (exists(select 1 from public.businesses b where b.id=business_id and b.is_published and b.status='active'));
create policy sc_member on public.service_categories for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy svc_public on public.services for select using (is_active and exists(select 1 from public.businesses b where b.id=business_id and b.is_published and b.status='active'));
create policy svc_member on public.services for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy sp_public on public.staff_profiles for select using (is_active and exists(select 1 from public.businesses b where b.id=business_id and b.is_published and b.status='active'));
create policy sp_member on public.staff_profiles for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy ss_public on public.staff_services for select using (exists(select 1 from public.businesses b where b.id=business_id and b.is_published and b.status='active'));
create policy ss_member on public.staff_services for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy sh_member on public.staff_hours for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy sb_member on public.staff_breaks for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy sl_member on public.staff_leaves for all using (public.is_business_member(business_id)) with check (public.has_business_role(business_id,'owner','manager','receptionist'));
create policy cust_member on public.customers for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy cust_own on public.customers for select using (user_id = auth.uid());
create policy appt_member on public.appointments for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy appt_customer_read on public.appointments for select using (customer_email = (select email from public.profiles where id = auth.uid()));
create policy appt_items_member on public.appointment_items for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy appt_events_member on public.appointment_events for select using (public.is_business_member(business_id));
create policy appt_events_insert on public.appointment_events for insert with check (public.is_business_member(business_id));
create policy appt_notes_member on public.appointment_notes for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy holds_member on public.booking_holds for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy waitlist_member on public.waitlist for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy pay_member on public.payment_transactions for all using (public.has_business_role(business_id,'owner','manager')) with check (public.has_business_role(business_id,'owner','manager'));
create policy pay_events_member on public.payment_events for select using (business_id is null or public.has_business_role(business_id,'owner','manager'));
create policy refunds_member on public.refunds for all using (public.has_business_role(business_id,'owner','manager')) with check (public.has_business_role(business_id,'owner','manager'));
create policy plans_public_read on public.subscription_plans for select using (is_active);
create policy plans_admin on public.subscription_plans for all using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy subs_member on public.subscriptions for select using (public.is_business_member(business_id));
create policy subs_admin on public.subscriptions for all using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy invoices_member on public.subscription_invoices for select using (public.has_business_role(business_id,'owner'));
create policy usage_member on public.usage_records for select using (public.is_business_member(business_id));
create policy nt_member on public.notification_templates for all using (business_id is null or public.is_business_member(business_id)) with check (business_id is null and public.is_platform_admin() or public.is_business_member(business_id));
create policy nj_member on public.notification_jobs for select using (public.is_business_member(business_id));
create policy nl_member on public.notification_logs for select using (public.is_business_member(business_id));
create policy coupons_public on public.coupons for select using (is_active and exists(select 1 from public.businesses b where b.id=business_id and b.is_published));
create policy coupons_member on public.coupons for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy cred_member on public.coupon_redemptions for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy reviews_public on public.reviews for select using (is_published);
create policy reviews_member on public.reviews for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy tickets_own on public.support_tickets for all using (opened_by = auth.uid() or public.is_platform_admin() or (business_id is not null and public.is_business_member(business_id))) with check (opened_by = auth.uid() or public.is_platform_admin());
create policy ticket_msgs on public.support_messages for all using (exists(select 1 from public.support_tickets t where t.id = ticket_id and (t.opened_by = auth.uid() or public.is_platform_admin()))) with check (exists(select 1 from public.support_tickets t where t.id = ticket_id and (t.opened_by = auth.uid() or public.is_platform_admin())));
create policy audit_admin on public.audit_logs for select using (public.is_platform_admin());
create policy audit_member on public.audit_logs for select using (business_id is not null and public.has_business_role(business_id,'owner'));
create policy psettings_admin on public.platform_settings for all using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy apikeys_owner on public.api_keys for all using (public.has_business_role(business_id,'owner')) with check (public.has_business_role(business_id,'owner'));
create policy webhooks_owner on public.webhook_endpoints for all using (public.has_business_role(business_id,'owner')) with check (public.has_business_role(business_id,'owner'));
create policy webhook_del_member on public.webhook_deliveries for select using (business_id is not null and public.has_business_role(business_id,'owner'));
create policy pages_public on public.custom_pages for select using (is_published);
create policy pages_member on public.custom_pages for all using (business_id is not null and public.is_business_member(business_id)) with check (business_id is not null and public.is_business_member(business_id));

-- Immutable histories: revoke update/delete from authenticated/anon (service_role bypasses for system jobs only)
revoke update, delete on public.appointment_events from authenticated, anon;
revoke update, delete on public.payment_events from authenticated, anon;
revoke update, delete on public.audit_logs from authenticated, anon;
