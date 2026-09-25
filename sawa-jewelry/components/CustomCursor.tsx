'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [isDiamond, setIsDiamond] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)

  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 })

  useEffect(() => {
    const moveCursor = (event: MouseEvent) => {
      x.set(event.clientX - 14)
      y.set(event.clientY - 14)
      setIsVisible(true)
    }

    const showDiamond = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const interactive = target.closest('a, button, input, textarea, select, [role="button"]')
      setIsDiamond(Boolean(interactive))
    }

    const hideCursor = () => setIsVisible(false)

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', showDiamond)
    window.addEventListener('mouseout', hideCursor)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', showDiamond)
      window.removeEventListener('mouseout', hideCursor)
    }
  }, [x, y])

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden lg:block"
      style={{ x: springX, y: springY }}
      animate={{
        scale: isVisible ? 1 : 0,
        opacity: isVisible ? 1 : 0,
        rotate: isDiamond ? 45 : 0,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.4 }}
    >
      <div
        className={
          isDiamond
            ? 'h-7 w-7 rounded-[6px] border border-gold bg-gold/20 shadow-[0_0_22px_rgba(212,175,55,0.35)]'
            : 'h-7 w-7 rounded-full border border-gold bg-gold/15 shadow-[0_0_22px_rgba(212,175,55,0.25)]'
        }
      />
    </motion.div>
  )
}