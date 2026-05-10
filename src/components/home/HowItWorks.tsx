'use client'

import { motion } from 'framer-motion'
import { Search, CalendarCheck, Anchor, Star } from 'lucide-react'

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Escolha sua embarcação',
    description: 'Filtre por tipo, capacidade, roteiro e data. Compare fotos, preços e avaliações de outros passageiros.',
    color: 'bg-[#00b4d8]/10',
    iconColor: 'text-[#00b4d8]',
  },
  {
    icon: CalendarCheck,
    step: '02',
    title: 'Reserve online',
    description: 'Selecione a data, o roteiro e os opcionais. Pague apenas a taxa de reserva para confirmar sua vaga.',
    color: 'bg-[#0a2540]/5',
    iconColor: 'text-[#0a2540]',
  },
  {
    icon: Anchor,
    step: '03',
    title: 'Aproveite o passeio',
    description: 'Embarque com tranquilidade. Marinheiro incluso, churrasco a bordo e experiências que você não vai esquecer.',
    color: 'bg-[#f4a261]/10',
    iconColor: 'text-[#f4a261]',
  },
  {
    icon: Star,
    step: '04',
    title: 'Avalie e compartilhe',
    description: 'Após o passeio, avalie a experiência e compartilhe com amigos. Sua opinião ajuda outros viajantes.',
    color: 'bg-green-50',
    iconColor: 'text-green-500',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#00b4d8] text-sm font-semibold uppercase tracking-widest"
          >
            Simples assim
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-playfair text-4xl sm:text-5xl font-bold text-[#0a2540] mt-3"
          >
            Como funciona
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg mt-4 max-w-xl mx-auto"
          >
            Do sofá ao mar em poucos cliques. Sem ligações, sem negociação, sem estresse.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative text-center group"
            >
              {/* Linha conectora */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-px bg-dashed border-t-2 border-dashed border-gray-200 z-0" />
              )}

              {/* Ícone */}
              <div className={`relative z-10 w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className={`w-9 h-9 ${step.iconColor}`} />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#0a2540] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-semibold text-[#0a2540] text-lg mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
