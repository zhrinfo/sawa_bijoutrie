'use client'

import { useEffect, useState } from 'react'
import { SectionTitle } from '../SectionTitle'
import { motion } from 'framer-motion'

type Category = {
  id: number
  name: string
  description?: string
}

export function JewelryByCategory() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('http://localhost:8080/api/categories', { cache: 'no-store' })

        if (!response.ok) throw new Error('CATEGORIES_FAILED')

        const data: unknown = await response.json()
        if (Array.isArray(data)) setCategories(data as Category[])
      } catch (error) {
        console.error('Impossible de charger les catégories.', error)
      }
    }

    loadCategories()
  }, [])

  return (
    <section className="relative border-t border-border/50 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="Shop by Type"
          title="Jewelry by Category"
          description="Browse our collections organized by jewelry type"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_18px_45px_rgba(64,53,35,0.1)]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                  0{index + 1}
                </span>
                <span className="h-2 w-2 rounded-full bg-gold transition-transform duration-300 group-hover:scale-150" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-3 line-clamp-2 max-w-[28ch] text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <div className="mt-5 h-px w-10 bg-gold transition-all duration-300 group-hover:w-20" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

