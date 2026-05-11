import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Se veio com ?next= explícito, usa ele
      if (next) return NextResponse.redirect(`${origin}${next}`)

      // Senão, redireciona baseado no role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        const role = profile?.role ?? 'client'
        if (role === 'admin')  return NextResponse.redirect(`${origin}/admin`)
        if (role === 'owner')  return NextResponse.redirect(`${origin}/painel`)
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
