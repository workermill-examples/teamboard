import { LandingNav } from '@/components/landing/nav'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { LandingFooter } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  )
}