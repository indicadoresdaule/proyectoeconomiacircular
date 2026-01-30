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
  const [userProfile, setUserProfile] = useState<any>(null)
  const pathname = usePathname()

  // Rutas publicas que no requieren timeout
  const publicRoutes = ["/login", "/auth/forgot-password", "/auth/reset-password", "/auth/callback"]
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setIsAuthenticated(true)
          
          // Obtener perfil del usuario
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUserProfile(profile)
          
          // Verificar última actividad del servidor al cargar
          if (profile?.last_activity) {
            const lastActivity = new Date(profile.last_activity)
            const now = new Date()
            const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
            
            // Si ya pasaron más de 30 minutos, cerrar sesión
            if (diffMinutes > 30) {
              await supabase.auth.signOut()
              setIsAuthenticated(false)
              window.location.href = '/login?message=session_expired'
            }
          }
        } else {
          setIsAuthenticated(false)
        }
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authenticated = !!session
      setIsAuthenticated(authenticated)
      
      if (authenticated && session?.user) {
        // Obtener perfil cuando se autentique
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const { showWarning, remainingTime, extendSession, logout } = useInactivityTimeout({
    timeoutMinutes: 0.1,
    warningMinutes: 0.05,
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
