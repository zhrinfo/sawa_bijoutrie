'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Diamond, LogIn, ShieldCheck, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

const loginUrl = 'http://localhost:8080/api/auth/login'

type AuthResponse = {
  token?: string
  accessToken?: string
  jwt?: string
  id?: number
  fullName?: string
  email?: string
  roles?: string[]
  user?: { token?: string; accessToken?: string }
}

function getToken(data: AuthResponse) {
  return data.token || data.accessToken || data.jwt || data.user?.token || data.user?.accessToken
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await response.json().catch(() => ({}))) as AuthResponse

      if (!response.ok) {
        throw new Error('LOGIN_FAILED')
      }

      const token = getToken(data)
      if (token) {
        window.localStorage.setItem('token', token.replace(/^Bearer\s+/i, ''))
      }
      window.localStorage.setItem('authUser', JSON.stringify(data))

      router.push(data.roles?.includes('ROLE_ADMIN') ? '/admin' : data.roles?.includes('ROLE_SOUS_ADMIN') ? '/admin/orders' : '/products')
    } catch {
      setError('Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f4ee] text-foreground">
      <Navbar />
      <Diamond className="pointer-events-none absolute left-[7%] top-40 h-16 w-16 text-gold/25" strokeWidth={1} aria-hidden="true" />
      <Diamond className="pointer-events-none absolute bottom-20 right-[8%] h-10 w-10 text-gold/30" strokeWidth={1} aria-hidden="true" />
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 pb-10 pt-28 sm:px-8 lg:px-12">
        <div className="grid w-full max-w-6xl overflow-hidden border border-[#ded6c9] bg-card shadow-[0_30px_90px_rgba(58,45,27,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden min-h-[680px] overflow-hidden bg-[#203d35] lg:block">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,38,32,0.12),rgba(16,38,32,0.82)),url('/bijoux.jpg')] bg-cover bg-center" />
            <div className="relative flex h-full flex-col justify-between p-10 text-[#fffaf2]">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em]"><span className="h-px w-8 bg-gold" /> Sawa Bijouterie</div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#e2c48b]">L&apos;art de vous révéler</p>
                <h2 className="mt-4 max-w-sm font-serif text-6xl leading-[0.88]">Le détail qui devient signature.</h2>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/70">Retrouvez vos créations favorites et laissez votre histoire prendre forme.</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/70"><Sparkles className="h-4 w-4 text-gold" /> Des pièces choisies avec intention</div>
            </div>
          </div>
          <div className="flex items-center p-7 sm:p-12 lg:p-16">
            <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-gold">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour à l&apos;accueil
          </Link>
          <p className="mt-12 text-xs font-mono uppercase tracking-[0.2em] text-gold">Espace privé</p>
          <h1 className="mt-3 font-serif text-6xl leading-none text-foreground">Bienvenue.</h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Connectez-vous pour retrouver vos pièces et finaliser vos commandes.</p>

          <form onSubmit={handleSubmit} className="mt-9 grid gap-5">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
              Adresse e-mail
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@exemple.com"
                className="w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm font-normal normal-case tracking-normal outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
              Mot de passe
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
                className="w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm font-normal normal-case tracking-normal outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold"
              />
            </label>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_24px_rgba(32,31,28,0.16)] disabled:cursor-wait disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-gold" /> Vos données restent confidentielles</div>
          <p className="mt-7 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primary underline underline-offset-4 hover:text-gold">Créer un compte</Link>
          </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
