'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { Heart, Anchor, Star, Users, ChevronRight, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// Mock — será substituído por query real
const MOCK_FAVORITOS = [
  {
    id: 'f1',
    boat: {
      id: '1', slug: 'focker-310', name: 'Focker 310', category: 'Lancha',
      capacity: 10, base_price: 800, avg_rating: 4.9, total_reviews: 24,
      image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=800',
      marina: 'Marina Pier 98',
    }
  },
  {
    id: 'f2',
    boat: {
      id: '2', slug: 'intermarine-480', name: 'Intermarine 480', category: 'Lancha Cabinada',
      capacity: 12, base_price: 1200, avg_rating: 4.8, total_reviews: 18,
      image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800',
      marina: 'Marina Pier 98',
    }
  },
]

export default function FavoritosPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [favoritos, setFavoritos] = useState(MOCK_FAVORITOS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  function removeFavorito(id: string) {
    setFavoritos(prev => prev.filter(f => f.id !== id))
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] pt-20">
          <div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Favoritos</h1>
            <p className="text-gray-400 mt-1">
              {favoritos.length > 0
                ? `${favoritos.length} embarcaç${favoritos.length > 1 ? 'ões salvas' : 'ão salva'}`
                : 'Nenhuma embarcação salva ainda'}
            </p>
          </div>

          {!user && (
            <div className="bg-[#00b4d8]/10 border border-[#00b4d8]/30 rounded-2xl p-5 mb-6 flex items-center gap-4">
              <Heart className="w-8 h-8 text-[#00b4d8] flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#0a2540]">Entre para salvar favoritos</p>
                <p className="text-sm text-gray-500">Crie uma conta e guarde suas embarcações preferidas.</p>
              </div>
              <Link href="/login" className="ml-auto px-4 py-2 bg-[#0a2540] text-white text-sm font-semibold rounded-xl hover:bg-[#0d3060] transition-colors whitespace-nowrap">
                Entrar
              </Link>
            </div>
          )}

          {favoritos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-300" />
              </div>
              <h3 className="font-semibold text-[#0a2540] mb-2">Nenhum favorito ainda</h3>
              <p className="text-gray-400 text-sm mb-6">Explore nossas embarcações e salve as que mais gostar.</p>
              <Link
                href="/embarcacoes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a2540] text-white font-semibold rounded-xl hover:bg-[#0d3060] transition-colors"
              >
                Explorar embarcações
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {favoritos.map((fav, i) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    {/* Imagem */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={fav.boat.image}
                        alt={fav.boat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                      {/* Botão remover */}
                      <button
                        onClick={() => removeFavorito(fav.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors group/btn"
                        title="Remover dos favoritos"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500 group-hover/btn:scale-110 transition-transform" />
                      </button>

                      {/* Rating */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {fav.boat.avg_rating} ({fav.boat.total_reviews})
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-[#0a2540]">{fav.boat.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{fav.boat.category}</span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                        <Anchor className="w-3 h-3" />
                        {fav.boat.marina}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400">a partir de</p>
                          <p className="font-bold text-[#0a2540]">{formatCurrency(fav.boat.base_price)}</p>
                        </div>
                        <Link
                          href={`/embarcacoes/${fav.boat.slug}`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#0a2540] text-white text-sm font-semibold rounded-xl hover:bg-[#0d3060] transition-colors"
                        >
                          Ver
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
