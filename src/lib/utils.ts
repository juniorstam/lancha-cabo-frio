import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatar moeda BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Formatar data pt-BR
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Formatar data longa
export function formatDateLong(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

// Slug a partir de texto
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Calcular taxa da plataforma
export function calculatePlatformFee(amount: number, feePercent = 0.1): number {
  return Math.round(amount * feePercent * 100) / 100
}

// Calcular total da reserva
export function calculateBookingTotal(
  basePrice: number,
  passengers: number,
  pricePerExtra: number,
  baseCapacity: number,
  extrasTotal: number
): number {
  const extraPassengers = Math.max(0, passengers - baseCapacity)
  const extraCost = extraPassengers * pricePerExtra
  return basePrice + extraCost + extrasTotal
}

// Plural simples pt-BR
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`
}

// Truncar texto
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Verificar se data é futura
export function isFutureDate(date: string): boolean {
  return new Date(date) > new Date()
}
