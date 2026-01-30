"use client"

import React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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
  const router = useRouter()

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

  const {
    showWarning, 
    remainingTime, 
    extendSession, 
    logout,
    recordActivity
  } = useInactivityTimeout({
    timeoutMinutes: 0.1,
    warningMinutes: 0.06
  })

  // Verificar estado del usuario y perfil
  const checkUserStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setIsAuthenticated(false)
        setUserProfile(null)
        return
      }

      // Verificar perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError || !profile) {
        console.error("Perfil no encontrado:", profileError)
        await supabase.auth.signOut()
        setIsAuthenticated(false)
        router.push('/login?error=profile_not_found')
        return
      }

      // Verificar si el usuario está activo
      if (profile.status !== 'active') {
        await supabase.auth.signOut()
        setIsAuthenticated(false)
        router.push('/login?error=account_inactive')
        return
      }

      setIsAuthenticated(true)
      setUserProfile(profile)
      
      // Registrar actividad inicial
      await recordActivity()

    } catch (error) {
      console.error("Error en checkUserStatus:", error)
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    checkUserStatus()

    // Escuchar cambios de autenticación
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
          setUserProfile(null)
        } else if (session) {
          await checkUserStatus()
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, recordActivity])

  // Si la ruta es pública o no hay autenticación, no mostrar el timeout
  if (isPublicRoute || !isAuthenticated || isLoading) {
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
