import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, Clock, XCircle, Anchor, Users, Calendar, Phone, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const RESERVAS = [
  { id: '1', code: 'LCF-2026-001', client: 'Carlos Mendes', phone: '(22) 98765-4321', route: 'Ilha do Japonês', date: '2026-05-14', passengers: 8, total: 1320, status: 'confirmed' },
  { id: '2', code: 'LCF-2026-002', client: 'Ana Paula Silva', phone: '(21) 99123-4567', route: 'Arraial do Cabo', date: '2026-05-17', passengers: 10, total: 2160, status: 'pending' },
  { id: '3', code: 'LCF-2026-003', client: 'Roberto Kley', phone: '(22) 97654-3210', route: 'Tour Pôr do Sol', date: '2026-05-19', passengers: 4, total: 528, status: 'confirmed' },
  { id: '4', code: 'LCF-2026-004', client: 'Fernanda Lima', phone: '(21) 98888-1111', route: 'Ilha do Papagaio', date: '2026-05-24', passengers: 6, total: 990, status: 'confirmed' },
  { id: '5', code: 'LCF-2026-005', client: 'Marcos Souza', phone: '(22) 91234-5678', route: 'Praia das Conchas', date: '2026-04-30', passengers: 4, total: 660, status: 'cancelled' },
]

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  pending:   { label: 'Pendente',   icon: Clock,        class: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelado',  icon: XCircle,      class: 'bg-red-100 text-red-700' },
}

export default function PainelReservasPage() {
  const totalReceita = RESERVAS.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.total, 0)

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
              <p className="text-gray-400 text-sm mt-0.5">{RESERVAS.length} reservas · {formatCurrency(totalReceita)} em receita</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['Todas', 'Confirmadas', 'Pendentes', 'Canceladas'].map(f => (
              <button key={f} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${f === 'Todas' ? 'bg-[#0a2540] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Código</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Cliente</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Roteiro</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Data</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Pax</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Total</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {RESERVAS.map(r => {
                    const s = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 text-xs font-mono text-gray-400">{r.code}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#0a2540] text-sm">{r.client}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />{r.phone}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{r.route}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-gray-300" />{r.passengers}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#0a2540]">{formatCurrency(r.total)}</td>
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
          </div>

        </div>
      </div>
    </>
  )
}
