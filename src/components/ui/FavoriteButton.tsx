'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  boatId: string
  className?: string
  size?: 'sm' | 'md'
}

export function FavoriteButton({ boatId, className, size = 'md' }: FavoriteButtonProps) {
  const supabase = createClient()
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setAuthLoading(false); return }
      // favorites.user_id referencia profiles(id), não auth.users(id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single()
      if (!profile) { setAuthLoading(false); return }
      setProfileId(profile.id)
      await checkFavorite(profile.id)
      setAuthLoading(false)
    })
  }, [boatId])

  async function checkFavorite(pid: string) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', pid)
      .eq('boat_id', boatId)
      .maybeSingle()
    setFavorited(!!data)
  }

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Still loading auth — wait for it to resolve
    if (authLoading) return

    // Auth resolved and no profile → not logged in
    if (!profileId) {
      // Double-check session before redirecting (avoids false redirect on slow networks)
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        window.location.href = '/login'
      }
      return
    }

    setLoading(true)
    if (favorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', profileId)
        .eq('boat_id', boatId)
      setFavorited(false)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: profileId, boat_id: boatId })
      setFavorited(true)
    }
    setLoading(false)
  }

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const btnSize  = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'

  return (
    <button
      onClick={toggle}
      disabled={loading || authLoading}
      className={cn(
        btnSize,
        'bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all',
        favorited ? 'bg-red-50' : 'hover:bg-white',
        (loading || authLoading) && 'opacity-60',
        className
      )}
      title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart
        className={cn(
          iconSize, 'transition-colors',
          favorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
        )}
      />
    </button>
  )
}
