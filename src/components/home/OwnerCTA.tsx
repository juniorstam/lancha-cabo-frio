'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, Shield, Calendar, ArrowRight, Anchor } from 'lucide-react'

const benefits = [
  {
    icon: TrendingUp,
    title: 'Aumente sua renda',
    description: 'Receba reservas online sem esforço de captação.',
  },
  {
    icon: Shield,
    title: 'Plataforma segura',
    description: 'Clientes verificados e pagamento garantido.',
  },
  {
    icon: Calendar,
    title: 'Agenda organizada',
    description: 'Gerencie disponibilidade e reservas em um só lugar.',
  },
]

export function OwnerCTA() {
  return (
    <section id="anunciar" className="py-24 bg-[#0a2540] relative overflow-hidden">

      {/* Decoração de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00b4d8]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00b4d8]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#00b4d8] text-sm font-semibold uppercase tracking-widest">
              Para proprietários
            </span>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-white mt-3 mb-6 leading-tight">
              Sua lancha gerando renda enquanto você descansa
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Cadastre sua embarcação gratuitamente e comece a receber reservas online.
              Você define os preços, a disponibilidade e os roteiros.
            </p>

            <ul className="space-y-4 mb-10">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#00b4d8]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-[#00b4d8]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{benefit.title}</p>
                    <p className="text-white/50 text-sm mt-0.5">{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#00b4d8] hover:bg-[#0096b7] text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl group"
            >
              Cadastrar minha embarcação
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Card decorativo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/50 text-sm">Seus ganhos este mês</p>
                  <p className="text-white text-4xl font-bold mt-1">R$ 4.800</p>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-xs font-semibold">+24%</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { data: '10 Mai', roteiro: 'Ilha do Japonês', valor: 'R$ 800', status: 'Confirmado' },
                  { data: '12 Mai', roteiro: 'Arraial do Cabo', valor: 'R$ 1.200', status: 'Confirmado' },
                  { data: '17 Mai', roteiro: 'Tour Pôr do Sol', valor: 'R$ 600', status: 'Pendente' },
                  { data: '19 Mai', roteiro: 'Ilha do Papagaio', valor: 'R$ 900', status: 'Confirmado' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#00b4d8]/20 rounded-lg flex items-center justify-center">
                        <Anchor className="w-4 h-4 text-[#00b4d8]" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">{item.roteiro}</p>
                        <p className="text-white/40 text-xs">{item.data}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs font-semibold">{item.valor}</p>
                      <span className={`text-xs ${item.status === 'Confirmado' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

