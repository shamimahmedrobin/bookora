import type { HTMLAttributes } from 'react'; import { cn } from '../../lib/utils'
export function Card({className,...p}:HTMLAttributes<HTMLDivElement>){return <div className={cn('rounded-xl border bg-white shadow-sm',className)} {...p}/>}
export function CardHeader({className,...p}:HTMLAttributes<HTMLDivElement>){return <div className={cn('p-5 pb-2',className)} {...p}/>}
export function CardTitle({className,...p}:HTMLAttributes<HTMLHeadingElement>){return <h3 className={cn('font-semibold text-slate-900',className)} {...p}/>}
export function CardContent({className,...p}:HTMLAttributes<HTMLDivElement>){return <div className={cn('p-5 pt-2',className)} {...p}/>}
