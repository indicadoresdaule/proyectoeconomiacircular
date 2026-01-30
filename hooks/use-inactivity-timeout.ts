"use client"

import React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout"
import { InactivityWarningDialog } from "@/components/inactivity-warning-dialog"

interface SessionTimeoutProviderProps {
  children: React.ReactNode
}

export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Para testing rápido
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const {
    showWarning, 
    remainingTime, 
    extendSession, 
    logout
  } = useInactivityTimeout({
    timeoutMinutes: isDevelopment ? 0.033 : 30, // 2 segundos en desarrollo
    warningMinutes: isDevelopment ? 0.016 : 5    // 1 segundo de advertencia
  })

  useEffect(() => {
    const supabase = createClient()
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log("🔐 Estado de sesión:", session ? `✅ AUTENTICADO (${session.user.email})` : "❌ NO autenticado")
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error("Error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Cambio de auth:", event)
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

  // SOLO mostrar timeout si está autenticado
  if (!isAuthenticated) {
    return <>{children}</>
  }

  console.log("🎯 Aplicando timeout - Usuario autenticado")

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
