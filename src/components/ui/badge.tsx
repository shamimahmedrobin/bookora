import type { HTMLAttributes } from 'react'; import { cn } from '../../lib/utils'
const map: Record<string,string>={default:'bg-indigo-50 text-indigo-700',success:'bg-emerald-50 text-emerald-700',warning:'bg-amber-50 text-amber-700',danger:'bg-red-50 text-red-700',neutral:'bg-slate-100 text-slate-700'}
export function Badge({className,variant='default',...p}:HTMLAttributes<HTMLSpanElement>&{variant?:keyof typeof map}){return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',map[variant],className)} {...p}/>}
