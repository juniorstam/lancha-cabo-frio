'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { Heart, Anchor, Users, MapPin, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function FavoritosPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [favoritos, setFavoritos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      if (data.user) fetchFavoritos(data.user.id)
      else setLoading(false)
    })
  }, [])

  async function fetchFavoritos(userId: string) {
    const { data } = await supabase
      .from('favorites')
      .select(`
        id, boat_id,
        boats (
          id, name, slug, category, capacity, base_price,
          boat_photos ( url, "order" ),
          marinas ( name )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setFavoritos(data ?? [])
    setLoading(false)
  }

  async function removeFavorito(boatId: string) {
    if (!user) return
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('boat_id', boatId)
    setFavoritos(prev => prev.filter(f => f.boat_id !== boatId))
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8fafc] pt-20">

        {/* Hero */}
        <div className="bg-[#0a2540] pt-16 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-red-400 fill-red-400" />
            </div>
            <h1 className="font-playfair text-4xl font-bold mb-2">Meus Favoritos</h1>
            <p className="text-white/60">Embarcações que você salvou para reservar depois</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Não logado */}
          {!user && !loading && (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h2 className="font-playfair text-2xl font-bold text-[#0a2540] mb-2">Entre para ver seus favoritos</h2>
              <p className="text-gray-400 mb-6">Faça login para salvar e acessar suas embarcações favoritas.</p>
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a2540] text-white font-semibold rounded-full hover:bg-[#0d3060] transition-colors">
                Entrar agora
              </Link>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Sem favoritos */}
          {!loading && user && favoritos.length === 0 && (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h2 className="font-playfair text-2xl font-bold text-[#0a2540] mb-2">Nenhum favorito ainda</h2>
              <p className="text-gray-400 mb-6">Clique no ❤️ em qualquer embarcação para salvar aqui.</p>
              <Link href="/embarcacoes" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00b4d8] text-white font-semibold rounded-full hover:bg-[#0096b7] transition-colors">
                <Anchor className="w-4 h-4" />
                Ver embarcações
              </Link>
            </div>
          )}

          {/* Lista */}
          {!loading && favoritos.length > 0 && (
            <>
              <p className="text-gray-400 text-sm mb-6">
                {favoritos.length} {favoritos.length === 1 ? 'embarcação salva' : 'embarcações salvas'}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritos.map(fav => {
                  const boat = fav.boats as any
                  if (!boat) return null
                  const photos = (boat.boat_photos as any[] ?? []).sort((a: any, b: any) => a.order - b.order)
                  const photo = photos[0]?.url ?? 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=600'
                  const marina = boat.marinas as any
                  return (
                    <div key={fav.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                      <div className="relative h-48 overflow-hidden">
                        <img src={photo} alt={boat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <button
                          onClick={() => removeFavorito(boat.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                          title="Remover dos favoritos"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#0a2540] text-base mb-1">{boat.name}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                          <MapPin className="w-3 h-3" />{marina?.name ?? 'Cabo Frio'}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{boat.capacity} pax</span>
                          <span className="capitalize text-gray-400">{boat.category}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400">a partir de</p>
                            <p className="font-bold text-[#0a2540]">{formatCurrency(Number(boat.base_price))}</p>
                          </div>
                          <Link href={`/embarcacoes/${boat.slug}`} className="flex items-center gap-1 px-4 py-2 bg-[#0a2540] text-white text-sm font-semibold rounded-xl hover:bg-[#0d3060] transition-colors">
                            Reservar <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
