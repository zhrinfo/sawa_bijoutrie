'use client'

import { motion } from 'framer-motion'

export interface SectionTitleProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center' | 'right'
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'center',
}: SectionTitleProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align]

  return (
    <motion.div
      className={`mb-14 ${alignClass}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {eyebrow && (
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="mb-6 font-serif text-4xl font-bold leading-none text-foreground sm:text-5xl md:text-6xl">
        {title}
      </h2>
      <div className={`mb-6 flex items-center gap-2 ${align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'}`}>
        <span className="h-px w-10 bg-gold" />
        <span className="size-1.5 rounded-full bg-gold" />
        <span className="h-px w-10 bg-gold" />
      </div>
      {description && (
        <p className={`max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
