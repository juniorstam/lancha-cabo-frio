import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { AgendaCalendar } from './AgendaCalendar'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const supabase = await createClient()
  const { mes } = await searchParams

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role === 'client') redirect('/')

  // Barcos do owner
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name')
    .eq('owner_id', profile.id)

  const boatIds = (boats ?? []).map(b => b.id)

  // Mês para exibir (default: mês atual)
  const now    = new Date()
  const target = mes ? new Date(mes + '-01T12:00:00') : now
  const year   = target.getFullYear()
  const month  = target.getMonth() + 1
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay  = new Date(year, month, 0).toISOString().split('T')[0]

  // Reservas do mês
  const { data: bookings } = boatIds.length > 0
    ? await supabase
        .from('bookings')
        .select(`
          id, booking_code, date, passenger_count, status,
          routes ( name ),
          client:profiles!client_id ( full_name ),
          boats ( name )
        `)
        .in('boat_id', boatIds)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .neq('status', 'cancelled')
        .order('date', { ascending: true })
    : { data: [] }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/painel" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0a2540]">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-[#0a2540]">Agenda</h1>
              <p className="text-gray-400 text-sm mt-0.5">Visualize seus passeios por dia</p>
            </div>
          </div>

          <AgendaCalendar
            year={year}
            month={month}
            bookings={(bookings ?? []).map(b => ({
              id: b.id,
              booking_code: b.booking_code ?? '',
              date: b.date,
              passenger_count: b.passenger_count,
              status: b.status,
              route_name: (b.routes as any)?.name ?? '—',
              client_name: (b.client as any)?.full_name ?? '—',
              boat_name: (b.boats as any)?.name ?? '—',
            }))}
          />
    </div>
  )
}
