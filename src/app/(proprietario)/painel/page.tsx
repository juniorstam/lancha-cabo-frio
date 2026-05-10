import { TrendingUp, Users, Calendar, DollarSign, Anchor, Star, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'

const STATS = [
  { label: 'Receita do mês', value: 'R$ 4.800', change: '+24%', positive: true, icon: DollarSign, color: 'bg-green-50 text-green-600' },
  { label: 'Reservas confirmadas', value: '12', change: '+3 esta semana', positive: true, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
  { label: 'Avaliação média', value: '4.9 ★', change: '24 avaliações', positive: true, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Taxa de ocupação', value: '78%', change: '+12% vs mês anterior', positive: true, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
]

const UPCOMING_BOOKINGS = [
  { id: '1', client: 'Carlos M.', boat: 'Focker 310', route: 'Ilha do Japonês', date: '2026-05-14', passengers: 8, total: 880, status: 'confirmed' },
  { id: '2', client: 'Ana Paula S.', boat: 'Focker 310', route: 'Arraial do Cabo', date: '2026-05-17', passengers: 10, total: 1320, status: 'pending' },
  { id: '3', client: 'Roberto K.', boat: 'Focker 310', route: 'Tour Pôr do Sol', date: '2026-05-19', passengers: 4, total: 528, status: 'confirmed' },
  { id: '4', client: 'Fernanda L.', boat: 'Focker 310', route: 'Ilha do Papagaio', date: '2026-05-24', passengers: 6, total: 660, status: 'confirmed' },
]

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendente', icon: Clock, class: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelado', icon: XCircle, class: 'bg-red-100 text-red-700' },
}

export default function PainelPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Painel do Proprietário</h1>
            <p className="text-gray-500 mt-1">Bem-vindo de volta! Aqui está um resumo do seu negócio.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0a2540]">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Reservas */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-semibold text-[#0a2540] text-lg">Próximas reservas</h2>
                <a href="/painel/reservas" className="text-sm text-[#00b4d8] font-semibold hover:underline">Ver todas</a>
              </div>
              <div className="divide-y divide-gray-50">
                {UPCOMING_BOOKINGS.map((booking) => {
                  const status = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG]
                  return (
                    <div key={booking.id} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 bg-[#0a2540]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Anchor className="w-5 h-5 text-[#0a2540]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#0a2540] text-sm truncate">{booking.client}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.class}`}>
                            <status.icon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{booking.route} • {booking.passengers} pax</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-[#0a2540] text-sm">{formatCurrency(booking.total)}</p>
                        <p className="text-gray-400 text-xs">{new Date(booking.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Coluna direita */}
            <div className="space-y-6">

              {/* Minhas embarcações */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#0a2540]">Minhas embarcações</h2>
                  <a href="/painel/embarcacoes/nova" className="text-xs bg-[#0a2540] text-white px-3 py-1.5 rounded-full hover:bg-[#0d3060] transition-colors">
                    + Adicionar
                  </a>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Focker 310', category: 'Lancha', status: 'active', bookings: 12 },
                  ].map((boat) => (
                    <div key={boat.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-[#00b4d8]/10 rounded-lg flex items-center justify-center">
                        <Anchor className="w-5 h-5 text-[#00b4d8]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#0a2540] text-sm">{boat.name}</p>
                        <p className="text-gray-400 text-xs">{boat.bookings} reservas</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Ativo
                      </span>
                    </div>
                  ))}
                  <a href="/painel/embarcacoes/nova"
                    className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors text-sm">
                    + Cadastrar nova embarcação
                  </a>
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-[#0a2540] mb-4">Ações rápidas</h2>
                <div className="space-y-2">
                  {[
                    { label: '📅 Gerenciar agenda', href: '/painel/agenda' },
                    { label: '🚤 Minhas embarcações', href: '/painel/embarcacoes' },
                    { label: '📋 Ver reservas', href: '/painel/reservas' },
                    { label: '💰 Financeiro', href: '/painel/financeiro' },
                  ].map((action) => (
                    <a key={action.href} href={action.href}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 hover:text-[#0a2540] transition-colors">
                      {action.label}
                    </a>
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
