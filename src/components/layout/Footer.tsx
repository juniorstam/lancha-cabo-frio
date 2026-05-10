import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-[#0a2540] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo + Descrição */}
          <div className="lg:col-span-1">
            <Image
              src="/logo.png"
              alt="Lancha em Cabo Frio"
              width={150}
              height={48}
              className="h-11 w-auto brightness-0 invert mb-4"
            />
            <p className="text-white/60 text-sm leading-relaxed mt-4">
              A plataforma premium para aluguel de lanchas, barcos e jet ski em Cabo Frio e região.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-[#00b4d8] rounded-full transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5522999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-[#00b4d8] rounded-full transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:contato@lanchaemcabofrio.com.br"
                className="p-2 bg-white/10 hover:bg-[#00b4d8] rounded-full transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Plataforma
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Embarcações', href: '/embarcacoes' },
                { label: 'Roteiros', href: '/roteiros' },
                { label: 'Como funciona', href: '/#como-funciona' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Fale Conosco', href: '/contato' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Proprietários */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Proprietários
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Cadastre sua lancha', href: '/cadastro' },
                { label: 'Como anunciar', href: '/#anunciar' },
                { label: 'Painel do proprietário', href: '/painel' },
                { label: 'Suporte', href: '/contato' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Contato
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#00b4d8] mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">
                  Cabo Frio, Rio de Janeiro — RJ
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />
                <a
                  href="https://wa.me/5522999999999"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  (22) 99999-9999
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#00b4d8] flex-shrink-0" />
                <a
                  href="mailto:contato@lanchaemcabofrio.com.br"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  contato@lanchaemcabofrio.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Lancha em Cabo Frio. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Termos de uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
