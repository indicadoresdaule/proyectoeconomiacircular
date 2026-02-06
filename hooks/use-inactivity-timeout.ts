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

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningTriggerMs = (timeoutMinutes - warningMinutes) * 60 * 1000
  const tabCloseTimeoutMs = 5 * 60 * 1000 // 5 minutos para cerrar si la pestaña está oculta

  const logout = useCallback(async () => {
    // Prevenir múltiples llamadas simultáneas
    if (isLoggingOutRef.current) return
    
    isLoggingOutRef.current = true
    
    try {
      console.log("[v0] Cerrando sesión por inactividad")
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
      if (visibilityCheckRef.current) {
        clearTimeout(visibilityCheckRef.current)
        visibilityCheckRef.current = null
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
  }, [router, warningMinutes])

  const resetTimers = useCallback(() => {
    // No resetear si estamos en proceso de logout
    if (isLoggingOutRef.current) return
    
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
    if (visibilityCheckRef.current) {
      clearTimeout(visibilityCheckRef.current)
      visibilityCheckRef.current = null
    }

    // Resetear tiempo de pestaña oculta
    tabHiddenTimeRef.current = null
    // Resetear tiempo de inicio de sesión
    sessionStartTimeRef.current = Date.now()

    // Ocultar advertencia si estaba visible
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)

    console.log("[v0] Timers reiniciados")

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
    
    console.log("[v0] Sesión extendida por usuario")
    
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
    if (visibilityCheckRef.current) {
      clearTimeout(visibilityCheckRef.current)
      visibilityCheckRef.current = null
    }
    
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

  const cleanupAllTimers = useCallback(() => {
    console.log("[v0] Limpiando todos los timers")
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
    tabHiddenTimeRef.current = null
    warningActiveRef.current = false
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)
  }, [warningMinutes])

  useEffect(() => {
    // Manejo de visibilidad de pestaña
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pestaña se ocultó - guardar tiempo
        tabHiddenTimeRef.current = Date.now()
        console.log("[v0] Pestaña ocultada, iniciando timer de 5 minutos")

        // Si la pestaña permanece oculta por 5 minutos, cerrar sesión
        visibilityCheckRef.current = setTimeout(() => {
          if (document.hidden) {
            console.log("[v0] Pestaña oculta por 5 minutos, cerrando sesión")
            logout()
          }
        }, tabCloseTimeoutMs)
      } else {
        // Pestaña se mostró nuevamente
        if (visibilityCheckRef.current) {
          clearTimeout(visibilityCheckRef.current)
          visibilityCheckRef.current = null
          console.log("[v0] Pestaña visible nuevamente, timer cancelado")
        }

        // Si la pestaña estuvo oculta, verificar si la sesión debe cerrarse
        if (tabHiddenTimeRef.current) {
          const hiddenDuration = Date.now() - tabHiddenTimeRef.current
          console.log(`[v0] Pestaña estuvo oculta por ${Math.round(hiddenDuration / 1000)} segundos`)
          
          if (hiddenDuration >= tabCloseTimeoutMs) {
            console.log("[v0] Pestaña estuvo oculta más de 5 minutos, cerrando sesión")
            logout()
          } else {
            // Si estuvo oculta pero menos de 5 minutos, resetear timers
            console.log("[v0] Pestaña visible menos de 5 minutos, reiniciando timers")
            resetTimers()
          }
        } else {
          // Si no había tiempo guardado, simplemente resetear timers
          resetTimers()
        }

        tabHiddenTimeRef.current = null
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

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
      
      // Limpiar todos los timers
      cleanupAllTimers()
    }
  }, [resetTimers, logout, cleanupAllTimers])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout,
    cleanupAllTimers, // Exportamos para poder limpiar desde el provider
  }
}
