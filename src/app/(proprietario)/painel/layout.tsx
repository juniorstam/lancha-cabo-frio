import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { PainelSidebar } from './PainelSidebar'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role === 'client') redirect('/')

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-[#f8fafc] pt-20">
        <PainelSidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </>
  )
}
