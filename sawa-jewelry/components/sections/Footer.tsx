'use client'

import { motion } from 'framer-motion'
import { Share2, Heart, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'

const footerLinks = {
  Shop: ['Collections', 'Best Sellers', 'New Arrivals', 'Sale'],
  Company: ['About Us', 'Craftsmanship', 'Careers', 'Press'],
  Support: ['Contact Us', 'FAQs', 'Shipping & Returns', 'Care Guide'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookies', 'Accessibility'],
}

const socialLinks = [
  { icon: Share2, href: '#', label: 'Share' },
  { icon: Heart, href: '#', label: 'Favorites' },
  { icon: Mail, href: '#', label: 'Email' },
  { icon: MessageCircle, href: '#', label: 'Contact' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      {/* Main Footer */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="mb-4">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sawa-ULakSyyYatTiH6aVCLIhNc56V7Xkor.jpeg"
                  alt="SAWA"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Luxury jewelry crafted with passion and perfection for over three generations.
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <motion.a
                    key={label}
                    href={href}
                    className="rounded-full border border-border bg-card p-2.5 transition-all hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-primary"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (categoryIndex + 1) * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h4 className="font-serif font-bold text-foreground mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-muted-foreground text-sm hover:text-primary transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <motion.div
            className="h-px bg-border mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          />

          {/* Bottom */}
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground text-sm">
              © {currentYear} SAWA Jewelry. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
