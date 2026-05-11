'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, MapPin, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { DatePicker } from '@/components/ui/DatePicker'

export function HeroSection() {
  const router = useRouter()
  const [passengers, setPassengers] = useState(1)
  const [date, setDate] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (passengers > 1) params.set('passengers', String(passengers))
    router.push(`/embarcacoes?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center">

      {/* Background — overflow-hidden só aqui para não cortar popups */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Imagem de fundo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        {/* Overlay gradiente cinematográfico */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2540]/70 via-[#0a2540]/40 to-[#0a2540]/80" />
        {/* Partículas decorativas */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00b4d8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#00b4d8]/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm mb-6"
        >
          <MapPin className="w-3.5 h-3.5 text-[#00b4d8]" />
          Cabo Frio, Rio de Janeiro
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
        >
          Sua aventura
          <span className="block text-[#00b4d8]">começa no mar</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Reserve lanchas, barcos e jet ski com facilidade.
          Experiências únicas em Cabo Frio e região.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-2 max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-2">

            {/* Data */}
            <DatePicker
              value={date}
              onChange={setDate}
              variant="hero"
              placeholder="Escolha a data"
            />

            <div className="hidden sm:block w-px bg-gray-200 my-2" />

            {/* Passageiros */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-[#00b4d8] flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-gray-500 font-medium">Passageiros</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-semibold text-gray-800 w-4 text-center">
                    {passengers}
                  </span>
                  <button
                    onClick={() => setPassengers(Math.min(20, passengers + 1))}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Botão buscar */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#0a2540] hover:bg-[#0d2f50] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              <span>Buscar</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex items-center justify-center gap-8 mt-10"
        >
          {[
            { value: '50+', label: 'Embarcações' },
            { value: '8', label: 'Roteiros' },
            { value: '500+', label: 'Passeios realizados' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/60 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  )
}
