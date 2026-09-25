'use client'

import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setEmail('')
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <section className="relative border-t border-border/50 px-6 py-28">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="rounded-[2rem] border border-gold/25 bg-gradient-to-br from-primary/95 via-primary/90 to-[#3d382e] p-8 shadow-[0_24px_70px_rgba(32,31,28,0.16)] sm:p-12 md:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
              Stay Updated
            </p>
            <h2 className="mb-4 font-serif text-4xl font-bold text-white md:text-5xl">
              Exclusive Previews & Offers
            </h2>
            <p className="text-lg leading-relaxed text-white/70">
              Be the first to discover new collections, receive exclusive offers, and access VIP events.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-full border border-white/15 bg-white/10 py-4 pr-4 pl-12 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <motion.button
              type="submit"
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-gold px-6 py-4 font-semibold text-primary transition-all hover:bg-[#e0bd78]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="hidden sm:inline">Subscribe</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.form>

          {isSubmitted && (
            <motion.p
              className="text-center text-primary mt-4 font-mono text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              ✓ Thank you for subscribing!
            </motion.p>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
