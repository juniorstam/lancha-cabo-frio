'use client'

import { useRouter, usePathname } from 'next/navigation'

const FILTROS = [
  { label: 'Todas',       value: '' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'Pendentes',   value: 'pending' },
  { label: 'Concluídas',  value: 'completed' },
  { label: 'Canceladas',  value: 'cancelled' },
]

export function PainelReservasFiltro({ atual }: { atual?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const setFiltro = (value: string) => {
    const params = new URLSearchParams()
    if (value) params.set('status', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {FILTROS.map(f => (
        <button
          key={f.value}
          onClick={() => setFiltro(f.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            (atual ?? '') === f.value
              ? 'bg-[#0a2540] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
