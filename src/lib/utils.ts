import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getCurrentTimestamp(): number {
  return Date.now()
}

export function getUrlByMode(site: { publicUrl: string; privateUrl?: string }, mode: 'public' | 'private'): string {
  if (mode === 'private' && site.privateUrl) {
    return site.privateUrl
  }
  return site.publicUrl
}
