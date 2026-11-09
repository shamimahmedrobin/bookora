import { cn } from '../../lib/utils'; import type { HTMLAttributes } from 'react'
export function Skeleton({className,...p}:HTMLAttributes<HTMLDivElement>){return <div className={cn('animate-pulse rounded-md bg-slate-200',className)} {...p}/>}
