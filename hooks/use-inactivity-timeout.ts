"use client"

import React, { Suspense } from "react"
import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout"
import { InactivityWarningDialog } from "@/components/inactivity-warning-dialog"

// Componente interno que usa useSearchParams
function SessionTimeoutProviderContent({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Rutas publicas que no requieren timeout
  const publicRoutes = ["/login", "/auth/forgot-password", "/auth/reset-password", "/auth/callback"]
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

  // Verificar si venimos de un cierre por inactividad
  const isInactivityRedirect = searchParams?.get('reason') === 'inactivity'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
        
        // Si hay sesión y venimos de inactividad, limpiar el parámetro de la URL
        if (session && isInactivityRedirect) {
          // Usar replaceState para limpiar la URL sin recargar
          const url = new URL(window.location.href)
          url.searchParams.delete('reason')
          window.history.replaceState({}, '', url.toString())
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
        setHasInitialized(true)
      }
    }

    checkAuth()

    // Escuchar cambios de autenticación
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      
      // Reiniciar el estado de inicialización cuando se autentica
      if (session) {
        setHasInitialized(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, isInactivityRedirect])

  const { showWarning, remainingTime, extendSession, logout } = useInactivityTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
  })

  // No mostrar nada durante la carga inicial
  if (isLoading) {
    return <>{children}</>
  }

  // No aplicar timeout en rutas publicas o si no esta autenticado
  if (isPublicRoute || !isAuthenticated) {
    return <>{children}</>
  }

  // Solo mostrar el provider si ya se inicializó completamente
  if (!hasInitialized) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <InactivityWarningDialog
        open={showWarning}
        remainingTime={remainingTime}
        onExtend={extendSession}
        onLogout={logout}
      />
    </>
  )
}

// Componente wrapper principal que usa Suspense
interface SessionTimeoutProviderProps {
  children: React.ReactNode
}

export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <SessionTimeoutProviderContent>
        {children}
      </SessionTimeoutProviderContent>
    </Suspense>
  )
}
