import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { Users, Anchor, Calendar, DollarSign, TrendingUp, Shield, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Stats globais
  const [
    { count: totalUsers },
    { count: totalBoats },
    { count: totalBookings },
    { data: recentBookings },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('boats').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
    supabase.from('bookings')
      .select(`booking_code, date, total_amount, status, boats(name), client:profiles!client_id(full_name)`)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('profiles')
      .select('full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const { data: revenueData } = await supabase
    .from('bookings')
    .select('total_amount, platform_fee')
    .neq('status', 'cancelled')

  const totalRevenue = (revenueData ?? []).reduce((s, b) => s + Number(b.platform_fee), 0)

  const STATUS_COLOR: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  }
  const STATUS_LABEL: Record<string, string> = {
    confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado', completed: 'Concluído',
  }

  const ROLE_COLOR: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    owner: 'bg-blue-100 text-blue-700',
    client: 'bg-gray-100 text-gray-600',
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Painel Admin</h1>
              <p className="text-gray-400 text-sm">Olá, {profile?.full_name?.split(' ')[0]}. Visão geral da plataforma.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Usuários cadastrados', value: totalUsers ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
              { label: 'Embarcações', value: totalBoats ?? 0, icon: Anchor, color: 'bg-cyan-50 text-cyan-600' },
              { label: 'Reservas (total)', value: totalBookings ?? 0, icon: Calendar, color: 'bg-green-50 text-green-600' },
              { label: 'Receita plataforma', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[#0a2540]">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* Reservas recentes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-semibold text-[#0a2540]">Reservas recentes</h2>
                <Link href="/admin/reservas" className="text-sm text-[#00b4d8] font-semibold hover:underline">Ver todas</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {(recentBookings ?? []).map(b => {
                  const boat   = b.boats as any
                  const client = b.client as any
                  return (
                    <div key={b.booking_code} className="px-6 py-3.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0a2540] truncate">{client?.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{boat?.name} · {new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#0a2540]">{formatCurrency(Number(b.total_amount))}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABEL[b.status] ?? b.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Usuários recentes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-semibold text-[#0a2540]">Usuários recentes</h2>
                <Link href="/admin/usuarios" className="text-sm text-[#00b4d8] font-semibold hover:underline">Ver todos</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {(recentUsers ?? []).map((u, i) => (
                  <div key={i} className="px-6 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0a2540]/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#0a2540]">
                      {(u.full_name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0a2540] truncate">{u.full_name ?? 'Sem nome'}</p>
                      <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_COLOR[u.role] ?? 'bg-gray-100'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Ver todas as reservas', href: '/admin/reservas', icon: Calendar },
              { label: 'Gerenciar usuários', href: '/admin/usuarios', icon: Users },
              { label: 'Ver embarcações', href: '/embarcacoes', icon: Anchor },
            ].map(action => (
              <Link key={action.href} href={action.href}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#00b4d8] hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-[#0a2540]/5 rounded-xl flex items-center justify-center group-hover:bg-[#00b4d8]/10 transition-colors">
                  <action.icon className="w-5 h-5 text-[#0a2540] group-hover:text-[#00b4d8]" />
                </div>
                <span className="font-medium text-[#0a2540] text-sm">{action.label}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
