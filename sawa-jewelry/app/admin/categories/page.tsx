'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FolderTree, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { AdminLayout } from '@/components/AdminLayout'

type AuthUser = {
  fullName?: string
  roles?: string[]
}

type Category = {
  id: number
  name: string
  description?: string
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [categorySubmitting, setCategorySubmitting] = useState(false)
  const [categoryFormError, setCategoryFormError] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

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
    async function loadCategories() {
      const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

      try {
        const response = await fetch('http://localhost:8080/api/categories', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!response.ok) throw new Error('Impossible de charger les catégories.')

        const data = await response.json()
        const values = (Array.isArray(data) ? data : (data.content ?? data.data ?? [])) as Category[]
        setCategories(values)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Une erreur est survenue.')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return categories

    return categories.filter((category) =>
      `${category.name} ${category.description ?? ''}`.toLowerCase().includes(normalizedQuery),
    )
  }, [categories, query])

  function openCreateCategory() {
    setEditingCategory(null)
    setCategoryName('')
    setCategoryDescription('')
    setCategoryFormError('')
    setAddCategoryOpen(true)
  }

  function openEditCategory(category: Category) {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryDescription(category.description ?? '')
    setCategoryFormError('')
    setAddCategoryOpen(true)
  }

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCategorySubmitting(true)
    setCategoryFormError('')

    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')
    const isEditing = editingCategory !== null

    try {
      const response = await fetch(
        `http://localhost:8080/api/categories${isEditing ? `/${editingCategory.id}` : ''}`,
        {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        }),
        },
      )

      if (!response.ok) {
        throw new Error(
          isEditing ? "La modification de la catégorie a échoué." : 'La création de la catégorie a échoué.',
        )
      }

      const savedCategory = (await response.json()) as Partial<Category>
      const category = {
        id: savedCategory.id ?? editingCategory?.id ?? Date.now(),
        name: savedCategory.name ?? categoryName.trim(),
        description: savedCategory.description ?? categoryDescription.trim(),
      }
      setCategories((current) =>
        isEditing ? current.map((item) => (item.id === category.id ? category : item)) : [category, ...current],
      )
      setCategoryName('')
      setCategoryDescription('')
      setEditingCategory(null)
      setAddCategoryOpen(false)
    } catch (createError) {
      setCategoryFormError(
        createError instanceof Error ? createError.message : 'Une erreur est survenue.',
      )
    } finally {
      setCategorySubmitting(false)
    }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » ?`)) return

    const token = window.localStorage.getItem('token')?.replace(/^Bearer\s+/i, '')

    try {
      const response = await fetch(`http://localhost:8080/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!response.ok) throw new Error('La suppression de la catégorie a échoué.')
      setCategories((current) => current.filter((item) => item.id !== category.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Une erreur est survenue.')
    }
  }

  if (!user) return <div className="min-h-screen bg-[#fffdf8]" />

  return (
    <AdminLayout
        user={user}
        activeItem="Catégories"
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Rechercher une catégorie..."
      >
      <main className="min-h-screen bg-[#fffdf8] text-[#201f1c]">
        <div className="mx-auto max-w-[1520px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <button onClick={() => router.push('/admin')} className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#b49768]">
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour au dashboard
              </button>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]">Catalogue</p>
              <h1 className="font-serif text-4xl tracking-tight sm:text-[44px]">Gestion des catégories</h1>
              <p className="mt-2 text-sm text-[#948d83]">Organisez vos bijoux par univers et collections.</p>
            </div>
            <button onClick={openCreateCategory} className="flex items-center justify-center gap-2 rounded-xl bg-[#201f1c] px-4 py-3 text-xs font-semibold text-white shadow-lg">
              <Plus className="h-4 w-4 text-[#dfbd78]" />
              Ajouter une catégorie
            </button>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5">
              <p className="text-xs text-[#938b80]">Catégories disponibles</p>
              <p className="mt-2 font-serif text-3xl">{categories.length}</p>
            </div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5">
              <p className="text-xs text-[#938b80]">Résultats affichés</p>
              <p className="mt-2 font-serif text-3xl">{filteredCategories.length}</p>
            </div>
            <div className="rounded-2xl border border-[#e9e3d9] bg-white/75 p-5">
              <p className="text-xs text-[#938b80]">Catalogue</p>
              <p className="mt-2 font-serif text-3xl text-[#b49768]">SAWA</p>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#e9e3d9] bg-white/80 shadow-[0_8px_30px_rgba(64,53,35,0.04)]">
            <div className="flex items-center justify-between border-b border-[#ece7df] px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-serif text-2xl">Toutes les catégories</h2>
                <p className="mt-1 text-xs text-[#999188]">Les univers disponibles dans votre catalogue.</p>
              </div>
              <FolderTree className="h-5 w-5 text-[#b49768]" />
            </div>

            {loading ? (
              <div className="flex min-h-56 items-center justify-center text-sm text-[#948d83]">Chargement des catégories...</div>
            ) : error ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-5 text-center">
                <p className="text-sm text-[#bd755f]">{error}</p>
                <button onClick={() => window.location.reload()} className="flex items-center gap-2 rounded-xl border border-[#ded6c9] px-4 py-2.5 text-xs font-semibold text-[#625c53]">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Réessayer
                </button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex min-h-56 items-center justify-center text-sm text-[#948d83]">Aucune catégorie trouvée.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="bg-[#fbfaf7] text-[10px] uppercase tracking-wider text-[#aaa298]">
                    <tr>
                      <th className="px-6 py-3 font-medium">Identifiant</th>
                      <th className="px-3 py-3 font-medium">Nom</th>
                      <th className="px-3 py-3 font-medium">Description</th>
                      <th className="px-3 py-3 text-right font-medium">État</th>
                      <th className="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="border-t border-[#f0ece5] transition-colors hover:bg-[#fcfaf6]">
                        <td className="px-6 py-4 font-semibold text-[#b49768]">#{category.id}</td>
                        <td className="px-3 py-4 font-semibold capitalize">{category.name}</td>
                        <td className="px-3 py-4 text-[#716b62]">{category.description || 'Aucune description'}</td>
                        <td className="px-3 py-4 text-right"><span className="rounded-full bg-[#e3f0e6] px-2.5 py-1 text-[10px] font-medium text-[#578166]">Active</span></td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEditCategory(category)} aria-label={`Modifier ${category.name}`} className="rounded-lg p-2 text-[#948d83] hover:bg-[#f2eee7] hover:text-[#b49768]">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteCategory(category)} aria-label={`Supprimer ${category.name}`} className="rounded-lg p-2 text-[#948d83] hover:bg-[#f9e9e5] hover:text-[#bd755f]">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      {addCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#201f1c]/40 px-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#e9e3d9] bg-[#fffdf8] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#b49768]">Catalogue</p>
                <h2 className="mt-2 font-serif text-3xl">{editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h2>
              </div>
              <button onClick={() => setAddCategoryOpen(false)} aria-label="Fermer" className="rounded-lg p-2 text-[#948d83] hover:bg-[#f2eee7]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={saveCategory} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold text-[#625c53]">
                Nom
                <input required value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#ded6c9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#b49768]" placeholder="Ex. Bracelets" />
              </label>
              <label className="block text-xs font-semibold text-[#625c53]">
                Description
                <textarea required value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#ded6c9] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#b49768]" placeholder="Décrivez cette catégorie" />
              </label>
              {categoryFormError && <p className="text-xs text-[#bd755f]">{categoryFormError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddCategoryOpen(false)} className="rounded-xl border border-[#ded6c9] px-4 py-2.5 text-xs font-semibold text-[#625c53]">Annuler</button>
                <button type="submit" disabled={categorySubmitting} className="rounded-xl bg-[#201f1c] px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{categorySubmitting ? 'Enregistrement...' : editingCategory ? 'Enregistrer les modifications' : 'Créer la catégorie'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
