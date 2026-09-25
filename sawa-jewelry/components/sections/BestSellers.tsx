'use client'

import { useEffect, useState } from 'react'
import { SectionTitle } from '../SectionTitle'
import { ProductCard } from '../ProductCard'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

type BestSellingProduct = {
  id: number
  produit: string
  image?: string
  prix: number
}

type ApiProduct = {
  id: number
  name: string
}

export function BestSellers() {
  const [bestsellers, setBestsellers] = useState<BestSellingProduct[]>([])

  useEffect(() => {
    async function loadBestSellers() {
      const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined
        const [bestSellersResponse, productsResponse] = await Promise.all([
          fetch('http://localhost:8080/api/admin/products/best-selling', {
            headers,
            cache: 'no-store',
          }),
          fetch('http://localhost:8080/api/products?page=0&size=100', { cache: 'no-store' }),
        ])

        if (!bestSellersResponse.ok || !productsResponse.ok) throw new Error('BEST_SELLERS_FAILED')

        const bestSellersData: unknown = await bestSellersResponse.json()
        const productsData = await productsResponse.json() as { content?: ApiProduct[] }
        const productsByName = new Map((productsData.content ?? []).map((product) => [product.name, product.id]))

        if (Array.isArray(bestSellersData)) {
          const products = (bestSellersData as Omit<BestSellingProduct, 'id'>[])
            .map((product) => ({ ...product, id: productsByName.get(product.produit) }))
            .filter((product): product is BestSellingProduct => product.id !== undefined)

          setBestsellers(products)
        }
      } catch (error) {
        console.error('Impossible de charger les meilleures ventes.', error)
      }
    }

    loadBestSellers()
  }, [])

  return (
    <section id="best-sellers" className="relative border-y border-border/50 bg-card/35 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="Most Loved"
          title="Best Sellers"
          description="The most coveted pieces from our luxury collection"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Swiper
            modules={[Pagination, Navigation]}
            slidesPerView={1}
            spaceBetween={24}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="pb-16"
          >
            {bestsellers.map((product, index) => (
              <SwiperSlide key={product.id ?? `${product.produit}-${index}`}>
                <ProductCard
                  id={String(product.id ?? '')}
                  image={product.image || '/placeholder-product.jpg'}
                  title={product.produit}
                  price={`${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(product.prix)} DH`}
                  badge="Best Seller"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}
