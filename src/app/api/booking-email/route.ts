import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingConfirmationToClient, sendNewBookingToOwner } from '@/lib/email'

// Cliente admin com service role (necessário para ler auth.users)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    const supabase = getAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    // Busca a reserva completa
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id, booking_code, date, passenger_count, total_amount, platform_fee,
        boats ( id, name, owner_id,
          marinas ( name, address )
        ),
        routes ( name ),
        client:profiles!client_id ( id, full_name, phone, user_id )
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const boat   = booking.boats as any
    const route  = booking.routes as any
    const client = booking.client as any
    const marina = boat?.marinas as any

    // Email do cliente via auth.users
    const { data: clientUser } = await supabase.auth.admin.getUserById(client.user_id)
    const clientEmail = clientUser?.user?.email

    if (clientEmail) {
      await sendBookingConfirmationToClient({
        to: clientEmail,
        clientName: client.full_name ?? 'Cliente',
        bookingCode: booking.booking_code ?? '',
        boatName: boat?.name ?? '',
        routeName: route?.name ?? '',
        date: booking.date,
        passengers: booking.passenger_count,
        total: Number(booking.total_amount),
        marina: marina ? `${marina.name} — ${marina.address}` : '',
      })
    }

    // Email do proprietário
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('full_name, user_id, phone')
      .eq('id', boat.owner_id)
      .single()

    if (ownerProfile) {
      const { data: ownerUser } = await supabase.auth.admin.getUserById(ownerProfile.user_id)
      const ownerEmail = ownerUser?.user?.email

      if (ownerEmail) {
        const ownerReceives = Number(booking.total_amount) - Number(booking.platform_fee)
        await sendNewBookingToOwner({
          to: ownerEmail,
          ownerName: ownerProfile.full_name ?? 'Proprietário',
          bookingCode: booking.booking_code ?? '',
          clientName: client.full_name ?? 'Cliente',
          clientPhone: client.phone ?? undefined,
          boatName: boat?.name ?? '',
          routeName: route?.name ?? '',
          date: booking.date,
          passengers: booking.passenger_count,
          ownerReceives,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
