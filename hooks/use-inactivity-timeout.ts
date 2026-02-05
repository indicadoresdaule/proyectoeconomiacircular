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
  timeoutMinutes = 2,
  warningMinutes = 1,
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

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningTriggerMs = (timeoutMinutes - warningMinutes) * 60 * 1000
  const tabCloseTimeoutMs = 5 * 60 * 1000 // 5 minutos para cerrar si la pestaña está oculta

  const logout = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login?reason=inactivity")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      router.push("/login?reason=inactivity")
    }
  }, [router])

  const resetTimers = useCallback(() => {
    // Solo resetear si no hay advertencia activa
    if (warningActiveRef.current) {
      return
    }

    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

    // Resetear tiempo de pestaña oculta
    tabHiddenTimeRef.current = null
    // Resetear tiempo de inicio de sesión
    sessionStartTimeRef.current = Date.now()

    // Ocultar advertencia si estaba visible
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)

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

    // Configurar timer de cierre de sesión
    timeoutRef.current = setTimeout(() => {
      warningActiveRef.current = false
      onTimeout?.()
      logout()
    }, timeoutMs)
  }, [timeoutMs, warningTriggerMs, warningMinutes, logout, onWarning, onTimeout])

  const extendSession = useCallback(() => {
    warningActiveRef.current = false
    setShowWarning(false)
    
    // Limpiar timers de advertencia
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
    
    // Resetear timers normales
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
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

  useEffect(() => {
    // Manejo de visibilidad de pestaña
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pestaña se ocultó - guardar tiempo
        tabHiddenTimeRef.current = Date.now()

        // Si la pestaña permanece oculta por 5 minutos, cerrar sesión
        visibilityCheckRef.current = setTimeout(() => {
          if (document.hidden) {
            console.log("[v0] Tab has been hidden for 5 minutes, closing session")
            logout()
          }
        }, tabCloseTimeoutMs)
      } else {
        // Pestaña se mostró nuevamente
        if (visibilityCheckRef.current) {
          clearTimeout(visibilityCheckRef.current)
        }

        // Si la pestaña estuvo oculta, verificar si la sesión debe cerrarse
        if (tabHiddenTimeRef.current) {
          const hiddenDuration = Date.now() - tabHiddenTimeRef.current
          if (hiddenDuration >= tabCloseTimeoutMs) {
            console.log("[v0] Tab was hidden for more than 5 minutes, closing session")
            logout()
          } else {
            // Si estuvo oculta pero menos de 5 minutos, resetear timers
            resetTimers()
          }
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      if (visibilityCheckRef.current) {
        clearTimeout(visibilityCheckRef.current)
      }
    }
  }, [resetTimers, logout])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout,
  }
}
