'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export interface AnimatedContainerProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function AnimatedContainer({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  )
}
