import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronLeft, Image as ImageIcon } from 'lucide-react'
import { MidiasClient } from './MidiasClient'

export const metadata = { title: 'Painel de Mídias' }

export default async function MidiasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: photos } = await supabase
    .from('boat_photos')
    .select(`
      id, url, order, is_cover, created_at,
      boat:boats(
        id, name, slug,
        owner:profiles!owner_id(full_name)
      )
    `)
    .order('created_at', { ascending: false })

  const rows = (photos ?? []).map(p => ({
    id:         p.id as string,
    url:        p.url as string,
    is_cover:   p.is_cover as boolean,
    created_at: p.created_at as string,
    boat_name:  (p.boat as any)?.name ?? '—',
    boat_slug:  (p.boat as any)?.slug ?? '',
    owner_name: (p.boat as any)?.owner?.full_name ?? '—',
    age:        formatDistanceToNow(new Date(p.created_at as string), { addSuffix: true, locale: ptBR }),
  }))

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0a2540]">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-playfair text-3xl font-bold text-[#0a2540] flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-[#00b4d8]" /> Painel de Mídias
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">{rows.length} foto{rows.length !== 1 ? 's' : ''} enviada{rows.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <MidiasClient photos={rows} />
        </div>
      </div>
    </>
  )
}
