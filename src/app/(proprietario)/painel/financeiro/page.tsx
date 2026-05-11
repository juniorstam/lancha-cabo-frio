import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, ChevronLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

const MESES = [
  { mes: 'Jan', receita: 2400, reservas: 6 },
  { mes: 'Fev', receita: 3200, reservas: 8 },
  { mes: 'Mar', receita: 4800, reservas: 12 },
  { mes: 'Abr', receita: 3600, reservas: 9 },
  { mes: 'Mai', receita: 4800, reservas: 12 },
]

const TRANSACOES = [
  { id: 't1', descricao: 'Reserva LCF-2026-001 — Carlos Mendes', data: '2026-05-14', valor: 1188, tipo: 'entrada' },
  { id: 't2', descricao: 'Reserva LCF-2026-003 — Roberto Kley', data: '2026-05-19', valor: 475, tipo: 'entrada' },
  { id: 't3', descricao: 'Reserva LCF-2026-004 — Fernanda Lima', data: '2026-05-24', valor: 891, tipo: 'entrada' },
  { id: 't4', descricao: 'Taxa da plataforma (maio)', data: '2026-05-31', valor: 255, tipo: 'saida' },
]

const maxReceita = Math.max(...MESES.map(m => m.receita))

export default function FinanceiroPage() {
  const totalReceita = TRANSACOES.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
  const totalTaxas   = TRANSACOES.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
  const liquido      = totalReceita - totalTaxas

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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Receita bruta (maio)', value: formatCurrency(totalReceita), icon: TrendingUp, color: 'bg-green-50 text-green-600', change: '+24%', up: true },
              { label: 'Taxas da plataforma', value: formatCurrency(totalTaxas), icon: DollarSign, color: 'bg-red-50 text-red-500', change: '10%', up: false },
              { label: 'Líquido a receber', value: formatCurrency(liquido), icon: DollarSign, color: 'bg-blue-50 text-blue-600', change: '+24%', up: true },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${card.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {card.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0a2540]">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* Gráfico de barras simples */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-6">Receita por mês</h2>
              <div className="flex items-end gap-3 h-32">
                {MESES.map(m => (
                  <div key={m.mes} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs font-bold text-[#0a2540]">{formatCurrency(m.receita).replace('R$ ', '')}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#0a2540] to-[#00b4d8] transition-all"
                      style={{ height: `${(m.receita / maxReceita) * 96}px` }}
                    />
                    <span className="text-xs text-gray-400">{m.mes}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Últimas transações */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#0a2540] mb-4">Últimas movimentações</h2>
              <div className="space-y-3">
                {TRANSACOES.map(t => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${t.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {t.tipo === 'entrada'
                        ? <ArrowUpRight className="w-4 h-4 text-green-600" />
                        : <ArrowDownRight className="w-4 h-4 text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0a2540] font-medium truncate">{t.descricao}</p>
                      <p className="text-xs text-gray-400">{new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className={`font-bold text-sm flex-shrink-0 ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
