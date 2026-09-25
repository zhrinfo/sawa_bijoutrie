'use client'

import { SectionTitle } from '../SectionTitle'
import { motion } from 'framer-motion'
import { Crown, Sparkles, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Crown,
    title: 'Premium Quality',
    description: 'Every piece crafted with ethically sourced materials and attention to detail.',
  },
  {
    icon: Sparkles,
    title: 'Timeless Design',
    description: 'Designs that transcend trends, created to be cherished for generations.',
  },
  {
    icon: Shield,
    title: 'Certified Authenticity',
    description: 'All gemstones and metals come with certification of authenticity.',
  },
  {
    icon: Zap,
    title: 'Master Craftsmanship',
    description: 'Handcrafted by master jewelers with decades of experience.',
  },
]

export function WhyChooseSawa() {
  return (
    <section id="why-choose-sawa" className="relative border-t border-border/50 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          eyebrow="Our Promise"
          title="Why Choose SAWA"
          description="We stand apart through our commitment to excellence, sustainability, and timeless beauty."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                className="group p-8 bg-card rounded-3xl border border-border hover:border-primary/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <motion.div
                  className="mb-6 p-4 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-8 h-8 text-primary" />
                </motion.div>

                <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
