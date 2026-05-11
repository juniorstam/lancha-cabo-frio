'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Users, MapPin, Shield, ChevronRight, Sun, AlertCircle } from 'lucide-react'
import { formatCurrency, calculatePlatformFee } from '@/lib/utils'
import { PLATFORM_FEE_PERCENT } from '@/constants'
import { DatePicker } from '@/components/ui/DatePicker'

interface Route {
  id: string
  name: string
  duration_hours: number
  base_price: number           // preço para até base_passengers pessoas
  base_passengers: number      // qtd de passageiros inclusos no preço base
  price_per_extra: number      // valor por passageiro adicional
  max_passengers?: number      // limite desta rota (se diferente da capacidade da lancha)
  price_override?: number      // compatibilidade com dados antigos
}

interface BookingWidgetProps {
  boatId: string
  boatName: string
  capacity: number
  routes: Route[]
  marina: string
  preselectedRoute?: string    // slug ou id do roteiro pré-selecionado
}

// Feriados nacionais brasileiros recorrentes (mês/dia)
const HOLIDAYS_MD: Array<[number, number]> = [
  [1, 1],   // Confraternização Universal
  [4, 21],  // Tiradentes
  [5, 1],   // Dia do Trabalho
  [9, 7],   // Independência
  [10, 12], // Nossa Sra. Aparecida
  [11, 2],  // Finados
  [11, 15], // Proclamação da República
  [12, 24], // Véspera de Natal
  [12, 25], // Natal
  [12, 31], // Véspera de Ano Novo
]

function isWeekend(dateStr: string): boolean {
  if (!dateStr) return false
  // Usar UTC para evitar problemas de fuso
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dow = date.getDay()
  return dow === 0 || dow === 6
}

function isHoliday(dateStr: string): boolean {
  if (!dateStr) return false
  const [, m, d] = dateStr.split('-').map(Number)
  return HOLIDAYS_MD.some(([hm, hd]) => hm === m && hd === d)
}

