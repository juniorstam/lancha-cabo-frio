'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Ruler, MapPin, Star, Heart, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { BOAT_CATEGORIES } from '@/constants'

// Dados mockados para exibição inicial (serão substituídos por dados reais do Supabase)
const MOCK_BOATS = [
  {
    id: '1',
    name: 'Focker 310',
    slug: 'focker-310',
    category: 'lancha',
    capacity: 10,
    size_ft: 22,
    base_price: 800,
    marina: 'Marina Pier 98',
    avg_rating: 4.9,
    total_reviews: 24,
    cover_photo: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Intermarine 480',
    slug: 'intermarine-480',
    category: 'lancha',
    capacity: 14,
    size_ft: 30,
    base_price: 1200,
    marina: 'Terminal Transatlântico',
    avg_rating: 5.0,
    total_reviews: 18,
    cover_photo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Armada 40',
    slug: 'armada-40',
    category: 'lancha',
    capacity: 12,
    size_ft: 23,
    base_price: 950,
    marina: 'Marina Pier 98',
    avg_rating: 4.8,
    total_reviews: 31,
    cover_photo: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'NHD 280 Cabinada',
    slug: 'nhd-280-cabinada',
    category: 'lancha',
    capacity: 11,
    size_ft: 28,
    base_price: 900,
    marina: 'Terminal Transatlântico',
    avg_rating: 4.7,
    total_reviews: 15,
    cover_photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
  },
]

export function FeaturedBoats() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_BOATS.map((boat, index) => (
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
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={boat.cover_photo}
                      alt={boat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge categoria */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-[#0a2540]/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                        {BOAT_CATEGORIES.find(c => c.value === boat.category)?.label || boat.category}
                      </span>
                    </div>
                    {/* Favorito */}
                    <button
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                    >
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Infos */}
                  <div className="p-4">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-gray-700">{boat.avg_rating}</span>
                      <span className="text-xs text-gray-400">({boat.total_reviews})</span>
                    </div>

                    <h3 className="font-semibold text-[#0a2540] text-base mb-1">{boat.name}</h3>

                    {/* Marina */}
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                      <MapPin className="w-3 h-3" />
                      {boat.marina}
                    </div>

                    {/* Capacidade e tamanho */}
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

                    {/* Preço */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400">a partir de</p>
                        <p className="text-[#0a2540] font-bold text-lg leading-tight">
                          {formatCurrency(boat.base_price)}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1.5 bg-[#00b4d8]/10 text-[#00b4d8] font-semibold rounded-full">
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
