import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './i18n'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import { Home, Features, Industries, Pricing, About, Contact, Legal } from './pages/public/PublicPages'
import { Login, Register, ForgotPassword } from './pages/public/AuthPages'

// Public site ships in the main bundle. Business dashboard, super admin, booking and
// customer portal are code-split into separate chunks: public visitors never download
// admin code, and each area can later move to its own subdomain (app./admin.) unchanged.
const BookingPage = lazy(() => import('./pages/booking/BookingPage'))
const MyBookings = lazy(() => import('./pages/customer/MyBookings'))
const Overview = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.Overview })))
const AppointmentsPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.AppointmentsPage })))
const CalendarPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.CalendarPage })))
const ServicesPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.ServicesPage })))
const StaffPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.StaffPage })))
const CustomersPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.CustomersPage })))
const AvailabilityPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.AvailabilityPage })))
const PaymentsPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.PaymentsPage })))
const NotificationsPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.NotificationsPage })))
const ReportsPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.ReportsPage })))
const SubscriptionPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.SubscriptionPage })))
const SettingsPage = lazy(() => import('./pages/dashboard/DashboardPages').then(m => ({ default: m.SettingsPage })))
const AdminOverview = lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AdminOverview })))
const AdminBusinesses = lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AdminBusinesses })))
const AdminUsers = lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AdminUsers })))
const AdminPlans = lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AdminPlans })))
const AdminPayments = lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AdminPayments })))
const AdminSupport = lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AdminSupport })))
const AdminSettings = lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AdminSettings })))

const qc = new QueryClient()
const Fallback = () => <div className="p-10 text-center text-slate-500 text-sm" role="status">Loading…</div>

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <LanguageProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="features" element={<Features />} />
                <Route path="industries" element={<Industries />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="terms" element={<Legal kind="terms" />} />
                <Route path="privacy" element={<Legal kind="privacy" />} />
                <Route path="refund" element={<Legal kind="refund" />} />
                <Route path="my-bookings" element={<MyBookings />} />
              </Route>
              <Route path="b/:slug" element={<div className="min-h-screen bg-slate-50"><BookingPage /></div>} />
              <Route path="app" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="availability" element={<AvailabilityPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="businesses" element={<AdminBusinesses />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="plans" element={<AdminPlans />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  )
}
