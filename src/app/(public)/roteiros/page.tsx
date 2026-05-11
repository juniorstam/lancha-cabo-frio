import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Clock, Users, Waves, MapPin, Star, ChevronRight, Anchor } from 'lucide-react'

const ROTEIROS = [
  {
    slug: 'ilha-do-japones',
    name: 'Ilha do Japonês',
    duration: '4h',
    difficulty: 'Tranquilo',
    idealFor: 'Todos os públicos',
    description: 'Mergulho e snorkel nas águas cristalinas ao redor da ilha. Um dos pontos mais belos de Cabo Frio, com visibilidade excepcional e rica vida marinha.',
    highlights: ['Snorkel', 'Mergulho', 'Praia isolada', 'Fotos incríveis'],
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
    from_price: 600,
    rating: 4.9,
    reviews: 48,
    tags: ['popular', 'familia'],
  },
  {
    slug: 'arraial-do-cabo',
    name: 'Arraial do Cabo',
    duration: '8h',
    difficulty: 'Moderado',
    idealFor: 'Grupos',
    description: 'O Caribe brasileiro! Visitamos a Lagoa Azul, Praia do Farol e as dunas de areia branca. Dia completo de aventura e paisagens únicas.',
    highlights: ['Lagoa Azul', 'Praia do Farol', 'Dunas', 'Praias desertas'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    from_price: 1200,
    rating: 5.0,
    reviews: 32,
    tags: ['aventura', 'destaque'],
  },
  {
    slug: 'praia-das-conchas',
    name: 'Praia das Conchas',
    duration: '3h',
    difficulty: 'Tranquilo',
    idealFor: 'Família',
    description: 'Areia branca, água transparente e tranquilidade total. Perfeito para quem busca relaxar com a família num ambiente seguro e paradisíaco.',
    highlights: ['Banho de mar', 'Areia branca', 'Aguas calmas', 'Crianças'],
    image: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=800&auto=format&fit=crop',
    from_price: 500,
    rating: 4.8,
    reviews: 27,
    tags: ['familia', 'curto'],
  },
  {
    slug: 'tour-por-do-sol',
    name: 'Tour Pôr do Sol',
    duration: '2h',
    difficulty: 'Tranquilo',
    idealFor: 'Casais e românticos',
    description: 'Uma experiência mágica ao entardecer. Navegue enquanto o sol se põe no horizonte do mar de Cabo Frio. Ideal para casais e momentos especiais.',
    highlights: ['Pôr do sol', 'Champagne', 'Romântico', 'Fotos únicas'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    from_price: 400,
    rating: 4.9,
    reviews: 19,
    tags: ['romantico', 'curto'],
  },
  {
    slug: 'ilha-do-papagaio',
    name: 'Ilha do Papagaio',
    duration: '5h',
    difficulty: 'Tranquilo',
    idealFor: 'Todos os públicos',
    description: 'Passeio encantador pela Ilha do Papagaio, com paradas para banho em enseadas protegidas. Águas azul-turquesa e natureza preservada.',
    highlights: ['Enseadas', 'Snorkel', 'Natureza', 'Tranquilidade'],
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800&auto=format&fit=crop',
    from_price: 750,
    rating: 4.7,
    reviews: 22,
    tags: ['natureza'],
  },
  {
    slug: 'passeio-completo',
    name: 'Passeio Completo',
    duration: '6h',
    difficulty: 'Moderado',
    idealFor: 'Grupos',
    description: 'O melhor de Cabo Frio em um único dia. Visitamos os principais pontos turísticos marítimos da região, com paradas para banho e almoço a bordo.',
    highlights: ['Múltiplos destinos', 'Almoço incluso', 'Churrasqueira', 'Dia completo'],
    image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=800&auto=format&fit=crop',
    from_price: 980,
    rating: 4.8,
    reviews: 35,
    tags: ['destaque', 'completo'],
  },
]

const DIFFICULTY_COLOR: Record<string, string> = {
  'Tranquilo': 'bg-green-100 text-green-700',
  'Moderado':  'bg-yellow-100 text-yellow-700',
  'Agitado':   'bg-red-100 text-red-700',
}

export const metadata = {
  title: 'Roteiros | Lancha em Cabo Frio',
  description: 'Conheça os roteiros disponíveis em Cabo Frio e Arraial do Cabo. Passeios de lancha para todos os gostos.',
}

export default function RoteirosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8fafc]">

        {/* Hero */}
        <div className="relative bg-[#0a2540] pt-32 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="relative max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4 text-[#00b4d8]" />
              Cabo Frio & Arraial do Cabo
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Roteiros de passeio
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Do passeio rápido ao dia completo de aventura — escolha o roteiro ideal e reserve sua embarcação.
            </p>
          </div>
        </div>

        {/* Grid de roteiros */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROTEIROS.map((roteiro) => (
              <div
                key={roteiro.slug}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                {/* Imagem */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={roteiro.image}
                    alt={roteiro.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${DIFFICULTY_COLOR[roteiro.difficulty] ?? 'bg-gray-100 text-gray-700'}`}>
                      {roteiro.difficulty}
                    </span>
                    {roteiro.tags.includes('destaque') && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f4a261] text-white backdrop-blur-sm">
                        ⭐ Destaque
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {roteiro.rating} ({roteiro.reviews})
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-playfair text-xl font-bold text-[#0a2540] mb-2">{roteiro.name}</h2>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{roteiro.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00b4d8]" />
                      {roteiro.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#00b4d8]" />
                      {roteiro.idealFor}
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {roteiro.highlights.map(h => (
                      <span key={h} className="text-xs bg-[#00b4d8]/10 text-[#00b4d8] px-2 py-0.5 rounded-full font-medium">{h}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">a partir de</p>
                      <p className="font-bold text-[#0a2540] text-lg">
                        R$ {roteiro.from_price.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Link
                      href="/embarcacoes"
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] text-white text-sm font-semibold rounded-xl hover:bg-[#0d3060] transition-colors"
                    >
                      Reservar
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0a2540] py-16 px-4 text-center">
          <Anchor className="w-10 h-10 text-[#00b4d8] mx-auto mb-4" />
          <h2 className="font-playfair text-3xl font-bold text-white mb-3">Pronto para zarpar?</h2>
          <p className="text-white/60 mb-6">Escolha sua embarcação e faça sua reserva em minutos.</p>
          <Link
            href="/embarcacoes"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00b4d8] hover:bg-[#0096b7] text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl"
          >
            Ver embarcações disponíveis
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
      <Footer />
    </>
  )
}
