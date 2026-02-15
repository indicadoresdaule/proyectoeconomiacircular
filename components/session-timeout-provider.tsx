"use client"

import React, { Suspense } from "react"
import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout"
import { InactivityWarningDialog } from "@/components/inactivity-warning-dialog"

function SessionTimeoutProviderContent({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const publicRoutes = ["/login", "/auth/forgot-password", "/auth/reset-password", "/auth/callback"]
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

  const isInactivityRedirect = searchParams?.get('reason') === 'inactivity'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
        
        if (session && isInactivityRedirect) {
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

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      
      if (session) {
        setHasInitialized(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, isInactivityRedirect])

  const { showWarning, remainingTime, extendSession, logout, cleanupAllTimers } = useInactivityTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
  })

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      console.log("Usuario no autenticado, limpiando timers de inactividad")
      cleanupAllTimers?.()
    }
  }, [isAuthenticated, isLoading, cleanupAllTimers])

  if (isLoading) {
    return <>{children}</>
  }

  if (isPublicRoute || !isAuthenticated) {
    return <>{children}</>
  }

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

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <SessionTimeoutProviderContent>
        {children}
      </SessionTimeoutProviderContent>
    </Suspense>
  )
}
