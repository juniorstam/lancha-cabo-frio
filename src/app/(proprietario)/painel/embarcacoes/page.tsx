import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { ChevronLeft, Plus, Edit, Eye } from 'lucide-react'
import Link from 'next/link'
import { EmbarcacaoActions } from './EmbarcacaoActions'

export default async function PainelEmbarcacoesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role === 'client') redirect('/')

  // Barcos com fotos e roteiros
  const { data: boats } = await supabase
    .from('boats')
    .select(`
      id, name, slug, category, capacity, base_price, status,
      boat_photos ( url, "order" ),
      boat_routes (
        routes ( name )
      )
    `)
    .eq('owner_id', profile.id)
    .order('created_at', { ascending: false })

  // Contagem de reservas deste mês por barco
  const boatIds = (boats ?? []).map(b => b.id)
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: bookingCounts } = boatIds.length > 0
    ? await supabase
        .from('bookings')
        .select('boat_id')
        .in('boat_id', boatIds)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .neq('status', 'cancelled')
    : { data: [] }

  const countByBoat = (bookingCounts ?? []).reduce<Record<string, number>>((acc, b) => {
    acc[b.boat_id] = (acc[b.boat_id] ?? 0) + 1
    return acc
  }, {})

  const embarcacoes = (boats ?? []).map(b => {
    const photos = (b.boat_photos as any[]).sort((a, b) => a.order - b.order)
    const routes = (b.boat_routes as any[]).map(br => br.routes?.name).filter(Boolean)
    return {
      ...b,
      photo: photos[0]?.url ?? null,
      routes,
      bookings_month: countByBoat[b.id] ?? 0,
    }
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link href="/painel" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0a2540]">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Minhas Embarcações</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  {embarcacoes.length} {embarcacoes.length === 1 ? 'embarcação cadastrada' : 'embarcações cadastradas'}
                </p>
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
            {embarcacoes.map(boat => (
              <div key={boat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex gap-5 p-5">
                  {/* Imagem */}
                  <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {boat.photo
                      ? <img src={boat.photo} alt={boat.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem foto</div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold text-[#0a2540] text-lg">{boat.name}</h2>
                        <p className="text-sm text-gray-400 capitalize">{boat.category} · {boat.capacity} passageiros</p>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${boat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {boat.status === 'active' ? 'Ativo' : boat.status === 'pending' ? 'Pendente' : 'Inativo'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                      <span className="text-gray-600">{boat.bookings_month} reservas este mês</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-semibold text-[#0a2540]">a partir de {formatCurrency(Number(boat.base_price))}</span>
                    </div>

                    {/* Roteiros */}
                    {boat.routes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {boat.routes.map((r: string) => (
                          <span key={r} className="text-xs bg-[#00b4d8]/10 text-[#00b4d8] px-2.5 py-0.5 rounded-full font-medium">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <Link
                    href={`/embarcacoes/${boat.slug}`}
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
                  <EmbarcacaoActions
                    boatId={boat.id}
                    boatName={boat.name}
                    initialStatus={boat.status}
                  />
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
  )
}
