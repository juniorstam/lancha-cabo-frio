'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Anchor, CalendarDays, BookOpen,
  DollarSign, Image, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard',    href: '/painel',               icon: LayoutDashboard, exact: true },
  { label: 'Embarcações',  href: '/painel/embarcacoes',   icon: Anchor },
  { label: 'Reservas',     href: '/painel/reservas',      icon: BookOpen },
  { label: 'Agenda',       href: '/painel/agenda',        icon: CalendarDays },
  { label: 'Financeiro',   href: '/painel/financeiro',    icon: DollarSign },
  { label: 'Mídias',       href: '/painel/midias',        icon: Image },
]

export function PainelSidebar() {
  const pathname = usePathname()

  function isActive(item: typeof NAV[0]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white border-r border-gray-100 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pb-2">Menu</p>
        {NAV.map(item => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#0a2540]'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-gray-400 group-hover:text-[#00b4d8]')} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
