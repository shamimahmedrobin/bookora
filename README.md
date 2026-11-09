# Bookora — Multi-tenant Appointment Booking SaaS
Production-oriented appointment scheduling for clinics, salons, dentists, consultants, tutors, fitness and repair businesses in Bangladesh & worldwide. Each business gets a public booking page at `/b/:slug`, a dashboard, staff calendars, payments and Bangla/English notifications.

## Quick start
```bash
npm install
cp .env.example .env.local   # leave Supabase vars empty to run in demo mode
npm run dev                  # http://localhost:5173
npm test                     # vitest — booking engine, plans, coupons, payments
npm run build                # typecheck + production build
```
Demo mode (no Supabase env): realistic demo businesses (Dhaka Care Clinic, Glow Studio Salon, Smile Dental) run with the real booking-engine logic locally. Try `/b/dhaka-care-clinic`, `/app`, `/admin`, `/my-bookings`.

## With Supabase
1. Create a Supabase project. 2. Apply `supabase/migrations/0001…0008` in order (SQL editor or `supabase db push` with the CLI). 3. Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. 4. Deploy functions in `supabase/functions/` and set their secrets (see `.env.example`). Service-role key is server-only, never in client code.

## Scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | Vitest unit tests |
| `npm run preview` | Preview production build |

## Env vars
| Var | Where | Notes |
|---|---|---|
| VITE_SUPABASE_URL | client | Project URL |
| VITE_SUPABASE_ANON_KEY | client | Anon key; RLS protects data |
| SUPABASE_SERVICE_ROLE_KEY | Edge Functions only | NEVER expose client-side |
| RESEND_API_KEY, MAIL_FROM | Edge Functions | Email sending |
| BKASH_*, NAGAD_*, SSLCOMMERZ_* | Edge Functions | Merchant credentials; integrations not live without them |

## Structure
`src/lib/booking` (availability/overlap/plans/coupons + tests) • `src/lib/payments` (adapter interface, manual live, gateways skeleton) • `src/lib/demo` • `src/pages` • `supabase/migrations` • `supabase/functions` • `docs/`
See docs/ARCHITECTURE.md, docs/PHASES.md, docs/LAUNCH_CHECKLIST.md.
