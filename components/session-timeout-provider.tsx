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
  const [userRole, setUserRole] = useState<string | null>(null)
  const pathname = usePathname()

  // Rutas públicas que no requieren timeout
  const publicRoutes = [
    "/login", 
    "/auth/forgot-password", 
    "/auth/reset-password", 
    "/auth/callback",
    "/",
    "/register"
  ]
  
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") return pathname === "/"
    return pathname?.startsWith(route)
  })

  // Configurar diferentes tiempos por rol
  const getTimeoutConfig = () => {
    switch(userRole) {
      case 'admin':
        return { timeoutMinutes: 0.1, warningMinutes: 0.05 } // 2 horas para admin
      case 'docente':
        return { timeoutMinutes: 0.1, warningMinutes: 0.05 } // 1 hora para docentes
      case 'estudiante':
        return { timeoutMinutes: 0.1, warningMinutes: 0.05} // 30 minutos para estudiantes
      default:
        return { timeoutMinutes: 0.1, warningMinutes: 0.05} // Default
    }
  }

  const config = getTimeoutConfig()

  const {
    showWarning, 
    remainingTime, 
    extendSession, 
    logout,
    recordActivity
  } = useInactivityTimeout({
    timeoutMinutes: config.timeoutMinutes,
    warningMinutes: config.warningMinutes
  })

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const isAuth = !!session
        
        setIsAuthenticated(isAuth)
        
        if (isAuth && session.user) {
          // Obtener el rol del usuario desde la tabla profiles
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (!error && profile) {
            setUserRole(profile.role)
            console.log(`Usuario autenticado con rol: ${profile.role}, timeout: ${config.timeoutMinutes}min`)
          }
          
          // Registrar actividad inicial con retardo
          setTimeout(() => {
            recordActivity()
          }, 2000)
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndProfile()

    // Escuchar cambios de autenticación
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuth = !!session
      setIsAuthenticated(isAuth)
      
      if (isAuth && session?.user) {
        // Obtener perfil cuando inicia sesión
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUserRole(profile.role)
        }
        
        // Registrar actividad cuando inicia sesión
        setTimeout(() => {
          recordActivity()
        }, 1000)
      } else {
        setUserRole(null)
      }
      
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [recordActivity, config.timeoutMinutes])

  // No mostrar nada durante la carga inicial
  if (isLoading) {
    return <>{children}</>
  }

  // No aplicar timeout en rutas públicas o si no está autenticado
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
