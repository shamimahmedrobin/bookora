import { useState } from 'react'; import { Link, Outlet, NavLink } from 'react-router-dom'; import { Menu, X, CalendarCheck } from 'lucide-react'
import { useLanguage, LanguageSwitcher } from '../i18n'; import { isDemoMode } from '../lib/supabase/client'
export default function PublicLayout(){
  const [open,setOpen]=useState(false); const {t}=useLanguage()
  const links=[{to:'/features',label:t('nav.features')},{to:'/industries',label:t('nav.industries')},{to:'/pricing',label:t('nav.pricing')},{to:'/about',label:t('nav.about')},{to:'/contact',label:t('nav.contact')}]
  return <div className="min-h-screen flex flex-col">
    {isDemoMode && <div className="bg-amber-50 text-amber-800 text-center text-xs py-1.5 px-3">Demo mode — Supabase env not configured. Data shown is realistic demo data; bookings use the real booking-engine logic locally.</div>}
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900"><span className="bg-indigo-600 text-white p-1.5 rounded-lg"><CalendarCheck size={20}/></span>Bookora</Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Main">{links.map(l=><NavLink key={l.to} to={l.to} className={({isActive})=>isActive?'text-indigo-600':'hover:text-slate-900'}>{l.label}</NavLink>)}</nav>
        <div className="hidden md:flex items-center gap-3"><LanguageSwitcher/><Link to="/my-bookings" className="text-sm font-medium text-slate-600 hover:text-slate-900">{t('nav.myBookings')}</Link><Link to="/login" className="text-sm font-medium">{t('nav.login')}</Link><Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">{t('nav.register')}</Link></div>
        <button className="md:hidden p-2" onClick={()=>setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open?<X/>:<Menu/>}</button>
      </div>
      {open && <div className="md:hidden border-t px-4 py-3 flex flex-col gap-3 bg-white">{links.map(l=><Link key={l.to} to={l.to} onClick={()=>setOpen(false)} className="font-medium">{l.label}</Link>)}<Link to="/my-bookings" onClick={()=>setOpen(false)}>My Bookings</Link><Link to="/login" onClick={()=>setOpen(false)}>Log in</Link><Link to="/register" onClick={()=>setOpen(false)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-center font-semibold">Get Started</Link><LanguageSwitcher/></div>}
    </header>
    <main className="flex-1"><Outlet/></main>
    <footer className="bg-slate-900 text-slate-300 mt-16"><div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
      <div><div className="font-bold text-white text-lg">Bookora</div><p className="text-sm mt-2">{t('footer.tagline')}</p></div>
      <div><h4 className="text-white font-semibold mb-3">Product</h4><ul className="space-y-2 text-sm"><li><Link to="/features">Features</Link></li><li><Link to="/pricing">Pricing</Link></li><li><Link to="/industries">Industries</Link></li></ul></div>
      <div><h4 className="text-white font-semibold mb-3">Company</h4><ul className="space-y-2 text-sm"><li><Link to="/about">About</Link></li><li><Link to="/contact">Contact</Link></li></ul></div>
      <div><h4 className="text-white font-semibold mb-3">Legal</h4><ul className="space-y-2 text-sm"><li><Link to="/terms">Terms</Link></li><li><Link to="/privacy">Privacy</Link></li><li><Link to="/refund">Refund Policy</Link></li></ul></div>
    </div><div className="border-t border-slate-800 py-4 text-center text-xs">© {new Date().getFullYear()} Bookora. Made for Bangladesh & the world.</div></footer>
  </div>
}
