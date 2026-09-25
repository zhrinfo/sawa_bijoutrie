import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/sections/Hero'
import { FeaturedCollections } from '@/components/sections/FeaturedCollections'
import { BestSellers } from '@/components/sections/BestSellers'
import { WhyChooseSawa } from '@/components/sections/WhyChooseSawa'
import { LuxuryBanner } from '@/components/sections/LuxuryBanner'
import { NewArrivals } from '@/components/sections/NewArrivals'
import { JewelryByCategory } from '@/components/sections/JewelryByCategory'
import { FeaturedProduct } from '@/components/sections/FeaturedProduct'
import { Testimonials } from '@/components/sections/Testimonials'
import { InstagramGallery } from '@/components/sections/InstagramGallery'
import { FAQ } from '@/components/sections/FAQ'
import { Footer } from '@/components/sections/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'

export default function Home() {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-36 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gold/8 blur-3xl" />
          <div className="absolute top-[34rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero />
          <FeaturedCollections />
          <BestSellers />
          <WhyChooseSawa />
          <LuxuryBanner />
          <NewArrivals />
          <JewelryByCategory />
          <FeaturedProduct />
          <Testimonials />
          <InstagramGallery />
          <FAQ />
          <Footer />
        </div>
      </main>
      <ScrollToTop />
    </>
  )
}
