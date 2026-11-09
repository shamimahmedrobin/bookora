import { forwardRef, type TextareaHTMLAttributes } from 'react'; import { cn } from '../../lib/utils'
export const Textarea=forwardRef<HTMLTextAreaElement,TextareaHTMLAttributes<HTMLTextAreaElement>>(({className,...p},ref)=><textarea ref={ref} className={cn('flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500',className)} {...p}/>)
Textarea.displayName='Textarea'
