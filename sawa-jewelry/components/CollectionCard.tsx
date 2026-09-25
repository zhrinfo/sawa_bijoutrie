'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export interface CollectionCardProps {
  image: string
  title: string
  description: string
  itemCount: string
}

export function CollectionCard({
  image,
  title,
  description,
  itemCount,
}: CollectionCardProps) {
  return (
    <motion.div
      className="group relative h-96 cursor-pointer overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_18px_50px_rgba(32,31,28,0.12)]"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-1000 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      <motion.div
        className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/30 to-transparent p-7"
        initial={{ opacity: 0.6 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div />
        <div className="text-white">
          <h3 className="mb-2 font-serif text-3xl font-bold">{title}</h3>
          <p className="mb-5 text-sm text-gray-300">{description}</p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{itemCount} Items</span>
            <motion.div
              initial={{ x: 0 }}
              whileHover={{ x: 6 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <ArrowRight className="h-5 w-5 text-gold" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
