"use client"

import type React from "react"

import { useState, useEffect, useRef, memo, useCallback } from "react"
import Link from "next/link"
import { Menu, X, LogOut, ChevronDown, UserIcon, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/metas", label: "Metas" },
  { href: "/indicadores", label: "Indicadores" },
  { href: "/avances", label: "Avances" },
  { href: "/reportes", label: "Reportes" },
  { href: "/formularios", label: "Formularios" },
]

// Memoizar componentes internos para evitar re-renders
const NavigationItem = memo(
  ({
    href,
    label,
    isActive,
    onClick,
  }: {
    href: string
    label: string
    isActive: boolean
    onClick?: () => void
  }) => (
    <Link
      href={href}
      className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
        isActive
          ? "bg-primary text-white shadow-md"
          : "text-secondary-text hover:text-primary-text hover:bg-secondary-bg"
      }`}
      onClick={onClick}
    >
      {label}
    </Link>
  ),
)

NavigationItem.displayName = "NavigationItem"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const supabase = createClient()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const currentUser = user // Assuming user object contains profile information

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()

      // Cerrar menús
      setShowUserMenu(false)
      setIsOpen(false)

      // Forzar recarga completa de la página
      window.location.href = "/"

      // También hacer refresh del router como respaldo
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setIsLoggingOut(false)
    }
  }, [supabase.auth, router])

  // Función para forzar actualización del header
  const forceHeaderUpdate = useCallback(() => {
    setForceUpdate((prev) => prev + 1)
    router.refresh()
  }, [router])

  // Custom Link que forza actualización cuando se navega desde páginas de autenticación
  const CustomLink = useCallback(
    ({ href, children, ...props }: any) => {
      const isAuthPage =
        pathname.includes("/login") ||
        pathname.includes("/registro") ||
        pathname.includes("/recuperar") ||
        pathname.includes("/restablecer")

      const handleClick = (e: React.MouseEvent) => {
        if (isAuthPage) {
          // Si estamos en una página de autenticación, forzamos actualización
          forceHeaderUpdate()
        }
        if (props.onClick) {
          props.onClick(e)
        }
      }

      return (
        <Link href={href} {...props} onClick={handleClick}>
          {children}
        </Link>
      )
    },
    [pathname, forceHeaderUpdate],
  )

  // Escuchar cambios en la autenticación específicamente
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Forzar actualización cuando haya cambios en la autenticación
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setForceUpdate((prev) => prev + 1)
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  // Usar useMemo para cálculos que no cambian frecuentemente
  const displayName = user?.email?.split("@")[0] || "Usuario"
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsOpen(false)
    setShowUserMenu(false)
  }, [pathname, forceUpdate]) // Añadimos forceUpdate como dependencia

  // Evitar re-render del logo con funcionalidad de actualización
  const Logo = useCallback(() => {
    const isAuthPage =
      pathname.includes("/login") ||
      pathname.includes("/registro") ||
      pathname.includes("/recuperar") ||
      pathname.includes("/restablecer")

    const handleLogoClick = () => {
      if (isAuthPage) {
        // Si estamos en una página de autenticación, forzamos actualización
        setForceUpdate((prev) => prev + 1)
        router.refresh()
      }
    }

    return (
      <Link href="/" className="flex items-center gap-3 group" onClick={handleLogoClick}>
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white">
          <Image
            src="/images/ingenieria-20-282-29.jpeg"
            alt="Logo Ingeniería Industrial UG"
            fill
            className="object-contain p-0.5"
            priority
            sizes="40px"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-primary tracking-tight">Seguimiento e indicadores</span>
          <span className="text-xs text-secondary-text font-medium">de gestión ambiental</span>
        </div>
      </Link>
    )
  }, [pathname, router])

  return (
    <header
      key={`header-${forceUpdate}`}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Navegación Desktop */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => (
                <NavigationItem key={item.href} href={item.href} label={item.label} isActive={pathname === item.href} />
              ))}
            </div>
          </div>

          {/* Sección Usuario */}
          <div className="flex items-center gap-2">
            {loading ? (
              // Skeleton más rápido y estático
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2">
                  <div className="w-24 h-4 bg-secondary-bg rounded" />
                  <div className="w-8 h-8 rounded-full bg-secondary-bg" />
                </div>
                <div className="lg:hidden w-8 h-8 rounded-full bg-secondary-bg" />
              </div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                {/* Desktop - Usuario completo */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-expanded={showUserMenu}
                  disabled={isLoggingOut}
                >
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground block">{displayName}</span>
                    <span className="text-xs text-secondary-text truncate max-w-[180px] block">{user.email}</span>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-secondary-text transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Mobile - Solo avatar */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="lg:hidden flex items-center gap-2 p-1.5 rounded-md hover:bg-secondary-bg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoggingOut}
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                    {initials}
                  </div>
                </button>

                {/* Dropdown Menu - Solo Configuración y Cerrar Sesión */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="py-1">
                      <CustomLink
                        href="/perfil"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary-bg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        Mi Perfil
                      </CustomLink>
                      {currentUser?.profile?.role === "admin" && (
                        <CustomLink
                          href="/gestion-usuarios"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary-bg transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Gestión de Usuarios
                        </CustomLink>
                      )}
                      <div className="my-1 border-t border-border" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoggingOut}
                      >
                        <LogOut className="w-4 h-4" />
                        {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:block">
                <CustomLink
                  href="/login"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
                  prefetch={true}
                >
                  Iniciar Sesión
                </CustomLink>
              </div>
            )}

            {/* Menú Hamburguesa */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-secondary-bg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menú principal"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menú Mobile Expandido */}
        {isOpen && (
          <div className="lg:hidden border-t border-border bg-background animate-in slide-in-from-top">
            <div className="py-3 space-y-1">
              {navItems.map((item) => (
                <CustomLink
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-md mx-2 transition-colors ${
                    pathname === item.href
                      ? "bg-primary text-white"
                      : "text-secondary-text hover:bg-secondary-bg hover:text-primary-text"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </CustomLink>
              ))}

              <div className="pt-4 border-t border-border mt-2 px-2">
                {user ? (
                  <>
                    <div className="px-3 py-3 bg-secondary-bg/50 rounded-lg mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                          <p className="text-xs text-secondary-text truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <CustomLink
                      href="/perfil"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary-bg rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserIcon className="w-5 h-5" />
                      Mi Perfil
                    </CustomLink>

                    {currentUser?.profile?.role === "admin" && (
                      <CustomLink
                        href="/gestion-usuarios"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary-bg rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        Gestión de Usuarios
                      </CustomLink>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoggingOut}
                    >
                      <LogOut className="w-5 h-5" />
                      {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                    </button>
                  </>
                ) : (
                  <div className="px-2 pt-2">
                    <CustomLink
                      href="/login"
                      className="block px-4 py-3 text-center bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity text-sm"
                      onClick={() => setIsOpen(false)}
                      prefetch={true}
                    >
                      Iniciar Sesión
                    </CustomLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
