'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS   = ['D','S','T','Q','Q','S','S']

interface DatePickerProps {
  value: string          // 'YYYY-MM-DD'
  onChange: (date: string) => void
  min?: string           // 'YYYY-MM-DD'
  placeholder?: string
  seasonLabel?: string | null
}

export function DatePicker({ value, onChange, min, placeholder = 'Selecione uma data', seasonLabel }: DatePickerProps) {
  const today = min || new Date().toISOString().split('T')[0]
  const [open, setOpen] = useState(false)
  const ref  = useRef<HTMLDivElement>(null)

  const parsed   = value ? new Date(value + 'T12:00:00') : null
  const minDate  = new Date(today + 'T12:00:00')

  const [viewing, setViewing] = useState<{ year: number; month: number }>(() => {
    const d = parsed ?? new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // Fechar ao clicar fora
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function prevMonth() {
    setViewing(v => {
      const d = new Date(v.year, v.month - 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }
  function nextMonth() {
    setViewing(v => {
      const d = new Date(v.year, v.month + 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function getDays() {
    const firstDay = new Date(viewing.year, viewing.month, 1).getDay()
    const daysInMonth = new Date(viewing.year, viewing.month + 1, 0).getDate()
    const cells: (number | null)[] = Array(firstDay).fill(null)
    for (let i = 1; i <= daysInMonth; i++) cells.push(i)
    return cells
  }

  function selectDay(day: number) {
    const m = String(viewing.month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    const str = `${viewing.year}-${m}-${d}`
    onChange(str)
    setOpen(false)
  }

  function isDisabled(day: number) {
    const d = new Date(viewing.year, viewing.month, day)
    return d < minDate
  }

  function isSelected(day: number) {
    if (!parsed) return false
    return parsed.getFullYear() === viewing.year &&
           parsed.getMonth()    === viewing.month &&
           parsed.getDate()     === day
  }

  function isToday(day: number) {
    const t = new Date()
    return t.getFullYear() === viewing.year &&
           t.getMonth()    === viewing.month &&
           t.getDate()     === day
  }

  const displayValue = parsed
    ? parsed.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left"
      >
        <div className="border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#00b4d8] hover:border-gray-300 transition-colors">
          <p className="text-xs font-semibold text-gray-500 mb-1">DATA DO PASSEIO</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />
            {displayValue ? (
              <span className="text-sm text-gray-800 capitalize">{displayValue}</span>
            ) : (
              <span className="text-sm text-gray-400">{placeholder}</span>
            )}
          </div>
          {seasonLabel && (
            <p className="text-xs font-medium text-amber-600 mt-1.5">{seasonLabel}</p>
          )}
        </div>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 select-none">
          {/* Navegação mês */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[#0a2540] text-sm">
              {MONTHS[viewing.month]} {viewing.year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-y-1">
            {getDays().map((day, i) => {
              if (!day) return <div key={i} />

              const disabled = isDisabled(day)
              const selected = isSelected(day)
              const today    = isToday(day)

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={`
                    w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all
                    ${selected ? 'bg-[#0a2540] text-white shadow-sm' : ''}
                    ${!selected && today ? 'border-2 border-[#00b4d8] text-[#0a2540]' : ''}
                    ${!selected && !today && !disabled ? 'text-gray-700 hover:bg-gray-100' : ''}
                    ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
