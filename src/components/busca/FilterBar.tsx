'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOAT_CATEGORIES } from '@/constants'

const PRICE_RANGES = [
  { label: 'Qualquer preço', min: 0, max: 0 },
  { label: 'Até R$ 500', min: 0, max: 500 },
  { label: 'R$ 500 – R$ 1.000', min: 500, max: 1000 },
  { label: 'R$ 1.000 – R$ 2.000', min: 1000, max: 2000 },
  { label: 'Acima de R$ 2.000', min: 2000, max: 0 },
]

const CAPACITY_OPTIONS = [
  { label: 'Qualquer', value: 0 },
  { label: 'Até 5 pax', value: 5 },
  { label: 'Até 10 pax', value: 10 },
  { label: 'Até 15 pax', value: 15 },
  { label: '15+ pax', value: 16 },
]

interface FilterBarProps {
  totalResults: number
}

export function FilterBar({ totalResults }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const currentCategory = searchParams.get('category') || ''
  const currentMin = Number(searchParams.get('min_price') || 0)
  const currentMax = Number(searchParams.get('max_price') || 0)
  const currentCapacity = Number(searchParams.get('passengers') || 0)

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/embarcacoes?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/embarcacoes')
  }

  const hasFilters = currentCategory || currentMin || currentMax || currentCapacity

  return (
    <div className="bg-white border-b border-gray-100 sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Linha principal */}
        <div className="flex items-center gap-3 pb-1">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide flex-1 min-w-0">

          {/* Botão filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              showFilters || hasFilters
                ? 'bg-[#0a2540] text-white border-[#0a2540]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasFilters && (
              <span className="w-5 h-5 bg-[#00b4d8] rounded-full text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

          {/* Categorias rápidas */}
          {BOAT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateFilter('category', currentCategory === cat.value ? '' : cat.value)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                currentCategory === cat.value
                  ? 'bg-[#0a2540] text-white border-[#0a2540]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}

          {/* Limpar filtros */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-red-500 whitespace-nowrap flex-shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}

        </div>

          {/* Total — fora do scroll */}
          <span className="text-sm text-gray-400 whitespace-nowrap flex-shrink-0">
            {totalResults} {totalResults !== 1 ? 'embarcações encontradas' : 'embarcação encontrada'}
          </span>
        </div>

        {/* Painel de filtros avançados */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Faixa de preço */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Preço
              </label>
              <select
                value={`${currentMin}-${currentMax}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-')
                  const params = new URLSearchParams(searchParams.toString())
                  if (min !== '0') params.set('min_price', min)
                  else params.delete('min_price')
                  if (max !== '0') params.set('max_price', max)
                  else params.delete('max_price')
                  router.push(`/embarcacoes?${params.toString()}`)
                }}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#00b4d8] transition-colors"
              >
                {PRICE_RANGES.map((range) => (
                  <option key={range.label} value={`${range.min}-${range.max}`}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacidade */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Passageiros
              </label>
              <select
                value={currentCapacity}
                onChange={(e) => updateFilter('passengers', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#00b4d8] transition-colors"
              >
                {CAPACITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amenidades */}
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Incluso
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'marinheiro', label: '👨‍✈️ Marinheiro' },
                  { key: 'churrasqueira', label: '🔥 Churrasqueira' },
                  { key: 'banheiro', label: '🚽 Banheiro' },
                  { key: 'som', label: '🔊 Som' },
                  { key: 'wifi', label: '📶 Wi-Fi' },
                ].map((amenity) => {
                  const active = searchParams.get(amenity.key) === 'true'
                  return (
                    <button
                      key={amenity.key}
                      onClick={() => updateFilter(amenity.key, active ? '' : 'true')}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        active
                          ? 'bg-[#0a2540] text-white border-[#0a2540]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      )}
                    >
                      {amenity.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
