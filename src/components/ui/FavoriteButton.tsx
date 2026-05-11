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
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      checkFavorite(data.user.id)
    })
  }, [boatId])

  async function checkFavorite(uid: string) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', uid)
      .eq('boat_id', boatId)
      .maybeSingle()
    setFavorited(!!data)
  }

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    if (favorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('boat_id', boatId)
      setFavorited(false)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, boat_id: boatId })
      setFavorited(true)
    }
    setLoading(false)
  }

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const btnSize  = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        btnSize,
        'bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all',
        favorited ? 'bg-red-50' : 'hover:bg-white',
        loading && 'opacity-60',
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
