'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Calendar, Users, Anchor, Clock, CheckCircle, XCircle, ChevronRight, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', icon: CheckCircle, class: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  pending:   { label: 'Pendente',   icon: Clock,        class: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  cancelled: { label: 'Cancelado',  icon: XCircle,      class: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
  completed: { label: 'Concluído',  icon: CheckCircle,  class: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
}

export default function ReservasPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading]   = useState(true)
  const [reservas, setReservas] = useState<any[]>([])
  const [filter, setFilter]     = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) { setLoading(false); return }

      const { data } = await supabase
        .from('bookings')
        .select(`
          id, booking_code, date, passenger_count, total_amount, status, created_at,
          boat:boats(name, slug),
          route:routes(name)
        `)
        .eq('client_id', profile.id)
        .order('date', { ascending: false })

      setReservas(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const filtered = reservas.filter(r => {
    if (filter === 'upcoming') return r.date >= today && r.status !== 'cancelled'
    if (filter === 'past')     return r.date < today || r.status === 'completed' || r.status === 'cancelled'
    return true
  })

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
        <div className="max-w-3xl mx-auto px-4 py-10">

          <div className="mb-8">
            <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Minhas reservas</h1>
            <p className="text-gray-400 mt-1">Acompanhe e gerencie seus passeios</p>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-6">
            {(['all', 'upcoming', 'past'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f ? 'bg-[#0a2540] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {{ all: 'Todas', upcoming: 'Próximas', past: 'Passadas' }[f]}
              </button>
            ))}
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Anchor className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-[#0a2540] mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-gray-400 text-sm mb-6">Explore nossas embarcações e faça sua primeira reserva!</p>
              <Link href="/embarcacoes" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a2540] text-white font-semibold rounded-xl hover:bg-[#0d3060] transition-colors">
                Ver embarcações <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((reserva, i) => {
                const status = STATUS_CONFIG[reserva.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                const StatusIcon = status.icon
                const dateFormatted = new Date(reserva.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })

                return (
                  <motion.div
                    key={reserva.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0a2540]/5 rounded-xl flex items-center justify-center">
                          <Anchor className="w-5 h-5 text-[#0a2540]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#0a2540]">{(reserva.boat as any)?.name}</p>
                          <p className="text-xs text-gray-400">#{reserva.booking_code}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${status.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    <div className="px-5 pb-4 space-y-2">
                      <div className="h-px bg-gray-50" />
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />
                          <span className="truncate">{(reserva.route as any)?.name ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />
                          <span>{reserva.passenger_count} passageiro{reserva.passenger_count > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                          <Calendar className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />
                          <span className="capitalize">{dateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="font-bold text-[#0a2540]">{formatCurrency(reserva.total_amount)}</p>
                      </div>
                      <Link
                        href={`/embarcacoes/${(reserva.boat as any)?.slug || ''}`}
                        className="flex items-center gap-1.5 text-sm text-[#00b4d8] font-semibold hover:underline"
                      >
                        Ver embarcação <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/embarcacoes" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00b4d8] text-white font-semibold rounded-xl hover:bg-[#0096b7] transition-colors shadow-md">
              <Anchor className="w-4 h-4" /> Nova reserva
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
