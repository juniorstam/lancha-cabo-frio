'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'
import { FilterBar } from '@/components/busca/FilterBar'
import { BoatCard } from '@/components/embarcacao/BoatCard'
import { cn } from '@/lib/utils'
import type { Boat } from '@/types'

// Mock data — será substituído por dados reais do Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_BOATS: any[] = [
  {
    id: '1', name: 'Focker 310', slug: 'focker-310', category: 'lancha',
    capacity: 10, size_ft: 22, base_price: 800, price_per_extra_person: 80,
    status: 'active', description: 'Lancha espaçosa e confortável para passeios em família ou grupos.',
    marina_id: '1', city_id: '1', owner_id: '1', created_at: '', updated_at: '',
    cover_photo: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=800',
    amenities: { marinheiro: true, churrasqueira: true, cooler: true, banheiro: false, ducha: false, som: true, wifi: false, toldo: true, ancora: true },
    marina: { id: '1', city_id: '1', name: 'Marina Pier 98', address: '', lat: 0, lng: 0 } as any,
    avg_rating: 4.9, total_reviews: 24,
  },
  {
    id: '2', name: 'Intermarine 480', slug: 'intermarine-480', category: 'lancha',
    capacity: 14, size_ft: 30, base_price: 1200, price_per_extra_person: 100,
    status: 'active', description: 'Luxuosa lancha com amplo espaço interno e deck solar generoso.',
    marina_id: '2', city_id: '1', owner_id: '1', created_at: '', updated_at: '',
    cover_photo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
    amenities: { marinheiro: true, churrasqueira: true, cooler: true, banheiro: true, ducha: true, som: true, wifi: true, toldo: true, ancora: true },
    marina: { id: '2', city_id: '1', name: 'Terminal Transatlântico', address: '', lat: 0, lng: 0 } as any,
    avg_rating: 5.0, total_reviews: 18,
  },
  {
    id: '3', name: 'Armada 40', slug: 'armada-40', category: 'lancha',
    capacity: 12, size_ft: 23, base_price: 950, price_per_extra_person: 90,
    status: 'active', description: 'Lancha moderna com design esportivo e excelente performance.',
    marina_id: '1', city_id: '1', owner_id: '1', created_at: '', updated_at: '',
    cover_photo: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800',
    amenities: { marinheiro: true, churrasqueira: false, cooler: true, banheiro: true, ducha: false, som: true, wifi: false, toldo: false, ancora: true },
    marina: { id: '1', city_id: '1', name: 'Marina Pier 98', address: '', lat: 0, lng: 0 } as any,
    avg_rating: 4.8, total_reviews: 31,
  },
  {
    id: '4', name: 'NHD 280 Cabinada', slug: 'nhd-280-cabinada', category: 'lancha',
    capacity: 11, size_ft: 28, base_price: 900, price_per_extra_person: 85,
    status: 'active', description: 'Lancha cabinada ideal para passeios mais longos com conforto extra.',
    marina_id: '2', city_id: '1', owner_id: '1', created_at: '', updated_at: '',
    cover_photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
    amenities: { marinheiro: true, churrasqueira: true, cooler: true, banheiro: true, ducha: true, som: false, wifi: false, toldo: true, ancora: true },
    marina: { id: '2', city_id: '1', name: 'Terminal Transatlântico', address: '', lat: 0, lng: 0 } as any,
    avg_rating: 4.7, total_reviews: 15,
  },
  {
    id: '5', name: 'Jet Ski Seadoo', slug: 'jet-ski-seadoo', category: 'jetski',
    capacity: 2, size_ft: 6, base_price: 300, price_per_extra_person: 0,
    status: 'active', description: 'Jet ski potente e emocionante para os mais aventureiros.',
    marina_id: '1', city_id: '1', owner_id: '1', created_at: '', updated_at: '',
    cover_photo: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=800',
    amenities: { marinheiro: false, churrasqueira: false, cooler: false, banheiro: false, ducha: false, som: false, wifi: false, toldo: false, ancora: false },
    marina: { id: '1', city_id: '1', name: 'Marina Pier 98', address: '', lat: 0, lng: 0 } as any,
    avg_rating: 4.6, total_reviews: 42,
  },
  {
    id: '6', name: 'Ventura 33', slug: 'ventura-33', category: 'lancha',
    capacity: 15, size_ft: 33, base_price: 1400, price_per_extra_person: 110,
    status: 'active', description: 'Lancha premium com acabamento de alto nível e espaço generoso.',
    marina_id: '1', city_id: '1', owner_id: '1', created_at: '', updated_at: '',
    cover_photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
    amenities: { marinheiro: true, churrasqueira: true, cooler: true, banheiro: true, ducha: true, som: true, wifi: true, toldo: true, ancora: true },
    marina: { id: '1', city_id: '1', name: 'Marina Pier 98', address: '', lat: 0, lng: 0 } as any,
    avg_rating: 5.0, total_reviews: 8,
  },
]

const SORT_OPTIONS = [
  { value: 'rating', label: 'Mais bem avaliados' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'capacity', label: 'Maior capacidade' },
]

export function BoatsListContent() {
  const searchParams = useSearchParams()
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState('rating')

  // Filtros da URL
  const category = searchParams.get('category') || ''
  const minPrice = Number(searchParams.get('min_price') || 0)
  const maxPrice = Number(searchParams.get('max_price') || 0)
  const passengers = Number(searchParams.get('passengers') || 0)

  // Aplicar filtros
  let filtered = MOCK_BOATS.filter((boat) => {
    if (category && boat.category !== category) return false
    if (minPrice && boat.base_price < minPrice) return false
    if (maxPrice && boat.base_price > maxPrice) return false
    if (passengers && boat.capacity < passengers) return false
    return true
  })

  // Ordenar
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0)
    if (sort === 'price_asc') return a.base_price - b.base_price
    if (sort === 'price_desc') return b.base_price - a.base_price
    if (sort === 'capacity') return b.capacity - a.capacity
    return 0
  })

  return (
    <>
      <FilterBar totalResults={filtered.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Barra de ordenação */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-playfair text-2xl font-bold text-[#0a2540]">
            {category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)}s disponíveis`
              : 'Todas as embarcações'}
          </h1>

          <div className="flex items-center gap-3">
            {/* Ordenação */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#00b4d8] transition-colors bg-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Layout toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1">
              <button
                onClick={() => setLayout('grid')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  layout === 'grid' ? 'bg-[#0a2540] text-white' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  layout === 'list' ? 'bg-[#0a2540] text-white' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">⚓</p>
            <h3 className="font-playfair text-2xl font-bold text-[#0a2540] mb-2">
              Nenhuma embarcação encontrada
            </h3>
            <p className="text-gray-500">Tente ajustar os filtros para ver mais opções.</p>
          </div>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((boat, index) => (
              <BoatCard key={boat.id} boat={boat} index={index} variant="default" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((boat, index) => (
              <BoatCard key={boat.id} boat={boat} index={index} variant="horizontal" />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
