'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  boatId: string
  boatName: string
  initialStatus: string
}

export function EmbarcacaoActions({ boatId, boatName, initialStatus }: Props) {
  const supabase = createClient()
  const router   = useRouter()
  const [status,   setStatus]   = useState(initialStatus)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isActive = status === 'active'

  async function togglePublish() {
    setToggling(true)
    const next = isActive ? 'inactive' : 'active'
    const { error } = await supabase.from('boats').update({ status: next }).eq('id', boatId)
    if (!error) setStatus(next)
    setToggling(false)
  }

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja apagar "${boatName}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    await supabase.from('boats').delete().eq('id', boatId)
    router.refresh()
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      {/* Toggle publicar */}
      <button
        type="button"
        onClick={togglePublish}
        disabled={toggling}
        title={isActive ? 'Clique para despublicar' : 'Clique para publicar'}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
          isActive
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100',
          toggling && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Switch visual */}
        <span className={cn(
          'relative inline-flex h-4 w-7 items-center rounded-full transition-colors',
          isActive ? 'bg-green-500' : 'bg-gray-300'
        )}>
          <span className={cn(
            'inline-block h-3 w-3 rounded-full bg-white shadow transition-transform',
            isActive ? 'translate-x-3.5' : 'translate-x-0.5'
          )} />
        </span>
        {isActive ? 'Publicada' : 'Publicar'}
      </button>

      {/* Apagar */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        title="Apagar embarcação"
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors',
          deleting && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Trash2 className="w-4 h-4" />
        {deleting ? 'Apagando...' : 'Apagar'}
      </button>
    </div>
  )
}
