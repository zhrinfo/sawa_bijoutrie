'use client'

import { SectionTitle } from '../SectionTitle'
import { CollectionCard } from '../CollectionCard'
import { motion } from 'framer-motion'

const collections = [
  {
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    title: 'Eternal Rings',
    description: 'Timeless engagement and wedding rings',
    itemCount: '24',
  },
  {
    image: 'https://imagur.org/i/wEql7Z4o',
    title: 'Pearl Essence',
    description: 'Luxurious pearl jewelry collection',
    itemCount: '18',
  },
  {
    image: 'https://imagur.org/i/iFCEITr2',
    title: 'Gem Treasury',
    description: 'Precious gemstone masterpieces',
    itemCount: '32',
  },
]

export function FeaturedCollections() {
  return (
    <section className="relative border-t border-border/50 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="Curated Collections"
          title="Discover Our Collections"
          description="Explore our handpicked collections, each representing a unique expression of luxury and craftsmanship."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <CollectionCard {...collection} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
