'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 160)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Button
      aria-label="Retourner en haut de la page"
      className={cn(
        'fixed right-5 bottom-5 z-40 size-12 rounded-full border-gold/40 bg-background/85 text-gold shadow-[0_12px_30px_rgba(32,31,28,0.18)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-primary hover:shadow-[0_16px_34px_rgba(193,154,91,0.32)] focus-visible:ring-gold/50 sm:right-8 sm:bottom-8',
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
      onClick={scrollToTop}
      size="icon-lg"
      variant="outline"
    >
      <ArrowUp aria-hidden="true" className="size-5" />
    </Button>
  )
}