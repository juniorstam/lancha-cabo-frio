'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'
import { FilterBar } from '@/components/busca/FilterBar'
import { BoatCard } from '@/components/embarcacao/BoatCard'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Boat } from '@/types'

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
  const [boats, setBoats] = useState<(Boat & { avg_rating?: number; total_reviews?: number })[]>([])
  const [loading, setLoading] = useState(true)

  const category = searchParams.get('category') || ''
  const minPrice = Number(searchParams.get('min_price') || 0)
  const maxPrice = Number(searchParams.get('max_price') || 0)
  const passengers = Number(searchParams.get('passengers') || 0)

  useEffect(() => {
    async function fetchBoats() {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('boats_with_rating')
        .select(`
          *,
          marina:marinas(id, name, address, lat, lng)
        `)
        .eq('status', 'active')

      if (category) query = query.eq('category', category)
      if (minPrice) query = query.gte('base_price', minPrice)
      if (maxPrice) query = query.lte('base_price', maxPrice)
      if (passengers) query = query.gte('capacity', passengers)

      const { data } = await query
      setBoats((data as any[]) ?? [])
      setLoading(false)
    }

    fetchBoats()
  }, [category, minPrice, maxPrice, passengers])

  const filtered = [...boats].sort((a, b) => {
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

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-playfair text-2xl font-bold text-[#0a2540]">
            {category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)}s disponíveis`
              : 'Todas as embarcações'}
          </h1>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#00b4d8] transition-colors bg-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
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
