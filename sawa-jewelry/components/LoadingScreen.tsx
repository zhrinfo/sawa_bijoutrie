'use client'

import { Diamond } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sawa-ULakSyyYatTiH6aVCLIhNc56V7Xkor.jpeg'

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 1800)

    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          aria-label="Chargement de SAWA Bijouterie"
          role="status"
        >
          <motion.div
            className="relative mb-7"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="absolute -inset-4 rounded-full bg-gold/15 blur-xl" />
            <Image
              src={logoUrl}
              alt="SAWA"
              width={92}
              height={92}
              priority
              className="relative rounded-full ring-1 ring-gold shadow-[0_0_32px_rgba(212,175,55,0.35)]"
            />
          </motion.div>

          <motion.div
            className="flex items-center gap-3 text-gold"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Diamond className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-serif text-xl tracking-[0.22em]">SAWA BIJOUTERIE</span>
            <Diamond className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </motion.div>

          <motion.div
            className="mt-5 h-px w-28 overflow-hidden bg-gold/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <motion.div
              className="h-full w-1/2 bg-gold"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}