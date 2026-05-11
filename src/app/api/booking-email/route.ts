import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmationToClient, sendNewBookingToOwner } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

    const supabase = await createClient()

    // Busca a reserva completa
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id, booking_code, date, passenger_count, total_amount, platform_fee, status,
        boats ( name, owner_id,
          marinas ( name, address )
        ),
        routes ( name ),
        client:profiles!client_id ( full_name, phone, user_id )
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const boat    = booking.boats as any
    const route   = booking.routes as any
    const client  = booking.client as any
    const marina  = boat?.marinas as any

    // Email do cliente
    const { data: clientAuthData } = await supabase.auth.admin.getUserById(client.user_id)
    const clientEmail = clientAuthData?.user?.email

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
      const { data: ownerAuthData } = await supabase.auth.admin.getUserById(ownerProfile.user_id)
      const ownerEmail = ownerAuthData?.user?.email

      if (ownerEmail) {
        const ownerReceives = Number(booking.total_amount) - Number(booking.platform_fee)
        await sendNewBookingToOwner({
          to: ownerEmail,
          ownerName: ownerProfile.full_name ?? 'Proprietário',
          bookingCode: booking.booking_code ?? '',
          clientName: client.full_name ?? 'Cliente',
          clientPhone: client.phone,
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
