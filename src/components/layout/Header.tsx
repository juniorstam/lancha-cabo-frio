'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Lancha em Cabo Frio"
              width={160}
              height={52}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  scrolled
                    ? 'text-[#0a2540] hover:text-[#00b4d8]'
                    : 'text-white/90 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Ações */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/favoritos"
              className={cn(
                'p-2 rounded-full transition-colors',
                scrolled
                  ? 'text-[#0a2540] hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              )}
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                scrolled
                  ? 'text-[#0a2540] hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              )}
            >
              <User className="w-4 h-4" />
              Entrar
            </Link>

            <Link
              href="/embarcacoes"
              className="px-5 py-2.5 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-semibold rounded-full transition-all shadow-lg hover:shadow-xl"
            >
              Reservar agora
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              scrolled ? 'text-[#0a2540]' : 'text-white'
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-[#0a2540] font-medium rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-3 text-[#0a2540] font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Entrar
              </Link>
              <Link
                href="/embarcacoes"
                className="block w-full text-center px-4 py-3 bg-[#00b4d8] text-white font-semibold rounded-xl hover:bg-[#0096b7] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Reservar agora
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
