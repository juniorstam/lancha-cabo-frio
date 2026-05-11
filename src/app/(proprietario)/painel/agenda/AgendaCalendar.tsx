'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Anchor, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-green-500',
  pending:   'bg-yellow-400',
  completed: 'bg-blue-500',
}

interface Booking {
  id: string
  booking_code: string
  date: string
  passenger_count: number
  status: string
  route_name: string
  client_name: string
  boat_name: string
}

interface Props {
  year: number
  month: number
  bookings: Booking[]
}

export function AgendaCalendar({ year, month, bookings }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const [selected, setSelected] = useState<string | null>(null)

  // Navegação
  function navigate(offset: number) {
    const d = new Date(year, month - 1 + offset, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    router.push(`${pathname}?mes=${key}`)
  }

  // Células do calendário
  const firstDow    = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  // Indexar reservas por dia
  const byDay: Record<number, Booking[]> = {}
  bookings.forEach(b => {
    const day = parseInt(b.date.split('-')[2])
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(b)
  })

  const today = new Date()
  const isThisMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDay = isThisMonth ? today.getDate() : -1

  const selectedBookings = selected ? (byDay[parseInt(selected)] ?? []) : []

  return (
    <div className="space-y-4">

      {/* Cabeçalho do mês */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="font-playfair text-xl font-bold text-[#0a2540]">
              {MONTHS[month - 1]} {year}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{bookings.length} passeio{bookings.length !== 1 ? 's' : ''} no mês</p>
          </div>
          <button
            onClick={() => navigate(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />

            const hasBookings = !!(byDay[day]?.length)
            const isToday     = day === todayDay
            const isSelected  = selected === String(day)
            const dayStr      = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isPast      = new Date(dayStr + 'T23:59:59') < new Date()

            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : String(day))}
                className={cn(
                  'relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-sm font-medium transition-all',
                  isSelected ? 'bg-[#0a2540] text-white' : '',
                  !isSelected && hasBookings ? 'bg-[#00b4d8]/10 hover:bg-[#00b4d8]/20 text-[#0a2540]' : '',
                  !isSelected && !hasBookings && isToday ? 'ring-2 ring-[#00b4d8] text-[#0a2540]' : '',
                  !isSelected && !hasBookings && !isToday && !isPast ? 'hover:bg-gray-100 text-gray-700' : '',
                  !isSelected && isPast && !hasBookings ? 'text-gray-300' : '',
                )}
              >
                <span className="text-xs leading-none">{day}</span>

                {/* Bolinhas de reserva */}
                {hasBookings && !isSelected && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                    {byDay[day].slice(0, 3).map((b, idx) => (
                      <span key={idx} className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[b.status] ?? 'bg-gray-400'}`} />
                    ))}
                    {byDay[day].length > 3 && (
                      <span className="text-[9px] font-bold text-current opacity-70">+{byDay[day].length - 3}</span>
                    )}
                  </div>
                )}
                {isSelected && hasBookings && (
                  <span className="text-[10px] mt-0.5 text-white/80">{byDay[day].length}x</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Confirmado</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />Pendente</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Concluído</span>
        </div>
      </div>

      {/* Detalhes do dia selecionado */}
      {selected && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0a2540]">
              {parseInt(selected)} de {MONTHS[month - 1]}
            </h3>
            <button onClick={() => setSelected(null)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma reserva neste dia.</p>
          ) : (
            <div className="space-y-3">
              {selectedBookings.map(b => (
                <div key={b.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-[#0a2540]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Anchor className="w-4 h-4 text-[#0a2540]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#0a2540] text-sm">{b.client_name}</p>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                                                   'bg-blue-100 text-blue-700'
                      )}>
                        {b.status === 'confirmed' ? 'Confirmado' : b.status === 'pending' ? 'Pendente' : 'Concluído'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{b.route_name} · {b.boat_name}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      {b.passenger_count} passageiro{b.passenger_count > 1 ? 's' : ''}
                      <span className="ml-2 font-mono">{b.booking_code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista do mês se nenhum dia selecionado */}
      {!selected && bookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-[#0a2540] mb-4">Todos os passeios de {MONTHS[month - 1]}</h3>
          <div className="space-y-2">
            {bookings.map(b => {
              const day = parseInt(b.date.split('-')[2])
              return (
                <div key={b.id}
                  onClick={() => setSelected(String(day))}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-[#0a2540] rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                    <span className="text-xs font-bold leading-none">{String(day).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0a2540] text-sm truncate">{b.client_name}</p>
                    <p className="text-gray-400 text-xs">{b.route_name} · {b.boat_name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    {b.passenger_count}
                  </div>
                  <span className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    STATUS_COLOR[b.status] ?? 'bg-gray-300'
                  )} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!selected && bookings.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Anchor className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Nenhum passeio em {MONTHS[month - 1]}</p>
          <p className="text-gray-300 text-sm mt-1">Clique em um mês diferente ou aguarde novas reservas.</p>
        </div>
      )}
    </div>
  )
}
