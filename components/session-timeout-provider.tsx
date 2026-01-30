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

  // Rutas públicas
  const publicRoutes = [
    "/login", 
    "/auth/forgot-password", 
    "/auth/reset-password", 
    "/auth/callback",
    "/"
  ]
  
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") return pathname === "/"
    return pathname?.startsWith(route)
  })

  // IMPORTANTE: Para testing, usa tiempos MUY CORTOS
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const {
    showWarning, 
    remainingTime, 
    extendSession, 
    logout
  } = useInactivityTimeout({
    timeoutMinutes: isDevelopment ? 0.1 : 30, // 6 segundos en desarrollo
    warningMinutes: isDevelopment ? 0.05 : 5   // 3 segundos de advertencia
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        console.log("🔐 Estado de sesión:", session ? "AUTENTICADO" : "NO autenticado")
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error("❌ Error verificando autenticación:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Escuchar cambios de autenticación
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Cambio de auth:", event, session ? "Con sesión" : "Sin sesión")
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return <>{children}</>
  }

  if (isPublicRoute || !isAuthenticated) {
    console.log("🔓 Ruta pública o no autenticado - sin timeout")
    return <>{children}</>
  }

  console.log("🔐 Usuario autenticado - timeout activo")

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
