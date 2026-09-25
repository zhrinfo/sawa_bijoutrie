'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function LuxuryBanner() {
  return (
    <section className="relative border-t border-border/50 px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="relative h-[30rem] overflow-hidden rounded-[2rem] border border-gold/25 bg-primary shadow-[0_24px_70px_rgba(32,31,28,0.18)]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Image
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80"
            alt="Luxury Banner"
            fill
            className="object-cover opacity-45 transition-transform duration-1000 hover:scale-105"
            sizes="100vw"
          />

          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-r from-primary/95 via-primary/65 to-primary/30 p-6">
            <motion.div
              className="text-center max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                Exclusive Offer
              </p>
              <h2 className="mb-6 font-serif text-4xl font-bold leading-none text-white sm:text-5xl md:text-6xl">
                Heritage of Excellence
              </h2>
              <p className="mb-8 text-base leading-relaxed text-white/75 sm:text-lg">
                Three generations of master craftsmen have refined our techniques, creating timeless pieces that endure through the ages.
              </p>
              <motion.button
                className="rounded-full border border-gold/50 bg-gold px-8 py-4 font-semibold text-primary transition-all hover:-translate-y-1 hover:bg-[#e0bd78] hover:shadow-lg hover:shadow-gold/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Discover Heritage Collection
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
