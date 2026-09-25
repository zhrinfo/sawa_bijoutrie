'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowRight, ChevronLeft, Gem, Heart, MessageCircle, RotateCcw, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface AssistantProduct {
  id: number
  name: string
  price: number
  imageUrl?: string
  category?: { name: string }
}

type Choice = 'category' | 'priority' | 'budget'

const apiUrl = 'http://localhost:8080/api/products/active'
const allCategories = 'Toutes les catégories'
const priorityChoices = ['Le prix le plus doux', 'Le meilleur compromis', 'Une pièce premium']
const budgetChoices = [
  { label: 'Moins de 50 $', min: 0, max: 50 },
  { label: '50 à 100 $', min: 50, max: 100 },
  { label: '100 à 180 $', min: 100, max: 180 },
  { label: 'Sans limite', min: 0, max: Infinity },
]

function matchesCategory(product: AssistantProduct, category: string) {
  return category === allCategories || product.category?.name?.toLowerCase() === category.toLowerCase()
}

function scoreProduct(product: AssistantProduct, preferences: Record<Choice, string>) {
  let score = 0
  if (matchesCategory(product, preferences.category)) score += 5
  const budget = budgetChoices.find((choice) => choice.label === preferences.budget)
  if (budget && product.price <= budget.max) score += 3
  if (preferences.priority === 'Le prix le plus doux') score += Math.max(0, 3 - product.price / 100)
  if (preferences.priority === 'Une pièce premium') score += product.price / 100
  return score
}

