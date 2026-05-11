import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PhotoGallery } from '@/components/embarcacao/PhotoGallery'
import { BookingWidget } from '@/components/reserva/BookingWidget'
import { Star, Users, Ruler, MapPin, CheckCircle, Clock, Waves, Anchor } from 'lucide-react'
import { AMENITIES_LABELS, AMENITIES_ICONS, DIFFICULTY_LABELS, IDEAL_FOR_LABELS } from '@/constants'
import { formatCurrency } from '@/lib/utils'

// Mock data — será substituído por query ao Supabase
const MOCK_BOATS: Record<string, any> = {
  'focker-310': {
    id: '1', name: 'Focker 310', slug: 'focker-310', category: 'lancha',
    capacity: 10, size_ft: 22, base_price: 800, price_per_extra_person: 80,
    description: 'A Focker 310 é uma lancha espaçosa e confortável, ideal para passeios em família ou grupos de amigos. Com deck solar amplo, som de qualidade e churrasqueira a bordo, você terá tudo para um dia perfeito no mar de Cabo Frio.\n\nO marinheiro experiente garante segurança e tranquilidade em toda a navegação. Você só precisa curtir — o gelo e o carvão já vêm inclusos!',
    rules: '• Proibido fumar a bordo\n• Não é permitido levar animais\n• Uso obrigatório de colete salva-vidas ao entrar na água\n• Respeite o limite de passageiros\n• Lixo não deve ser jogado no mar',
    marina: { name: 'Marina Pier 98', address: 'Av. Julia Kubitscheck, 98 - Braga, Cabo Frio - RJ', lat: -22.8784, lng: -42.0178 },
    amenities: { marinheiro: true, churrasqueira: true, cooler: true, banheiro: false, ducha: false, som: true, wifi: false, toldo: true, ancora: true },
    photos: [
      'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=1200',
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
      'https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
    ],
    routes: [
      { id: 'r1', name: 'Ilha do Japonês', duration_hours: 4, difficulty: 'calm', ideal_for: 'all', description: 'Mergulho e snorkel nas águas cristalinas.', base_price: 800, base_passengers: 4, price_per_extra: 50, max_passengers: 10 },
      { id: 'r2', name: 'Praia das Conchas', duration_hours: 3, difficulty: 'calm', ideal_for: 'family', description: 'Areia branca e água transparente.', base_price: 600, base_passengers: 4, price_per_extra: 40, max_passengers: 10 },
      { id: 'r3', name: 'Arraial do Cabo', duration_hours: 8, difficulty: 'moderate', ideal_for: 'group', description: 'O Caribe brasileiro. Lagoa Azul e Praia do Farol.', base_price: 1200, base_passengers: 6, price_per_extra: 80, max_passengers: 10 },
    ],
    reviews: [
      { id: '1', client: { full_name: 'Carlos M.', avatar_url: '' }, rating_overall: 5, comment: 'Experiência incrível! Marinheiro super atencioso, lancha impecável. Vamos voltar com certeza!', created_at: '2024-03-15' },
      { id: '2', client: { full_name: 'Ana Paula S.', avatar_url: '' }, rating_overall: 5, comment: 'Passeio perfeito para a família. As crianças adoraram! Tudo muito organizado e seguro.', created_at: '2024-02-28' },
      { id: '3', client: { full_name: 'Roberto K.', avatar_url: '' }, rating_overall: 4.5, comment: 'Ótima estrutura, churrasco muito bom. Só a água poderia estar mais gelada rsrs. Recomendo!', created_at: '2024-02-10' },
    ],
    avg_rating: 4.9,
    total_reviews: 24,
  },
}

