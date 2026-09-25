'use client'

import { useEffect, useState } from 'react'
import { SectionTitle } from '../SectionTitle'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

type Review = {
  id: number
  rating: number
  comment: string
  clientName: string
  productName: string
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Review[]>([])

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch('http://localhost:8080/api/reviews/random', { cache: 'no-store' })

        if (!response.ok) throw new Error('REVIEWS_FAILED')

        const data: unknown = await response.json()
        if (Array.isArray(data)) setTestimonials(data as Review[])
      } catch (error) {
        console.error('Impossible de charger les avis.', error)
      }
    }

    loadReviews()
  }, [])

  return (
    <section className="relative border-y border-border/50 bg-card/35 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="Client Stories"
          title="What Our Clients Say"
          description="Discover why jewelry connoisseurs choose SAWA for their most treasured moments"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Swiper
            modules={[Pagination]}
            slidesPerView={1}
            spaceBetween={24}
            pagination={{ clickable: true }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-16"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  className="p-8 bg-background rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col"
                  whileHover={{ y: -8 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-primary text-primary"
                      />
                    ))}
                  </div>

                    <p className="text-foreground text-lg leading-relaxed mb-6 flex-grow">
                      &quot;{testimonial.comment}&quot;
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-border">
                    <div>
                      <p className="font-serif font-bold text-foreground">
                        {testimonial.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {testimonial.productName}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}
