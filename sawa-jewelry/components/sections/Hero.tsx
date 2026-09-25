'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FloatingJewelryScene } from '@/components/FloatingJewelryScene'

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0d0d0c] pt-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_72%,rgba(21,56,24,0.5),transparent_30%),radial-gradient(circle_at_68%_48%,rgba(193,154,91,0.16),transparent_23%),linear-gradient(115deg,#0b0b0a_0%,#171511_55%,#090909_100%)]" />
      <FloatingJewelryScene />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 max-w-xl text-left"
        >
          <div className="mb-5 flex items-center gap-3 text-gold">
            <span className="h-px w-10 bg-gold/70" />
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]">Collection 2026</p>
          </div>
        </motion.div>

        <motion.h1
          className="mb-8 max-w-2xl font-serif text-6xl font-semibold leading-[0.9] tracking-tight text-white md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          ÉLÉGANCE
          <br />
          <span className="text-[#f4d999]">INTEMPORELLE</span>
        </motion.h1>

        <motion.p
          className="mb-10 max-w-md text-base leading-relaxed text-white/65 md:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Découvrez des bijoux conçus pour révéler votre éclat.
        </motion.p>

        <motion.div
          className="flex flex-col items-start gap-5 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="group inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_12px_30px_rgba(193,154,91,0.24)] transition-all hover:-translate-y-1 hover:bg-[#e0bd78] hover:shadow-[0_18px_36px_rgba(193,154,91,0.38)]"
          >
            Découvrir la collection
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
       
        </motion.div>
      </div>

      <div className="absolute right-6 bottom-10 left-6 z-10 flex items-end justify-between sm:right-10 sm:left-10">
        <div className="hidden items-center gap-4 text-left text-white/70 sm:flex">
          <span className="font-serif text-2xl italic text-gold">Sawa</span>
          <span className="h-6 w-px bg-white/25" />
          <span className="font-mono text-[9px] uppercase tracking-[0.25em]">L'art de durer</span>
        </div>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">Pièce N° 01 / 26</span>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="h-6 w-6 text-gold" />
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-28 right-[8%] h-72 w-72 rounded-full border border-gold/20 opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-20 left-[12%] h-96 w-96 rounded-full border border-[#153818]/70 opacity-30"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
    </section>
  )
}
