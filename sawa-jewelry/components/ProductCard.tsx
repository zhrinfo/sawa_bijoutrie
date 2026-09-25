'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface ProductCardProps {
  id: string
  image: string
  title: string
  price: string
  badge?: string
  onHover?: (id: string) => void
  disabled?: boolean
}

export function ProductCard({
  id,
  image,
  title,
  price,
  badge,
  onHover,
  disabled = false,
}: ProductCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      type="button"
      disabled={disabled || !id}
      onClick={() => {
        if (!disabled && id) router.push(`/products/${id}`)
      }}
      className="group relative w-full cursor-pointer text-left outline-none disabled:cursor-default"
      onHoverStart={() => {
        setIsHovered(true)
        onHover?.(id)
      }}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_12px_30px_rgba(32,31,28,0.06)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-gold/50 group-hover:shadow-[0_20px_40px_rgba(32,31,28,0.12)] group-focus-visible:ring-2 group-focus-visible:ring-gold/60">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {badge && (
          <div className="absolute top-4 right-4 rounded-full bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-primary-foreground shadow-lg">
            {badge}
          </div>
        )}

        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg">Voir détail</span>
        </motion.div>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 truncate font-serif text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="font-mono text-sm font-semibold tracking-wide text-gold">{price}</p>
      </div>
    </motion.button>
  )
}
