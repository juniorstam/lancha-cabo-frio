// ============================================================
// CONSTANTES GLOBAIS
// ============================================================

export const SITE_NAME = 'Lancha em Cabo Frio'
export const SITE_DESCRIPTION =
  'Aluguel de lanchas, barcos e jet ski em Cabo Frio e região. Reserve online com facilidade e segurança.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const PLATFORM_FEE_PERCENT = 0.1 // 10% de taxa da plataforma

export const BOAT_CATEGORIES = [
  { value: 'lancha', label: 'Lancha', icon: '🚤' },
  { value: 'jetski', label: 'Jet Ski', icon: '🏄' },
  { value: 'barco', label: 'Barco', icon: '⛵' },
  { value: 'veleiro', label: 'Veleiro', icon: '🌊' },
  { value: 'catamara', label: 'Catamarã', icon: '🛥️' },
] as const

export const BOAT_STATUS_LABELS = {
  pending: 'Aguardando aprovação',
  active: 'Ativo',
  inactive: 'Inativo',
  rejected: 'Reprovado',
} as const

export const BOOKING_STATUS_LABELS = {
  pending: 'Aguardando confirmação',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
  refunded: 'Reembolsado',
} as const

export const BOOKING_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  refunded: 'bg-gray-100 text-gray-800',
} as const

export const DIFFICULTY_LABELS = {
  calm: 'Mar Calmo',
  moderate: 'Mar Moderado',
  rough: 'Mar Agitado',
} as const

export const IDEAL_FOR_LABELS = {
  family: 'Famílias',
  couple: 'Casais',
  group: 'Grupos',
  all: 'Todos',
} as const

export const AMENITIES_LABELS = {
  marinheiro: 'Marinheiro incluso',
  churrasqueira: 'Churrasqueira',
  cooler: 'Cooler',
  banheiro: 'Banheiro a bordo',
  ducha: 'Ducha',
  som: 'Som',
  wifi: 'Wi-Fi',
  toldo: 'Toldo',
  ancora: 'Âncora',
} as const

export const AMENITIES_ICONS = {
  marinheiro: '👨‍✈️',
  churrasqueira: '🔥',
  cooler: '🧊',
  banheiro: '🚽',
  ducha: '🚿',
  som: '🔊',
  wifi: '📶',
  toldo: '⛱️',
  ancora: '⚓',
} as const

export const NAV_ITEMS = [
  { label: 'Início', href: '/' },
  { label: 'Embarcações', href: '/embarcacoes' },
  { label: 'Roteiros', href: '/roteiros' },
  { label: 'Favoritos', href: '/favoritos' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Fale Conosco', href: '/contato' },
] as const

export const CITIES = [
  { name: 'Cabo Frio', slug: 'cabo-frio', state: 'RJ', active: true },
  { name: 'Búzios', slug: 'buzios', state: 'RJ', active: false },
  { name: 'Arraial do Cabo', slug: 'arraial-do-cabo', state: 'RJ', active: false },
  { name: 'Angra dos Reis', slug: 'angra-dos-reis', state: 'RJ', active: false },
  { name: 'Paraty', slug: 'paraty', state: 'RJ', active: false },
  { name: 'Florianópolis', slug: 'florianopolis', state: 'SC', active: false },
] as const
