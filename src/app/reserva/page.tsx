'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  Calendar, Users, MapPin, Anchor, Shield, CheckCircle,
  ChevronLeft, ChevronRight, Clock, AlertCircle, CreditCard, Smartphone
} from 'lucide-react'
import { motion } from 'framer-motion'

// Mock boat data — será substituído por query real
const MOCK_BOAT = {
  id: '1', name: 'Focker 310', slug: 'focker-310',
  marina: 'Marina Pier 98 — Av. Julia Kubitscheck, 98, Braga, Cabo Frio',
  image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=800',
  routes: [
    { id: 'r1', name: 'Ilha do Japonês', duration_hours: 4, base_price: 800, base_passengers: 4, price_per_extra: 50, max_passengers: 10 },
    { id: 'r2', name: 'Praia das Conchas', duration_hours: 3, base_price: 600, base_passengers: 4, price_per_extra: 40, max_passengers: 10 },
    { id: 'r3', name: 'Arraial do Cabo', duration_hours: 8, base_price: 1200, base_passengers: 6, price_per_extra: 80, max_passengers: 10 },
  ],
}

const HOLIDAYS_MD: Array<[number, number]> = [
  [1,1],[4,21],[5,1],[9,7],[10,12],[11,2],[11,15],[12,24],[12,25],[12,31]
]
function isWeekend(d: string) { const [y,m,day] = d.split('-').map(Number); const dt = new Date(y,m-1,day); return dt.getDay()===0||dt.getDay()===6 }
function isHoliday(d: string) { const [,m,day] = d.split('-').map(Number); return HOLIDAYS_MD.some(([hm,hd])=>hm===m&&hd===day) }

const PLATFORM_FEE = 0.10

