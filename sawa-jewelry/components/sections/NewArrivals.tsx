'use client'

import { SectionTitle } from '../SectionTitle'
import { ProductCard } from '../ProductCard'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type ApiProduct = {
  id: number
  name: string
  price: number
  imageUrl?: string
}

export function NewArrivals() {
  const router = useRouter()
  const [products, setProducts] = useState<ApiProduct[]>([])

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch('http://localhost:8080/api/products?page=0&size=4', { cache: 'no-store' })

        if (!response.ok) throw new Error('PRODUCTS_FAILED')

        const data = await response.json() as { content?: ApiProduct[] }
        setProducts(data.content ?? [])
      } catch (error) {
        console.error('Impossible de charger les nouveautés.', error)
      }
    }

    loadProducts()
  }, [])

  return (
    <section className="relative border-y border-border/50 bg-card/35 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="Our Collection"
          title="Discover Our Products"
          description="Explore our latest jewelry designs, carefully selected to bring elegance, style, and a unique touch to every look."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <ProductCard
                id={String(product.id)}
                image={product.imageUrl || '/placeholder-product.jpg'}
                title={product.name}
                price={`${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(product.price)} DH`}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            className="h-12 gap-3 rounded-full bg-primary px-7 text-sm uppercase tracking-[0.12em] text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push('/products')}
          >
            View All Products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}
