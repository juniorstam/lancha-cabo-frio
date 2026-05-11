import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Image as ImageIcon } from 'lucide-react'
import { MidiasPropietarioClient } from './MidiasProprietarioClient'

export const metadata = { title: 'Minhas Mídias' }

export default async function PainelMidiasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('id, role').eq('user_id', user.id).single()
  if (!profile || profile.role === 'client') redirect('/')

  const { data: photos } = await supabase
    .from('boat_photos')
    .select(`
      id, url, order, is_cover, created_at,
      boat:boats!inner(id, name, slug, owner_id)
    `)
    .eq('boat.owner_id', profile.id)
    .order('created_at', { ascending: false })

  const rows = (photos ?? []).map(p => ({
    id:         p.id as string,
    url:        p.url as string,
    is_cover:   p.is_cover as boolean,
    created_at: p.created_at as string,
    boat_name:  (p.boat as any)?.name ?? '—',
    boat_slug:  (p.boat as any)?.slug ?? '',
    age: formatDistanceToNow(new Date(p.created_at as string), { addSuffix: true, locale: ptBR }),
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#0a2540] flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#00b4d8]" /> Minhas Mídias
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{rows.length} foto{rows.length !== 1 ? 's' : ''} enviada{rows.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <MidiasPropietarioClient photos={rows} />
    </div>
  )
}
