"use client"

import React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout"
import { InactivityWarningDialog } from "@/components/inactivity-warning-dialog"

interface SessionTimeoutProviderProps {
  children: React.ReactNode
}

export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Rutas publicas que no requieren timeout
  const publicRoutes = ["/login", "/auth/forgot-password", "/auth/reset-password", "/auth/callback"]
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error("Error verificando autenticacion:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Escuchar cambios de autenticacion
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const { showWarning, remainingTime, extendSession, logout } = useInactivityTimeout({
    timeoutMinutes: 1,
    warningMinutes: 0.3,
  })

  // No mostrar nada durante la carga inicial
  if (isLoading) {
    return <>{children}</>
  }

  // No aplicar timeout en rutas publicas o si no esta autenticado
  if (isPublicRoute || !isAuthenticated) {
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
