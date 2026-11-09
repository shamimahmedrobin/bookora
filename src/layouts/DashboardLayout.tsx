import { useState } from 'react'; import { Link, Outlet, NavLink } from 'react-router-dom'; import { Menu, X, LayoutDashboard, Calendar, CalendarDays, Briefcase, Users, UserRound, Clock, CreditCard, Bell, BarChart3, Crown, Settings } from 'lucide-react'
import { LanguageSwitcher } from '../i18n'
const items=[{to:'/app',label:'Overview',icon:LayoutDashboard,end:true},{to:'/app/appointments',label:'Appointments',icon:Calendar},{to:'/app/calendar',label:'Calendar',icon:CalendarDays},{to:'/app/services',label:'Services',icon:Briefcase},{to:'/app/staff',label:'Doctors',icon:Users},{to:'/app/customers',label:'Customers',icon:UserRound},{to:'/app/availability',label:'Availability',icon:Clock},{to:'/app/payments',label:'Payments',icon:CreditCard},{to:'/app/notifications',label:'Notifications',icon:Bell},{to:'/app/reports',label:'Reports',icon:BarChart3},{to:'/app/subscription',label:'Subscription',icon:Crown},{to:'/app/settings',label:'Settings',icon:Settings}]
export default function DashboardLayout(){
  const [open,setOpen]=useState(false)
  const nav=<nav className="space-y-1 p-3">{items.map(it=><NavLink key={it.to} to={it.to} end={it.end} onClick={()=>setOpen(false)} className={({isActive})=>`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${isActive?'bg-indigo-50 text-indigo-700':'text-slate-600 hover:bg-slate-50'}`}><it.icon size={18}/>{it.label}</NavLink>)}
    <div className="pt-4 border-t mt-4"><Link to="/b/dhaka-care-clinic" className="block px-3 py-2 text-sm text-indigo-600 font-medium">↗ View public booking page</Link><Link to="/" className="block px-3 py-2 text-sm text-slate-500">← Back to website</Link></div></nav>
  return <div className="min-h-screen bg-slate-50 flex">
    <aside className="hidden lg:block w-64 bg-white border-r shrink-0 sticky top-0 h-screen overflow-y-auto"><div className="p-4 font-bold text-lg">Bookora <span className="text-xs font-normal text-slate-500 block">Dhaka Care Clinic</span></div>{nav}</aside>
    <div className="flex-1 min-w-0">
      <header className="bg-white border-b h-14 flex items-center justify-between px-4 sticky top-0 z-30"><button className="lg:hidden p-2" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button><span className="font-semibold lg:hidden">Bookora Dashboard</span><div className="flex items-center gap-3 ml-auto"><LanguageSwitcher/><span className="hidden sm:block text-sm text-slate-600">Owner</span><span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">S</span></div></header>
      {open && <div className="fixed inset-0 z-50 flex"><div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)}/><aside className="relative bg-white w-72 max-w-[85vw] overflow-y-auto"><div className="flex justify-between items-center p-4"><span className="font-bold">Bookora</span><button onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>{nav}</aside></div>}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto"><Outlet/></main>
    </div>
  </div>
}
