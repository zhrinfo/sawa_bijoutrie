'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import Swal from 'sweetalert2'
import { AdminLayout } from '@/components/AdminLayout'

type AuthUser = {
  fullName?: string
  roles?: string[]
}

type AdminUser = {
  id: number
  fullName: string
  email: string
  roles: string[]
}

function roleLabel(roles: string[]) {
  if (roles.includes('ROLE_ADMIN')) return 'Administrateur'
  if (roles.includes('ROLE_SOUS_ADMIN')) return 'Sous-administrateur'
  return 'Client'
}

function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('Tous les rôles')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [error, setError] = useState('')

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
      setUser(parsedUser)
    } catch {
      router.replace('/login')
    }
  }, [router])

  async function loadUsers() {
    setLoading(true)
    setError('')
    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

    try {
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Impossible de charger les utilisateurs.')

      const data = await response.json()
      const values = (Array.isArray(data) ? data : (data.content ?? data.data ?? [])) as AdminUser[]
      setUsers(values)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function updateUserRole(userId: number, nextRole: 'ROLE_CLIENT' | 'ROLE_ADMIN' | 'ROLE_SOUS_ADMIN') {
    const selectedRoleLabel = nextRole === 'ROLE_ADMIN'
      ? 'Administrateur'
      : nextRole === 'ROLE_SOUS_ADMIN'
        ? 'Sous-administrateur'
        : 'Client'
    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'Modifier le rôle ?',
      text: `Cet utilisateur sera défini comme « ${selectedRoleLabel} ».`,
      showCancelButton: true,
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#013d11',
      cancelButtonColor: '#948d83',
    })

    if (!confirmation.isConfirmed) return

    setUpdatingUserId(userId)
    setError('')
    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: nextRole }),
      })

      if (!response.ok) {
        const responseText = await response.text()
        let responseMessage = ''

        try {
          const responseData = JSON.parse(responseText) as { message?: string; error?: string; detail?: string }
          responseMessage = responseData.message ?? responseData.error ?? responseData.detail ?? ''
        } catch {
          responseMessage = responseText.trim()
        }

        throw new Error(responseMessage || `Impossible de modifier le rôle de cet utilisateur (${response.status}).`)
      }

      setUsers((currentUsers) => currentUsers.map((item) => (
        item.id === userId ? { ...item, roles: [nextRole] } : item
      )))
      await Swal.fire({
        icon: 'success',
        title: 'Rôle mis à jour',
        text: `Le rôle de cet utilisateur est maintenant « ${selectedRoleLabel} ».`,
        confirmButtonColor: '#013d11',
      })
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Une erreur est survenue.'
      setError(message)
      await Swal.fire({
        icon: 'error',
        title: 'Modification impossible',
        text: message,
        confirmButtonColor: '#013d11',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return users.filter((item) => {
      const matchesRole = role === 'Tous les rôles' || roleLabel(item.roles) === role
      const searchableText = `${item.fullName} ${item.email} ${item.id}`.toLowerCase()
      return matchesRole && (!normalizedQuery || searchableText.includes(normalizedQuery))
    })
  }, [users, query, role])

  const adminCount = users.filter((item) => item.roles.some((itemRole) => ['ROLE_ADMIN', 'ROLE_SOUS_ADMIN'].includes(itemRole))).length
  const clientCount = users.length - adminCount

  if (!user) return <div className="min-h-screen bg-[#fffdf8]" />

  return (
    <AdminLayout
      user={user}
      activeItem="Clients"
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="Rechercher un utilisateur..."
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
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]">Administration</p>
              <h1 className="font-serif text-4xl tracking-tight sm:text-[44px]">Utilisateurs</h1>
              <p className="mt-2 text-sm text-[#948d83]">Gérez les comptes clients et administrateurs de SAWA.</p>
            </div>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><div className="flex items-center justify-between"><p className="text-xs text-[#938b80]">Total utilisateurs</p><UsersRound className="h-4 w-4 text-[#b49768]" /></div><p className="mt-2 font-serif text-3xl">{users.length}</p></div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><div className="flex items-center justify-between"><p className="text-xs text-[#938b80]">Clients</p><UserRound className="h-4 w-4 text-[#075D54]" /></div><p className="mt-2 font-serif text-3xl text-[#075D54]">{clientCount}</p></div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><div className="flex items-center justify-between"><p className="text-xs text-[#938b80]">Administrateurs</p><ShieldCheck className="h-4 w-4 text-[#b49768]" /></div><p className="mt-2 font-serif text-3xl text-[#b49768]">{adminCount}</p></div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#e9e3d9] bg-white/80 shadow-[0_8px_30px_rgba(64,53,35,0.04)]">
            <div className="flex flex-col gap-4 border-b border-[#ece7df] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div><h2 className="font-serif text-2xl">Liste des utilisateurs</h2><p className="mt-1 text-xs text-[#999188]">{filteredUsers.length} résultat{filteredUsers.length > 1 ? 's' : ''} affiché{filteredUsers.length > 1 ? 's' : ''}</p></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select value={role} onChange={(event) => setRole(event.target.value)} className="h-10 rounded-xl border border-[#e2e8e3] bg-[#F8F7F0] px-3 text-xs text-[#5e7771] outline-none sm:w-44"><option>Tous les rôles</option><option>Client</option><option>Administrateur</option><option>Sous-administrateur</option></select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center text-sm text-[#948d83]">Chargement des utilisateurs...</div>
            ) : error ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 text-center"><p className="text-sm text-[#bd755f]">{error}</p><button onClick={loadUsers} className="flex items-center gap-2 rounded-xl border border-[#ded6c9] px-4 py-2.5 text-xs font-semibold text-[#625c53]"><RefreshCw className="h-3.5 w-3.5" />Réessayer</button></div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center text-sm text-[#948d83]">Aucun utilisateur trouvé.</div>
            ) : (
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-wider text-[#aaa298]"><tr><th className="px-6 py-3 font-medium">Utilisateur</th><th className="px-3 py-3 font-medium">Email</th><th className="px-3 py-3 font-medium">Rôle</th><th className="px-3 py-3 font-medium">Modifier le rôle</th><th className="px-6 py-3 text-right font-medium">Identifiant</th></tr></thead><tbody>{filteredUsers.map((item) => <tr key={item.id} className="border-t border-[#f0ece5] transition-colors hover:bg-[#fcfaf6]"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e5efe9] text-xs font-semibold text-[#075D54]">{initials(item.fullName)}</div><span className="font-semibold">{item.fullName}</span></div></td><td className="px-3 py-4 text-[#716b62]">{item.email}</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.roles.some((itemRole) => ['ROLE_ADMIN', 'ROLE_SOUS_ADMIN'].includes(itemRole)) ? 'bg-[#f4eddd] text-[#a17b3d]' : 'bg-[#e3f0e6] text-[#578166]'}`}>{roleLabel(item.roles)}</span></td><td className="px-3 py-4"><select value={item.roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : item.roles.includes('ROLE_SOUS_ADMIN') ? 'ROLE_SOUS_ADMIN' : 'ROLE_CLIENT'} disabled={updatingUserId === item.id} onChange={(event) => updateUserRole(item.id, event.target.value as 'ROLE_CLIENT' | 'ROLE_ADMIN' | 'ROLE_SOUS_ADMIN')} className="h-9 rounded-lg border border-[#e2e8e3] bg-[#F8F7F0] px-2.5 text-xs text-[#5e7771] outline-none disabled:cursor-wait disabled:opacity-60"><option value="ROLE_CLIENT">Client</option><option value="ROLE_ADMIN">Administrateur</option><option value="ROLE_SOUS_ADMIN">Sous-administrateur</option></select></td><td className="px-6 py-4 text-right text-[#aaa298]">#{item.id}</td></tr>)}</tbody></table></div>
            )}
          </section>
        </div>
      </main>
    </AdminLayout>
  )
}
