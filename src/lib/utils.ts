import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatBDT(minor: number): string { return `৳${(minor/100).toLocaleString('en-BD')}` }
export function formatMoney(minor: number, currency='BDT'): string { return `${currency} ${(minor/100).toLocaleString()}` }
export function genBookingRef(): string { const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<6;i++) s+=c[Math.floor(Math.random()*c.length)]; return `BKR-${s}` }
