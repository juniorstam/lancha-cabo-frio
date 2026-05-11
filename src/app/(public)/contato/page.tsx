import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ContactForm } from './ContactForm'
import { MapPin, Mail, Phone, Clock, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Fale Conosco | Lancha em Cabo Frio',
  description: 'Entre em contato com a equipe da Lancha em Cabo Frio. Atendemos de segunda a domingo, das 8h às 20h.',
}

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Localização',
    value: 'Cabo Frio, RJ',
    detail: 'Rio de Janeiro — Brasil',
    href: null,
  },
  {
    icon: Mail,
    label: 'E-mail',
    value: 'contato@lanchaemcabofrio.com.br',
    detail: 'Respondemos em até 2h',
    href: 'mailto:contato@lanchaemcabofrio.com.br',
  },
  {
    icon: Phone,
    label: 'WhatsApp',
    value: '(22) 99999-0000',
    detail: 'Atendimento rápido',
    href: 'https://wa.me/5522999990000',
  },
  {
    icon: Clock,
    label: 'Horário de atendimento',
    value: 'Seg – Dom, 8h às 20h',
    detail: 'Inclusive feriados',
    href: null,
  },
]

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    emoji: '📸',
    href: 'https://instagram.com/lanchaemcabofrio',
    handle: '@lanchaemcabofrio',
  },
  {
    label: 'Facebook',
    emoji: '👍',
    href: 'https://facebook.com/lanchaemcabofrio',
    handle: '/lanchaemcabofrio',
  },
  {
    label: 'TikTok',
    emoji: '🎬',
    href: 'https://tiktok.com/@lanchaemcabofrio',
    handle: '@lanchaemcabofrio',
  },
]

export default function ContatoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8fafc]">

        {/* Hero */}
        <div className="relative bg-[#0a2540] pt-32 pb-20 px-4 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1539066742-fbe8f91bd77f?q=80&w=1600&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4 text-[#00b4d8]" />
              Estamos aqui para ajudar
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Fale Conosco
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Tem uma dúvida, sugestão ou quer planejar seu passeio? Nossa equipe responde rápido.
            </p>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Formulário — 3 colunas */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="font-playfair text-2xl font-bold text-[#0a2540] mb-2">
                  Envie sua mensagem
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  Preencha o formulário e entraremos em contato em breve.
                </p>
                <ContactForm />
              </div>
            </div>

            {/* Informações de contato — 2 colunas */}
            <div className="lg:col-span-2 space-y-5">

              {/* Cards de contato */}
              {CONTACT_INFO.map((item) => {
                const Icon = item.icon
                const content = (
                  <div className="flex items-start gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-[#00b4d8]/30 hover:shadow transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#00b4d8]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                        {item.label}
                      </p>
                      <p className="font-semibold text-[#0a2540] text-sm">{item.value}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                )

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                )
              })}

              {/* Redes sociais */}
              <div className="bg-[#0a2540] rounded-2xl p-6">
                <h3 className="font-playfair text-lg font-bold text-white mb-4">
                  Nos siga nas redes
                </h3>
                <div className="space-y-3">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/10 hover:bg-[#00b4d8] rounded-xl transition-colors group"
                    >
                      <span className="text-xl leading-none">{social.emoji}</span>
                      <div>
                        <p className="text-white text-sm font-semibold">{social.label}</p>
                        <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors">
                          {social.handle}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
