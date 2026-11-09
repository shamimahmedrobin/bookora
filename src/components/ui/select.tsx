import { forwardRef, type SelectHTMLAttributes } from 'react'; import { cn } from '../../lib/utils'
export const Select=forwardRef<HTMLSelectElement,SelectHTMLAttributes<HTMLSelectElement>>(({className,...p},ref)=><select ref={ref} className={cn('flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500',className)} {...p}/>)
Select.displayName='Select'
