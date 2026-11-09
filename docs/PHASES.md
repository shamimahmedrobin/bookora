# Phases
- Phase 1 — Foundation, auth pages, DB schema, tenant isolation (RLS), public website: ✅ Done (demo-mode frontend; Supabase wiring needs a project + env)
- Phase 2 — Business onboarding (register flow), services, staff, availability, booking engine: ✅ Core done (engine + tests + public booking flow + dashboard CRUD on demo state; live Supabase CRUD wiring is next)
- Phase 3 — Customer portal, appointments, business dashboard: 🟡 Functional on demo state (/my-bookings, /app/*); needs live Supabase queries for production
- Phase 4 — Payments, notifications, subscription billing: 🟡 Adapters + Edge Function structure done; NOT live — needs merchant credentials (bKash/Nagad/SSLCommerz), Resend key, billing provider
- Phase 5 — Super Admin, analytics, custom domains, integrations: 🟡 Admin UI + domains table + API keys/webhooks schema done; DNS verification flow not implemented
- Phase 6 — Testing, security audit, optimization, deployment: 🟡 Vitest covers booking engine/plans/coupons/payments idempotency; RLS integration tests + load/perf + deployment remain