export function SawaAssistant() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [products, setProducts] = useState<AssistantProduct[]>([])
  const [step, setStep] = useState<Choice | 'intro' | 'results'>('intro')
  const [preferences, setPreferences] = useState<Record<Choice, string>>({ category: '', priority: '', budget: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || products.length) return
    setIsLoading(true)
    fetch(apiUrl)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Products unavailable'))))
      .then((data: AssistantProduct[] | { content?: AssistantProduct[] }) => setProducts(Array.isArray(data) ? data : data.content ?? []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false))
  }, [isOpen, products.length])

  const categoryChoices = useMemo(() => {
    const categories = products
      .map((product) => product.category?.name?.trim())
      .filter((category): category is string => Boolean(category))

    return [allCategories, ...Array.from(new Set(categories))]
  }, [products])

  const recommendations = useMemo(() => {
    const budget = budgetChoices.find((choice) => choice.label === preferences.budget)
    if (!budget) return []

    return products
      .filter((product) => {
        const matchesPrice = product.price >= budget.min && product.price <= budget.max
        return matchesPrice && matchesCategory(product, preferences.category)
      })
      .sort((first, second) => scoreProduct(second, preferences) - scoreProduct(first, preferences))
      .slice(0, 3)
  }, [preferences, products])

  if (pathname.startsWith('/admin')) return null

  function selectChoice(choice: string) {
    if (step === 'intro') {
      setPreferences((current) => ({ ...current, category: choice }))
      setStep('priority')
    } else if (step === 'priority') {
      setPreferences((current) => ({ ...current, priority: choice }))
      setStep('budget')
    } else if (step === 'budget') {
      setPreferences((current) => ({ ...current, budget: choice }))
      setStep('results')
    }
  }

  function reset() {
    setPreferences({ category: '', priority: '', budget: '' })
    setStep('intro')
  }

  const choices = step === 'intro' ? categoryChoices : step === 'priority' ? priorityChoices : budgetChoices.map((choice) => choice.label)
  const stepLabel = step === 'intro' ? '01 / 03' : step === 'priority' ? '02 / 03' : step === 'budget' ? '03 / 03' : 'SÉLECTION POUR VOUS'

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-7 sm:right-7">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.section
            key="assistant-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="mb-4 w-[calc(100vw-2.5rem)] max-w-[390px] overflow-hidden rounded-[1.75rem] border border-[#e6d6b9] bg-[#fffdf9] shadow-[0_24px_80px_rgba(35,27,20,0.2)]"
            aria-label="Assistant shopping SAWA"
          >
            <div className="relative overflow-hidden bg-[#201f1c] px-5 pb-6 pt-5 text-white">
              <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border border-[#d6b879]/30" />
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d6b879] text-[#201f1c]"><Sparkles className="h-5 w-5" /></span>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#e9c982]">SAWA personal edit</p>
                    <h2 className="mt-1 font-serif text-2xl leading-none">Votre bijou idéal</h2>
                  </div>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Fermer l’assistant" className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              {step !== 'results' && <p className="relative mt-5 max-w-[290px] text-sm leading-relaxed text-white/70">Répondez à trois questions basées sur les pièces disponibles.</p>}
              <p className="relative mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#e9c982]">{stepLabel}</p>
            </div>

            {step === 'results' ? (
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-2xl text-foreground">La sélection Sawa</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Des pièces choisies selon votre univers et votre budget.</p>
                  </div>
                  <Heart className="mt-1 h-5 w-5 shrink-0 text-gold" />
                </div>
                {isLoading ? <div className="py-10 text-center font-serif text-xl text-muted-foreground">Je cherche vos pièces...</div> : recommendations.length ? (
                  <div className="mt-5 space-y-3">
                    {recommendations.map((product) => (
                      <button key={product.id} type="button" onClick={() => router.push(`/products/${product.id}`)} className="group flex w-full items-center gap-3 rounded-2xl border border-[#eee4d5] bg-[#fffaf3] p-2 text-left transition-all hover:border-gold hover:shadow-[0_10px_24px_rgba(193,154,91,0.14)]">
                        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f1ece4]">
                          {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="56px" /> : <Gem className="absolute inset-0 m-auto h-5 w-5 text-gold" />}
                        </div>
                        <span className="min-w-0 flex-1"><span className="block truncate font-serif text-lg text-foreground">{product.name}</span><span className="font-mono text-[10px] text-gold">{product.price.toFixed(2)} $</span></span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                ) : <div className="py-10 text-center text-sm text-muted-foreground">La sélection arrive bientôt. Explorez toutes nos pièces.</div>}
                <button type="button" onClick={reset} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-foreground transition-colors hover:text-gold"><RotateCcw className="h-3.5 w-3.5" /> Recommencer</button>
              </div>
            ) : (
              <div className="p-5">
                <p className="mb-4 text-sm font-medium text-foreground">{step === 'intro' ? 'Quelle catégorie cherchez-vous ?' : step === 'priority' ? 'Quelle priorité pour votre sélection ?' : 'Quel budget souhaitez-vous respecter ?'}</p>
                {isLoading && step === 'intro' ? <div className="py-6 text-center font-serif text-xl text-muted-foreground">Je regarde les catégories disponibles...</div> : <div className="grid gap-2">
                  {choices.map((choice) => <button key={choice} type="button" onClick={() => selectChoice(choice)} className="group flex items-center justify-between rounded-xl border border-[#eee4d5] bg-white px-4 py-3 text-left text-sm text-foreground transition-all hover:border-gold hover:bg-[#fffaf3]"><span>{choice}</span><ArrowRight className="h-4 w-4 text-gold opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100" /></button>)}
                </div>}
                {step !== 'intro' && <button type="button" onClick={() => setStep(step === 'budget' ? 'priority' : 'intro')} className="mt-5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="h-3.5 w-3.5" /> Retour</button>}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button type="button" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? 'Fermer l’assistant SAWA' : 'Ouvrir l’assistant SAWA'} className="ml-auto flex items-center gap-3 rounded-full bg-[#201f1c] py-2 pl-2 pr-4 text-white shadow-[0_14px_35px_rgba(32,31,28,0.24)] transition-colors hover:bg-[#3a352d]" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#d6b879] text-[#201f1c]"><MessageCircle className="h-5 w-5" /><span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#201f1c] bg-[#91aca0]" /></span>
        <span className="hidden text-left sm:block"><span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#e9c982]">Besoin d’aide ?</span><span className="block font-serif text-lg leading-none">Parler à Sawa</span></span>
      </motion.button>
    </div>
  )
}