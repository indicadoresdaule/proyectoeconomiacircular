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
  const visibilityCheckRef = useRef<NodeJS.Timeout | null>(null)
  const tabHiddenTimeRef = useRef<number | null>(null)
  const sessionStartTimeRef = useRef<number>(Date.now())
  const warningActiveRef = useRef<boolean>(false)
  const isLoggingOutRef = useRef<boolean>(false)
  const isAuthenticatedRef = useRef<boolean>(false)

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningTriggerMs = (timeoutMinutes - warningMinutes) * 60 * 1000
  const tabCloseTimeoutMs = 5 * 60 * 1000 // 5 minutos para cerrar si la pestaña está oculta

  // Función para verificar autenticación
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      isAuthenticatedRef.current = !!session
      return !!session
    } catch (error) {
      console.error("[Timeout] Error verificando autenticación:", error)
      isAuthenticatedRef.current = false
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    // Prevenir múltiples llamadas simultáneas
    if (isLoggingOutRef.current) return
    
    // Verificar si hay sesión activa antes de cerrar
    const isAuthenticated = await checkAuthentication()
    if (!isAuthenticated) {
      console.log("[Timeout] No hay sesión activa, omitiendo cierre")
      return
    }
    
    isLoggingOutRef.current = true
    
    try {
      console.log("[Timeout] Cerrando sesión por inactividad")
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Limpiar todos los timers
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
      
      // Resetear todos los estados
      warningActiveRef.current = false
      setShowWarning(false)
      setRemainingTime(warningMinutes * 60)
      
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
  }, [router, warningMinutes, checkAuthentication])

  const resetTimers = useCallback(async () => {
    // No resetear si estamos en proceso de logout
    if (isLoggingOutRef.current) return
    
    // Verificar autenticación antes de proceder
    const isAuthenticated = await checkAuthentication()
    if (!isAuthenticated) {
      console.log("[Timeout] Usuario no autenticado, omitiendo timers")
      return
    }
    
    // Solo resetear si no hay advertencia activa
    if (warningActiveRef.current) {
      return
    }

    // Limpiar timers existentes
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

    // Resetear tiempo de pestaña oculta
    tabHiddenTimeRef.current = null
    // Resetear tiempo de inicio de sesión
    sessionStartTimeRef.current = Date.now()

    // Ocultar advertencia si estaba visible
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)

    console.log("[Timeout] Timers reiniciados")

    // Configurar timer de advertencia
    warningTimeoutRef.current = setTimeout(async () => {
      // Verificar autenticación antes de mostrar advertencia
      const isAuthenticated = await checkAuthentication()
      if (!isAuthenticated) {
        console.log("[Timeout] Usuario no autenticado, omitiendo advertencia")
        return
      }
      
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
      
      timeoutRef.current = setTimeout(async () => {
        // Verificar autenticación antes de cerrar sesión
        const isAuthenticated = await checkAuthentication()
        if (!isAuthenticated) {
          console.log("[Timeout] Usuario no autenticado, omitiendo cierre automático")
          return
        }
        
        warningActiveRef.current = false
        onTimeout?.()
        logout()
      }, timeUntilLogout)
      
    }, warningTriggerMs)

    // Configurar timer de cierre de sesión principal
    timeoutRef.current = setTimeout(async () => {
      // Verificar autenticación antes de cerrar sesión
      const isAuthenticated = await checkAuthentication()
      if (!isAuthenticated) {
        console.log("[Timeout] Usuario no autenticado, omitiendo cierre automático")
        return
      }
      
      warningActiveRef.current = false
      onTimeout?.()
      logout()
    }, timeoutMs)
  }, [timeoutMs, warningTriggerMs, warningMinutes, logout, onWarning, onTimeout, checkAuthentication])

  const extendSession = useCallback(async () => {
    if (isLoggingOutRef.current) return
    
    // Verificar autenticación antes de proceder
    const isAuthenticated = await checkAuthentication()
    if (!isAuthenticated) {
      console.log("[Timeout] Usuario no autenticado, omitiendo extensión de sesión")
      return
    }
    
    warningActiveRef.current = false
    setShowWarning(false)
    
    console.log("[Timeout] Sesión extendida por usuario")
    
    // Limpiar timers de advertencia
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    
    // Resetear timers normales
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    
    // Configurar nuevos timers
    warningTimeoutRef.current = setTimeout(async () => {
      // Verificar autenticación antes de mostrar advertencia
      const isAuthenticated = await checkAuthentication()
      if (!isAuthenticated) {
        console.log("[Timeout] Usuario no autenticado, omitiendo advertencia")
        return
      }
      
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
      
      timeoutRef.current = setTimeout(async () => {
        // Verificar autenticación antes de cerrar sesión
        const isAuthenticated = await checkAuthentication()
        if (!isAuthenticated) {
          console.log("[Timeout] Usuario no autenticado, omitiendo cierre automático")
          return
        }
        
        warningActiveRef.current = false
        onTimeout?.()
        logout()
      }, timeUntilLogout)
      
    }, warningTriggerMs)

    timeoutRef.current = setTimeout(async () => {
      // Verificar autenticación antes de cerrar sesión
      const isAuthenticated = await checkAuthentication()
      if (!isAuthenticated) {
        console.log("[Timeout] Usuario no autenticado, omitiendo cierre automático")
        return
      }
      
      warningActiveRef.current = false
      onTimeout?.()
      logout()
    }, timeoutMs)
  }, [warningTriggerMs, warningMinutes, timeoutMs, logout, onWarning, onTimeout, checkAuthentication])

  // Función para guardar el tiempo cuando se cierra la pestaña
  const saveTabCloseTime = useCallback(async () => {
    // Verificar si hay sesión activa antes de guardar
    const isAuthenticated = await checkAuthentication()
    if (!isAuthenticated) {
      console.log("[Timeout] Usuario no autenticado, omitiendo guardado de tiempo de cierre")
      return
    }
    
    const closeTime = Date.now()
    try {
      localStorage.setItem('tabCloseTime', closeTime.toString())
      localStorage.setItem('sessionActive', 'true')
      console.log('[Timeout] Tiempo de cierre guardado:', new Date(closeTime).toISOString())
    } catch (error) {
      console.error('[Timeout] Error guardando tiempo de cierre:', error)
    }
  }, [checkAuthentication])

  // Función para verificar si la pestaña estuvo cerrada por más de 5 minutos
  const checkTabCloseDuration = useCallback(async (): Promise<boolean> => {
    try {
      const closeTimeStr = localStorage.getItem('tabCloseTime')
      const sessionActive = localStorage.getItem('sessionActive')
      
      if (!closeTimeStr || sessionActive !== 'true') {
        return false
      }
      
      const closeTime = parseInt(closeTimeStr, 10)
      const now = Date.now()
      const duration = now - closeTime
      
      console.log(`[Timeout] Pestaña estuvo cerrada por ${Math.floor(duration / 1000)} segundos`)
      
      // Si la pestaña estuvo cerrada por más de 5 minutos, verificar autenticación
      if (duration >= tabCloseTimeoutMs) {
        const isAuthenticated = await checkAuthentication()
        if (isAuthenticated) {
          console.log('[Timeout] Usuario autenticado, procediendo con cierre por pestaña cerrada')
          return true
        } else {
          console.log('[Timeout] Usuario no autenticado, omitiendo cierre por pestaña cerrada')
          return false
        }
      }
      
      return false
    } catch (error) {
      console.error('[Timeout] Error verificando duración de cierre:', error)
      return false
    }
  }, [tabCloseTimeoutMs, checkAuthentication])

  // Función para limpiar el estado de cierre de pestaña
  const clearTabCloseState = useCallback(async () => {
    try {
      localStorage.removeItem('tabCloseTime')
      localStorage.setItem('sessionActive', 'true')
    } catch (error) {
      console.error('[Timeout] Error limpiando estado de cierre:', error)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      // Verificar si la pestaña fue cerrada por más de 5 minutos
      const shouldLogout = await checkTabCloseDuration()
      if (shouldLogout && mounted) {
        console.log('[Timeout] Cerrando sesión por pestaña cerrada > 5 minutos')
        logout()
        return
      }
      
      // Limpiar el estado de cierre al iniciar
      await clearTabCloseState()

      // Verificar autenticación inicial
      const isAuthenticated = await checkAuthentication()
      if (!isAuthenticated && mounted) {
        console.log('[Timeout] Usuario no autenticado, omitiendo configuración de timers')
        return
      }

      // Manejo de visibilidad de pestaña
      const handleVisibilityChange = async () => {
        if (document.hidden) {
          // Pestaña se ocultó - guardar tiempo solo si hay sesión activa
          const isAuthenticated = await checkAuthentication()
          if (isAuthenticated) {
            tabHiddenTimeRef.current = Date.now()
            console.log('[Timeout] Pestaña oculta a las:', new Date(tabHiddenTimeRef.current).toISOString())

            // Si la pestaña permanece oculta por 5 minutos, cerrar sesión
            visibilityCheckRef.current = setTimeout(async () => {
              if (document.hidden && mounted) {
                const isAuthenticated = await checkAuthentication()
                if (isAuthenticated) {
                  console.log("[Timeout] Tab has been hidden for 5 minutes, closing session")
                  logout()
                }
              }
            }, tabCloseTimeoutMs)
          }
        } else {
          // Pestaña se mostró nuevamente
          if (visibilityCheckRef.current) {
            clearTimeout(visibilityCheckRef.current)
            visibilityCheckRef.current = null
          }

          // Si la pestaña estuvo oculta, verificar si la sesión debe cerrarse
          if (tabHiddenTimeRef.current && mounted) {
            const hiddenDuration = Date.now() - tabHiddenTimeRef.current
            console.log(`[Timeout] Pestaña estuvo oculta por ${Math.floor(hiddenDuration / 1000)} segundos`)
            
            if (hiddenDuration >= tabCloseTimeoutMs) {
              const isAuthenticated = await checkAuthentication()
              if (isAuthenticated) {
                console.log("[Timeout] Tab was hidden for more than 5 minutes, closing session")
                logout()
              }
            } else {
              // Si estuvo oculta pero menos de 5 minutos, resetear timers
              resetTimers()
            }
          }

          tabHiddenTimeRef.current = null
        }
      }

      // Manejo de cierre de pestaña/navegador
      const handlePageHide = async () => {
        console.log('[Timeout] Pestaña/navegador se está cerrando')
        await saveTabCloseTime()
      }

      const handleBeforeUnload = async () => {
        console.log('[Timeout] Antes de cerrar la pestaña')
        await saveTabCloseTime()
      }

      // Agregar listeners para cierre de pestaña
      window.addEventListener('pagehide', handlePageHide)
      window.addEventListener('beforeunload', handleBeforeUnload)
      document.addEventListener("visibilitychange", handleVisibilityChange)

      // Eventos que indican actividad del usuario
      const activityEvents = [
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "wheel",
        "click",
        "mousemove",
        "input",
        "focus",
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

      // Iniciar timers solo si hay sesión activa
      if (isAuthenticated) {
        resetTimers()
      }

      // Cleanup
      return () => {
        mounted = false
        
        activityEvents.forEach((event) => {
          document.removeEventListener(event, handleActivity)
        })
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        window.removeEventListener('pagehide', handlePageHide)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        
        // Limpiar todos los timers
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
    }

    const cleanup = initialize()

    return () => {
      mounted = false
      if (cleanup) {
        cleanup.then(fn => fn && fn())
      }
    }
  }, [resetTimers, logout, saveTabCloseTime, checkTabCloseDuration, clearTabCloseState, tabCloseTimeoutMs, checkAuthentication])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout,
  }
}
