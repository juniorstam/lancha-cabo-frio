'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, Waves } from 'lucide-react'
import { DIFFICULTY_LABELS, IDEAL_FOR_LABELS } from '@/constants'

const MOCK_ROUTES = [
  {
    id: '1',
    name: 'Ilha do Japonês',
    slug: 'ilha-do-japones',
    description: 'Mergulho e snorkel nas águas cristalinas. Um dos pontos mais belos de Cabo Frio.',
    duration_hours: 4,
    difficulty: 'calm',
    ideal_for: 'all',
    image_url: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Arraial do Cabo',
    slug: 'arraial-do-cabo',
    description: 'O Caribe brasileiro. Praia do Farol, Ilha do Cabo Frio e Lagoa Azul.',
    duration_hours: 8,
    difficulty: 'moderate',
    ideal_for: 'group',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Tour Pôr do Sol',
    slug: 'tour-por-do-sol',
    description: 'Passeio ao entardecer pela Lagoa de Araruama. Romântico e inesquecível.',
    duration_hours: 2.5,
    difficulty: 'calm',
    ideal_for: 'couple',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop',
  },
]

const difficultyColors: Record<string, string> = {
  calm: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  rough: 'bg-red-100 text-red-700',
}

export function FeaturedRoutes() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#00b4d8] text-sm font-semibold uppercase tracking-widest"
            >
              Destinos incríveis
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-playfair text-4xl sm:text-5xl font-bold text-[#0a2540] mt-2"
            >
              Roteiros mais procurados
            </motion.h2>
          </div>
          <Link
            href="/roteiros"
            className="flex items-center gap-2 text-[#00b4d8] font-semibold hover:gap-3 transition-all group"
          >
            Ver todos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_ROUTES.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Link href={`/roteiros/${route.slug}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition-all duration-300">
                  {/* Imagem */}
                  <img
                    src={route.image_url}
                    alt={route.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540] via-[#0a2540]/20 to-transparent" />

                  {/* Badges topo */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${difficultyColors[route.difficulty]}`}>
                      <Waves className="w-3 h-3 inline mr-1" />
                      {DIFFICULTY_LABELS[route.difficulty as keyof typeof DIFFICULTY_LABELS]}
                    </span>
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      {IDEAL_FOR_LABELS[route.ideal_for as keyof typeof IDEAL_FOR_LABELS]}
                    </span>
                  </div>

                  {/* Conteúdo inferior */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-1.5 text-white/70 text-xs mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      {route.duration_hours}h de passeio
                    </div>
                    <h3 className="font-playfair text-white text-2xl font-bold mb-2">{route.name}</h3>
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{route.description}</p>

                    <div className="mt-4 flex items-center gap-2 text-[#00b4d8] text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Ver embarcações disponíveis
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
