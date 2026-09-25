'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Diamond, Package, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'

interface OrderItem {
  priceAtPurchase: number
  quantity: number
  productId: number
  brand: string
  name: string
  sizeId: number | null
  sizeName: string | null
  colorId: number | null
  colorName: string | null
}

interface Order {
  id: number
  orderDate: string
  phoneNumber: string
  shippingAddress: string
  status: string
  totalAmount: number
  deliveryFee: number
  city: string
  email: string
  fullName: string
  items: OrderItem[]
}

const ordersUrl = 'http://localhost:8080/api/orders/my-orders'
const currency = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' })

function getAuthToken() {
  return window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function statusLabel(status: string) {
  return status === 'PENDING' ? 'En préparation' : status === 'SHIPPED' ? 'Expédiée' : status === 'DELIVERED' ? 'Livrée' : status
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      const token = getAuthToken()

      if (!token) {
        setIsLoggedOut(true)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(ordersUrl, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) setIsLoggedOut(true)
          throw new Error('ORDERS_FAILED')
        }

        setOrders(await response.json())
      } catch {
        setError('Impossible de charger vos commandes. Vérifiez que le serveur est démarré.')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-36 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute -right-8 top-28 text-gold/20" aria-hidden="true">
          <Diamond className="h-48 w-48 rotate-12" strokeWidth={0.7} />
        </div>

        <header className="relative max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-gold">Espace personnel / suivi</p>
          <h1 className="mt-4 font-serif text-6xl leading-[0.9] text-foreground sm:text-8xl">Mes commandes</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">Chaque création, de votre sélection à sa livraison, réunie dans un seul espace.</p>
        </header>

        {isLoading && <div className="py-24 text-center font-serif text-3xl">Chargement de vos commandes...</div>}

        {!isLoading && isLoggedOut && (
          <div className="mt-16 border border-border bg-card p-10 text-center shadow-[0_20px_60px_rgba(11,106,90,0.08)]">
            <UserRound className="mx-auto h-10 w-10 text-gold" strokeWidth={1.2} />
            <h2 className="mt-5 font-serif text-4xl">Connectez-vous pour continuer</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">Votre historique de commandes est réservé aux clients SAWA connectés.</p>
            <Link href="/login" className="mt-7 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-primary/90">
              Se connecter <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        {!isLoading && !isLoggedOut && error && <p className="mt-16 border border-destructive/30 bg-card p-8 text-center text-destructive">{error}</p>}

        {!isLoading && !isLoggedOut && !error && orders.length === 0 && (
          <div className="mt-16 border border-border bg-card p-10 text-center">
            <Package className="mx-auto h-10 w-10 text-gold" strokeWidth={1.2} />
            <h2 className="mt-5 font-serif text-4xl">Aucune commande pour le moment</h2>
            <p className="mt-3 text-muted-foreground">Vos prochaines créations SAWA apparaîtront ici.</p>
            <Link href="/products" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-primary hover:text-gold">
              Découvrir la collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!isLoading && !isLoggedOut && !error && orders.length > 0 && (
          <section className="mt-16 grid gap-7">
            {orders.map((order, index) => (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="border border-border bg-card shadow-[0_18px_55px_rgba(11,106,90,0.07)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border p-6 sm:p-8">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Commande #{order.id}</p>
                    <h2 className="mt-3 font-serif text-3xl text-foreground">{formatDate(order.orderDate)}</h2>
                  </div>
                  <span className="border border-gold/50 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">{statusLabel(order.status)}</span>
                </div>
                <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="divide-y divide-border">
                    {order.items.map((item, itemIndex) => (
                      <div key={`${order.id}-${item.productId}-${item.sizeId}-${itemIndex}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-secondary text-gold"><Diamond className="h-7 w-7" strokeWidth={1} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-2xl">{item.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">{item.brand} · Quantité {item.quantity}</p>
                          <p className="mt-2 text-sm text-muted-foreground">Taille {item.sizeName || 'Standard'}{item.colorName ? ` · ${item.colorName}` : ''}</p>
                        </div>
                        <p className="shrink-0 text-right text-sm font-semibold text-primary">{currency.format(item.priceAtPurchase * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <aside className="border-l-2 border-gold bg-primary p-6 text-primary-foreground">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-gold">Total de la commande</p>
                    <p className="mt-3 font-serif text-4xl text-gold">{currency.format(order.totalAmount)}</p>
                    <p className="mt-2 text-xs text-primary-foreground/65">Livraison : {currency.format(order.deliveryFee)}</p>
                    <div className="my-5 h-px bg-primary-foreground/20" />
                    <p className="text-sm leading-relaxed text-primary-foreground/80">{order.city}<br />{order.shippingAddress}</p>
                  </aside>
                </div>
                <details className="border-t border-border px-6 py-4 sm:px-8">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-primary">
                    Informations de livraison <ChevronDown className="h-4 w-4" />
                  </summary>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>{order.fullName}</span><span>{order.phoneNumber}</span><span>{order.email}</span>
                  </div>
                </details>
              </motion.article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}