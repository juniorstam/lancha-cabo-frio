'use client'

import Link from 'next/link'
import { Star, Users, Ruler, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { BOAT_CATEGORIES, AMENITIES_ICONS } from '@/constants'
import type { Boat } from '@/types'
import { cn } from '@/lib/utils'
import { FavoriteButton } from '@/components/ui/FavoriteButton'

interface BoatCardProps {
  boat: Boat & { avg_rating?: number; total_reviews?: number }
  index?: number
  variant?: 'default' | 'horizontal'
}

export function BoatCard({ boat, index = 0, variant = 'default' }: BoatCardProps) {
  const categoryLabel = BOAT_CATEGORIES.find(c => c.value === boat.category)?.label || boat.category
  const amenityIcons = Object.entries(boat.amenities || {})
    .filter(([, value]) => value === true)
    .slice(0, 4)
    .map(([key]) => AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS])

  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link href={`/embarcacoes/${boat.slug}`} className="group block">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex">
            {/* Foto */}
            <div className="relative w-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#0a2540] to-[#00b4d8]">
              {boat.cover_photo ? (
                <img
                  src={boat.cover_photo}
                  alt={boat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-5xl select-none">⚓</div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 bg-[#0a2540]/80 text-white text-xs font-semibold rounded-full">
                  {categoryLabel}
                </span>
              </div>
            </div>

            {/* Infos */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-[#0a2540] text-lg">{boat.name}</h3>
                  <FavoriteButton boatId={boat.id} size="sm" className="flex-shrink-0" />
                </div>

                <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                  <MapPin className="w-3 h-3" />
                  {(boat.marina as any)?.name || 'Cabo Frio'}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {amenityIcons.map((icon, i) => (
                    <span key={i} className="text-sm" title={icon}>{icon}</span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {boat.capacity} passageiros
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5" />
                    {boat.size_ft} pés
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  {boat.avg_rating ? (
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-gray-700">{boat.avg_rating}</span>
                      <span className="text-xs text-gray-400">({boat.total_reviews})</span>
                    </div>
                  ) : null}
                  <p className="text-xs text-gray-400">a partir de</p>
                  <p className="text-[#0a2540] font-bold text-xl">{formatCurrency(boat.base_price)}</p>
                </div>
                <span className="px-4 py-2 bg-[#0a2540] text-white text-sm font-semibold rounded-full group-hover:bg-[#00b4d8] transition-colors">
                  Ver detalhes
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Link href={`/embarcacoes/${boat.slug}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

          {/* Foto */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#0a2540] to-[#00b4d8]">
            {boat.cover_photo ? (
              <img
                src={boat.cover_photo}
                alt={boat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-7xl select-none">⚓</div>
            )}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-[#0a2540]/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                {categoryLabel}
              </span>
            </div>
            <FavoriteButton boatId={boat.id} className="absolute top-3 right-3" />

            {/* Amenidades sobrepostas */}
            {amenityIcons.length > 0 && (
              <div className="absolute bottom-3 left-3 flex gap-1">
                {amenityIcons.map((icon, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-xs shadow-sm"
                  >
                    {icon}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="p-4">
            {boat.avg_rating ? (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-gray-700">{boat.avg_rating}</span>
                <span className="text-xs text-gray-400">({boat.total_reviews})</span>
              </div>
            ) : null}

            <h3 className="font-semibold text-[#0a2540] text-base mb-1">{boat.name}</h3>

            <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
              <MapPin className="w-3 h-3" />
              {(boat.marina as any)?.name || 'Cabo Frio'}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {boat.capacity} pax
              </span>
              <span className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                {boat.size_ft} pés
              </span>
            </div>

            <div className="flex items-end justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">a partir de</p>
                <p className="text-[#0a2540] font-bold text-lg">{formatCurrency(boat.base_price)}</p>
              </div>
              <span className="text-xs px-3 py-1.5 bg-[#00b4d8]/10 text-[#00b4d8] font-semibold rounded-full group-hover:bg-[#00b4d8] group-hover:text-white transition-all">
                Ver detalhes
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
