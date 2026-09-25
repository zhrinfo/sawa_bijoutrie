'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Diamond, Package, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'

interface CartItem {
  id: number
  quantity: number
  productId: number
  productName: string
  price: number
  sizeId: number | null
  colorId: number | null
}

interface Cart {
  id: number
  totalAmount: number
  items: CartItem[]
}

interface DeliveryAddress {
  id: number
  city: string
  deliveryFee: number
}

const ordersUrl = 'http://localhost:8080/api/cart'
const checkoutUrl = 'http://localhost:8080/api/orders/checkout'
const deliveryAddressesUrl = '/api/delivery-addresses'
const currency = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' })

function getAuthToken() {
  return window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([])
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState('')
  const [deliveryCityQuery, setDeliveryCityQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDeliveryAddresses, setIsLoadingDeliveryAddresses] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const selectedDeliveryAddress = deliveryAddresses.find((address) => String(address.id) === selectedDeliveryAddressId)
  const matchingDeliveryAddresses = deliveryAddresses.filter((address) =>
    address.city.toLocaleLowerCase('fr').includes(deliveryCityQuery.toLocaleLowerCase('fr')),
  )
  const orderTotal = (cart?.totalAmount ?? 0) + (selectedDeliveryAddress?.deliveryFee ?? 0)

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = getAuthToken()

    if (!token) {
      setIsLoggedOut(true)
      return
    }

    if (!shippingAddress.trim() || !selectedDeliveryAddress || !phoneNumber.trim()) {
      setCheckoutError('Veuillez renseigner votre adresse et votre numéro de téléphone.')
      return
    }

    setIsCheckingOut(true)
    setCheckoutError('')
    setSuccessMessage('')

    try {
      const response = await fetch(checkoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: shippingAddress.trim(),
          city: selectedDeliveryAddress.city,
          phoneNumber: phoneNumber.trim(),
        }),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsLoggedOut(true)
        }
        throw new Error('CHECKOUT_FAILED')
      }

      setCart((currentCart) => currentCart ? { ...currentCart, items: [], totalAmount: 0 } : currentCart)
      setShippingAddress('')
      setSelectedDeliveryAddressId('')
      setDeliveryCityQuery('')
      setPhoneNumber('')
      setSuccessMessage('Votre commande a été passée avec succès.')
    } catch {
      setCheckoutError('Impossible de finaliser la commande. Vérifiez vos informations et réessayez.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  useEffect(() => {
    async function loadDeliveryAddresses() {
      try {
        const response = await fetch(deliveryAddressesUrl)

        if (!response.ok) throw new Error('DELIVERY_ADDRESSES_FAILED')

        const addresses: DeliveryAddress[] = await response.json()
        setDeliveryAddresses(addresses)
      } catch {
        setCheckoutError('Impossible de charger les villes de livraison. Réessayez plus tard.')
      } finally {
        setIsLoadingDeliveryAddresses(false)
      }
    }

    async function loadCart() {
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
          throw new Error('CART_FAILED')
        }

        setCart(await response.json())
      } catch {
        setError('Impossible de charger vos commandes. Vérifiez que le serveur est démarré.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDeliveryAddresses()
    loadCart()
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-36 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute right-10 top-28 text-gold/25" aria-hidden="true">
          <Diamond className="h-28 w-28 rotate-12" strokeWidth={1} />
        </div>

        <Link href="/products" className="relative z-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Continuer mes achats
        </Link>
        <div className="relative z-10 mt-10 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">Espace personnel</p>
          <h1 className="mt-3 font-serif text-6xl leading-none text-foreground sm:text-7xl">Mon panier</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">Retrouvez ici l&apos;historique de vos commandes et les détails de chaque création SAWA.</p>
        </div>

        {isLoading && <div className="py-24 text-center font-serif text-3xl">Chargement de votre panier...</div>}

        {!isLoading && isLoggedOut && (
          <div className="mt-16 border border-border bg-card p-10 text-center shadow-[0_20px_60px_rgba(11,106,90,0.08)]">
            <UserRound className="mx-auto h-10 w-10 text-gold" strokeWidth={1.2} />
            <h2 className="mt-5 font-serif text-4xl">Connectez-vous pour voir votre panier</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">Votre panier est réservé aux clients SAWA connectés.</p>
            <Link href="/login" className="mt-7 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-colors hover:bg-primary/90">
              Se connecter <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        {!isLoading && !isLoggedOut && error && <p className="mt-16 border border-destructive/30 bg-card p-8 text-center text-destructive">{error}</p>}

        {!isLoading && !isLoggedOut && successMessage && <p className="mt-16 border border-gold/40 bg-gold/10 p-8 text-center text-primary" role="status">{successMessage}</p>}

        {!isLoading && !isLoggedOut && !error && (!cart || cart.items.length === 0) && (
          <div className="mt-16 border border-border bg-card p-10 text-center">
            <Package className="mx-auto h-10 w-10 text-gold" strokeWidth={1.2} />
            <h2 className="mt-5 font-serif text-4xl">Votre panier est vide</h2>
            <p className="mt-3 text-muted-foreground">Les pièces que vous ajouterez apparaîtront ici.</p>
          </div>
        )}

        {!isLoading && !isLoggedOut && !error && cart && cart.items.length > 0 && (
          <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <motion.article initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="border border-border bg-card shadow-[0_15px_45px_rgba(11,106,90,0.06)]">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-6 sm:p-8">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Panier #{cart.id}</p>
                  <h2 className="mt-3 font-serif text-3xl">Vos créations sélectionnées</h2>
                </div>
                <span className="border border-gold/50 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">{cart.items.length} article{cart.items.length > 1 ? 's' : ''}</span>
              </header>
              <div className="divide-y divide-border">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-6 sm:p-8">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-secondary text-gold"><Diamond className="h-8 w-8" strokeWidth={1} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-2xl text-foreground">{item.productName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">Création SAWA · Quantité {item.quantity}</p>
                      <p className="mt-3 text-sm text-muted-foreground">Prix unitaire : {currency.format(item.price)}</p>
                    </div>
                    <p className="shrink-0 text-right text-sm font-semibold text-primary">{currency.format(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </motion.article>
            <aside className="h-fit border-l-2 border-gold bg-primary p-7 text-primary-foreground lg:sticky lg:top-32">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">Résumé</p>
              <p className="mt-5 font-serif text-5xl">{cart.items.length}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">article{cart.items.length > 1 ? 's' : ''} dans votre panier</p>
              <div className="my-7 h-px bg-primary-foreground/20" />
              <p className="text-xs uppercase tracking-[0.14em] text-primary-foreground/70">Total</p>
              <p className="mt-2 font-serif text-3xl text-gold">{currency.format(orderTotal)}</p>
              <form onSubmit={checkout} className="mt-7 grid gap-4 border-t border-primary-foreground/20 pt-7">
                <label className="text-sm text-primary-foreground">
                  Adresse
                  <textarea
                    required
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder="12 rue de la Liberte"
                    rows={3}
                    className="mt-2 w-full resize-none border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-2 text-sm outline-none placeholder:text-primary-foreground/50 focus:border-gold"
                  />
                </label>
                <label className="text-sm text-primary-foreground">
                  Ville de livraison
                  <input
                    required
                    type="search"
                    list="delivery-cities"
                    value={deliveryCityQuery}
                    onChange={(event) => {
                      const city = event.target.value
                      const address = deliveryAddresses.find((item) => item.city.toLocaleLowerCase('fr') === city.trim().toLocaleLowerCase('fr'))

                      setDeliveryCityQuery(city)
                      setSelectedDeliveryAddressId(address ? String(address.id) : '')
                    }}
                    disabled={isLoadingDeliveryAddresses || deliveryAddresses.length === 0}
                    placeholder={isLoadingDeliveryAddresses ? 'Chargement des villes...' : 'Rechercher une ville'}
                    className="mt-2 w-full border border-primary-foreground/30 bg-primary px-3 py-2 text-sm text-primary-foreground outline-none placeholder:text-primary-foreground/50 focus:border-gold disabled:cursor-wait disabled:opacity-60"
                  />
                  <datalist id="delivery-cities">
                    {matchingDeliveryAddresses.map((address) => (
                      <option key={address.id} value={address.city}>
                        {currency.format(address.deliveryFee)}
                      </option>
                    ))}
                  </datalist>
                  {selectedDeliveryAddress && (
                    <span className="mt-2 block text-xs text-primary-foreground/70">
                      Frais de livraison : {currency.format(selectedDeliveryAddress.deliveryFee)}
                    </span>
                  )}
                </label>
                <label className="text-sm text-primary-foreground">
                  Téléphone
                  <input
                    required
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="0612345678"
                    className="mt-2 w-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-2 text-sm outline-none placeholder:text-primary-foreground/50 focus:border-gold"
                  />
                </label>
                {checkoutError && <p className="text-sm text-red-200" role="alert">{checkoutError}</p>}
                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-gold/90 disabled:cursor-wait disabled:opacity-50"
                >
                  {isCheckingOut ? 'Commande en cours...' : 'Commander'}
                  {!isCheckingOut && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </button>
              </form>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}