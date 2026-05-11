'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, ExternalLink, Star } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  url: string
  is_cover: boolean
  created_at: string
  boat_name: string
  boat_slug: string
  owner_name: string
  age: string
}

export function MidiasClient({ photos: initial }: { photos: Photo[] }) {
  const supabase = createClient()
  const [photos, setPhotos] = useState(initial)
  const [filter, setFilter] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = photos.filter(p =>
    !filter ||
    p.boat_name.toLowerCase().includes(filter.toLowerCase()) ||
    p.owner_name.toLowerCase().includes(filter.toLowerCase())
  )

  async function deletePhoto(photo: Photo) {
    if (!confirm(`Excluir esta foto de "${photo.boat_name}"?`)) return
    setDeleting(photo.id)

    // Extract storage path from URL
    const urlObj = new URL(photo.url)
    const storagePath = urlObj.pathname.split('/boat-photos/')[1]
    if (storagePath) {
      await supabase.storage.from('boat-photos').remove([storagePath])
    }
    await supabase.from('boat_photos').delete().eq('id', photo.id)
    setPhotos(p => p.filter(x => x.id !== photo.id))
    setDeleting(null)
  }

  return (
    <div>
      {/* Filtro */}
      <div className="mb-6">
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filtrar por embarcação ou proprietário..."
          className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00b4d8] transition-colors bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-3">🖼️</p>
          <p className="text-sm">Nenhuma foto encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(photo => (
            <div key={photo.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={photo.url}
                  alt={photo.boat_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=Erro' }}
                />
                {photo.is_cover && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    <Star className="w-2.5 h-2.5" /> CAPA
                  </span>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a href={photo.url} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-[#00b4d8] transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => deletePhoto(photo)}
                    disabled={deleting === photo.id}
                    className={cn(
                      'w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors',
                      deleting === photo.id && 'opacity-50'
                    )}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <Link
                  href={`/embarcacoes/${photo.boat_slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-[#0a2540] hover:text-[#00b4d8] transition-colors line-clamp-1 block"
                >
                  {photo.boat_name}
                </Link>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{photo.owner_name}</p>
                <p className="text-[11px] text-gray-300 mt-0.5">{photo.age}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
