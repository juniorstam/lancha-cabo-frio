import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, DollarSign, ChevronLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

export default async function FinanceiroPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role === 'client') redirect('/')

  // Barcos do owner
  const { data: boats } = await supabase
    .from('boats')
    .select('id')
    .eq('owner_id', profile.id)

  const boatIds = (boats ?? []).map(b => b.id)

  // Todas as reservas não canceladas
  const { data: allBookings } = boatIds.length > 0
    ? await supabase
        .from('bookings')
        .select('boat_id, date, total_amount, platform_fee, status, booking_code, routes(name), client:profiles!client_id(full_name)')
        .in('boat_id', boatIds)
        .neq('status', 'cancelled')
        .order('date', { ascending: false })
    : { data: [] }

  const bookings = allBookings ?? []

  // Mês atual
  const now = new Date()
  const thisMonth = now.toISOString().slice(0, 7) // "YYYY-MM"

  const bookingsThisMonth = bookings.filter(b => b.date.startsWith(thisMonth))

  const receitaBruta   = bookingsThisMonth.reduce((s, b) => s + Number(b.total_amount), 0)
  const totalTaxas     = bookingsThisMonth.reduce((s, b) => s + Number(b.platform_fee), 0)
  const liquido        = receitaBruta - totalTaxas
  const totalAllTime   = bookings.reduce((s, b) => s + (Number(b.total_amount) - Number(b.platform_fee)), 0)

  // Dados para o gráfico: últimos 6 meses
  const meses: { mes: string; label: string; receita: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    const receita = bookings
      .filter(b => b.date.startsWith(key))
      .reduce((s, b) => s + (Number(b.total_amount) - Number(b.platform_fee)), 0)
    meses.push({ mes: key, label, receita })
  }

  const maxReceita = Math.max(...meses.map(m => m.receita), 1)

  // Últimas 8 transações
  const ultimas = bookings.slice(0, 8)

  const mesLabel = now.toLocaleDateString('pt-BR', { month: 'long' })

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/painel" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0a2540]">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Financeiro</h1>
              <p className="text-gray-400 text-sm mt-0.5">Resumo de receitas e movimentações</p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: `Receita bruta (${mesLabel})`, value: formatCurrency(receitaBruta), icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
              { label: `Taxas plataforma (${mesLabel})`, value: formatCurrency(totalTaxas), icon: DollarSign, color: 'bg-red-50 text-red-500' },
              { label: `Líquido (${mesLabel})`, value: formatCurrency(liquido), icon: DollarSign, color: 'bg-green-50 text-green-600' },
              { label: 'Total acumulado', value: formatCurrency(totalAllTime), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[#0a2540]">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* Gráfico: últimos 6 meses */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-6">Líquido por mês</h2>
              {totalAllTime === 0 ? (
                <div className="h-32 flex items-center justify-center text-gray-300 text-sm">
                  Nenhuma receita ainda
                </div>
              ) : (
                <div className="flex items-end gap-3 h-32">
                  {meses.map(m => (
                    <div key={m.mes} className="flex-1 flex flex-col items-center gap-1.5">
                      {m.receita > 0 && (
                        <span className="text-[10px] font-bold text-[#0a2540]">
                          {formatCurrency(m.receita).replace('R$ ', '')}
                        </span>
                      )}
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#0a2540] to-[#00b4d8] transition-all min-h-[4px]"
                        style={{ height: `${Math.max(4, (m.receita / maxReceita) * 96)}px` }}
                      />
                      <span className="text-xs text-gray-400 capitalize">{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Últimas transações */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-4">Últimas reservas</h2>
              {ultimas.length === 0 ? (
                <div className="py-8 text-center text-gray-300 text-sm">Nenhuma reserva ainda</div>
              ) : (
                <div className="space-y-3">
                  {ultimas.map(b => {
                    const ownerReceives = Number(b.total_amount) - Number(b.platform_fee)
                    const client = b.client as any
                    const route = b.routes as any
                    return (
                      <div key={b.booking_code} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#0a2540] font-medium truncate">
                            {client?.full_name ?? 'Cliente'} — {route?.name ?? 'Roteiro'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR')} · {b.booking_code}
                          </p>
                        </div>
                        <span className="font-bold text-sm flex-shrink-0 text-green-600">
                          +{formatCurrency(ownerReceives)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
