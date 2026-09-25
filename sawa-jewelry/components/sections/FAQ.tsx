'use client'

import { SectionTitle } from '../SectionTitle'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    id: '1',
    question: 'How do you ensure the authenticity of your gemstones?',
    answer: 'All our gemstones come with official certification from recognized gemological institutes. Each piece includes a detailed authentication certificate with its unique specifications and origin.',
  },
  {
    id: '2',
    question: 'What is your return and exchange policy?',
    answer: 'We offer a 30-day return policy on all unworn items in original packaging. Exchanges are available within 60 days. Custom pieces have a 14-day inspection period.',
  },
  {
    id: '3',
    question: 'Do you offer custom jewelry design services?',
    answer: 'Yes! Our master artisans can create bespoke pieces tailored to your specifications. Schedule a consultation with our design team to bring your vision to life.',
  },
  {
    id: '4',
    question: 'How do I care for my SAWA jewelry?',
    answer: 'Each piece comes with detailed care instructions. Generally, store jewelry in our provided pouches, avoid harsh chemicals, and have professional cleaning annually.',
  },
  {
    id: '5',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, wire transfers, and cryptocurrency payments. Flexible payment plans are available for purchases over $10,000.',
  },
  {
    id: '6',
    question: 'How long does shipping take?',
    answer: 'Domestic orders typically arrive within 3-5 business days. International orders take 7-14 days. All items are insured and tracked throughout delivery.',
  },
]

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>('1')

  return (
    <section className="relative border-y border-border/50 bg-card/35 px-6 py-28">
      <div className="max-w-3xl mx-auto">
        <SectionTitle
          eyebrow="Common Questions"
          title="Frequently Asked Questions"
          description="Find answers to common questions about our jewelry and services"
        />

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              className="border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-card/50 transition-colors text-left"
              >
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-4 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
