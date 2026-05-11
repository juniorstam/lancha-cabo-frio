import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { Anchor, Star, Users, ChevronLeft, Plus, Edit, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'

const EMBARCACOES = [
  {
    id: '1', name: 'Focker 310', category: 'Lancha', capacity: 10,
    base_price: 800, avg_rating: 4.9, total_reviews: 24,
    active: true, bookings_month: 12,
    image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=400',
    routes: ['Ilha do Japonês', 'Arraial do Cabo', 'Praia das Conchas'],
  },
]

export default function PainelEmbarcacoesPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link href="/painel" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0a2540]">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Minhas Embarcações</h1>
                <p className="text-gray-400 text-sm mt-0.5">{EMBARCACOES.length} embarcação cadastrada</p>
              </div>
            </div>
            <Link
              href="/painel/embarcacoes/nova"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0a2540] text-white text-sm font-semibold rounded-xl hover:bg-[#0d3060] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Link>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            {EMBARCACOES.map(boat => (
              <div key={boat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex gap-5 p-5">
                  {/* Imagem */}
                  <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={boat.image} alt={boat.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold text-[#0a2540] text-lg">{boat.name}</h2>
                        <p className="text-sm text-gray-400">{boat.category} · {boat.capacity} passageiros</p>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${boat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {boat.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {boat.avg_rating} ({boat.total_reviews} avaliações)
                      </span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">{boat.bookings_month} reservas este mês</span>
                      <span className="text-gray-400">·</span>
                      <span className="font-semibold text-[#0a2540]">a partir de {formatCurrency(boat.base_price)}</span>
                    </div>

                    {/* Roteiros */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {boat.routes.map(r => (
                        <span key={r} className="text-xs bg-[#00b4d8]/10 text-[#00b4d8] px-2.5 py-0.5 rounded-full font-medium">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <Link
                    href={`/embarcacoes/${boat.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#0a2540] hover:bg-white rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Ver página
                  </Link>
                  <Link
                    href={`/painel/embarcacoes/${boat.id}/editar`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#0a2540] hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Editar
                  </Link>
                  <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-[#0a2540] hover:bg-white rounded-lg transition-colors ml-auto">
                    {boat.active
                      ? <><ToggleRight className="w-4 h-4 text-green-500" /> Desativar</>
                      : <><ToggleLeft className="w-4 h-4" /> Ativar</>
                    }
                  </button>
                </div>
              </div>
            ))}

            {/* Card de adicionar nova */}
            <Link
              href="/painel/embarcacoes/nova"
              className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Cadastrar nova embarcação</p>
                <p className="text-sm opacity-70">Adicione lancha, jet ski ou caiaque</p>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}
