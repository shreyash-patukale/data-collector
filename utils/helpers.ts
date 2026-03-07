import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function tdsStatus(tds: number): { label: string; color: string } {
  if (tds < 400)  return { label: 'Low',  color: 'text-blue-400' }
  if (tds < 1200) return { label: 'Good', color: 'text-brand-400' }
  if (tds < 2000) return { label: 'High', color: 'text-yellow-400' }
  return { label: 'Very High', color: 'text-red-400' }
}

export function phStatus(ph: number): { label: string; color: string } {
  if (ph < 5.5)               return { label: 'Too Acidic', color: 'text-red-400' }
  if (ph >= 5.5 && ph <= 6.5) return { label: 'Optimal',   color: 'text-brand-400' }
  if (ph > 6.5 && ph <= 7.5)  return { label: 'Alkaline',  color: 'text-yellow-400' }
  return { label: 'Too Basic', color: 'text-red-400' }
}
