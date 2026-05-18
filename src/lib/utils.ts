import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('bs-BA', {
    style: 'currency',
    currency: 'BAM',
    minimumFractionDigits: 2
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}