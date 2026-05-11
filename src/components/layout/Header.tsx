'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, Heart, User, LogOut, LayoutDashboard, ChevronDown, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const router = useRouter()
  const supabase = createClient()

  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userRole, setUserRole] = useState<string>('client')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      if (data.user) fetchRole(data.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchRole(session.user.id)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchRole(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single()
    if (data?.role) setUserRole(data.role)
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const dashboardHref = userRole === 'admin' ? '/admin' : userRole === 'owner' ? '/painel' : '/reservas'
  const dashboardLabel = userRole === 'admin' ? 'Admin' : userRole === 'owner' ? 'Meu Painel' : 'Minhas Reservas'

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const initials = displayName.slice(0, 2).toUpperCase()

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

          {/* Ações Desktop */}
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

            {user ? (
              /* Usuário logado — dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#00b4d8] flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <span className={cn('text-sm font-medium max-w-[100px] truncate', scrolled ? 'text-[#0a2540]' : 'text-white')}>
                    {displayName.split(' ')[0]}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', scrolled ? 'text-[#0a2540]' : 'text-white', menuOpen && 'rotate-180')} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-[#0a2540] truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#00b4d8]" />
                      {dashboardLabel}
                    </Link>
                    <Link
                      href="/reservas"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-[#00b4d8]" />
                      Minhas reservas
                    </Link>
                    <Link
                      href="/perfil"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#00b4d8]" />
                      Meu perfil
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Não logado */
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
            )}

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
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#00b4d8] flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#0a2540]">{displayName.split(' ')[0]}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href={dashboardHref}
                    className="block w-full text-center px-4 py-3 text-[#0a2540] font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {dashboardLabel}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-4 py-3 text-red-500 font-medium rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-3 text-[#0a2540] font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Entrar
                </Link>
              )}
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
