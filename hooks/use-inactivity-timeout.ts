"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface UseInactivityTimeoutOptions {
  timeoutMinutes?: number
  warningMinutes?: number
  onWarning?: () => void
  onTimeout?: () => void
}

export function useInactivityTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onWarning,
  onTimeout,
}: UseInactivityTimeoutOptions = {}) {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(warningMinutes * 60)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const tabCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningActiveRef = useRef<boolean>(false)
  const isLoggingOutRef = useRef<boolean>(false)
  const isAuthenticatedRef = useRef<boolean>(false)
  const lastActivityTimeRef = useRef<number>(Date.now())

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningTriggerMs = (timeoutMinutes - warningMinutes) * 60 * 1000
  const tabCloseDelayMs = 5 * 60 * 1000 // 5 minutos para cerrar sesión cuando se cierra la pestaña

  // Función para verificar autenticación
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const isAuth = !!session
      isAuthenticatedRef.current = isAuth
      return isAuth
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      isAuthenticatedRef.current = false
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    const isAuth = await checkAuthentication()
    if (!isAuth) {
      console.log("Usuario no autenticado, omitiendo logout")
      return
    }

    if (isLoggingOutRef.current) return
    
    isLoggingOutRef.current = true
    
    try {
      console.log("Cerrando sesión por inactividad")
      const supabase = createClient()
      await supabase.auth.signOut()
      
      cleanupAllTimers()
      
      router.push("/login?reason=inactivity")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      router.push("/login?reason=inactivity")
    } finally {
      setTimeout(() => {
        isLoggingOutRef.current = false
      }, 1000)
    }
  }, [router, checkAuthentication])

  const resetTimers = useCallback(() => {
    if (isLoggingOutRef.current) return
    
    if (warningActiveRef.current) {
      return
    }

    cleanupTimers()

    lastActivityTimeRef.current = Date.now()
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)

    console.log("Timers de inactividad reiniciados")

    // Configurar timer de advertencia
    warningTimeoutRef.current = setTimeout(() => {
      warningActiveRef.current = true
      setShowWarning(true)
      setRemainingTime(warningMinutes * 60)
      onWarning?.()

      countdownRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
              countdownRef.current = null
            }
            warningActiveRef.current = false
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const timeUntilLogout = warningMinutes * 60 * 1000
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        warningActiveRef.current = false
        onTimeout?.()
        logout()
      }, timeUntilLogout)
      
    }, warningTriggerMs - (Date.now() - lastActivityTimeRef.current))

    // Configurar timer de cierre de sesión principal
    timeoutRef.current = setTimeout(() => {
      warningActiveRef.current = false
      onTimeout?.()
      logout()
    }, timeoutMs - (Date.now() - lastActivityTimeRef.current))
  }, [timeoutMs, warningTriggerMs, warningMinutes, logout, onWarning, onTimeout])

  const extendSession = useCallback(() => {
    if (isLoggingOutRef.current) return
    
    warningActiveRef.current = false
    setShowWarning(false)
    
    console.log("Sesión extendida por usuario")
    
    resetTimers()
  }, [resetTimers])

  const cleanupTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    if (tabCloseTimeoutRef.current) {
      clearTimeout(tabCloseTimeoutRef.current)
      tabCloseTimeoutRef.current = null
    }
  }

  const cleanupAllTimers = useCallback(() => {
    console.log("Limpiando todos los timers")
    cleanupTimers()
    
    warningActiveRef.current = false
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)
  }, [warningMinutes])

  // Función para manejar el cierre de pestaña
  const handleTabClose = useCallback(async () => {
    const isAuth = await checkAuthentication()
    if (!isAuth) {
      console.log("Usuario no autenticado, omitiendo logout por cierre de pestaña")
      return
    }
    
    console.log("Pestaña cerrada, programando logout en 5 minutos")
    
    // Limpiar cualquier timeout previo de cierre de pestaña
    if (tabCloseTimeoutRef.current) {
      clearTimeout(tabCloseTimeoutRef.current)
    }
    
    // Programar logout después de 5 minutos
    tabCloseTimeoutRef.current = setTimeout(() => {
      console.log("Ejecutando logout por cierre de pestaña")
      logout()
    }, tabCloseDelayMs)
    
    // Guardar información en localStorage para sincronizar con otras pestañas
    const closeInfo = {
      timestamp: Date.now(),
      tabId: Math.random().toString(36).substr(2, 9),
      logoutTime: Date.now() + tabCloseDelayMs,
      isAuthenticated: true
    }
    
    localStorage.setItem('tabCloseSession', JSON.stringify(closeInfo))
  }, [logout, tabCloseDelayMs, checkAuthentication])

  // Verificar si hay un logout pendiente de otra pestaña
  const checkPendingLogout = useCallback(async () => {
    try {
      const closeInfoStr = localStorage.getItem('tabCloseSession')
      if (closeInfoStr) {
        const closeInfo = JSON.parse(closeInfoStr)
        const now = Date.now()
        
        if (!closeInfo.isAuthenticated) {
          console.log("Logout pendiente no es de usuario autenticado, ignorando")
          localStorage.removeItem('tabCloseSession')
          return
        }
        
        if (closeInfo.logoutTime <= now) {
          console.log("Encontrado logout pendiente de otra pestaña, ejecutando")
          localStorage.removeItem('tabCloseSession')
          
          const isAuth = await checkAuthentication()
          if (isAuth) {
            logout()
          }
        } else {
          const timeRemaining = closeInfo.logoutTime - now
          console.log(`Logout pendiente de otra pestaña en ${Math.round(timeRemaining/1000)} segundos`)
          
          const isAuth = await checkAuthentication()
          if (isAuth) {
            if (tabCloseTimeoutRef.current) {
              clearTimeout(tabCloseTimeoutRef.current)
            }
            tabCloseTimeoutRef.current = setTimeout(() => {
              logout()
            }, timeRemaining)
          } else {
            console.log("Usuario no autenticado, cancelando logout pendiente")
            localStorage.removeItem('tabCloseSession')
          }
        }
      }
    } catch (error) {
      console.error("Error al verificar logout pendiente:", error)
      localStorage.removeItem('tabCloseSession')
    }
  }, [logout, checkAuthentication])

  useEffect(() => {
    // Verificar logout pendiente al cargar
    checkAuthentication().then((isAuth) => {
      if (isAuth) {
        checkPendingLogout()
        resetTimers()
      }
    })

    // Eventos para detectar cierre de pestaña/navegador
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("Evento beforeunload detectado - pestaña cerrándose")
      if (isAuthenticatedRef.current) {
        handleTabClose()
      }
    }

    const handlePageHide = (event: PageTransitionEvent) => {
      console.log("Evento pagehide detectado")
      if (isAuthenticatedRef.current) {
        handleTabClose()
      }
    }

    // Detectar cuando la página se vuelve visible después de navegación hacia atrás
    const handlePageshow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log("Página restaurada desde cache")
        // Cancelar cualquier logout pendiente
        if (tabCloseTimeoutRef.current) {
          clearTimeout(tabCloseTimeoutRef.current)
          tabCloseTimeoutRef.current = null
        }
        
        // Limpiar el item de localStorage
        localStorage.removeItem('tabCloseSession')
        
        // Reiniciar timers de inactividad
        checkAuthentication().then((isAuth) => {
          if (isAuth) {
            resetTimers()
          }
        })
      }
    }

    // Sincronización entre pestañas usando localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'tabCloseSession') {
        if (!event.newValue) {
          console.log("Otra pestaña removió el item de logout")
          if (tabCloseTimeoutRef.current) {
            clearTimeout(tabCloseTimeoutRef.current)
            tabCloseTimeoutRef.current = null
          }
        } else {
          checkAuthentication().then((isAuth) => {
            if (isAuth) {
              checkPendingLogout()
            }
          })
        }
      }
    }

    // Eventos que indican actividad del usuario (solo cuando la pestaña está visible)
    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "wheel",
      "mousemove"
    ]

    const handleActivity = () => {
      // Solo resetear timers si la pestaña está visible y no hay advertencia activa
      if (!document.hidden && !warningActiveRef.current) {
        resetTimers()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("pagehide", handlePageHide)
    window.addEventListener("pageshow", handlePageshow)
    window.addEventListener("storage", handleStorageChange)
    
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("pagehide", handlePageHide)
      window.removeEventListener("pageshow", handlePageshow)
      window.removeEventListener("storage", handleStorageChange)
      
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      
      // Limpiar el item de localStorage si esta pestaña lo creó
      const closeInfoStr = localStorage.getItem('tabCloseSession')
      if (closeInfoStr) {
        try {
          const closeInfo = JSON.parse(closeInfoStr)
          if (closeInfo && closeInfo.isAuthenticated && tabCloseTimeoutRef.current) {
            localStorage.removeItem('tabCloseSession')
          }
        } catch (error) {
          localStorage.removeItem('tabCloseSession')
        }
      }
      
      cleanupAllTimers()
    }
  }, [resetTimers, logout, cleanupAllTimers, checkPendingLogout, handleTabClose, checkAuthentication])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout,
    cleanupAllTimers,
  }
}
