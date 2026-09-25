'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, MoreHorizontal, Package, Plus, ShoppingBag, Sparkles,
  TrendingUp, UserRound, Users,
} from 'lucide-react'
import { AdminLayout } from '@/components/AdminLayout'

type AuthUser = {
  fullName?: string
  email?: string
  roles?: string[]
}

type BestSellingProduct = {
  revenus: number
  produit: string
  prix: number
  ventes: number
  image?: string
}

type LowStockProduct = {
  sizeId: number
  productId: number
  stockQuantity: number
  productName: string
  sizeName: string
}

type RecentOrder = {
  id: number
  orderDate: string
  status: string
  totalAmount: number
  phoneNumber?: string
  fullName?: string
  items: { name: string }[]
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [range, setRange] = useState('30 jours')
  const [query, setQuery] = useState('')
  const [revenue, setRevenue] = useState<number | null>(null)
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [clientCount, setClientCount] = useState<number | null>(null)
  const [confirmedOrderCount, setConfirmedOrderCount] = useState<number | null>(null)
  const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentOrdersPage, setRecentOrdersPage] = useState(1)

  useEffect(() => {
    const storedUser = window.localStorage.getItem('authUser')

    if (!storedUser) {
      router.replace('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser) as AuthUser
      if (!parsedUser.roles?.includes('ROLE_ADMIN')) {
        router.replace(parsedUser.roles?.includes('ROLE_SOUS_ADMIN') ? '/admin/orders' : '/products')
        return
      }
      Promise.resolve().then(() => setUser(parsedUser))
    } catch {
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    if (!user) return

    async function loadDashboardMetrics() {
      const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined
        const [revenueResponse, orderCountResponse, clientCountResponse, confirmedOrderCountResponse, bestSellingProductsResponse, lowStockProductsResponse, recentOrdersResponse] = await Promise.all([
          fetch('http://localhost:8080/api/orders/revenue', { headers, cache: 'no-store' }),
          fetch('http://localhost:8080/api/orders/count', { headers, cache: 'no-store' }),
          fetch('http://localhost:8080/api/admin/clients/count', { headers, cache: 'no-store' }),
          fetch('http://localhost:8080/api/orders/count/confirmed', { headers, cache: 'no-store' }),
          fetch('http://localhost:8080/api/admin/products/best-selling', { headers, cache: 'no-store' }),
          fetch('http://localhost:8080/api/admin/products/low-stock-by-size?threshold=3', { headers, cache: 'no-store' }),
          fetch('http://localhost:8080/api/admin/orders/recent?limit=8', { headers, cache: 'no-store' }),
        ])

        if (revenueResponse.ok) {
          const data: unknown = await revenueResponse.json()
          const amount = typeof data === 'number'
            ? data
            : typeof data === 'object' && data !== null
              ? Number((data as { revenue?: number; totalRevenue?: number; total?: number }).revenue
                ?? (data as { totalRevenue?: number }).totalRevenue
                ?? (data as { total?: number }).total)
              : Number.NaN

          if (Number.isFinite(amount)) setRevenue(amount)
        }

        if (orderCountResponse.ok) {
          const data: unknown = await orderCountResponse.json()
          const count = typeof data === 'number'
            ? data
            : typeof data === 'object' && data !== null
              ? Number((data as { count?: number; orderCount?: number; total?: number }).count
                ?? (data as { orderCount?: number }).orderCount
                ?? (data as { total?: number }).total)
              : Number.NaN

          if (Number.isFinite(count)) setOrderCount(count)
        }

        if (clientCountResponse.ok) {
          const data: unknown = await clientCountResponse.json()
          const count = typeof data === 'number'
            ? data
            : typeof data === 'object' && data !== null
              ? Number((data as { count?: number; clientCount?: number; total?: number }).count
                ?? (data as { clientCount?: number }).clientCount
                ?? (data as { total?: number }).total)
              : Number.NaN

          if (Number.isFinite(count)) setClientCount(count)
        }

        if (confirmedOrderCountResponse.ok) {
          const data: unknown = await confirmedOrderCountResponse.json()
          const count = typeof data === 'number'
            ? data
            : typeof data === 'object' && data !== null
              ? Number((data as { count?: number; confirmedOrderCount?: number; total?: number }).count
                ?? (data as { confirmedOrderCount?: number }).confirmedOrderCount
                ?? (data as { total?: number }).total)
              : Number.NaN

          if (Number.isFinite(count)) setConfirmedOrderCount(count)
        }

        if (bestSellingProductsResponse.ok) {
          const data: unknown = await bestSellingProductsResponse.json()
          setBestSellingProducts(Array.isArray(data) ? data as BestSellingProduct[] : [])
        }

        if (lowStockProductsResponse.ok) {
          const data: unknown = await lowStockProductsResponse.json()
          setLowStockProducts(Array.isArray(data) ? data as LowStockProduct[] : [])
        }

        if (recentOrdersResponse.ok) {
          const data: unknown = await recentOrdersResponse.json()
          setRecentOrders(Array.isArray(data) ? data as RecentOrder[] : [])
        }
      } catch (loadError) {
        console.error('Impossible de charger les statistiques du tableau de bord.', loadError)
      }
    }

    loadDashboardMetrics()
  }, [user])

  if (!user) {
    return <div className="min-h-screen bg-background" />
  }

  const displayName = user.fullName || 'Sofia El Mansouri'
  const revenueValue = revenue === null
    ? 'Chargement...'
    : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(revenue)} DH`
  const orderCountValue = orderCount === null
    ? 'Chargement...'
    : new Intl.NumberFormat('fr-FR').format(orderCount)
  const clientCountValue = clientCount === null
    ? 'Chargement...'
    : new Intl.NumberFormat('fr-FR').format(clientCount)
  const confirmedOrderCountValue = confirmedOrderCount === null
    ? 'Chargement...'
    : new Intl.NumberFormat('fr-FR').format(confirmedOrderCount)
  const chartPoints = ''
  const products = bestSellingProducts.map((product) => ({
    name: product.produit,
    category: '---',
    price: `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(product.prix)} DH`,
    sales: product.ventes,
    stock: 0,
    revenue: `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(product.revenus)} DH`,
    image: product.image || '',
  }))
  const orders = recentOrders.map((order) => [
    `#${order.id}`,
    order.fullName || 'Client',
    order.items.map((item) => item.name).join(', ') || 'Aucun article',
    new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.orderDate)),
    `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(order.totalAmount)} DH`,
    order.phoneNumber || '---',
    ({ PENDING: 'En attente', CONFIRMED: 'Confirmée', SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée' }[order.status] || order.status),
  ])
  const customers = [
    ['NB', 'Nadia Benali', 'nadia.benali@email.com', '8', '42 860 DH', 'bg-[#d9c2a1]'],
    ['YA', 'Youssef Amrani', 'youssef.amrani@email.com', '3', '18 240 DH', 'bg-[#b6c5be]'],
    ['SI', 'Salma Idrissi', 'salma.idrissi@email.com', '12', '76 500 DH', 'bg-[#d7b0ad]'],
  ]

  return (
    <AdminLayout
        user={user}
        activeItem="Dashboard"
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Rechercher un produit, une commande, un client..."
        
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
      >
      <main className={darkMode ? 'min-h-screen bg-[#013d11] text-[#f7f3ed]' : 'min-h-screen bg-[#FFFFFF] text-[#013d11]'}>
      <div
        className={`admin-dashboard recent-orders-page-${recentOrdersPage}`}
        onClick={(event) => {
          const button = (event.target as HTMLElement).closest('button')
          const pagination = button?.closest('.recent-orders-pagination')

          if (!button || !pagination) return

          const buttons = Array.from(pagination.querySelectorAll('button'))
          const buttonIndex = buttons.indexOf(button)
          const page = Number(button?.textContent)

          if (buttonIndex === 0) {
            setRecentOrdersPage((currentPage) => Math.max(1, currentPage - 1))
          } else if (buttonIndex === buttons.length - 1) {
            setRecentOrdersPage((currentPage) => Math.min(2, currentPage + 1))
          } else if (page === 1 || page === 2) {
            setRecentOrdersPage(page)
          }
        }}
      >
        <style>{`.admin-dashboard > div:nth-child(2) > div:nth-child(3), .admin-dashboard > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(4), .admin-dashboard > div:nth-child(2) > div:nth-child(4) table th:nth-child(4), .admin-dashboard > div:nth-child(2) > div:nth-child(4) table td:nth-child(4), .admin-dashboard > div:nth-child(2) > div:last-child { display: none; } .admin-dashboard > div:nth-child(2) > div:nth-child(5) th:nth-child(4) { font-size: 0; } .admin-dashboard > div:nth-child(2) > div:nth-child(5) th:nth-child(4)::after { content: 'Téléphone'; font-size: 10px; } .recent-orders-page-1 > div:nth-child(2) > div:nth-child(5) tbody tr:nth-child(n + 5), .recent-orders-page-2 > div:nth-child(2) > div:nth-child(5) tbody tr:nth-child(-n + 4) { display: none; }`}</style>
        <div className="mx-auto max-w-[1520px] px-5 py-8 sm:px-8 lg:px-10"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]"><Sparkles className="h-3.5 w-3.5" />Vue d’ensemble</div><h1 className="font-serif text-4xl tracking-tight sm:text-[44px]">Bonjour, {displayName.split(' ')[0]}</h1><p className="mt-2 text-sm text-[#948d83]">Voici ce qui se passe dans votre maison aujourd&apos;hui.</p></div><div className="flex items-center gap-2"><button className="flex items-center gap-2 rounded-xl border border-[#e4ddd2] bg-white/70 px-3.5 py-2.5 text-xs font-medium shadow-sm"><span className="h-2 w-2 rounded-full bg-[#6ca784]" /> En ligne <ChevronDown className="h-3.5 w-3.5 text-[#a7a095]" /></button></div></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[ { label: 'Chiffre d’affaires', value: revenueValue, change: '+18.5%', icon: CircleDollarSign, color: '#c19a5b', data: '2,18 13,20 24,14 35,17 46,10 57,13 68,6 79,9 90,3' }, { label: 'Commandes', value: orderCountValue, change: '+12.4%', icon: ShoppingBag, color: '#78988b', data: '2,18 13,15 24,17 35,10 46,14 57,8 68,10 79,4 90,6' }, { label: 'Nouveaux clients', value: clientCountValue, change: '+9.8%', icon: Users, color: '#9a8190', data: '2,17 13,13 24,15 35,9 46,11 57,6 68,8 79,3 90,5' }, { label: 'Produits vendus', value: confirmedOrderCountValue, change: '+15.2%', icon: Package, color: '#bd755f', data: '2,19 13,18 24,13 35,15 46,8 57,11 68,5 79,8 90,2' } ].map(({ label, value, change, icon: Icon, color, data }) => <div key={label} className={`group rounded-2xl border p-5 shadow-[0_8px_30px_rgba(64,53,35,0.04)] transition-transform hover:-translate-y-1 ${darkMode ? 'border-[#302e2a] bg-[#181714]' : 'border-[#e9e3d9] bg-white/75'}`}><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18`, color }}><Icon className="h-[19px] w-[19px]" /></div><MoreHorizontal className="h-4 w-4 text-[#b7afa4]" /></div><p className="mt-5 text-xs font-medium text-[#938b80]">{label}</p><div className="mt-1 flex items-end justify-between"><p className="font-serif text-[28px] tracking-tight">{value}</p><svg viewBox="0 0 92 22" className="mb-1 h-7 w-24"><polyline points={data} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="mt-2 flex items-center gap-1.5 text-[11px]"><span className="flex items-center gap-0.5 font-semibold text-[#5b9a76]"><ArrowUpRight className="h-3 w-3" />{change}</span><span className="text-[#a49d92]">vs mois dernier</span></div></div>)}</div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]"><section className={`rounded-2xl border p-5 shadow-[0_8px_30px_rgba(64,53,35,0.04)] sm:p-6 ${darkMode ? 'border-[#302e2a] bg-[#181714]' : 'border-[#e9e3d9] bg-white/75'}`}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h2 className="font-serif text-2xl">Performance des ventes</h2><p className="mt-1 text-xs text-[#999188]">Suivez l’évolution de votre activité</p></div><div className="flex gap-1 rounded-lg bg-[#f2efe9] p-1">{['7 jours', '30 jours', '3 mois', '6 mois', '1 an'].map((item) => <button key={item} onClick={() => setRange(item)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-all ${range === item ? 'bg-white text-[#38342e] shadow-sm' : 'text-[#9a9389]'}`}>{item}</button>)}</div></div><div className="mt-7 flex items-center gap-5 text-[11px] text-[#8e877d]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#c19a5b]" /> Chiffre d’affaires</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#91aca0]" /> Commandes</span><span className="ml-auto font-semibold text-[#312e29]">+18,5%</span></div><div className="relative mt-4 h-[230px] w-full"><div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[#b2aa9f]"><span>300k</span><span>225k</span><span>150k</span><span>75k</span><span>0</span></div><svg viewBox="0 0 906 150" preserveAspectRatio="none" className="ml-9 h-full w-[calc(100%-2.25rem)] overflow-visible"><defs><linearGradient id="goldFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c19a5b" stopOpacity=".2" /><stop offset="1" stopColor="#c19a5b" stopOpacity="0" /></linearGradient></defs><polyline points={chartPoints} fill="none" stroke="#c19a5b" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /><polyline points={`${chartPoints} 888,150 18,150`} fill="url(#goldFill)" stroke="none" /><polyline points="18,120 105,113 192,120 279,86 366,98 453,72 540,76 627,54 714,64 801,37 888,45" fill="none" stroke="#91aca0" strokeWidth="2" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" /></svg><div className="absolute bottom-[-22px] left-9 right-0 flex justify-between text-[10px] text-[#aaa298]"><span>01 Sept.</span><span>06 Sept.</span><span>12 Sept.</span><span>18 Sept.</span><span>24 Sept.</span><span>30 Sept.</span></div></div></section><section className={`rounded-2xl border p-5 shadow-[0_8px_30px_rgba(64,53,35,0.04)] sm:p-6 ${darkMode ? 'border-[#302e2a] bg-[#181714]' : 'border-[#e9e3d9] bg-white/75'}`}><div className="flex items-start justify-between"><div><h2 className="font-serif text-2xl">Ventes par catégorie</h2><p className="mt-1 text-xs text-[#999188]">Répartition du chiffre d’affaires</p></div><MoreHorizontal className="h-4 w-4 text-[#aaa298]" /></div><div className="mt-6 flex items-center gap-6"><div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: 'conic-gradient(#c19a5b 0 31%, #91aca0 31% 53%, #9a8190 53% 70%, #bd755f 70% 82%, #d5b879 82% 92%, #d9d5cc 92% 100%)' }}><div className={`absolute inset-[24px] flex flex-col items-center justify-center rounded-full ${darkMode ? 'bg-[#181714]' : 'bg-white'}`}><span className="font-serif text-2xl">245k</span><span className="text-[9px] text-[#a49d92]">TOTAL DH</span></div></div><div className="flex-1 space-y-2.5">{[['Bagues', '31%', '#c19a5b'], ['Colliers', '22%', '#91aca0'], ['Bracelets', '17%', '#9a8190'], ['Boucles', '12%', '#bd755f'], ['Autres', '18%', '#d5b879']].map(([name, percentage, color]) => <div key={name} className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 text-[#817a70]"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{name}</span><span className="font-semibold">{percentage}</span></div>)}</div></div></section></div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]"><section className={`overflow-hidden rounded-2xl border shadow-[0_8px_30px_rgba(64,53,35,0.04)] ${darkMode ? 'border-[#302e2a] bg-[#181714]' : 'border-[#e9e3d9] bg-white/75'}`}><div className="flex items-center justify-between border-b border-[#ece7df] px-5 py-5 sm:px-6"><div><h2 className="font-serif text-2xl">Produits les plus vendus</h2><p className="mt-1 text-xs text-[#999188]">Les pièces qui captivent vos clients</p></div><button className="text-xs font-semibold text-[#af8b53]">Voir tout <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-wider text-[#aaa298]"><tr><th className="px-6 py-3 font-medium">Produit</th><th className="px-3 py-3 font-medium">Prix</th><th className="px-3 py-3 font-medium">Ventes</th><th className="px-3 py-3 font-medium">Stock</th><th className="px-6 py-3 text-right font-medium">Revenus</th></tr></thead><tbody>{products.map((product) => <tr key={product.name} className="border-t border-[#f0ece5] transition-colors hover:bg-[#fcfaf6]"><td className="px-6 py-3.5"><div className="flex items-center gap-3"><img src={product.image} alt="" className="h-9 w-9 rounded-lg object-cover" /><div><p className="font-semibold">{product.name}</p><p className="mt-0.5 text-[10px] text-[#aaa298]">{product.category}</p></div></div></td><td className="px-3 text-[#716b62]">{product.price}</td><td className="px-3 font-semibold">{product.sales}</td><td className="px-3"><span className={product.stock === 0 ? 'text-[#bd755f]' : product.stock < 10 ? 'text-[#c19a5b]' : 'text-[#67947c]'}>{product.stock === 0 ? 'Rupture' : `${product.stock} unités`}</span></td><td className="px-6 text-right font-semibold">{product.revenue}</td></tr>)}</tbody></table></div></section><section className={`rounded-2xl border p-5 shadow-[0_8px_30px_rgba(64,53,35,0.04)] sm:p-6 ${darkMode ? 'border-[#302e2a] bg-[#181714]' : 'border-[#e9e3d9] bg-white/75'}`}><div className="flex items-start justify-between"><div><h2 className="font-serif text-2xl">Alerte stock</h2><p className="mt-1 text-xs text-[#999188]">Les pièces à réapprovisionner</p></div><AlertTriangle className="h-5 w-5 text-[#bd755f]" /></div><div className="mt-6 space-y-4">{lowStockProducts.length === 0 ? <p className="text-xs text-[#9a9389]">Aucune alerte de stock.</p> : lowStockProducts.map((product) => <div key={`${product.productId}-${product.sizeId}`} className="flex items-center gap-3"><div className={`h-2 w-2 rounded-full ${product.stockQuantity === 0 ? 'bg-[#bd755f]' : 'bg-[#c19a5b]'}`} /><div className="flex-1"><p className="text-xs font-semibold">{product.productName}</p><p className="mt-0.5 text-[11px] text-[#9a9389]">Taille {product.sizeName} · {product.stockQuantity === 0 ? 'Rupture de stock' : `${product.stockQuantity} unité${product.stockQuantity > 1 ? 's' : ''} restante${product.stockQuantity > 1 ? 's' : ''}`}</p></div><ChevronRight className="h-4 w-4 text-[#aaa298]" /></div>)}</div></section></div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]"><section className={`overflow-hidden rounded-2xl border shadow-[0_8px_30px_rgba(64,53,35,0.04)] ${darkMode ? 'border-[#302e2a] bg-[#181714]' : 'border-[#e9e3d9] bg-white/75'}`}><div className="flex items-center justify-between border-b border-[#ece7df] px-5 py-5 sm:px-6"><div><h2 className="font-serif text-2xl">Commandes récentes</h2><p className="mt-1 text-xs text-[#999188]">Les dernières commandes passées</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-wider text-[#aaa298]"><tr><th className="px-6 py-3 font-medium">Commande</th><th className="px-3 py-3 font-medium">Client</th><th className="px-3 py-3 font-medium">Montant</th><th className="px-3 py-3 font-medium">Paiement</th><th className="px-6 py-3 font-medium">Statut</th></tr></thead><tbody>{orders.map(([id, client, product, date, amount, payment, status]) => <tr key={id} className="border-t border-[#f0ece5]"><td className="px-6 py-3.5"><p className="font-semibold">{id}</p><p className="mt-0.5 text-[10px] text-[#aaa298]">{date}</p></td><td className="px-3"><p className="font-medium">{client}</p><p className="mt-0.5 text-[10px] text-[#aaa298]">{product}</p></td><td className="px-3 font-semibold">{amount}</td><td className="px-3 text-[#7d786f]">{payment}</td><td className="px-6"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${status === 'Livrée' ? 'bg-[#e3f0e6] text-[#578166]' : status === 'Expédiée' ? 'bg-[#e7eef0] text-[#64818a]' : status === 'Confirmée' ? 'bg-[#f4eddd] text-[#a17b3d]' : 'bg-[#f7e9e5] text-[#a96557]'}`}>{status}</span></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-[#ece7df] px-6 py-3 text-[11px] text-[#a29a90]"><span>Affichage de 1 à 4 sur 1 248 commandes</span><div className="recent-orders-pagination flex gap-1"><button className="rounded-md border p-1.5"><ChevronLeft className="h-3.5 w-3.5" /></button><button className="rounded-md bg-[#201f1c] px-2.5 py-1.5 text-white">1</button><button className="rounded-md border px-2.5 py-1.5">2</button><button className="rounded-md border p-1.5"><ChevronRight className="h-3.5 w-3.5" /></button></div></div></section><section className={`rounded-2xl border p-5 shadow-[0_8px_30px_rgba(64,53,35,0.04)] sm:p-6 ${darkMode ? 'border-[#302e2a] bg-[#181714]' : 'border-[#e9e3d9] bg-white/75'}`}><div className="flex items-start justify-between"><div><h2 className="font-serif text-2xl">Nouveaux clients</h2><p className="mt-1 text-xs text-[#999188]">Les nouveaux membres de SAWA</p></div><Users className="h-5 w-5 text-[#b49768]" /></div><div className="mt-5 space-y-4">{customers.map(([avatar, name, email, ordersCount, spent, color]) => <div key={email} className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-semibold text-white ${color}`}>{avatar}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{name}</p><p className="truncate text-[10px] text-[#aaa298]">{email}</p></div><div className="text-right"><p className="text-xs font-semibold">{spent}</p><p className="mt-0.5 text-[10px] text-[#aaa298]">{ordersCount} commandes</p></div></div>)}</div><button onClick={() => router.push('/admin/users')} className="mt-6 w-full rounded-xl border border-[#ded6c9] py-2.5 text-xs font-semibold text-[#625c53]">Voir tous les clients</button></section></div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">{[['Panier moyen', '1 840 DH', '+7.2%', CircleDollarSign, '#c19a5b'], ['Taux de conversion', '4.86%', '+0.8%', TrendingUp, '#78988b'], ['Visiteurs ce mois', '72 450', '+22.4%', UserRound, '#9a8190']].map(([label, value, change, Icon, color]) => <div key={label as string} className={`rounded-2xl border p-5 ${darkMode ? 'border-[#302e2a] bg-[#181714]' : 'border-[#e9e3d9] bg-white/75'}`}><div className="flex items-center gap-2 text-xs text-[#999188]"><Icon className="h-4 w-4" style={{ color: color as string }} /> {label as string}</div><p className="mt-4 font-serif text-3xl">{value as string}</p><p className="mt-2 text-[11px] text-[#5b9a76]">{change as string} <span className="text-[#aaa298]">vs mois dernier</span></p></div>)}</div></div>
      </div>
      </main>
    </AdminLayout>
  )
}
