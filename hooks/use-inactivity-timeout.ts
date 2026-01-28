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

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000

  const logout = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login?reason=inactivity")
    } catch (error) {
      console.error("Error al cerrar sesion:", error)
      router.push("/login?reason=inactivity")
    }
  }, [router])

  const resetTimers = useCallback(() => {
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

    // Ocultar advertencia si estaba visible
    setShowWarning(false)
    setRemainingTime(warningMinutes * 60)

    // Configurar timer de advertencia
    warningTimeoutRef.current = setTimeout(() => {
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
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, warningMs)

    // Configurar timer de cierre de sesion
    timeoutRef.current = setTimeout(() => {
      onTimeout?.()
      logout()
    }, timeoutMs)
  }, [timeoutMs, warningMs, warningMinutes, logout, onWarning, onTimeout])

  const extendSession = useCallback(() => {
    setShowWarning(false)
    resetTimers()
  }, [resetTimers])

  useEffect(() => {
    // Eventos que indican actividad del usuario
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel",
    ]

    const handleActivity = () => {
      // Solo resetear si no estamos en la pantalla de advertencia
      if (!showWarning) {
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [resetTimers, showWarning])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout,
  }
}
