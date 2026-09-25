'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, Share2, ShoppingCart } from 'lucide-react'

export function FeaturedProduct() {
  return (
    <section className="relative border-t border-border/50 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden bg-card"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
              alt="Featured Product"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <motion.div
              className="absolute top-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-mono font-semibold"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              viewport={{ once: true }}
            >
              Spotlight Collection
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-mono text-xs uppercase tracking-widest mb-4">
              Featured Piece
            </p>

            <h2 className="font-serif text-5xl font-bold text-foreground mb-6">
              The Crown Jewel
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              An extraordinary masterpiece featuring a rare 5-carat Golconda diamond, surrounded by perfectly matched sapphires. This piece represents the pinnacle of luxury jewelry craftsmanship.
            </p>

            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Price</p>
                  <p className="font-serif text-4xl font-bold text-primary">$28,500</p>
                </div>
              </div>

              <div className="flex gap-3 mb-8 flex-wrap">
                <span className="text-xs bg-secondary text-secondary-foreground px-3 py-2 rounded-full font-mono">
                  18K Gold
                </span>
                <span className="text-xs bg-secondary text-secondary-foreground px-3 py-2 rounded-full font-mono">
                  5 Carat
                </span>
                <span className="text-xs bg-secondary text-secondary-foreground px-3 py-2 rounded-full font-mono">
                  Certified
                </span>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <motion.button
                className="flex-1 min-w-[200px] px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </motion.button>
              <motion.button
                className="p-4 border border-primary text-primary rounded-2xl hover:bg-primary/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="p-4 border border-primary text-primary rounded-2xl hover:bg-primary/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">Free worldwide shipping</span> on orders over $5,000. Insured delivery with authentication certificate included.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