// Adicionar as outras embarcações com os mesmos dados base
;['intermarine-480', 'armada-40', 'nhd-280-cabinada', 'jet-ski-seadoo', 'ventura-33'].forEach(slug => {
  MOCK_BOATS[slug] = { ...MOCK_BOATS['focker-310'], slug, id: slug, name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const boat = MOCK_BOATS[slug]
  if (!boat) return { title: 'Embarcação não encontrada' }
  return {
    title: boat.name,
    description: boat.description?.slice(0, 160),
  }
}

export default async function EmbarcacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ route?: string }>
}) {
  const { slug } = await params
  const { route: preselectedRoute } = await searchParams
  const boat = MOCK_BOATS[slug]
  if (!boat) notFound()

  const amenityEntries = Object.entries(boat.amenities).filter(([, v]) => v === true)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <a href="/" className="hover:text-[#0a2540] transition-colors">Início</a>
            <span>/</span>
            <a href="/embarcacoes" className="hover:text-[#0a2540] transition-colors">Embarcações</a>
            <span>/</span>
            <span className="text-[#0a2540] font-medium">{boat.name}</span>
          </div>

          {/* Título */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#0a2540] mb-2">{boat.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-gray-700">{boat.avg_rating}</span>
                  <span>({boat.total_reviews} avaliações)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#00b4d8]" />
                  {boat.marina.name}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {boat.capacity} passageiros
                </div>
                <div className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  {boat.size_ft} pés
                </div>
              </div>
            </div>
          </div>

          {/* Galeria */}
          <div className="mb-10">
            <PhotoGallery photos={boat.photos} name={boat.name} />
          </div>

          {/* Conteúdo principal + Widget */}
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Coluna esquerda */}
            <div className="lg:col-span-2 space-y-10">

              {/* Descrição */}
              <section>
                <h2 className="font-playfair text-2xl font-bold text-[#0a2540] mb-4">Sobre esta embarcação</h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">{boat.description}</div>
              </section>

              {/* Amenidades */}
              <section>
                <h2 className="font-playfair text-2xl font-bold text-[#0a2540] mb-4">O que está incluso</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenityEntries.map(([key]) => (
                    <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-xl">{AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]}</span>
                      <span className="text-sm text-gray-700 font-medium">
                        {AMENITIES_LABELS[key as keyof typeof AMENITIES_LABELS]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Roteiros disponíveis */}
              <section>
                <h2 className="font-playfair text-2xl font-bold text-[#0a2540] mb-4">Roteiros disponíveis</h2>
                <div className="space-y-3">
                  {boat.routes.map((route: any) => (
                    <div key={route.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-2xl hover:border-[#00b4d8] transition-colors">
                      <div className="w-10 h-10 bg-[#00b4d8]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Anchor className="w-5 h-5 text-[#00b4d8]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[#0a2540]">{route.name}</h3>
                          <span className="font-bold text-[#0a2540] whitespace-nowrap">
                            {formatCurrency(route.price_override || boat.base_price)}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{route.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{route.duration_hours}h</span>
                          <span className="flex items-center gap-1"><Waves className="w-3 h-3" />{DIFFICULTY_LABELS[route.difficulty as keyof typeof DIFFICULTY_LABELS]}</span>
                          <span>👥 {IDEAL_FOR_LABELS[route.ideal_for as keyof typeof IDEAL_FOR_LABELS]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Regras */}
              <section>
                <h2 className="font-playfair text-2xl font-bold text-[#0a2540] mb-4">Regras de bordo</h2>
                <div className="bg-gray-50 rounded-2xl p-5">
                  {boat.rules.split('\n').map((rule: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 mb-2 last:mb-0 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{rule.replace('• ', '')}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Avaliações */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-playfair text-2xl font-bold text-[#0a2540]">Avaliações</h2>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-[#0a2540] text-lg">{boat.avg_rating}</span>
                    <span className="text-gray-400 text-sm">({boat.total_reviews})</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {boat.reviews.map((review: any) => (
                    <div key={review.id} className="p-5 border border-gray-100 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#0a2540] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {review.client.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0a2540] text-sm">{review.client.full_name}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(review.rating_overall) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Widget de reserva */}
            <div className="lg:col-span-1">
              <BookingWidget
                boatId={boat.id}
                boatName={boat.name}
                capacity={boat.capacity}
                routes={boat.routes}
                marina={boat.marina.name}
                preselectedRoute={preselectedRoute}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