function ReservaContent() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const boatId   = params.get('boat') || '1'
  const dateParam = params.get('date') || ''
  const paxParam  = parseInt(params.get('passengers') || '2')
  const routeParam = params.get('route') || MOCK_BOAT.routes[0].id

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<1|2|3>(1)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingCode, setBookingCode] = useState('')

  const route = MOCK_BOAT.routes.find(r => r.id === routeParam) ?? MOCK_BOAT.routes[0]
  const weekend = isWeekend(dateParam)
  const holiday = isHoliday(dateParam)
  const multiplier = holiday ? 1.5 : weekend ? 1.3 : 1.0
  const seasonLabel = holiday ? '🎉 Feriado (+50%)' : weekend ? '📅 Fim de semana (+30%)' : null

  const extraPax    = Math.max(0, paxParam - route.base_passengers)
  const extraCost   = extraPax * route.price_per_extra
  const subtotalBase = route.base_price + extraCost
  const subtotal    = Math.round(subtotalBase * multiplier * 100) / 100
  const platformFee = Math.round(subtotal * PLATFORM_FEE * 100) / 100
  const total       = subtotal + platformFee

  const dateFormatted = dateParam
    ? new Date(dateParam + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push(`/login?redirect=/reserva?${params.toString()}`)
        return
      }
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  async function handleConfirm() {
    setSubmitting(true)
    // Aqui virá a integração com Mercado Pago / Supabase
    // Por ora, simula sucesso após 1.5s
    await new Promise(r => setTimeout(r, 1500))
    setBookingCode('LCF-2026-' + Math.floor(Math.random() * 900 + 100))
    setStep(3)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] pt-20">
        <div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Step 3 — Confirmação
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-[#0a2540] mb-2">Reserva confirmada!</h2>
          <p className="text-gray-500 mb-1 text-sm">Código da reserva</p>
          <p className="text-2xl font-bold text-[#00b4d8] mb-6">{bookingCode}</p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Passeio</span><span className="font-medium text-[#0a2540]">{route.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Data</span><span className="font-medium text-[#0a2540] capitalize">{dateFormatted}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Passageiros</span><span className="font-medium text-[#0a2540]">{paxParam}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold text-[#0a2540]">Total</span><span className="font-bold text-[#0a2540]">{formatCurrency(total)}</span></div>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Enviamos os detalhes para <strong>{user?.email}</strong>. O proprietário entrará em contato para confirmar o pagamento.
          </p>

          <div className="space-y-3">
            <Link href="/reservas" className="block w-full py-3 bg-[#0a2540] text-white font-bold rounded-xl hover:bg-[#0d3060] transition-colors">
              Ver minhas reservas
            </Link>
            <Link href="/embarcacoes" className="block w-full py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Fazer nova reserva
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb / Steps */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href={`/embarcacoes/${MOCK_BOAT.slug}`} className="hover:text-[#0a2540] transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> {MOCK_BOAT.name}
          </Link>
          <span>/</span>
          <span className={step >= 1 ? 'text-[#0a2540] font-medium' : ''}>Resumo</span>
          <span>/</span>
          <span className={step >= 2 ? 'text-[#0a2540] font-medium' : ''}>Pagamento</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4">

            {/* Step 1 — Revisão */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-semibold text-[#0a2540] text-xl mb-5">Revise sua reserva</h2>

                  {/* Boat */}
                  <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                    <img src={MOCK_BOAT.image} alt={MOCK_BOAT.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Embarcação</p>
                      <p className="font-semibold text-[#0a2540] text-lg">{MOCK_BOAT.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#00b4d8]" />
                        {MOCK_BOAT.marina}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Roteiro</p>
                      <p className="font-semibold text-[#0a2540]">{route.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {route.duration_hours}h de passeio
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Data</p>
                      <p className="font-semibold text-[#0a2540] capitalize text-sm">{dateFormatted}</p>
                      {seasonLabel && <p className="text-xs text-amber-600 font-medium mt-1">{seasonLabel}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Passageiros</p>
                      <p className="font-semibold text-[#0a2540]">{paxParam} pessoa{paxParam > 1 ? 's' : ''}</p>
                      {extraPax > 0 && <p className="text-xs text-gray-400 mt-1">{extraPax} extra{extraPax > 1 ? 's' : ''} × {formatCurrency(route.price_per_extra)}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Saída</p>
                      <p className="font-semibold text-[#0a2540] text-sm">Marina Pier 98</p>
                      <p className="text-xs text-gray-400 mt-1">Braga, Cabo Frio</p>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Alguma necessidade especial? Aniversário, restrição alimentar, etc."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00b4d8] transition-colors resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-[#0a2540] hover:bg-[#0d3060] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group mt-4"
                >
                  Ir para pagamento
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* Step 2 — Pagamento */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0a2540] transition-colors mb-4"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar ao resumo
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-semibold text-[#0a2540] text-xl mb-2">Forma de pagamento</h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Escolha como prefere pagar. O pagamento é processado com segurança via Mercado Pago.
                  </p>

                  {/* Opções de pagamento (visual apenas — MP será integrado) */}
                  <div className="space-y-3 mb-6">
                    {[
                      { icon: CreditCard, label: 'Cartão de crédito', desc: 'Até 12x sem juros', active: true },
                      { icon: Smartphone, label: 'Pix', desc: 'Pagamento instantâneo', active: false },
                    ].map((option) => (
                      <div
                        key={option.label}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          option.active ? 'border-[#0a2540] bg-[#0a2540]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${option.active ? 'bg-[#0a2540]' : 'bg-gray-100'}`}>
                          <option.icon className={`w-5 h-5 ${option.active ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#0a2540] text-sm">{option.label}</p>
                          <p className="text-xs text-gray-400">{option.desc}</p>
                        </div>
                        {option.active && (
                          <div className="ml-auto w-5 h-5 rounded-full bg-[#0a2540] flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Aviso integração */}
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      <strong>Em breve:</strong> integração com Mercado Pago. Por enquanto, ao confirmar a reserva o proprietário entrará em contato para combinar o pagamento.
                    </p>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full py-4 bg-[#0a2540] hover:bg-[#0d3060] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <>Confirmar reserva · {formatCurrency(total)}</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar — Resumo de valores */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-28">
              <h3 className="font-semibold text-[#0a2540] mb-4">Resumo do valor</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passeio base <span className="text-xs text-gray-400">({route.base_passengers} pax inc.)</span></span>
                  <span className="font-medium">{formatCurrency(route.base_price)}</span>
                </div>
                {extraPax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{extraPax} pax extra × {formatCurrency(route.price_per_extra)}</span>
                    <span className="font-medium">{formatCurrency(extraCost)}</span>
                  </div>
                )}
                {multiplier > 1 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>{holiday ? 'Feriado' : 'Fim de semana'} ×{multiplier.toFixed(1)}</span>
                    <span>+{formatCurrency(subtotal - subtotalBase)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de reserva <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">10%</span></span>
                  <span className="font-medium">{formatCurrency(platformFee)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                  <span className="font-bold text-[#0a2540]">Total</span>
                  <span className="font-bold text-[#0a2540] text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5 text-green-500" />
                  Reserva segura e protegida
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Cancelamento gratuito em 24h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReservaPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] pt-20">
          <div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ReservaContent />
      </Suspense>
    </>
  )
}
