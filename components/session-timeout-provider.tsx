"use client"

import React from "react"
import { useEffect, useState, useRef } from "react"
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
  const [sessionKey, setSessionKey] = useState(0) // Clave para forzar reinicio
  const pathname = usePathname()
  const authCheckedRef = useRef(false)

  // Rutas publicas que no requieren timeout
  const publicRoutes = ["/login", "/auth/forgot-password", "/auth/reset-password", "/auth/callback"]
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

  useEffect(() => {
    const checkAuth = async () => {
      // Prevenir múltiples verificaciones
      if (authCheckedRef.current) return
      
      try {
        authCheckedRef.current = true
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const authenticated = !!session
        
        if (authenticated !== isAuthenticated) {
          setIsAuthenticated(authenticated)
          
          // Incrementar la clave cuando se detecta una nueva sesión
          if (authenticated) {
            setSessionKey(prev => prev + 1)
            console.log("Nueva sesión detectada, reiniciando timers")
          }
        }
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authenticated = !!session
      
      console.log("Auth state changed:", event, "Authenticated:", authenticated)
      
      if (authenticated !== isAuthenticated) {
        setIsAuthenticated(authenticated)
        
        // Incrementar la clave cuando cambia el estado de autenticación
        // especialmente cuando se inicia sesión después de un cierre automático
        if (authenticated) {
          setSessionKey(prev => prev + 1)
          console.log("Sesión iniciada, reiniciando timers")
        }
      }
      
      // Si está cargando, marcar como no cargando después del primer evento
      if (isLoading) {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthenticated, isLoading])

  // Reiniciar el ref cuando la autenticación cambia
  useEffect(() => {
    if (!isAuthenticated) {
      authCheckedRef.current = false
    }
  }, [isAuthenticated])

  // Usar una nueva instancia del hook cada vez que cambie la clave de sesión
  const { showWarning, remainingTime, extendSession, logout } = useInactivityTimeout({
    timeoutMinutes: 1,
    warningMinutes: 0.5,
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
        key={`dialog-${sessionKey}`} // Forzar recreación del diálogo
        open={showWarning}
        remainingTime={remainingTime}
        onExtend={extendSession}
        onLogout={logout}
      />
    </>
  )
}
