'use client'

import {
  Bell,
  Boxes,
  ChevronDown,
  CreditCard,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Sun,
  Tag,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

type AuthUser = {
  fullName?: string
  email?: string
  roles?: string[]
}

type AdminLayoutProps = {
  children: ReactNode
  user: AuthUser
  activeItem: 'Dashboard' | 'Produits' | 'Catégories' | 'Size' | 'Commandes' | 'Clients'
  sidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
  query?: string
  onQueryChange?: (value: string) => void
  searchPlaceholder?: string
  productCount?: number
  darkMode?: boolean
  onDarkModeChange?: (value: boolean) => void
}

const sidebarPattern = 'repeating-linear-gradient(135deg, rgba(255,249,214,0.045) 0, rgba(255,249,214,0.045) 1px, transparent 1px, transparent 12px)'

export function AdminLayout({
  children,
  user,
  activeItem,
  sidebarOpen,
  onSidebarOpenChange,
  query = '',
  onQueryChange,
  searchPlaceholder = 'Rechercher...',
  productCount,
  darkMode = false,
  onDarkModeChange,
}: AdminLayoutProps) {
  const router = useRouter()
  const displayName = user.fullName || 'Administrateur'
  const roleLabel = user.roles?.includes('ROLE_SOUS_ADMIN') && !user.roles.includes('ROLE_ADMIN')
    ? 'Sous-administrateur'
    : 'Administrateur'
  const isSubAdmin = user.roles?.includes('ROLE_SOUS_ADMIN') && !user.roles.includes('ROLE_ADMIN')
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function logout() {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('authUser')
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Produits', icon: Package, count: productCount },
    { label: 'Catégories', icon: Grid2X2 },
    { label: 'Size', icon: Tag },
    { label: 'Commandes', icon: ShoppingBag },
    { label: 'Clients', icon: Users },

  ].filter((item) => !isSubAdmin || item.label === 'Commandes')

  function navigateTo(label: string) {
    if (label === 'Dashboard') router.push('/admin')
    if (label === 'Produits') router.push('/admin/products')
    if (label === 'Catégories') router.push('/admin/categories')
    if (label === 'Size') router.push('/admin/sizes')
    if (label === 'Commandes') router.push('/admin/orders')
    if (label === 'Clients') router.push('/admin/users')
  }

  return (
    <div className={darkMode ? 'min-h-screen bg-[#013d11] text-[#f7f3ed]' : 'min-h-screen bg-[#fffdf8] text-[#201f1c]'}>
      <aside
        style={{ backgroundImage: sidebarPattern }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] flex-col border-r border-[#174d2b] bg-[#013d11] px-5 py-6 text-white transition-transform duration-300 lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-2">
          <button onClick={() => router.push('/admin')} className="flex items-center gap-3 text-left">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sawa-ULakSyyYatTiH6aVCLIhNc56V7Xkor.jpeg" alt="SAWA" className="h-10 w-10 rounded-xl object-cover ring-1 ring-[#FFF9D6]/70" />
            <span>
              <span className="block font-serif text-2xl tracking-wide">SAWA</span>
              <span className="block text-[9px] uppercase tracking-[.25em] text-[#FFF9D6]">Administration</span>
            </span>
          </button>
          <button onClick={() => onSidebarOpenChange(false)} className="lg:hidden" aria-label="Fermer la navigation"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-10 flex-1 space-y-1">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#b9c9bd]">Menu principal</p>
          {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} onClick={() => navigateTo(label)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[13px] transition-all ${activeItem === label ? 'bg-[#FFF9D6] text-[#013d11] shadow-lg shadow-black/10' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
              <span className="flex items-center gap-3"><Icon className={`h-[17px] w-[17px] ${activeItem === label ? 'text-[#075D54]' : 'text-[#FFF9D6]'}`} />{label}</span>
              {count !== undefined && <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeItem === label ? 'bg-[#013d11] text-[#FFF9D6]' : 'bg-[#FFF9D6] text-[#013d11]'}`}>{count}</span>}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF9D6] text-xs font-semibold text-[#013d11]">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{displayName}</p><p className="mt-0.5 text-[10px] text-white/60">{roleLabel}</p></div><button onClick={logout} title="Se déconnecter"><LogOut className="h-4 w-4 text-[#FFF9D6]" /></button></div></div>
      </aside>

      {sidebarOpen && <button aria-label="Fermer la navigation" onClick={() => onSidebarOpenChange(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />}

      <header
        style={{ backgroundImage: sidebarPattern }}
        className={`fixed left-0 right-0 top-0 z-40 flex h-[78px] items-center justify-between border-b px-4 backdrop-blur-xl sm:px-8 lg:left-[260px] ${darkMode ? 'border-[#174d2b] bg-[#013d11]/90' : 'border-[#e5e9e3] bg-white/95'}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button className="shrink-0 lg:hidden" onClick={() => onSidebarOpenChange(true)} aria-label="Ouvrir la navigation"><Menu className={`h-5 w-5 ${darkMode ? 'text-[#FFF9D6]' : 'text-[#013d11]'}`} /></button>
          <div className={`flex h-10 min-w-0 w-full max-w-[420px] items-center gap-2 rounded-xl border px-3 sm:w-[300px] ${darkMode ? 'border-[#174d2b] bg-[#075D54]' : 'border-[#e2e8e3] bg-[#F8F7F0]'}`}>
            <Search className="h-4 w-4 shrink-0 text-[#075D54]" />
            <input value={query} onChange={(event) => onQueryChange?.(event.target.value)} placeholder={searchPlaceholder} className={`w-full min-w-0 bg-transparent text-xs outline-none ${darkMode ? 'text-white placeholder:text-[#b9c9bd]' : 'text-[#013d11] placeholder:text-[#6e8880]'}`} />
          </div>
        </div>
        <div className="ml-3 flex shrink-0 items-center gap-1 sm:gap-2">
          <button onClick={() => onDarkModeChange?.(!darkMode)} title="Changer de thème" className={`rounded-xl p-2.5 ${darkMode ? 'text-[#FFF9D6] hover:bg-white/10' : 'text-[#075D54] hover:bg-[#F8F7F0]'}`}>{darkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}</button>
          <button className={`relative rounded-xl p-2.5 ${darkMode ? 'text-[#FFF9D6] hover:bg-white/10' : 'text-[#075D54] hover:bg-[#F8F7F0]'}`} aria-label="Notifications"><Bell className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d99b42]" /></button>
          <div className={`ml-1 flex items-center gap-2 border-l pl-3 sm:ml-2 sm:pl-4 ${darkMode ? 'border-white/20' : 'border-[#e5e9e3]'}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#075D54] text-xs font-semibold text-white">{initials}</div>
            <div className="hidden text-left sm:block"><p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-[#013d11]'}`}>{displayName}</p><p className={`text-[10px] ${darkMode ? 'text-white/60' : 'text-[#5e7771]'}`}>{roleLabel}</p></div>
            <ChevronDown className={`h-4 w-4 ${darkMode ? 'text-[#FFF9D6]' : 'text-[#075D54]'}`} />
          </div>
        </div>
      </header>

      <div className="min-h-screen pt-[78px] lg:ml-[260px]">{children}</div>
    </div>
  )
}
