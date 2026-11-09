import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import { useForm } from 'react-hook-form'; import { z } from 'zod'; import { zodResolver } from '@hookform/resolvers/zod'
const loginSchema=z.object({email:z.string().email(), password:z.string().min(6)})
const regSchema=z.object({businessName:z.string().min(2), name:z.string().min(2), email:z.string().email(), password:z.string().min(8), industry:z.string().min(1)})
type LoginForm=z.infer<typeof loginSchema>; type RegForm=z.infer<typeof regSchema>
function Shell({title,children}:{title:string;children:React.ReactNode}){return <div className="max-w-md mx-auto px-4 py-12"><div className="border rounded-2xl p-6 sm:p-8 bg-white shadow-sm"><h1 className="text-2xl font-bold">{title}</h1><div className="mt-6">{children}</div></div></div>}
const inputCls="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
const errCls="text-red-600 text-xs mt-1"
export function Login(){ const nav=useNavigate(); const {register,handleSubmit,formState:{errors}}=useForm<LoginForm>({resolver:zodResolver(loginSchema)}); const [note,setNote]=useState('')
  return <Shell title="Welcome back"><form className="space-y-4" onSubmit={handleSubmit(()=>{setNote('Demo mode: signed in as Business Owner. Redirecting to dashboard…'); setTimeout(()=>nav('/app'),600)})}>
    <div><label className="text-sm font-medium">Email<input className={inputCls} {...register('email')} placeholder="you@business.com"/></label>{errors.email&&<p className={errCls}>{errors.email.message}</p>}</div>
    <div><label className="text-sm font-medium">Password<input type="password" className={inputCls} {...register('password')}/></label>{errors.password&&<p className={errCls}>{errors.password.message}</p>}</div>
    <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold">Log in</button>
    {note&&<p className="text-sm bg-indigo-50 text-indigo-800 p-3 rounded-lg" role="status">{note}</p>}
    <div className="flex justify-between text-sm"><Link to="/forgot-password" className="text-indigo-600">Forgot password?</Link><Link to="/register" className="text-indigo-600">Create account</Link></div>
    <div className="border-t pt-4 grid gap-2"><Link to="/app" className="text-center border rounded-lg py-2 text-sm font-medium">Open Business Dashboard (demo)</Link><Link to="/admin" className="text-center border rounded-lg py-2 text-sm font-medium">Open Super Admin (demo)</Link></div>
  </form></Shell> }
export function Register(){ const nav=useNavigate(); const {register,handleSubmit,formState:{errors}}=useForm<RegForm>({resolver:zodResolver(regSchema)})
  return <Shell title="Create your workspace"><form className="space-y-4" onSubmit={handleSubmit(()=>nav('/app'))}>
    <div><label className="text-sm font-medium">Business name<input className={inputCls} {...register('businessName')} placeholder="e.g. Dhaka Care Clinic"/></label>{errors.businessName&&<p className={errCls}>{errors.businessName.message}</p>}</div>
    <div><label className="text-sm font-medium">Your name<input className={inputCls} {...register('name')}/></label>{errors.name&&<p className={errCls}>{errors.name.message}</p>}</div>
    <div><label className="text-sm font-medium">Industry<select className={inputCls} {...register('industry')}><option value="">Select…</option><option>Clinic</option><option>Dentist</option><option>Salon & Beauty</option><option>Consultant</option><option>Fitness</option><option>Tutor</option><option>Repair Service</option><option>Other</option></select></label>{errors.industry&&<p className={errCls}>{errors.industry.message}</p>}</div>
    <div><label className="text-sm font-medium">Email<input className={inputCls} {...register('email')}/></label>{errors.email&&<p className={errCls}>{errors.email.message}</p>}</div>
    <div><label className="text-sm font-medium">Password<input type="password" className={inputCls} {...register('password')}/></label>{errors.password&&<p className={errCls}>{errors.password.message}</p>}</div>
    <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold">Create free workspace</button>
    <p className="text-xs text-slate-500 text-center">Free plan: 1 staff, 30 bookings/month. Your booking link will be /b/your-business-slug.</p>
    <p className="text-sm text-center">Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Log in</Link></p>
  </form></Shell> }
export function ForgotPassword(){ const [sent,setSent]=useState(false); return <Shell title="Reset password"><form className="space-y-4" onSubmit={e=>{e.preventDefault(); setSent(true)}}><label className="text-sm font-medium block">Email<input required type="email" className={inputCls}/></label><button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold">Send reset link</button>{sent&&<p className="text-sm bg-emerald-50 text-emerald-800 p-3 rounded-lg" role="status">If an account exists, a reset link was sent via Supabase Auth (demo mode: no email sent).</p>}<Link to="/login" className="block text-center text-sm text-indigo-600">Back to login</Link></form></Shell> }
