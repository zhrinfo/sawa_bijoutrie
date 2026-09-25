'use client'

import { motion } from 'framer-motion'
import { Menu, ShoppingBag, User, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AuthUser {
  fullName?: string
  email?: string
  roles?: string[]
}

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    function loadUser() {
      const storedUser = window.localStorage.getItem('authUser')

      if (!storedUser) {
        setUser(null)
        return
      }

      try {
        setUser(JSON.parse(storedUser) as AuthUser)
      } catch {
        setUser(null)
      }
    }

    loadUser()
    window.addEventListener('storage', loadUser)
    window.addEventListener('focus', loadUser)

    return () => {
      window.removeEventListener('storage', loadUser)
      window.removeEventListener('focus', loadUser)
    }
  }, [])

  function logout() {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('authUser')
    setUser(null)
    setIsAccountOpen(false)
    router.push('/login')
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sawa-ULakSyyYatTiH6aVCLIhNc56V7Xkor.jpeg"
            alt="SAWA"
            width={44}
            height={44}
            className="rounded-full ring-1 ring-gold/70 "
          />
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {[
            ['Collections', '/products'],
            ['Best Sellers', '/#best-sellers'],
            ['About', '/#why-choose-sawa'],
            ['Contact', '#'],
           
          ].map(([item, href], i) => (
            <motion.a
              key={item}
              href={href}
              className="group/item relative text-black text-sm font-sans hover:text-black transition-colors"
              whileHover={{ color: '#c19a5b' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {item}
              <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover/item:scale-x-100" />
            </motion.a>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <motion.button
            className="p-2 hover:bg-card rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="relative">
            <motion.button
              type="button"
              aria-label="Ouvrir le menu du compte"
              aria-expanded={isAccountOpen}
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="rounded-full p-2 transition-colors hover:bg-card"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="h-5 w-5 text-foreground" />
            </motion.button>
            {isAccountOpen && (
              <div className="absolute right-0 top-12 z-50 w-44 border border-border bg-background p-2 shadow-lg">
                {user ? (
                  <>
                    <div className="border-b border-border px-3 py-2">
                      <p className="truncate text-sm font-semibold text-foreground">{user.fullName || user.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{user.roles?.includes('ROLE_ADMIN') ? 'Administrateur' : user.roles?.includes('ROLE_SOUS_ADMIN') ? 'Sous-administrateur' : 'Client'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={logout}
                      className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    >
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              type="button"
              aria-label="Ouvrir le menu du panier"
              aria-expanded={isShopOpen}
              onClick={() => setIsShopOpen(!isShopOpen)}
              className="relative rounded-full p-2 transition-colors hover:bg-card"
            >
              <ShoppingBag className="h-5 w-5 text-foreground" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />
            </button>
            {isShopOpen && (
              <div className="absolute right-0 top-12 z-50 w-44 border border-border bg-background p-2 shadow-lg">
                <Link
                  href="/cart"
                  onClick={() => setIsShopOpen(false)}
                  className="block px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  Panier
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsShopOpen(false)}
                  className="block px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  Mes commandes
                </Link>
              </div>
            )}
          </motion.div>
          <motion.button
            type="button"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isOpen}
            className="md:hidden p-2 hover:bg-card rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden border-t border-border overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {[
            ['Collections', '/products'],
            ['Best Sellers', '/#best-sellers'],
            ['About', '/#why-choose-sawa'],
            ['Contact', '#'],
          ].map(([item, href]) => (
            <a
              key={item}
              href={href}
              onClick={() => setIsOpen(false)}
              className="group/item relative w-fit text-black text-sm font-sans hover:text-black transition-colors"
            >
              {item}
              <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover/item:scale-x-100" />
            </a>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  )
}
