import { forwardRef, type ButtonHTMLAttributes } from 'react'; import { cn } from '../../lib/utils'
type Variant='default'|'outline'|'ghost'|'destructive'|'secondary'; type Size='sm'|'default'|'lg'
const variants: Record<Variant,string>={default:'bg-indigo-600 text-white hover:bg-indigo-700',outline:'border bg-white hover:bg-slate-50 text-slate-900',ghost:'hover:bg-slate-100 text-slate-700',destructive:'bg-red-600 text-white hover:bg-red-700',secondary:'bg-slate-100 text-slate-900 hover:bg-slate-200'}
const sizes: Record<Size,string>={sm:'h-8 px-3 text-xs',default:'h-10 px-4 text-sm',lg:'h-11 px-6 text-base'}
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{variant?:Variant;size?:Size}
export const Button=forwardRef<HTMLButtonElement,ButtonProps>(({className,variant='default',size='default',...p},ref)=><button ref={ref} className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none',variants[variant],sizes[size],className)} {...p}/>)
Button.displayName='Button'
