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

  // Para testing, usa tiempos cortos
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const {
    showWarning, 
    remainingTime, 
    extendSession, 
    logout,
    getDebugInfo,
    simulateActivity,
    forceLogout
  } = useInactivityTimeout({
    timeoutMinutes: isDevelopment ? 0.25 : 30, // 15 segundos en desarrollo
    warningMinutes: isDevelopment ? 0.1 : 5    // 6 segundos de advertencia
  })

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        console.log("Session check:", session ? "Autenticado" : "No autenticado")
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error("Error verificando autenticación:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Escuchar cambios de autenticación
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "Sesión activa" : "Sin sesión")
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
      
      {/* Panel de debug solo en desarrollo y cuando esté autenticado */}
      {isDevelopment && isAuthenticated && (
        <DebugPanel 
          debugInfo={getDebugInfo()}
          onSimulateActivity={simulateActivity}
          onForceLogout={forceLogout}
        />
      )}
    </>
  )
}
