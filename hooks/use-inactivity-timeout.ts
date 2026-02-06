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
  timeoutMinutes = 30, // 30 minutos de timeout total
  warningMinutes = 5,  // 5 minutos de advertencia
  onWarning,
  onTimeout,
}: UseInactivityTimeoutOptions = {}) {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(warningMinutes * 60)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const visibilityCheckRef = useRef<NodeJS.Timeout | null>(null)
  const tabHiddenTimeRef = useRef<number | null>(null)
  const sessionStartTimeRef = useRef<number>(Date.now())
  const warningActiveRef = useRef<boolean>(false)
  const isLoggingOutRef = useRef<boolean>(false)
  const beforeUnloadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pageHideTimeRef = useRef<number | null>(null)
  const isAuthenticatedRef = useRef<boolean>(false)

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningTriggerMs = (timeoutMinutes - warningMinutes) * 60 * 1000
  const tabCloseTimeoutMs = 5 * 60 * 1000 // 5 minutos para cerrar sesión cuando se cierra la pestaña
  const tabHiddenTimeoutMs = 5 * 60 * 1000 // 5 minutos para cerrar si la pestaña está oculta

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
    // Verificar si está autenticado antes de hacer logout
    const isAuth = await checkAuthentication()
    if (!isAuth) {
      console.log("Usuario no autenticado, omitiendo logout")
      return
    }

    // Prevenir múltiples llamadas simultáneas
    if (isLoggingOutRef.current) return
    
    isLoggingOutRef.current = true
    
    try {
      console.log("Cerrando sesión por inactividad")
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Limpiar todos los timers
      cleanupAllTimers()
      
      // Redirigir a login con parámetro de razón
      router.push("/login?reason=inactivity")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      router.push("/login?reason=inactivity")
    } finally {
      // Permitir futuros cierres de sesión después de un breve delay
      setTimeout(() => {
        isLoggingOutRef.current = false
      }, 1000)
    }
  }, [router, checkAuthentication])

  const resetTimers = useCallback(() => {
    // No resetear si estamos en proceso de logout
    if (isLoggingOutRef.current) return
    
    // Solo resetear si no hay advertencia activa
    if (warningActiveRef.current) {
      return
    }

    // Limpiar timers existentes
    cleanupTimers()

    // Resetear tiempo de pestaña oculta
    tabHiddenTimeRef.current = null
    pageHideTimeRef.current = null
    // Resetear tiempo de inicio de sesión
    sessionStartTimeRef.current = Date.now()

    // Ocultar advertencia si estaba visible
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)

    console.log("Timers reiniciados")

    // Configurar timer de advertencia
    warningTimeoutRef.current = setTimeout(() => {
      warningActiveRef.current = true
      setShowWarning(true)
      setRemainingTime(warningMinutes * 60)
      onWarning?.()

      // Iniciar cuenta regresiva
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

      // Configurar el logout para cuando termine la advertencia
      const timeUntilLogout = warningMinutes * 60 * 1000
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        warningActiveRef.current = false
        onTimeout?.()
        logout()
      }, timeUntilLogout)
      
    }, warningTriggerMs)

    // Configurar timer de cierre de sesión principal
    timeoutRef.current = setTimeout(() => {
      warningActiveRef.current = false
      onTimeout?.()
      logout()
    }, timeoutMs)
  }, [timeoutMs, warningTriggerMs, warningMinutes, logout, onWarning, onTimeout])

  const extendSession = useCallback(() => {
    if (isLoggingOutRef.current) return
    
    warningActiveRef.current = false
    setShowWarning(false)
    
    console.log("Sesión extendida por usuario")
    
    // Resetear timers normales
    cleanupTimers()
    
    // Configurar nuevos timers
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
      
    }, warningTriggerMs)

    timeoutRef.current = setTimeout(() => {
      warningActiveRef.current = false
      onTimeout?.()
      logout()
    }, timeoutMs)
  }, [warningTriggerMs, warningMinutes, timeoutMs, logout, onWarning, onTimeout])

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
    if (visibilityCheckRef.current) {
      clearTimeout(visibilityCheckRef.current)
      visibilityCheckRef.current = null
    }
  }

  const cleanupAllTimers = useCallback(() => {
    console.log("Limpiando todos los timers")
    cleanupTimers()
    
    if (beforeUnloadTimeoutRef.current) {
      clearTimeout(beforeUnloadTimeoutRef.current)
      beforeUnloadTimeoutRef.current = null
    }
    
    tabHiddenTimeRef.current = null
    pageHideTimeRef.current = null
    warningActiveRef.current = false
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)
  }, [warningMinutes])

  // Función para cerrar sesión cuando se detecta cierre de pestaña
  const handleTabClose = useCallback(async () => {
    // Verificar si el usuario está autenticado antes de proceder
    const isAuth = await checkAuthentication()
    if (!isAuth) {
      console.log("Usuario no autenticado, omitiendo logout por cierre de pestaña")
      return
    }
    
    console.log("Detectando cierre de pestaña, programando logout en 5 minutos")
    
    // Programar logout después de 5 minutos
    beforeUnloadTimeoutRef.current = setTimeout(() => {
      console.log("Ejecutando logout por cierre de pestaña")
      logout()
    }, tabCloseTimeoutMs)
    
    // Guardar el tiempo en localStorage para verificar en otras pestañas
    const closeInfo = {
      timestamp: Date.now(),
      tabId: Math.random().toString(36).substr(2, 9), // ID único para esta pestaña
      logoutTime: Date.now() + tabCloseTimeoutMs,
      isAuthenticated: true
    }
    
    localStorage.setItem('tabCloseSession', JSON.stringify(closeInfo))
  }, [logout, tabCloseTimeoutMs, checkAuthentication])

  // Verificar si hay un logout pendiente de otra pestaña
  const checkPendingLogout = useCallback(async () => {
    try {
      const closeInfoStr = localStorage.getItem('tabCloseSession')
      if (closeInfoStr) {
        const closeInfo = JSON.parse(closeInfoStr)
        const now = Date.now()
        
        // Verificar si el logout es de un usuario autenticado
        if (!closeInfo.isAuthenticated) {
          console.log("Logout pendiente no es de usuario autenticado, ignorando")
          localStorage.removeItem('tabCloseSession')
          return
        }
        
        // Si el logout programado ya pasó, ejecutarlo ahora
        if (closeInfo.logoutTime <= now) {
          console.log("Encontrado logout pendiente de otra pestaña, ejecutando")
          localStorage.removeItem('tabCloseSession')
          
          // Verificar autenticación antes de ejecutar logout
          const isAuth = await checkAuthentication()
          if (isAuth) {
            logout()
          }
        } else {
          // Calcular tiempo restante para logout
          const timeRemaining = closeInfo.logoutTime - now
          console.log(`Logout pendiente en ${Math.round(timeRemaining/1000)} segundos`)
          
          // Verificar autenticación antes de programar logout
          const isAuth = await checkAuthentication()
          if (isAuth) {
            // Programar logout para el tiempo restante
            beforeUnloadTimeoutRef.current = setTimeout(() => {
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
      }
    })

    // Manejo de visibilidad de pestaña
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pestaña se ocultó - guardar tiempo
        tabHiddenTimeRef.current = Date.now()
        console.log("Pestaña ocultada, iniciando timer de 5 minutos")

        // Si la pestaña permanece oculta por 5 minutos, cerrar sesión
        visibilityCheckRef.current = setTimeout(async () => {
          if (document.hidden) {
            // Verificar si está autenticado antes de proceder
            const isAuth = await checkAuthentication()
            if (isAuth) {
              console.log("Pestaña oculta por 5 minutos, cerrando sesión")
              logout()
            }
          }
        }, tabHiddenTimeoutMs)
      } else {
        // Pestaña se mostró nuevamente
        if (visibilityCheckRef.current) {
          clearTimeout(visibilityCheckRef.current)
          visibilityCheckRef.current = null
          console.log("Pestaña visible nuevamente, timer cancelado")
        }

        // Si la pestaña estuvo oculta, verificar si la sesión debe cerrarse
        if (tabHiddenTimeRef.current) {
          const hiddenDuration = Date.now() - tabHiddenTimeRef.current
          console.log(`Pestaña estuvo oculta por ${Math.round(hiddenDuration / 1000)} segundos`)
          
          if (hiddenDuration >= tabHiddenTimeoutMs) {
            // Verificar autenticación antes de proceder
            checkAuthentication().then((isAuth) => {
              if (isAuth) {
                console.log("Pestaña estuvo oculta más de 5 minutos, cerrando sesión")
                logout()
              }
            })
          } else {
            // Si estuvo oculta pero menos de 5 minutos, resetear timers
            console.log("Pestaña visible menos de 5 minutos, reiniciando timers")
            resetTimers()
          }
        } else {
          // Si no había tiempo guardado, simplemente resetear timers
          resetTimers()
        }

        tabHiddenTimeRef.current = null
      }
    }

    // Eventos para detectar cierre de pestaña/navegador
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("Evento beforeunload detectado")
      // Solo procesar si está autenticado
      if (isAuthenticatedRef.current) {
        handleTabClose()
      }
    }

    const handlePageHide = (event: PageTransitionEvent) => {
      console.log("Evento pagehide detectado")
      // Solo procesar si está autenticado
      if (isAuthenticatedRef.current) {
        pageHideTimeRef.current = Date.now()
        handleTabClose()
      }
    }

    // Detectar cuando la página se vuelve visible después de navegación hacia atrás
    const handlePageshow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log("Página restaurada desde cache")
        // Verificar si deberíamos hacer logout
        if (pageHideTimeRef.current) {
          const hiddenDuration = Date.now() - pageHideTimeRef.current
          if (hiddenDuration >= tabCloseTimeoutMs) {
            // Verificar autenticación antes de proceder
            checkAuthentication().then((isAuth) => {
              if (isAuth) {
                console.log("Página estuvo en cache más de 5 minutos, cerrando sesión")
                logout()
              }
            })
          } else {
            resetTimers()
          }
        }
      }
    }

    // Sincronización entre pestañas usando localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'tabCloseSession') {
        if (!event.newValue) {
          // El item fue removido, otra pestaña ejecutó logout
          console.log("Otra pestaña removió el item de logout")
          if (beforeUnloadTimeoutRef.current) {
            clearTimeout(beforeUnloadTimeoutRef.current)
            beforeUnloadTimeoutRef.current = null
          }
        } else {
          // Otra pestaña agregó un item de logout
          // Verificar autenticación antes de procesar
          checkAuthentication().then((isAuth) => {
            if (isAuth) {
              checkPendingLogout()
            }
          })
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("pagehide", handlePageHide)
    window.addEventListener("pageshow", handlePageshow)
    window.addEventListener("storage", handleStorageChange)

    // Eventos que indican actividad del usuario
    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "wheel",
    ]

    const handleActivity = () => {
      // Solo resetear si no hay advertencia activa
      if (!warningActiveRef.current) {
        resetTimers()
      }
    }

    // Agregar listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Iniciar timers
    resetTimers()

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("pagehide", handlePageHide)
      window.removeEventListener("pageshow", handlePageshow)
      window.removeEventListener("storage", handleStorageChange)
      
      // Limpiar el item de localStorage si esta pestaña lo creó
      const closeInfoStr = localStorage.getItem('tabCloseSession')
      if (closeInfoStr) {
        try {
          const closeInfo = JSON.parse(closeInfoStr)
          if (closeInfo && closeInfo.isAuthenticated && beforeUnloadTimeoutRef.current) {
            // Esta pestaña tiene un logout pendiente para usuario autenticado, limpiar
            localStorage.removeItem('tabCloseSession')
          }
        } catch (error) {
          localStorage.removeItem('tabCloseSession')
        }
      }
      
      // Limpiar todos los timers
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
