'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Diamond, Search, SlidersHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { SectionTitle } from '@/components/SectionTitle'

interface ApiProduct {
  id: number
  name: string
  price: number
  imageUrl?: string
  category?: {
    name: string
  }
}

interface PaginatedProductsResponse {
  content: ApiProduct[]
  totalPages: number
  totalElements: number
}

type ProductsResponse = ApiProduct[] | PaginatedProductsResponse

const apiUrl = 'http://localhost:8080/api/products/active'
const catalogBanner = 'https://iconic-bijoux.fr/wp-content/uploads/2025/06/1750546989-les-tendances-modes-bijoux-plaques-or-a-suivre-en-2026.jpg'
const productsPerPage = 8
const allCategories = 'all'
const backgroundDiamonds = [
  { left: '4%', top: '14%', size: 24, delay: 0 },
  { left: '18%', top: '28%', size: 14, delay: 1.2 },
  { left: '34%', top: '10%', size: 18, delay: 2.4 },
  { left: '52%', top: '24%', size: 30, delay: 0.6 },
  { left: '72%', top: '14%', size: 16, delay: 1.8 },
  { left: '91%', top: '30%', size: 22, delay: 3 },
  { left: '8%', top: '48%', size: 18, delay: 2.1 },
  { left: '28%', top: '62%', size: 28, delay: 0.9 },
  { left: '48%', top: '52%', size: 14, delay: 3.6 },
  { left: '68%', top: '70%', size: 24, delay: 1.5 },
  { left: '92%', top: '78%', size: 18, delay: 2.7 },
  { left: '14%', top: '88%', size: 16, delay: 4.2 },
]

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [category, setCategory] = useState(allCategories)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error('Unable to load products')
        }

        const data: ProductsResponse = await response.json()
        setProducts(Array.isArray(data) ? data : data.content ?? [])
      } catch {
        setError('Impossible de charger les produits. Vérifiez que le serveur est démarré.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = useMemo(() => {
    const names = products
      .map((product) => product.category?.name)
      .filter((name): name is string => Boolean(name))

    return [allCategories, ...Array.from(new Set(names))]
  }, [products])

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === allCategories || category === 'All' || product.category?.name === category
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })

    return [...filtered].sort((first, second) => {
      if (sort === 'price-low') return first.price - second.price
      if (sort === 'price-high') return second.price - first.price
      return first.id - second.id
    })
  }, [products, category, search, sort])

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const currentPage = Math.min(page, pageCount)
  const visibleProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  function changeCategory(nextCategory: string) {
    setCategory(nextCategory)
    setPage(1)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function changeSort(value: string) {
    setSort(value)
    setPage(1)
  }

  const pageLabel = filteredProducts.length
    ? `${Math.min((currentPage - 1) * productsPerPage + 1, filteredProducts.length)}-${Math.min(currentPage * productsPerPage, filteredProducts.length)}`
    : '0-0'

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(193,154,91,0.14),_transparent_32%),linear-gradient(180deg,#fbfaf7_0%,#f5f1ea_100%)] text-foreground">
      <Navbar />

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {backgroundDiamonds.map((diamond) => (
          <motion.div
            key={`${diamond.left}-${diamond.top}`}
            className="absolute text-gold/45"
            style={{ left: diamond.left, top: diamond.top }}
            animate={{
              x: [0, 18, -10, 0],
              y: [0, -24, 12, 0],
              rotate: [0, 20, -15, 0],
              opacity: [0.45, 0.95, 0.6, 0.45],
            }}
            transition={{
              duration: 8,
              delay: diamond.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Diamond style={{ width: diamond.size, height: diamond.size }} strokeWidth={1} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-20 mt-20 h-[280px] overflow-hidden sm:h-[360px] lg:h-[440px]">
        <Image
          src={catalogBanner}
          alt="Collection de bijoux dores"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,14,12,0.72),rgba(17,14,12,0.18),rgba(17,14,12,0.42))]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-6 max-w-5xl w-full rounded-[2rem] border border-white/15 bg-white/8 px-6 py-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:px-10 lg:px-14">
            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[#f5d9a3]">Curated elegance</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-white sm:text-5xl lg:text-7xl">Jewelry that speaks softly</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
              Discover signature pieces crafted with intention, depth, and a timeless luxury attitude.
            </p>
          </div>
        </div>
      </div>

      <section className="relative z-20 px-6 pb-24 pt-16 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Our Collection"
            title="Discover Our Products"
            description="Explore every SAWA creation, selected for its character, craftsmanship, and timeless elegance."
          />

          <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
            <aside className="rounded-[2rem] border border-[#f0e6d8] bg-white/75 p-6 shadow-[0_18px_45px_rgba(24,19,17,0.05)] backdrop-blur-sm lg:sticky lg:top-28">
              <div className="flex items-center gap-3 text-base font-medium text-foreground">
                <SlidersHorizontal className="h-5 w-5 text-gold" aria-hidden="true" />
                <span>Filter by type</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 lg:flex-col lg:items-stretch">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeCategory(item)}
                    className={`rounded-full border px-4 py-3 text-[11px] uppercase tracking-[0.14em] transition-all duration-300 lg:w-full lg:text-left ${
                      category === item
                        ? 'border-[#201f1c] bg-[#201f1c] text-white shadow-[0_14px_32px_rgba(32,31,28,0.24)]'
                        : 'border-[#eadfc7] bg-[#fffdf9] text-muted-foreground hover:border-gold hover:text-foreground'
                    }`}
                  >
                    {item === allCategories ? 'All' : item}
                  </button>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <label className="flex h-12 items-center gap-3 rounded-full border border-[#eadfc7] bg-[#fffdf9] px-4 text-muted-foreground shadow-inner shadow-[#f5efe7]">
                  <Search className="h-4 w-4 text-gold" aria-hidden="true" />
                  <span className="sr-only">Search products</span>
                  <input
                    value={search}
                    onChange={(event) => changeSearch(event.target.value)}
                    placeholder="Search products"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </label>

                <label className="flex h-12 items-center rounded-full border border-[#eadfc7] bg-[#fffdf9] px-4 text-base text-foreground shadow-inner shadow-[#f5efe7]">
                  <span className="sr-only">Sort products</span>
                  <select
                    value={sort}
                    onChange={(event) => changeSort(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                  </select>
                </label>
              </div>
            </aside>

            <div>
              {isLoading ? (
                <div className="rounded-[2rem] border border-[#f0e6d8] bg-white/75 py-20 text-center shadow-[0_18px_45px_rgba(24,19,17,0.04)]">
                  <p className="font-serif text-3xl text-foreground">Loading products...</p>
                </div>
              ) : error ? (
                <div className="rounded-[2rem] border border-[#f0e6d8] bg-white/75 py-20 text-center shadow-[0_18px_45px_rgba(24,19,17,0.04)]">
                  <p className="font-serif text-3xl text-foreground">Products unavailable</p>
                  <p className="mt-3 text-muted-foreground">{error}</p>
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  <div className="mb-6 flex items-center justify-between gap-4 rounded-full border border-[#eadfc7] bg-white/75 px-4 py-3 shadow-[0_12px_32px_rgba(24,19,17,0.03)]">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Showing</p>
                      <p className="mt-1 text-sm text-foreground">{pageLabel} of {filteredProducts.length}</p>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{category === allCategories ? 'All categories' : category}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleProducts.map((product, index) => (
                      <motion.button
                        key={product.id}
                        type="button"
                        onClick={() => router.push(`/products/${product.id}`)}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.45 }}
                        className="group relative w-full overflow-hidden rounded-[2rem] border border-[#f2e8d8] bg-white/85 text-left shadow-[0_18px_40px_rgba(29,22,18,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_28px_60px_rgba(35,27,20,0.12)]"
                      >
                        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
                          <span className="rounded-full border border-white/70 bg-white/75 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                          <span className="rounded-full bg-[#201f1c] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white">
                            new
                          </span>
                        </div>

                        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center font-serif text-2xl text-muted-foreground">
                              No image
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#140f0d]/50 via-transparent to-transparent opacity-90" />
                        </div>

                        <div className="relative p-5">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="max-w-[80%] font-serif text-[2rem] leading-none text-foreground">
                              {product.name}
                            </h3>
                            <p className="mt-1 font-mono text-sm font-semibold text-gold">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="mt-5 flex items-center justify-between border-t border-[#f0e7d8] pt-4">
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              Sawa signature
                            </span>
                            <span className="inline-flex items-center gap-2 text-sm text-foreground transition-transform duration-300 group-hover:translate-x-1">
                              View detail
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-[2rem] border border-[#f0e6d8] bg-white/75 py-20 text-center shadow-[0_18px_45px_rgba(24,19,17,0.04)]">
                  <p className="font-serif text-3xl text-foreground">No products found</p>
                  <p className="mt-3 text-muted-foreground">Try another search or category.</p>
                </div>
              )}

              {filteredProducts.length > 0 && (
                <div className="mt-14 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                    className="rounded-full border border-[#eadfc7] bg-white/80 p-3 text-foreground shadow-sm transition-all duration-300 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <div className="flex items-center gap-2 rounded-full border border-[#eadfc7] bg-white/80 px-4 py-2 shadow-sm">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Page</span>
                    <span className="font-mono text-sm font-semibold text-foreground">{currentPage}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-mono text-sm text-muted-foreground">{pageCount}</span>
                  </div>

                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                    className="rounded-full border border-[#eadfc7] bg-white/80 p-3 text-foreground shadow-sm transition-all duration-300 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}