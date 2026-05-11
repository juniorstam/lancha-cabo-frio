'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  min?: string
  placeholder?: string
  seasonLabel?: string | null
  /** 'default' = caixa com borda (BookingWidget) | 'hero' = trigger flat para search bar */
  variant?: 'default' | 'hero'
}

export function DatePicker({
  value,
  onChange,
  min,
  placeholder = 'Selecione uma data',
  seasonLabel,
  variant = 'default',
}: DatePickerProps) {
  const today = new Date().toISOString().split('T')[0]
  const minStr = min || today
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const parsed  = value ? new Date(value + 'T12:00:00') : null
  const minDate = new Date(minStr + 'T12:00:00')

  const [viewing, setViewing] = useState<{ year: number; month: number }>(() => {
    const d = parsed ?? new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

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

  function getDays(): (number | null)[] {
    const firstDay    = new Date(viewing.year, viewing.month, 1).getDay()
    const daysInMonth = new Date(viewing.year, viewing.month + 1, 0).getDate()
    const cells: (number | null)[] = Array(firstDay).fill(null)
    for (let i = 1; i <= daysInMonth; i++) cells.push(i)
    // Completar última linha
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  function selectDay(day: number) {
    const m   = String(viewing.month + 1).padStart(2, '0')
    const d   = String(day).padStart(2, '0')
    onChange(`${viewing.year}-${m}-${d}`)
    setOpen(false)
  }

  function isDisabled(day: number) {
    return new Date(viewing.year, viewing.month, day) < minDate
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

  const displayShort = parsed
    ? parsed.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const displayFull = parsed
    ? parsed.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : null

  // ── Popover ───────────────────────────────────────────────────────────────
  const popover = open && (
    <div className="absolute left-0 top-full mt-2 z-[200] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-80 select-none">

      {/* Navegação mês */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-[#0a2540] text-sm tracking-wide">
          {MONTHS[viewing.month]} {viewing.year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {getDays().map((day, i) => {
          if (!day) return <div key={i} />

          const disabled = isDisabled(day)
          const selected = isSelected(day)
          const todayDay = isToday(day)

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => selectDay(day)}
              className={cn(
                'relative w-9 h-9 mx-auto flex items-center justify-center rounded-full text-sm transition-all duration-100',
                selected && 'bg-[#0a2540] text-white font-semibold shadow-md',
                !selected && !disabled && 'hover:bg-gray-100 text-gray-800 cursor-pointer',
                !selected && todayDay && 'font-bold text-[#00b4d8]',
                disabled && 'text-gray-300 cursor-not-allowed line-through',
              )}
            >
              {day}
              {/* Ponto "hoje" quando não selecionado */}
              {todayDay && !selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00b4d8]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00b4d8] inline-block" /> Hoje
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#0a2540] inline-flex items-center justify-center text-white text-[9px]">✓</span> Selecionado
        </span>
      </div>
    </div>
  )

  // ── Variante HERO (search bar flat) ──────────────────────────────────────
  if (variant === 'hero') {
    return (
      <div className="relative flex-1" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full text-left"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Calendar className="w-5 h-5 text-[#00b4d8] flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Data</p>
              {displayShort ? (
                <p className="text-sm text-gray-800 font-medium capitalize">{displayShort}</p>
              ) : (
                <p className="text-sm text-gray-400">{placeholder || 'Escolha a data'}</p>
              )}
            </div>
          </div>
        </button>
        {popover}
      </div>
    )
  }

  // ── Variante DEFAULT (BookingWidget com borda) ────────────────────────────
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left"
      >
        <div className="border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 focus-within:border-[#00b4d8] transition-colors">
          <p className="text-xs font-semibold text-gray-500 mb-1">DATA DO PASSEIO</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />
            {displayFull ? (
              <span className="text-sm text-gray-800 capitalize">{displayFull}</span>
            ) : (
              <span className="text-sm text-gray-400">{placeholder}</span>
            )}
          </div>
          {seasonLabel && (
            <p className="text-xs font-medium text-amber-600 mt-1.5">{seasonLabel}</p>
          )}
        </div>
      </button>
      {popover}
    </div>
  )
}