export function BookingWidget({
  boatId,
  capacity,
  routes,
  marina,
  preselectedRoute,
}: BookingWidgetProps) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState(2)

  // Pré-selecionar rota por slug ou id
  const initialRoute = routes.find(r =>
    r.id === preselectedRoute ||
    r.name.toLowerCase().replace(/\s+/g, '-') === preselectedRoute
  )?.id || routes[0]?.id || ''

  const [selectedRoute, setSelectedRoute] = useState(initialRoute)

  const route = routes.find(r => r.id === selectedRoute)

  // Limites
  const maxPax = route?.max_passengers ?? capacity

  // Preço base da rota (suporte a legado com price_override)
  const basePrice = route?.base_price ?? route?.price_override ?? 0
  const basePax = route?.base_passengers ?? capacity
  const pricePerExtra = route?.price_per_extra ?? 0

  // Detecção de sazonalidade
  const weekend = isWeekend(date)
  const holiday = isHoliday(date)
  const seasonal = holiday || weekend
  const seasonalMultiplier = holiday ? 1.5 : weekend ? 1.3 : 1.0
  const seasonalLabel = holiday ? '🎉 Feriado (+50%)' : weekend ? '📅 Final de semana (+30%)' : null

  // Cálculo de preço
  const extraPax = Math.max(0, passengers - basePax)
  const extraCost = extraPax * pricePerExtra
  const subtotalBase = basePrice + extraCost
  const subtotal = Math.round(subtotalBase * seasonalMultiplier * 100) / 100
  const platformFee = calculatePlatformFee(subtotal, PLATFORM_FEE_PERCENT)
  const total = subtotal + platformFee

  const ownerReceives = subtotal - platformFee

  const handleReserve = () => {
    if (!date) {
      alert('Selecione uma data para continuar.')
      return
    }
    const p = new URLSearchParams({
      boat: boatId,
      date,
      passengers: String(passengers),
      route: selectedRoute,
    })
    router.push(`/reserva?${p.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-28">

      {/* Preço de partida */}
      <div className="mb-5">
        <p className="text-gray-400 text-xs uppercase tracking-wide">a partir de</p>
        <div className="flex items-end gap-2 mt-0.5">
          <span className="text-3xl font-bold text-[#0a2540]">{formatCurrency(basePrice)}</span>
          <span className="text-gray-400 text-sm mb-1">/ passeio</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">para até {basePax} passageiros</p>
      </div>

      {/* Campos */}
      <div className="space-y-3 mb-5">

        {/* Data */}
        <DatePicker
          value={date}
          onChange={setDate}
          min={today}
          seasonLabel={date ? seasonalLabel : null}
        />

        {/* Passageiros */}
        <div className="border border-gray-200 rounded-xl px-4 py-3">
          <label className="text-xs font-semibold text-gray-500 block mb-1">PASSAGEIROS</label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4 text-[#00b4d8]" />
              <span>{passengers} pessoa{passengers > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#0a2540] transition-colors text-gray-600 font-bold text-lg leading-none"
              >−</button>
              <span className="w-5 text-center text-sm font-semibold">{passengers}</span>
              <button
                onClick={() => setPassengers(Math.min(maxPax, passengers + 1))}
                disabled={passengers >= maxPax}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#0a2540] transition-colors text-gray-600 font-bold text-lg leading-none disabled:opacity-40 disabled:cursor-not-allowed"
              >+</button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-400">Máx: {maxPax} pessoas</p>
            {extraPax > 0 && (
              <p className="text-xs text-amber-600 font-medium">
                +{extraPax} pax extra · {formatCurrency(pricePerExtra)}/pax
              </p>
            )}
          </div>
          {passengers >= maxPax && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Limite máximo atingido
            </p>
          )}
        </div>

        {/* Roteiro */}
        {routes.length > 0 && (
          <div className="border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#00b4d8] transition-colors">
            <label className="text-xs font-semibold text-gray-500 block mb-1">ROTEIRO</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full text-sm text-gray-800 outline-none bg-transparent cursor-pointer"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.duration_hours}h · {formatCurrency(r.base_price)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Resumo de valores */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2.5">

        {/* Linha: passeio base */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Passeio base
            <span className="text-xs text-gray-400 ml-1">({basePax} pax inc.)</span>
          </span>
          <span className="font-medium">{formatCurrency(basePrice)}</span>
        </div>

        {/* Linha: extras */}
        {extraPax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {extraPax} passageiro{extraPax > 1 ? 's' : ''} extra
              <span className="text-xs text-gray-400 ml-1">× {formatCurrency(pricePerExtra)}</span>
            </span>
            <span className="font-medium">{formatCurrency(extraCost)}</span>
          </div>
        )}

        {/* Linha: multiplicador sazonal */}
        {date && seasonal && (
          <div className="flex justify-between text-sm">
            <span className="text-amber-600 font-medium">
              {holiday ? 'Feriado' : 'Final de semana'}
              <span className="ml-1">×{seasonalMultiplier.toFixed(1)}</span>
            </span>
            <span className="font-medium text-amber-600">
              +{formatCurrency(subtotal - subtotalBase)}
            </span>
          </div>
        )}

        {/* Linha: taxa */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            Taxa de reserva
            <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">10%</span>
          </span>
          <span className="font-medium">{formatCurrency(platformFee)}</span>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-2.5 flex justify-between">
          <span className="font-semibold text-[#0a2540]">Total da reserva</span>
          <span className="font-bold text-[#0a2540] text-lg">{formatCurrency(total)}</span>
        </div>

        <p className="text-xs text-gray-400">
          * O proprietário recebe {formatCurrency(ownerReceives)} após a taxa da plataforma.
        </p>
      </div>

      {/* Botão reservar */}
      <button
        onClick={handleReserve}
        className="w-full py-4 bg-[#0a2540] hover:bg-[#0d3060] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
      >
        Reservar agora
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Segurança */}
      <div className="flex items-center gap-2 justify-center mt-4 text-gray-400 text-xs">
        <Shield className="w-3.5 h-3.5" />
        <span>Reserva segura · Cancele grátis em 24h</span>
      </div>

      {/* Marina */}
      <div className="flex items-center gap-2 justify-center mt-2 text-gray-400 text-xs">
        <MapPin className="w-3.5 h-3.5" />
        <span>Saída: {marina}</span>
      </div>
    </div>
  )
}
