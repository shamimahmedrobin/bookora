import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './i18n'
import PublicLayout from './layouts/PublicLayout'; import DashboardLayout from './layouts/DashboardLayout'; import AdminLayout from './layouts/AdminLayout'
import { Home, Features, Industries, Pricing, About, Contact, Legal } from './pages/public/PublicPages'
import { Login, Register, ForgotPassword } from './pages/public/AuthPages'
import BookingPage from './pages/booking/BookingPage'
import MyBookings from './pages/customer/MyBookings'
import { Overview, AppointmentsPage, CalendarPage, ServicesPage, StaffPage, CustomersPage, AvailabilityPage, PaymentsPage, NotificationsPage, ReportsPage, SubscriptionPage, SettingsPage } from './pages/dashboard/DashboardPages'
import { AdminOverview, AdminBusinesses, AdminUsers, AdminPlans, AdminPayments, AdminSupport, AdminSettings } from './pages/admin/AdminPages'
const qc = new QueryClient()
export default function App(){ return <QueryClientProvider client={qc}><LanguageProvider><BrowserRouter><Routes>
  <Route element={<PublicLayout/>}>
    <Route index element={<Home/>}/><Route path="features" element={<Features/>}/><Route path="industries" element={<Industries/>}/><Route path="pricing" element={<Pricing/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/>
    <Route path="login" element={<Login/>}/><Route path="register" element={<Register/>}/><Route path="forgot-password" element={<ForgotPassword/>}/>
    <Route path="terms" element={<Legal kind="terms"/>}/><Route path="privacy" element={<Legal kind="privacy"/>}/><Route path="refund" element={<Legal kind="refund"/>}/>
    <Route path="my-bookings" element={<MyBookings/>}/>
  </Route>
  <Route path="b/:slug" element={<div className="min-h-screen bg-slate-50"><BookingPage/></div>}/>
  <Route path="app" element={<DashboardLayout/>}>
    <Route index element={<Overview/>}/><Route path="appointments" element={<AppointmentsPage/>}/><Route path="calendar" element={<CalendarPage/>}/><Route path="services" element={<ServicesPage/>}/><Route path="staff" element={<StaffPage/>}/><Route path="customers" element={<CustomersPage/>}/><Route path="availability" element={<AvailabilityPage/>}/><Route path="payments" element={<PaymentsPage/>}/><Route path="notifications" element={<NotificationsPage/>}/><Route path="reports" element={<ReportsPage/>}/><Route path="subscription" element={<SubscriptionPage/>}/><Route path="settings" element={<SettingsPage/>}/>
  </Route>
  <Route path="admin" element={<AdminLayout/>}>
    <Route index element={<AdminOverview/>}/><Route path="businesses" element={<AdminBusinesses/>}/><Route path="users" element={<AdminUsers/>}/><Route path="plans" element={<AdminPlans/>}/><Route path="payments" element={<AdminPayments/>}/><Route path="support" element={<AdminSupport/>}/><Route path="settings" element={<AdminSettings/>}/>
  </Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></BrowserRouter></LanguageProvider></QueryClientProvider> }
