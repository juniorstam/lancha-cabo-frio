'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Ruler, MapPin, Star, Heart, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { BOAT_CATEGORIES } from '@/constants'
import { createClient } from '@/lib/supabase/client'
import { FavoriteButton } from '@/components/ui/FavoriteButton'

interface FeaturedBoat {
  id: string
  name: string
  slug: string
  category: string
  capacity: number
  size_ft: number
  base_price: number
  cover_photo: string | null
  avg_rating: number | null
  total_reviews: number | null
  marina: { name: string } | null
}

export function FeaturedBoats() {
  const [boats, setBoats] = useState<FeaturedBoat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('boats_with_rating')
        .select(`
          id, name, slug, category, capacity, size_ft, base_price, cover_photo,
          avg_rating, total_reviews,
          boat_photos(url, "order"),
          marina:marinas(name)
        `)
        .eq('status', 'active')
        .order('avg_rating', { ascending: false })
        .limit(4)

      const normalized = (data as any[] ?? []).map(b => {
        let cover = b.cover_photo
        if (!cover && Array.isArray(b.boat_photos) && b.boat_photos.length > 0) {
          const sorted = [...b.boat_photos].sort((a: any, z: any) => a.order - z.order)
          cover = sorted[0].url
        }
        return { ...b, cover_photo: cover }
      })

      setBoats(normalized)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <section className="py-24 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#00b4d8] text-sm font-semibold uppercase tracking-widest"
            >
              Disponíveis agora
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-playfair text-4xl sm:text-5xl font-bold text-[#0a2540] mt-2"
            >
              Embarcações em destaque
            </motion.h2>
          </div>
          <Link
            href="/embarcacoes"
            className="flex items-center gap-2 text-[#00b4d8] font-semibold hover:gap-3 transition-all group"
          >
            Ver todas
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-5 bg-gray-100 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : boats.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">⚓</p>
            <p className="font-semibold text-lg">Nenhuma embarcação disponível ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {boats.map((boat, index) => (
              <motion.div
                key={boat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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

                      {/* Badge categoria */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-[#0a2540]/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                          {BOAT_CATEGORIES.find(c => c.value === boat.category)?.label || boat.category}
                        </span>
                      </div>

                      {/* Favorito */}
                      <FavoriteButton boatId={boat.id} className="absolute top-3 right-3" />
                    </div>

                    {/* Infos */}
                    <div className="p-4">
                      {/* Rating */}
                      {boat.avg_rating ? (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold text-gray-700">
                            {Number(boat.avg_rating).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-400">({boat.total_reviews})</span>
                        </div>
                      ) : null}

                      <h3 className="font-semibold text-[#0a2540] text-base mb-1">{boat.name}</h3>

                      {/* Marina / localização */}
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                        <MapPin className="w-3 h-3" />
                        {(boat.marina as any)?.name || 'Cabo Frio'}
                      </div>

                      {/* Capacidade e tamanho */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {boat.capacity} pax
                        </span>
                        {boat.size_ft ? (
                          <span className="flex items-center gap-1">
                            <Ruler className="w-3.5 h-3.5" />
                            {boat.size_ft} pés
                          </span>
                        ) : null}
                      </div>

                      {/* Preço */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-400">a partir de</p>
                          <p className="text-[#0a2540] font-bold text-lg leading-tight">
                            {formatCurrency(boat.base_price)}
                          </p>
                        </div>
                        <span className="text-xs px-3 py-1.5 bg-[#00b4d8]/10 text-[#00b4d8] font-semibold rounded-full group-hover:bg-[#00b4d8] group-hover:text-white transition-all">
                          Ver detalhes
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
