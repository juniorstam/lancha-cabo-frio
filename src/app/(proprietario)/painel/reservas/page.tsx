import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, Clock, XCircle, Users, Phone, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PainelReservasFiltro } from './Filtro'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  pending:   { label: 'Pendente',   icon: Clock,        class: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelado',  icon: XCircle,      class: 'bg-red-100 text-red-700' },
  completed: { label: 'Concluído',  icon: CheckCircle,  class: 'bg-blue-100 text-blue-700' },
}

export default async function PainelReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { status: filterStatus } = await searchParams

  // Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profile do owner
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

  if (boatIds.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f8fafc] pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Nenhuma embarcação cadastrada ainda.</p>
            <Link href="/painel/embarcacoes/nova" className="px-5 py-2.5 bg-[#0a2540] text-white rounded-xl text-sm font-semibold">
              Cadastrar embarcação
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Query de reservas
  let query = supabase
    .from('bookings')
    .select(`
      id, booking_code, date, passenger_count, total_amount, platform_fee, status,
      routes ( name ),
      client:profiles!client_id ( full_name, phone )
    `)
    .in('boat_id', boatIds)
    .order('date', { ascending: false })

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const { data: reservas } = await query

  const totalReceita = (reservas ?? [])
    .filter(r => r.status !== 'cancelled')
    .reduce((s, r) => s + Number(r.total_amount), 0)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/painel" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0a2540]">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Reservas</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {(reservas ?? []).length} reservas · {formatCurrency(totalReceita)} em receita
              </p>
            </div>
          </div>

          {/* Filtros */}
          <PainelReservasFiltro atual={filterStatus} />

          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {!reservas || reservas.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-lg font-medium mb-1">Nenhuma reserva encontrada</p>
                <p className="text-sm">As reservas dos seus clientes aparecerão aqui.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Código</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Cliente</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Roteiro</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Data</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Pax</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Você recebe</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservas.map(r => {
                      const s = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                      const ownerReceives = Number(r.total_amount) - Number(r.platform_fee)
                      const client = r.client as any
                      const route = r.routes as any
                      return (
                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4 text-xs font-mono text-gray-400">{r.booking_code}</td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#0a2540] text-sm">{client?.full_name ?? '—'}</p>
                            {client?.phone && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />{client.phone}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{route?.name ?? '—'}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-gray-300" />{r.passenger_count}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-green-600">{formatCurrency(ownerReceives)}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.class}`}>
                              <s.icon className="w-3 h-3" />{s.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
