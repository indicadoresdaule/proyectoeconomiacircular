"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseInactivityTimeoutProps {
  timeoutMinutes: number
  warningMinutes: number
  enabled: boolean // Nueva prop para controlar si está habilitado
}

export function useInactivityTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  enabled = true // Por defecto habilitado
}: UseInactivityTimeoutProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const timeoutSeconds = timeoutMinutes * 60
  const warningSeconds = warningMinutes * 60

  // Función para registrar actividad
  const recordActivity = useCallback(async () => {
    if (!enabled) return // No registrar si no está habilitado
    
    console.log("Registrando actividad...")
    
    if (showWarning) {
      setShowWarning(false)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
    
    resetTimeouts()
    
    // Actualizar last_sign_in_at en la tabla profiles
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            last_sign_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) {
          console.error("Error actualizando actividad:", error)
        }
      }
    } catch (error) {
      console.error("Error registrando actividad:", error)
    }
  }, [showWarning, supabase, enabled])

  // Función para extender sesión
  const extendSession = useCallback(() => {
    recordActivity()
    setShowWarning(false)
  }, [recordActivity])

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    console.log("Cerrando sesión por inactividad...")
    setShowWarning(false)
    
    await supabase.auth.signOut()
    window.location.href = '/login?message=session_expired'
  }, [supabase])

  // Limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current)
      warningRef.current = null
    }
  }, [])

  // Reiniciar timeouts
  const resetTimeouts = useCallback(() => {
    if (!enabled) return // No reiniciar si no está habilitado
    
    clearTimeouts()
    
    console.log(`Reiniciando timeouts: ${timeoutMinutes}min total, ${warningMinutes}min advertencia`)

    // Timeout para mostrar advertencia
    warningRef.current = setTimeout(() => {
      console.log("Mostrando advertencia de inactividad")
      setShowWarning(true)
      const startTime = timeoutSeconds - warningSeconds
      setRemainingTime(startTime)
    }, (timeoutSeconds - warningSeconds) * 1000)

    // Timeout para cerrar sesión
    timeoutRef.current = setTimeout(() => {
      console.log("Timeout alcanzado, cerrando sesión")
      logout()
    }, timeoutSeconds * 1000)
  }, [timeoutSeconds, warningSeconds, logout, clearTimeouts, timeoutMinutes, warningMinutes, enabled])

  // Actualizar tiempo restante cada segundo
  useEffect(() => {
    if (!showWarning || !enabled) return

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showWarning, enabled])

  // Configurar listeners de actividad SOLO si está habilitado
  useEffect(() => {
    if (!enabled) return

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'scroll',
      'click'
    ]

    let lastCall = 0
    const throttledHandleActivity = () => {
      const now = Date.now()
      if (now - lastCall > 1000) {
        lastCall = now
        recordActivity()
      }
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, { passive: true })
    })

    // Inicializar timeouts solo si está habilitado
    resetTimeouts()

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity)
      })
      
      clearTimeouts()
    }
  }, [recordActivity, resetTimeouts, clearTimeouts, enabled])

  // Verificar actividad al cambiar de pestaña SOLO si está habilitado
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordActivity()
      }
    }

    const handleFocus = () => {
      recordActivity()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [recordActivity, enabled])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout,
    recordActivity
  }
}
