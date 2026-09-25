'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Diamond, Gift, RotateCcw, ShieldCheck, Star, Truck, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

interface ProductSize {
  id: number
  size: {
    id: number
    name: string
    description?: string
  }
  stockQuantity: number
}

interface ProductColor {
  id?: number
  name?: string
  description?: string
}

interface ProductImage {
  id: number
  imageUrl: string
  primaryImage?: boolean
  sortOrder?: number
}

interface ProductDetail {
  id: number
  name: string
  description?: string
  price: number
  stockQuantity: number
  brand?: string
  imageUrl?: string
  images?: ProductImage[]
  category?: {
    name: string
  }
  sizes?: ProductSize[]
  colors?: ProductColor[]
}

interface ProductReview {
  id?: number
  rating: number
  comment: string
  clientName?: string
  createdAt?: string
  user?: {
    firstName?: string
    lastName?: string
    name?: string
    username?: string
  }
  author?: string
}

const apiUrl = 'http://localhost:8080/api/products'
const cartItemsUrl = 'http://localhost:8080/api/cart/items'
const reviewsUrl = 'http://localhost:8080/api/reviews/product'

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState<number | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartError, setCartError] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const selectedSizeOption = product?.sizes?.find((item) => item.size.name === selectedSize)
  const selectedSizeId = selectedSizeOption?.id
  const availableStock = selectedSizeOption?.stockQuantity ?? product?.stockQuantity ?? 0
  const hasSizes = (product?.sizes?.length ?? 0) > 0
  const productImages = Array.from(new Set([
    product?.imageUrl,
    ...(product?.images
      ?.sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0))
      .map((image) => image.imageUrl) ?? []),
  ].filter((imageUrl): imageUrl is string => Boolean(imageUrl))))
  const displayedImageUrl = selectedImageUrl || productImages[0]

  function getAuthToken() {
    const directToken = window.localStorage.getItem('token')
      || window.localStorage.getItem('accessToken')
      || window.localStorage.getItem('authToken')
      || window.localStorage.getItem('jwt')

    if (directToken) {
      return directToken.replace(/^Bearer\s+/i, '')
    }

    for (const key of ['user', 'currentUser', 'auth']) {
      const storedValue = window.localStorage.getItem(key)

      if (storedValue) {
        try {
          const parsedValue = JSON.parse(storedValue) as { token?: string; accessToken?: string }
          const nestedToken = parsedValue.token || parsedValue.accessToken

          if (nestedToken) {
            return nestedToken.replace(/^Bearer\s+/i, '')
          }
        } catch {
        }
      }
    }

    return null
  }

  async function addToCart() {
    const token = getAuthToken()

    if (!token || !product) {
      setCartError('Vous devez être connecté pour ajouter ce produit au panier.')
      return
    }

    if (selectedSizeId === undefined) {
      setCartError('Veuillez choisir une taille.')
      return
    }

    const quantityToAdd = Math.min(Math.max(quantity, 1), availableStock)

    if (availableStock < 1 || quantityToAdd !== quantity) {
      setCartError('La quantité choisie dépasse le stock disponible.')
      return
    }

    setIsAddingToCart(true)
    setCartError('')

    try {
      const cartItem = {
        productId: product.id,
        quantity: quantityToAdd,
        sizeId: selectedSizeId ?? null,
        colorId: selectedColor ?? null,
      }

      const response = await fetch(cartItemsUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartItem),
      })

      if (!response.ok) {
        const responseBody = await response.text()
        console.error('Impossible d’ajouter le produit au panier.', {
          status: response.status,
          statusText: response.statusText,
          request: cartItem,
          response: responseBody,
        })

        if (response.status === 401 || response.status === 403) {
          throw new Error('AUTHORIZATION_FAILED')
        }

        throw new Error('Cart failed')
      }

      setIsAdded(true)
      window.alert('Produit ajouté au panier !')
    } catch (cartFailure) {
      setCartError(
        cartFailure instanceof Error && cartFailure.message === 'AUTHORIZATION_FAILED'
          ? 'Votre session est invalide ou expirée. Reconnectez-vous avant d’ajouter au panier.'
          : 'Impossible d’ajouter le produit au panier. Réessayez.',
      )
    } finally {
      setIsAddingToCart(false)
    }
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const token = getAuthToken()

    if (!token || !product) {
      setReviewError('Vous devez être connecté pour laisser un avis.')
      return
    }

    if (!rating) {
      setReviewError('Veuillez choisir une note.')
      return
    }

    if (!reviewComment.trim()) {
      setReviewError('Veuillez ajouter un commentaire.')
      return
    }

    setIsSubmittingReview(true)
    setReviewError('')
    setReviewMessage('')

    try {
      const response = await fetch(`${reviewsUrl}/${product.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment: reviewComment.trim(),
        }),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('AUTHORIZATION_FAILED')
        }

        throw new Error('Review failed')
      }

      setReviewMessage('Merci pour votre avis !')
      setRating(0)
      setReviewComment('')
      loadReviews(product.id)
    } catch (reviewFailure) {
      setReviewError(
        reviewFailure instanceof Error && reviewFailure.message === 'AUTHORIZATION_FAILED'
          ? 'Votre session est invalide ou expirée. Reconnectez-vous avant de laisser un avis.'
          : 'Impossible d’envoyer votre avis. Réessayez.',
      )
    } finally {
      setIsSubmittingReview(false)
    }
  }

  async function loadReviews(productId: number) {
    try {
      setIsLoadingReviews(true)
      setReviewsError('')
      const token = getAuthToken()
      const response = await fetch(`${reviewsUrl}/${productId}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!response.ok) {
        throw new Error('Reviews failed')
      }

      const responseData = await response.json()
      const reviewList = Array.isArray(responseData)
        ? responseData
        : responseData.reviews || responseData.content || []

      setReviews(reviewList)
    } catch {
      setReviewsError('Impossible de charger les avis pour le moment.')
    } finally {
      setIsLoadingReviews(false)
    }
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true)
        setError('')
        const response = await fetch(`${apiUrl}/${params.id}`)

        if (!response.ok) {
          throw new Error('Unable to load product')
        }

        const productData: ProductDetail = await response.json()
        setProduct(productData)
        setSelectedImageUrl('')
      } catch {
        setError('Impossible de charger ce produit. Vérifiez que le serveur est démarré.')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
      loadReviews(Number(params.id))
    }
  }, [params.id])

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Diamond className="absolute left-[8%] top-40 h-8 w-8 text-gold/35" strokeWidth={1} />
        <Diamond className="absolute right-[12%] top-[28rem] h-12 w-12 text-gold/25" strokeWidth={1} />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-32">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-12 inline-flex items-center gap-3 text-sm uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux produits
        </button>

        {isLoading ? (
          <div className="py-24 text-center">
            <p className="font-serif text-4xl text-foreground">Chargement du produit...</p>
          </div>
        ) : error || !product ? (
          <div className="py-24 text-center">
            <p className="font-serif text-4xl text-foreground">Produit indisponible</p>
            <p className="mt-4 text-muted-foreground">{error}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.8fr)] lg:items-start lg:gap-20"
          >
            <div>
              {displayedImageUrl ? (
                <button
                  type="button"
                  onClick={() => setIsImagePreviewOpen(true)}
                  className="relative block aspect-square w-full overflow-hidden rounded-3xl border border-border bg-secondary text-left shadow-[0_20px_60px_rgba(11,106,90,0.08)] focus:outline-none focus:ring-2 focus:ring-gold/50"
                  aria-label={`Agrandir l'image de ${product.name}`}
                >
                  <Image
                    src={displayedImageUrl}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                </button>
              ) : (
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-secondary font-serif text-3xl text-muted-foreground shadow-[0_20px_60px_rgba(11,106,90,0.08)]">
                  SAWA
                </div>
              )}
              {productImages.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-label="Images du produit">
                  {productImages.map((imageUrl, index) => (
                    <button
                      key={imageUrl}
                      type="button"
                      onClick={() => setSelectedImageUrl(imageUrl)}
                      aria-label={`Afficher l'image ${index + 1} de ${product.name}`}
                      aria-pressed={displayedImageUrl === imageUrl}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                        displayedImageUrl === imageUrl ? 'border-gold' : 'border-border hover:border-gold/60'
                      }`}
                    >
                      <Image src={imageUrl} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:pt-4">
              <p className="mb-5 text-xs font-mono uppercase tracking-[0.16em] text-gold">
                {product.category?.name || 'Collection SAWA'}
              </p>
              <h1 className="max-w-xl font-serif text-5xl font-semibold leading-[0.95] text-foreground md:text-6xl">
                {product.name}
              </h1>
              <p className="mt-7 font-mono text-2xl font-semibold text-primary">
                ${product.price.toFixed(2)}
              </p>
              <div className="mt-8 h-px w-20 bg-gold" />
              <p className="mt-8 text-base leading-relaxed text-muted-foreground">
                {product.description || 'Une création SAWA pensée avec soin pour accompagner chaque moment.'}
              </p>

              {hasSizes && product.sizes && (
                <div className="mt-9 border-t border-border pt-7">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono uppercase tracking-[0.12em] text-foreground">Choisir une taille</p>
                    <a
                      href="/Guides_des_tailles_de_bagues-F%C3%A9vrier_2021-FR.pdf.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-gold"
                    >
                      Guide des tailles
                    </a>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {product.sizes.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={item.stockQuantity === 0}
                        aria-label={`${item.size.name}, ${item.stockQuantity} disponible${item.stockQuantity > 1 ? 's' : ''}`}
                        onClick={() => {
                          setSelectedSize(item.size.name)
                          setQuantity(1)
                          setCartError('')
                        }}
                        className={`min-w-20 rounded-full border-2 px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-200 ${
                          item.stockQuantity === 0
                            ? 'cursor-not-allowed border-destructive/30 bg-destructive/5 text-destructive/70'
                            : selectedSize === item.size.name
                              ? 'border-gold bg-primary text-primary-foreground shadow-md ring-2 ring-gold/30 ring-offset-2 ring-offset-background'
                              : 'border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-gold hover:shadow-md'
                        }`}
                      >
                        {item.size.name} ({item.stockQuantity})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="mt-8 border-t border-border pt-7">
                  <p className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Couleurs</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={color.id ?? index}
                        type="button"
                        onClick={() => color.id !== undefined && setSelectedColor(color.id)}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                          selectedColor === color.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-foreground hover:border-gold'
                        }`}
                      >
                        {color.name || color.description || 'Couleur'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="mt-8 flex items-center justify-between border-t border-border pt-7 text-xs font-mono uppercase tracking-[0.12em] text-foreground">
                Quantité
                <input
                  type="number"
                  min={1}
                  max={availableStock}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="ml-4 w-20 border border-border bg-background px-3 py-2 text-center text-sm font-sans tracking-normal outline-none focus:border-gold"
                  aria-label="Quantité"
                />
              </label>

              <button
                type="button"
                disabled={availableStock === 0 || isAddingToCart}
                onClick={addToCart}
                className="mt-10 flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Gift className="h-4 w-4" aria-hidden="true" />
                {isAddingToCart ? 'Ajout en cours...' : isAdded ? 'Ajouté au panier' : 'Ajouter au panier'}
              </button>

              {cartError && <p className="mt-4 text-sm text-destructive" role="alert">{cartError}</p>}

              <div className="mt-8 grid gap-5 border-t border-border pt-7 sm:grid-cols-3">
                {[
                  { icon: Truck, label: 'Livraison offerte', detail: 'Dès 100 $' },
                  { icon: RotateCcw, label: 'Retours faciles', detail: 'Sous 30 jours' },
                  { icon: ShieldCheck, label: 'Création certifiée', detail: product.brand || 'SAWA' },
                ].map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Marque</p>
                  <p className="mt-2 text-foreground">{product.brand || 'SAWA'}</p>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Disponibilité</p>
                  <p className="mt-2 flex items-center gap-2 text-foreground">
                    <Check className="h-4 w-4 text-gold" aria-hidden="true" />
                    {product.stockQuantity > 0 ? `${product.stockQuantity} en stock` : 'Rupture de stock'}
                  </p>
                </div>
              </div>

              <form onSubmit={submitReview} className="mt-8 border-t border-border pt-7">
                <p className="text-xs font-mono uppercase tracking-[0.12em] text-foreground">Laisser un avis</p>
                <div className="mt-4 flex items-center gap-1" aria-label={`Note : ${rating} sur 5`}>
                  {Array.from({ length: 5 }, (_, index) => {
                    const starRating = index + 1

                    return (
                      <button
                        key={starRating}
                        type="button"
                        onClick={() => {
                          setRating(starRating)
                          setReviewError('')
                        }}
                        aria-label={`${starRating} étoile${starRating > 1 ? 's' : ''}`}
                        className="rounded-sm p-1 text-gold transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gold/50"
                      >
                        <Star
                          className="h-6 w-6"
                          fill={starRating <= rating ? 'currentColor' : 'none'}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </button>
                    )
                  })}
                </div>
                <label className="mt-4 block text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">
                  Votre commentaire
                  <textarea
                    value={reviewComment}
                    onChange={(event) => {
                      setReviewComment(event.target.value)
                      setReviewError('')
                    }}
                    rows={4}
                    maxLength={1000}
                    placeholder="Partagez votre expérience..."
                    className="mt-2 block w-full resize-y border border-border bg-background px-3 py-3 text-sm font-sans normal-case tracking-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-gold"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="mt-4 rounded-full border border-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Envoi en cours...' : 'Publier mon avis'}
                </button>
                {reviewError && <p className="mt-3 text-sm text-destructive" role="alert">{reviewError}</p>}
                {reviewMessage && <p className="mt-3 text-sm text-primary" role="status">{reviewMessage}</p>}
              </form>

              <section className="mt-10 border-t border-border pt-7" aria-labelledby="reviews-title">
                <div className="flex items-center justify-between gap-4">
                  <h2 id="reviews-title" className="text-xs font-mono uppercase tracking-[0.12em] text-foreground">
                    Avis clients ({reviews.length})
                  </h2>
                </div>

                {isLoadingReviews ? (
                  <p className="mt-5 text-sm text-muted-foreground">Chargement des avis...</p>
                ) : reviewsError ? (
                  <p className="mt-5 text-sm text-destructive" role="alert">{reviewsError}</p>
                ) : reviews.length === 0 ? (
                  <p className="mt-5 text-sm text-muted-foreground">Aucun avis pour ce produit.</p>
                ) : (
                  <div className="mt-5 space-y-5">
                    {reviews.map((review, index) => {
                      const author = review.clientName
                        || review.author
                        || review.user?.name
                        || review.user?.username
                        || [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ')
                        || 'Client SAWA'
                      const reviewDate = review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString('fr-FR')
                        : ''

                      return (
                        <article key={review.id ?? index} className="border-b border-border pb-5 last:border-b-0">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1 text-gold" aria-label={`Note : ${review.rating} sur 5`}>
                              {Array.from({ length: 5 }, (_, starIndex) => (
                                <Star
                                  key={starIndex}
                                  className="h-4 w-4"
                                  fill={starIndex < review.rating ? 'currentColor' : 'none'}
                                  strokeWidth={1.5}
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <span className="block">{author}</span>
                              {reviewDate && <time dateTime={review.createdAt}>{reviewDate}</time>}
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        )}
      </section>
      {isImagePreviewOpen && displayedImageUrl && product && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Image agrandie de ${product.name}`}
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImagePreviewOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-background/90 p-3 text-foreground transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-gold/50 sm:right-8 sm:top-8"
            aria-label="Fermer l'image agrandie"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="relative h-full w-full" onClick={(event) => event.stopPropagation()}>
            <Image
              src={displayedImageUrl}
              alt={product.name}
              fill
              priority
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </main>
  )
}
