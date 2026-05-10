import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedBoats } from '@/components/home/FeaturedBoats'
import { FeaturedRoutes } from '@/components/home/FeaturedRoutes'
import { HowItWorks } from '@/components/home/HowItWorks'
import { OwnerCTA } from '@/components/home/OwnerCTA'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedBoats />
        <FeaturedRoutes />
        <HowItWorks />
        <OwnerCTA />
      </main>
      <Footer />
    </>
  )
}
