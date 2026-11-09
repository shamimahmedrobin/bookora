import { forwardRef, type InputHTMLAttributes } from 'react'; import { cn } from '../../lib/utils'
export const Input=forwardRef<HTMLInputElement,InputHTMLAttributes<HTMLInputElement>>(({className,...p},ref)=><input ref={ref} className={cn('flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50',className)} {...p}/>)
Input.displayName='Input'
