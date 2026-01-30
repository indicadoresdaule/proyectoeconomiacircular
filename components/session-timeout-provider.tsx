"use client"

import React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock, LogOut } from "lucide-react"

interface SessionTimeoutProviderProps {
  children: React.ReactNode
}

export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const pathname = usePathname()
  const supabase = createClient()

  // Rutas públicas
  const publicRoutes = ["/login", "/auth/forgot-password", "/auth/reset-password", "/auth/callback", "/"]
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

  // Configuración
  const TIMEOUT_MINUTES = 0.5 // 30 segundos para pruebas - cambia a 30
  const WARNING_MINUTES = 0.25 // 15 segundos para pruebas - cambia a 5
  const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000
  const WARNING_MS = WARNING_MINUTES * 60 * 1000

  // Registrar actividad
  const recordActivity = useCallback(async () => {
    if (!isAuthenticated) return
    
    console.log("Actividad registrada")
    
    // Limpiar timeouts anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (showWarning) setShowWarning(false)
    
    // Configurar nuevo timeout de advertencia
    warningRef.current = setTimeout(() => {
      console.log("Mostrando advertencia")
      setShowWarning(true)
      setRemainingTime(Math.floor((TIMEOUT_MS - WARNING_MS) / 1000))
    }, TIMEOUT_MS - WARNING_MS)
    
    // Configurar timeout de cierre de sesión
    timeoutRef.current = setTimeout(() => {
      console.log("Cerrando sesión por inactividad")
      handleLogout()
    }, TIMEOUT_MS)
    
    // Actualizar en la base de datos
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            last_sign_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error("Error actualizando actividad:", error)
    }
  }, [isAuthenticated, showWarning, supabase])

  // Cerrar sesión
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login?message=session_expired'
  }, [supabase])

  // Extender sesión
  const extendSession = useCallback(() => {
    console.log("Extendiendo sesión")
    setShowWarning(false)
    recordActivity()
  }, [recordActivity])

  // Configurar listeners de actividad
  const setupActivityListeners = useCallback(() => {
    if (!isAuthenticated) return
    
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click']
    
    const handleActivity = () => recordActivity()
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })
    
    // Iniciar el primer registro de actividad
    recordActivity()
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [isAuthenticated, recordActivity])

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setIsLoading(false)
      console.log("Sesión activa:", !!session)
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
      console.log(`Auth change: ${event}, session: ${!!session}`)
    })
    
    return () => subscription.unsubscribe()
  }, [supabase])

  // Iniciar/Detener listeners según autenticación
  useEffect(() => {
    if (isAuthenticated && !isPublicRoute) {
      console.log("Iniciando listeners de inactividad")
      const cleanup = setupActivityListeners()
      
      // Actualizar tiempo restante cada segundo cuando hay advertencia
      activityIntervalRef.current = setInterval(() => {
        if (showWarning) {
          setRemainingTime(prev => {
            if (prev <= 1) {
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
      
      return () => {
        if (cleanup) cleanup()
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (warningRef.current) clearTimeout(warningRef.current)
        if (activityIntervalRef.current) clearInterval(activityIntervalRef.current)
        console.log("Limpiando listeners de inactividad")
      }
    }
  }, [isAuthenticated, isPublicRoute, setupActivityListeners, showWarning])

  // Formatear tiempo
  const formatTime = () => {
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
    return `${seconds} segundos`
  }

  if (isLoading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      {isAuthenticated && !isPublicRoute && (
        <AlertDialog open={showWarning}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                <Clock className="h-5 w-5" />
                Sesión por expirar
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Tu sesión está a punto de cerrarse por inactividad.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-700 mb-1">Tiempo restante:</p>
                  <p className="text-2xl font-bold text-amber-800">{formatTime()}</p>
                </div>
                <p className="text-sm">
                  Haz clic en &quot;Continuar sesión&quot; para mantener tu sesión activa.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={extendSession}
                className="bg-primary hover:bg-primary/90"
              >
                Continuar sesión
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
