import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, Calendar, DollarSign, Anchor, Star, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  pending:   { label: 'Pendente',   icon: Clock,        class: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelado',  icon: XCircle,      class: 'bg-red-100 text-red-700' },
  completed: { label: 'Concluído',  icon: CheckCircle,  class: 'bg-blue-100 text-blue-700' },
}

export default async function PainelPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role === 'client') redirect('/')

  // Barcos do owner
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, slug, active, boat_photos(url, "order")')
    .eq('owner_id', profile.id)

  const boatIds = (boats ?? []).map(b => b.id)

  // Mês atual
  const now      = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  const today    = now.toISOString().split('T')[0]

  const [{ data: allBookings }, { data: upcomingBookings }] = await Promise.all([
    // Todas deste mês (para stats)
    boatIds.length > 0
      ? supabase
          .from('bookings')
          .select('total_amount, platform_fee, status')
          .in('boat_id', boatIds)
          .gte('date', firstDay)
          .lte('date', lastDay)
      : Promise.resolve({ data: [] }),

    // Próximas reservas (a partir de hoje)
    boatIds.length > 0
      ? supabase
          .from('bookings')
          .select(`
            id, booking_code, date, passenger_count, total_amount, platform_fee, status,
            boats ( name ),
            routes ( name ),
            client:profiles!client_id ( full_name )
          `)
          .in('boat_id', boatIds)
          .gte('date', today)
          .neq('status', 'cancelled')
          .order('date', { ascending: true })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ])

  const bookingsMonth = allBookings ?? []
  const upcoming = upcomingBookings ?? []

  const receitaBruta   = bookingsMonth.filter(b => b.status !== 'cancelled').reduce((s, b) => s + Number(b.total_amount), 0)
  const totalTaxas     = bookingsMonth.filter(b => b.status !== 'cancelled').reduce((s, b) => s + Number(b.platform_fee), 0)
  const liquido        = receitaBruta - totalTaxas
  const reservasConfirmadas = bookingsMonth.filter(b => b.status === 'confirmed').length

  const firstName = (profile.full_name ?? user.email?.split('@')[0] ?? 'Olá').split(' ')[0]
  const mesLabel  = now.toLocaleDateString('pt-BR', { month: 'long' })

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-gray-500 mt-1">Aqui está o resumo do seu negócio em {mesLabel}.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: `Receita líquida (${mesLabel})`, value: formatCurrency(liquido), icon: DollarSign, color: 'bg-green-50 text-green-600' },
              { label: `Reservas confirmadas`, value: String(reservasConfirmadas), icon: Calendar, color: 'bg-blue-50 text-blue-600' },
              { label: 'Próximas reservas', value: String(upcoming.length), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
              { label: 'Embarcações ativas', value: String((boats ?? []).filter(b => b.active).length), icon: Anchor, color: 'bg-cyan-50 text-cyan-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[#0a2540]">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Próximas reservas */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-semibold text-[#0a2540] text-lg">Próximas reservas</h2>
                <Link href="/painel/reservas" className="text-sm text-[#00b4d8] font-semibold hover:underline">
                  Ver todas
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Anchor className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">Nenhuma reserva futura</p>
                  <p className="text-sm opacity-70">As próximas reservas aparecerão aqui.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {upcoming.map(booking => {
                    const s = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                    const client = booking.client as any
                    const route  = booking.routes as any
                    const boat   = booking.boats as any
                    const ownerReceives = Number(booking.total_amount) - Number(booking.platform_fee)
                    return (
                      <div key={booking.id} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="w-10 h-10 bg-[#0a2540]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Anchor className="w-5 h-5 text-[#0a2540]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-[#0a2540] text-sm truncate">
                              {client?.full_name ?? '—'}
                            </p>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.class}`}>
                              <s.icon className="w-3 h-3" />
                              {s.label}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            {route?.name ?? '—'} · {booking.passenger_count} pax · {boat?.name}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-green-600 text-sm">{formatCurrency(ownerReceives)}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Coluna direita */}
            <div className="space-y-6">

              {/* Minhas embarcações */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#0a2540]">Embarcações</h2>
                  <Link href="/painel/embarcacoes/nova" className="text-xs bg-[#0a2540] text-white px-3 py-1.5 rounded-full hover:bg-[#0d3060] transition-colors">
                    + Adicionar
                  </Link>
                </div>
                <div className="space-y-3">
                  {(boats ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhuma embarcação ainda</p>
                  ) : (
                    (boats ?? []).map(boat => (
                      <Link key={boat.id} href={`/embarcacoes/${boat.slug}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-[#00b4d8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Anchor className="w-5 h-5 text-[#00b4d8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#0a2540] text-sm truncate">{boat.name}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${boat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {boat.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </Link>
                    ))
                  )}
                  <Link href="/painel/embarcacoes/nova"
                    className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors text-sm">
                    + Nova embarcação
                  </Link>
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-[#0a2540] mb-4">Ações rápidas</h2>
                <div className="space-y-1">
                  {[
                    { label: '📅 Agenda', href: '/painel/agenda' },
                    { label: '🚤 Embarcações', href: '/painel/embarcacoes' },
                    { label: '📋 Reservas', href: '/painel/reservas' },
                    { label: '💰 Financeiro', href: '/painel/financeiro' },
                  ].map(action => (
                    <Link key={action.href} href={action.href}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 hover:text-[#0a2540] transition-colors">
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
