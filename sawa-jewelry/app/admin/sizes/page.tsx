'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Plus, RefreshCw, Ruler, Trash2, X } from 'lucide-react'
import { AdminLayout } from '@/components/AdminLayout'

type AuthUser = { fullName?: string; roles?: string[] }
type Size = { id: number; name: string; description?: string }

export default function AdminSizesPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sizes, setSizes] = useState<Size[]>([])
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [editingSize, setEditingSize] = useState<Size | null>(null)

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

  async function loadSizes() {
    setLoading(true)
    setError('')
    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

    try {
      const response = await fetch('http://localhost:8080/api/sizes', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!response.ok) throw new Error('Impossible de charger les tailles.')
      const data = await response.json()
      setSizes((Array.isArray(data) ? data : (data.content ?? data.data ?? [])) as Size[])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSizes()
  }, [])

  const filteredSizes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return sizes
    return sizes.filter((size) => `${size.name} ${size.description ?? ''}`.toLowerCase().includes(normalizedQuery))
  }, [query, sizes])

  function openCreate() {
    setEditingSize(null)
    setName('')
    setDescription('')
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(size: Size) {
    setEditingSize(size)
    setName(size.name)
    setDescription(size.description ?? '')
    setFormError('')
    setFormOpen(true)
  }

  async function saveSize(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')
    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')
    const isEditing = editingSize !== null

    try {
      const response = await fetch(`http://localhost:8080/api/sizes${isEditing ? `/${editingSize.id}` : ''}`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })
      if (!response.ok) throw new Error(isEditing ? 'La modification de la taille a échoué.' : 'La création de la taille a échoué.')

      const savedSize = (await response.json()) as Partial<Size>
      const size = {
        id: savedSize.id ?? editingSize?.id ?? Date.now(),
        name: savedSize.name ?? name.trim(),
        description: savedSize.description ?? description.trim(),
      }
      setSizes((current) => isEditing ? current.map((item) => item.id === size.id ? size : item) : [size, ...current])
      setFormOpen(false)
      setEditingSize(null)
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteSize(size: Size) {
    if (!window.confirm(`Supprimer la taille « ${size.name} » ?`)) return
    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

    try {
      const response = await fetch(`http://localhost:8080/api/sizes/${size.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!response.ok) throw new Error('La suppression de la taille a échoué.')
      setSizes((current) => current.filter((item) => item.id !== size.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Une erreur est survenue.')
    }
  }

  if (!user) return <div className="min-h-screen bg-[#fffdf8]" />

  return (
    <AdminLayout user={user} activeItem="Size" sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen} query={query} onQueryChange={setQuery} searchPlaceholder="Rechercher une taille...">
      <main className="min-h-screen bg-[#fffdf8] text-[#201f1c]">
        <div className="mx-auto max-w-[1520px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <button onClick={() => router.push('/admin')} className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#b49768]"><ArrowLeft className="h-3.5 w-3.5" />Retour au dashboard</button>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]">Catalogue</p>
              <h1 className="font-serif text-4xl tracking-tight sm:text-[44px]">Gestion des tailles</h1>
              <p className="mt-2 text-sm text-[#948d83]">Gérez les tailles disponibles pour vos bijoux.</p>
            </div>
            <button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-xl bg-[#201f1c] px-4 py-3 text-xs font-semibold text-white shadow-lg"><Plus className="h-4 w-4 text-[#dfbd78]" />Ajouter une taille</button>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><p className="text-xs text-[#938b80]">Tailles disponibles</p><p className="mt-2 font-serif text-3xl">{sizes.length}</p></div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><p className="text-xs text-[#938b80]">Résultats affichés</p><p className="mt-2 font-serif text-3xl">{filteredSizes.length}</p></div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5"><p className="text-xs text-[#938b80]">Catalogue</p><p className="mt-2 font-serif text-3xl text-[#b49768]">SAWA</p></div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#e9e3d9] bg-white/80 shadow-[0_8px_30px_rgba(64,53,35,0.04)]">
            <div className="flex items-center justify-between border-b border-[#ece7df] px-5 py-5 sm:px-6"><div><h2 className="font-serif text-2xl">Toutes les tailles</h2><p className="mt-1 text-xs text-[#999188]">Les tailles disponibles dans votre catalogue.</p></div><Ruler className="h-5 w-5 text-[#b49768]" /></div>
            {loading ? <div className="flex min-h-56 items-center justify-center text-sm text-[#948d83]">Chargement des tailles...</div> : error ? <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-5 text-center"><p className="text-sm text-[#bd755f]">{error}</p><button onClick={loadSizes} className="flex items-center gap-2 rounded-xl border border-[#ded6c9] px-4 py-2.5 text-xs font-semibold text-[#625c53]"><RefreshCw className="h-3.5 w-3.5" />Réessayer</button></div> : filteredSizes.length === 0 ? <div className="flex min-h-56 items-center justify-center text-sm text-[#948d83]">Aucune taille trouvée.</div> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-wider text-[#aaa298]"><tr><th className="px-6 py-3 font-medium">Identifiant</th><th className="px-3 py-3 font-medium">Nom</th><th className="px-3 py-3 font-medium">Description</th><th className="px-3 py-3 text-right font-medium">État</th><th className="px-6 py-3 text-right font-medium">Actions</th></tr></thead><tbody>{filteredSizes.map((size) => <tr key={size.id} className="border-t border-[#f0ece5] transition-colors hover:bg-[#fcfaf6]"><td className="px-6 py-4 font-semibold text-[#b49768]">#{size.id}</td><td className="px-3 py-4 font-semibold">{size.name}</td><td className="px-3 py-4 text-[#716b62]">{size.description || 'Aucune description'}</td><td className="px-3 py-4 text-right"><span className="rounded-full bg-[#e3f0e6] px-2.5 py-1 text-[10px] font-medium text-[#578166]">Active</span></td><td className="px-6 py-4"><div className="flex justify-end gap-1"><button onClick={() => openEdit(size)} aria-label={`Modifier ${size.name}`} className="rounded-lg p-2 text-[#948d83] hover:bg-[#f2eee7] hover:text-[#b49768]"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteSize(size)} aria-label={`Supprimer ${size.name}`} className="rounded-lg p-2 text-[#948d83] hover:bg-[#f9e9e5] hover:text-[#bd755f]"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
            )}
          </section>
        </div>
      </main>
      {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#201f1c]/40 px-5 backdrop-blur-sm"><div className="w-full max-w-lg rounded-2xl border border-[#e9e3d9] bg-[#fffdf8] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]">Catalogue</p><h2 className="mt-2 font-serif text-3xl">{editingSize ? 'Modifier la taille' : 'Ajouter une taille'}</h2></div><button onClick={() => setFormOpen(false)} aria-label="Fermer" className="rounded-lg p-2 text-[#948d83] hover:bg-[#f2eee7]"><X className="h-5 w-5" /></button></div><form onSubmit={saveSize} className="mt-6 space-y-4"><label className="block text-xs font-semibold text-[#625c53]">Nom<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#ded6c9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#b49768]" placeholder="Ex. XL" /></label><label className="block text-xs font-semibold text-[#625c53]">Description<textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#ded6c9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#b49768]" placeholder="Ex. Extra Large" /></label>{formError && <p className="text-xs text-[#bd755f]">{formError}</p>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-[#ded6c9] px-4 py-2.5 text-xs font-semibold text-[#625c53]">Annuler</button><button type="submit" disabled={submitting} className="rounded-xl bg-[#201f1c] px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Enregistrement...' : editingSize ? 'Enregistrer les modifications' : 'Créer la taille'}</button></div></form></div></div>}
    </AdminLayout>
  )
}
