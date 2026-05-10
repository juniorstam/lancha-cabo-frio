'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MapPin, Clock, ChevronRight, Shield } from 'lucide-react'
import { formatCurrency, calculatePlatformFee } from '@/lib/utils'
import { PLATFORM_FEE_PERCENT } from '@/constants'

interface Route {
  id: string
  name: string
  duration_hours: number
  price_override?: number
}

interface BookingWidgetProps {
  boatId: string
  boatName: string
  basePrice: number
  pricePerExtraPerson: number
  capacity: number
  routes: Route[]
  marina: string
}

export function BookingWidget({
  boatId,
  boatName,
  basePrice,
  pricePerExtraPerson,
  capacity,
  routes,
  marina,
}: BookingWidgetProps) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState(2)
  const [selectedRoute, setSelectedRoute] = useState(routes[0]?.id || '')

  const selectedRouteData = routes.find(r => r.id === selectedRoute)
  const routePrice = selectedRouteData?.price_override || basePrice
  const extraPassengers = Math.max(0, passengers - capacity)
  const extrasTotal = extraPassengers * pricePerExtraPerson
  const subtotal = routePrice + extrasTotal
  const platformFee = calculatePlatformFee(subtotal, PLATFORM_FEE_PERCENT)
  const total = subtotal + platformFee

  const handleReserve = () => {
    if (!date) {
      alert('Selecione uma data para continuar.')
      return
    }
    const params = new URLSearchParams({
      boat: boatId,
      date,
      passengers: String(passengers),
      route: selectedRoute,
    })
    router.push(`/reserva?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-28">

      {/* Preço */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm">a partir de</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-[#0a2540]">{formatCurrency(basePrice)}</span>
          <span className="text-gray-400 text-sm mb-1">/ passeio</span>
        </div>
      </div>

      {/* Campos */}
      <div className="space-y-3 mb-5">

        {/* Data */}
        <div className="border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#00b4d8] transition-colors">
          <label className="text-xs font-semibold text-gray-500 block mb-1">DATA DO PASSEIO</label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00b4d8]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 text-sm text-gray-800 outline-none cursor-pointer"
            />
          </div>
        </div>

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
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#0a2540] transition-colors text-gray-600 font-bold"
              >−</button>
              <span className="w-5 text-center text-sm font-semibold">{passengers}</span>
              <button
                onClick={() => setPassengers(Math.min(capacity + 5, passengers + 1))}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#0a2540] transition-colors text-gray-600 font-bold"
              >+</button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Capacidade máxima: {capacity} pessoas</p>
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
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name} • {route.duration_hours}h
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Resumo de valores */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Passeio base</span>
          <span className="font-medium">{formatCurrency(routePrice)}</span>
        </div>
        {extraPassengers > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{extraPassengers} passageiro{extraPassengers > 1 ? 's' : ''} extra</span>
            <span className="font-medium">{formatCurrency(extrasTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            Taxa de reserva
            <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">10%</span>
          </span>
          <span className="font-medium">{formatCurrency(platformFee)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2.5 flex justify-between">
          <span className="font-semibold text-[#0a2540]">Total da reserva</span>
          <span className="font-bold text-[#0a2540] text-lg">{formatCurrency(total)}</span>
        </div>
        <p className="text-xs text-gray-400">
          * O restante ({formatCurrency(subtotal - platformFee)}) é pago diretamente ao proprietário.
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
        <span>Reserva segura • Cancele grátis em 24h</span>
      </div>

      {/* Marina */}
      <div className="flex items-center gap-2 justify-center mt-3 text-gray-400 text-xs">
        <MapPin className="w-3.5 h-3.5" />
        <span>Saída: {marina}</span>
      </div>
    </div>
  )
}
