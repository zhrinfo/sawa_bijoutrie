'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ClipboardList, RefreshCw, Search, X } from 'lucide-react'
import Swal from 'sweetalert2'
import { AdminLayout } from '@/components/AdminLayout'

type AuthUser = {
  fullName?: string
  roles?: string[]
}

type OrderItem = {
  priceAtPurchase: number
  quantity: number
  productId: number
  name: string
  brand?: string
  sizeName?: string | null
  colorName?: string | null
}

type Order = {
  id: number
  orderDate: string
  phoneNumber?: string
  shippingAddress?: string
  status: string
  totalAmount: number
  deliveryFee?: number | null
  city?: string | null
  email?: string
  fullName?: string
  items: OrderItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-[#f7e9e5] text-[#a96557]',
  CONFIRMED: 'bg-[#f4eddd] text-[#a17b3d]',
  SHIPPED: 'bg-[#e7eef0] text-[#64818a]',
  DELIVERED: 'bg-[#e3f0e6] text-[#578166]',
  CANCELLED: 'bg-[#ece9e5] text-[#716b62]',
}

function formatAmount(amount: number) {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(Number(amount) || 0)} DH`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Tous les statuts')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  useEffect(() => {
    const storedUser = window.localStorage.getItem('authUser')
    if (!storedUser) {
      router.replace('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser) as AuthUser
      if (!parsedUser.roles?.some((role) => ['ROLE_ADMIN', 'ROLE_SOUS_ADMIN'].includes(role))) {
        router.replace('/products')
        return
      }
      setUser(parsedUser)
    } catch {
      router.replace('/login')
    }
  }, [router])

  async function loadOrders() {
    setLoading(true)
    setError('')
    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

    try {
      const response = await fetch('http://localhost:8080/api/orders/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Impossible de charger les commandes.')

      const data = await response.json()
      const values = (Array.isArray(data) ? data : (data.content ?? data.data ?? [])) as Order[]
      setOrders(values)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function updateOrderStatus(order: Order, nextStatus: string) {
    if (nextStatus === order.status) return

    setUpdatingOrderId(order.id)
    setError('')
    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

    try {
      const response = await fetch(`http://localhost:8080/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) throw new Error('La mise à jour du statut a échoué.')

      const updatedOrder = { ...order, status: nextStatus }
      setOrders((current) => current.map((item) => (item.id === order.id ? updatedOrder : item)))
      setSelectedOrder((current) => (current?.id === order.id ? updatedOrder : current))
      await Swal.fire({
        icon: 'success',
        title: 'Statut mis à jour',
        text: `La commande #${order.id} est maintenant « ${statusLabels[nextStatus] ?? nextStatus} ».`,
        confirmButtonColor: '#013d11',
      })
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Une erreur est survenue.'
      setError(message)
      await Swal.fire({
        icon: 'error',
        title: 'Mise à jour impossible',
        text: message,
        confirmButtonColor: '#013d11',
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus = status === 'Tous les statuts' || order.status === status
      const searchableText = [
        order.id,
        order.fullName,
        order.email,
        order.phoneNumber,
        order.shippingAddress,
        order.city,
        ...order.items.map((item) => item.name),
      ].join(' ').toLowerCase()

      return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery))
    })
  }, [orders, query, status])

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
  const pendingCount = orders.filter((order) => order.status === 'PENDING').length
  const deliveredCount = orders.filter((order) => order.status === 'DELIVERED').length

  if (!user) return <div className="min-h-screen bg-[#fffdf8]" />

  return (
    <AdminLayout
      user={user}
      activeItem="Commandes"
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="Rechercher une commande, un client..."
      darkMode={darkMode}
      onDarkModeChange={setDarkMode}
    >
      <main className={darkMode ? 'min-h-screen bg-[#013d11] text-[#f7f3ed]' : 'min-h-screen bg-[#fffdf8] text-[#201f1c]'}>
        <div className="mx-auto max-w-[1520px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <button onClick={() => router.push('/admin')} className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#b49768]">
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour au dashboard
              </button>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]">Ventes</p>
              <h1 className="font-serif text-4xl tracking-tight sm:text-[44px]">Toutes les commandes</h1>
              <p className="mt-2 text-sm text-[#948d83]">Suivez les commandes et les informations de livraison de vos clients.</p>
            </div>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><p className="text-xs text-[#938b80]">Commandes reçues</p><p className="mt-2 font-serif text-3xl">{orders.length}</p></div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><p className="text-xs text-[#938b80]">En attente</p><p className="mt-2 font-serif text-3xl text-[#a96557]">{pendingCount}</p></div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><p className="text-xs text-[#938b80]">Livrées</p><p className="mt-2 font-serif text-3xl text-[#578166]">{deliveredCount}</p></div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><p className="text-xs text-[#938b80]">Chiffre d’affaires</p><p className="mt-2 font-serif text-3xl">{formatAmount(totalRevenue)}</p></div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#e9e3d9] bg-white/80 shadow-[0_8px_30px_rgba(64,53,35,0.04)]">
            <div className="flex flex-col gap-4 border-b border-[#ece7df] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div><h2 className="font-serif text-2xl">Liste des commandes</h2><p className="mt-1 text-xs text-[#999188]">{filteredOrders.length} résultat{filteredOrders.length > 1 ? 's' : ''} affiché{filteredOrders.length > 1 ? 's' : ''}</p></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e2e8e3] bg-[#F8F7F0] px-3 sm:w-64"><Search className="h-4 w-4 shrink-0 text-[#075D54]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher..." className="w-full bg-transparent text-xs outline-none placeholder:text-[#6e8880]" /></div>
                <div className="relative"><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#e2e8e3] bg-[#F8F7F0] px-3 pr-9 text-xs text-[#5e7771] outline-none sm:w-44"><option>Tous les statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#075D54]" /></div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center text-sm text-[#948d83]">Chargement des commandes...</div>
            ) : error ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 text-center"><p className="text-sm text-[#bd755f]">{error}</p><button onClick={loadOrders} className="flex items-center gap-2 rounded-xl border border-[#ded6c9] px-4 py-2.5 text-xs font-semibold text-[#625c53]"><RefreshCw className="h-3.5 w-3.5" />Réessayer</button></div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center text-sm text-[#948d83]">Aucune commande trouvée.</div>
            ) : (
              <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-wider text-[#aaa298]"><tr><th className="px-6 py-3 font-medium">Commande</th><th className="px-3 py-3 font-medium">Client</th><th className="px-3 py-3 font-medium">Articles</th><th className="px-3 py-3 font-medium">Livraison</th><th className="px-3 py-3 font-medium">Montant</th><th className="px-3 py-3 font-medium">Statut</th><th className="px-6 py-3 text-right font-medium">Détails</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id} className="border-t border-[#f0ece5] transition-colors hover:bg-[#fcfaf6]"><td className="px-6 py-4"><p className="font-semibold text-[#b49768]">#{order.id}</p><p className="mt-1 text-[10px] text-[#aaa298]">{formatDate(order.orderDate)}</p></td><td className="px-3 py-4"><p className="font-semibold">{order.fullName || 'Client non renseigné'}</p><p className="mt-1 text-[10px] text-[#716b62]">{order.email || order.phoneNumber || 'Coordonnées indisponibles'}</p></td><td className="max-w-[240px] px-3 py-4"><p className="font-medium">{order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</p><p className="mt-1 text-[10px] text-[#aaa298]">{order.items.reduce((sum, item) => sum + item.quantity, 0)} article{order.items.reduce((sum, item) => sum + item.quantity, 0) > 1 ? 's' : ''}</p></td><td className="max-w-[200px] px-3 py-4"><p className="truncate">{order.city || 'Ville non renseignée'}</p><p className="mt-1 truncate text-[10px] text-[#aaa298]">{order.shippingAddress || 'Adresse indisponible'}</p></td><td className="px-3 py-4 font-semibold">{formatAmount(order.totalAmount)}</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[order.status] ?? 'bg-[#ece9e5] text-[#716b62]'}`}>{statusLabels[order.status] ?? order.status}</span></td><td className="px-6 py-4 text-right"><button onClick={() => setSelectedOrder(order)} className="rounded-lg border border-[#e5ded4] px-3 py-2 text-[11px] font-semibold text-[#625c53] hover:border-[#b49768] hover:text-[#8c6a38]">Voir</button></td></tr>)}</tbody></table></div>
            )}
          </section>
        </div>
      </main>

      {selectedOrder && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedOrder(null)}><section role="dialog" aria-modal="true" aria-labelledby="order-details-title" onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#fffdf8] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]">Commande #{selectedOrder.id}</p><h2 id="order-details-title" className="mt-2 font-serif text-3xl">Détails de la commande</h2><p className="mt-1 text-xs text-[#948d83]">{formatDate(selectedOrder.orderDate)}</p></div><button onClick={() => setSelectedOrder(null)} aria-label="Fermer les détails" className="rounded-lg p-2 text-[#716b62] hover:bg-[#f2eee7]"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-[#f8f5ee] p-4"><p className="text-[10px] uppercase tracking-wider text-[#aaa298]">Client</p><p className="mt-2 text-sm font-semibold">{selectedOrder.fullName || 'Non renseigné'}</p><p className="mt-1 text-xs text-[#716b62]">{selectedOrder.email}</p><p className="mt-1 text-xs text-[#716b62]">{selectedOrder.phoneNumber}</p></div><div className="rounded-xl bg-[#f8f5ee] p-4"><p className="text-[10px] uppercase tracking-wider text-[#aaa298]">Livraison</p><p className="mt-2 text-sm font-semibold">{selectedOrder.city || 'Ville non renseignée'}</p><p className="mt-1 text-xs text-[#716b62]">{selectedOrder.shippingAddress || 'Adresse non renseignée'}</p></div></div><div className="mt-6 rounded-xl border border-[#e9e3d9] bg-[#f8f5ee] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] uppercase tracking-wider text-[#aaa298]">Statut de la commande</p><p className="mt-1 text-xs text-[#716b62]">Modifiez l’état actuel de cette commande.</p></div><div className="relative"><select value={selectedOrder.status} disabled={updatingOrderId === selectedOrder.id} onChange={(event) => updateOrderStatus(selectedOrder, event.target.value)} className={`h-10 appearance-none rounded-xl border border-[#e2d8c9] bg-white px-3 pr-9 text-xs font-semibold outline-none ${statusStyles[selectedOrder.status] ?? 'text-[#716b62]'} disabled:cursor-wait disabled:opacity-60`}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#075D54]" /></div></div></div><div className="mt-6 overflow-hidden rounded-xl border border-[#e9e3d9]"><div className="flex items-center gap-2 border-b border-[#e9e3d9] px-4 py-3"><ClipboardList className="h-4 w-4 text-[#b49768]" /><h3 className="text-xs font-semibold uppercase tracking-wider text-[#716b62]">Articles commandés</h3></div>{selectedOrder.items.map((item, index) => <div key={`${item.productId}-${item.sizeName}-${index}`} className="flex items-center justify-between gap-4 border-b border-[#f0ece5] px-4 py-3 last:border-0"><div><p className="text-sm font-semibold">{item.name}</p><p className="mt-1 text-[11px] text-[#948d83]">Quantité : {item.quantity}{item.sizeName ? ` · Taille ${item.sizeName}` : ''}{item.colorName ? ` · ${item.colorName}` : ''}</p></div><p className="shrink-0 text-sm font-semibold">{formatAmount(item.priceAtPurchase * item.quantity)}</p></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-[#e9e3d9] pt-4"><span className="text-sm text-[#716b62]">Total{selectedOrder.deliveryFee ? ` · Livraison ${formatAmount(selectedOrder.deliveryFee)}` : ''}</span><span className="font-serif text-2xl">{formatAmount(selectedOrder.totalAmount)}</span></div></section></div>}
    </AdminLayout>
  )
}
