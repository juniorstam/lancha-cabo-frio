import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BoatsListContent } from '@/components/embarcacao/BoatsListContent'

export const metadata = {
  title: 'Embarcações',
  description: 'Encontre a lancha, barco ou jet ski perfeito para seu passeio em Cabo Frio.',
}

export default function EmbarcacoesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8fafc] pt-20">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" /></div>}>
          <BoatsListContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
