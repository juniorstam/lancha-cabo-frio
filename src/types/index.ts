// ============================================================
// TIPOS GLOBAIS — Plataforma Náutica Premium
// ============================================================

export type UserRole = 'client' | 'owner' | 'admin'

export type BoatCategory = 'lancha' | 'jetski' | 'barco' | 'veleiro' | 'catamara'

export type BoatStatus = 'pending' | 'active' | 'inactive' | 'rejected'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'refunded'

export type AvailabilityStatus = 'available' | 'blocked' | 'reserved'

// ============================================================
// USUÁRIO
// ============================================================

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  phone?: string
  avatar_url?: string
  verified_at?: string
  created_at: string
}

// ============================================================
// CIDADE
// ============================================================

export interface City {
  id: string
  name: string
  slug: string
  state: string
  active: boolean
  image_url?: string
  description?: string
}

// ============================================================
// MARINA
// ============================================================

export interface Marina {
  id: string
  city_id: string
  name: string
  address: string
  lat: number
  lng: number
  city?: City
}

// ============================================================
// EMBARCAÇÃO
// ============================================================

export interface BoatAmenities {
  marinheiro: boolean
  churrasqueira: boolean
  cooler: boolean
  banheiro: boolean
  ducha: boolean
  som: boolean
  wifi: boolean
  toldo: boolean
  ancora: boolean
}

export interface Boat {
  id: string
  owner_id: string
  city_id: string
  marina_id: string
  name: string
  slug: string
  category: BoatCategory
  description: string
  capacity: number
  size_ft: number
  status: BoatStatus
  amenities: BoatAmenities
  base_price: number
  price_per_extra_person: number
  rules?: string
  cover_photo?: string
  created_at: string

  // Relacionamentos
  owner?: Profile
  city?: City
  marina?: Marina
  photos?: BoatPhoto[]
  routes?: Route[]
  reviews?: Review[]
  avg_rating?: number
  total_reviews?: number
}

export interface BoatPhoto {
  id: string
  boat_id: string
  url: string
  order: number
  is_cover: boolean
}

// ============================================================
// ROTEIRO
// ============================================================

export type RouteDifficulty = 'calm' | 'moderate' | 'rough'
export type RouteIdealFor = 'family' | 'couple' | 'group' | 'all'

export interface Route {
  id: string
  city_id: string
  name: string
  slug: string
  description: string
  duration_hours: number
  difficulty: RouteDifficulty
  ideal_for: RouteIdealFor
  image_url?: string
  map_url?: string
  city?: City
}

export interface BoatRoute {
  id: string
  boat_id: string
  route_id: string
  price_override?: number
  route?: Route
}

// ============================================================
// OPCIONAL / EXTRA
// ============================================================

export type ExtraUnit = 'unit' | 'kg' | 'liter' | 'person'

export interface Extra {
  id: string
  name: string
  unit: ExtraUnit
  price: number
  icon?: string
  category: 'food' | 'drink' | 'decoration' | 'activity' | 'other'
}

// ============================================================
// RESERVA
// ============================================================

export interface BookingExtra {
  id: string
  booking_id: string
  extra_id: string
  quantity: number
  price: number
  extra?: Extra
}

export interface Booking {
  id: string
  boat_id: string
  client_id: string
  route_id?: string
  date: string
  start_time: string
  passenger_count: number
  status: BookingStatus
  base_price: number
  extras_total: number
  platform_fee: number
  total_amount: number
  payment_id?: string
  notes?: string
  created_at: string

  // Relacionamentos
  boat?: Boat
  client?: Profile
  route?: Route
  extras?: BookingExtra[]
  payment?: Payment
}

// ============================================================
// DISPONIBILIDADE
// ============================================================

export interface Availability {
  id: string
  boat_id: string
  date: string
  status: AvailabilityStatus
}

// ============================================================
// AVALIAÇÃO
// ============================================================

export interface Review {
  id: string
  booking_id: string
  boat_id: string
  client_id: string
  rating_overall: number
  rating_boat: number
  rating_captain: number
  comment?: string
  photos?: string[]
  created_at: string

  client?: Profile
}

// ============================================================
// PAGAMENTO
// ============================================================

export type PaymentProvider = 'mercadopago' | 'stripe'
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded'

export interface Payment {
  id: string
  booking_id: string
  provider: PaymentProvider
  external_id?: string
  status: PaymentStatus
  amount: number
  fee: number
  created_at: string
}

// ============================================================
// FILTROS DE BUSCA
// ============================================================

export interface SearchFilters {
  city_slug?: string
  route_id?: string
  date?: string
  passengers?: number
  category?: BoatCategory
  min_price?: number
  max_price?: number
  amenities?: Partial<BoatAmenities>
}

// ============================================================
// RESPOSTAS DE API
// ============================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
