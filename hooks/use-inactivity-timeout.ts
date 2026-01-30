"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseInactivityTimeoutProps {
  timeoutMinutes: number
  warningMinutes: number
}

export function useInactivityTimeout({
  timeoutMinutes = 0.05,
  warningMinutes = 0.02
}: UseInactivityTimeoutProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const timeoutSeconds = timeoutMinutes * 60
  const warningSeconds = warningMinutes * 60

  // Función para registrar actividad y actualizar profiles
  const recordActivity = useCallback(async () => {
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
        // Actualizar la tabla profiles con la última actividad
        const { error } = await supabase
          .from('profiles')
          .update({ 
            last_sign_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) {
          console.error("Error actualizando actividad en profiles:", error)
        } else {
          console.log("Actividad registrada en profiles para usuario:", user.id)
        }
      }
    } catch (error) {
      console.error("Error registrando actividad:", error)
    }
  }, [showWarning, supabase])

  // Función para extender sesión
  const extendSession = useCallback(() => {
    recordActivity()
    setShowWarning(false)
  }, [recordActivity])

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    console.log("Cerrando sesión por inactividad...")
    setShowWarning(false)
    
    // Registrar el logout en profiles si quieres
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            status: 'inactive', // O mantener active si prefieres
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error("Error actualizando estado al cerrar sesión:", error)
    }
    
    await supabase.auth.signOut()
    window.location.href = '/login?message=session_expired'
  }, [supabase])

  // Limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
  }, [])

  // Reiniciar timeouts
  const resetTimeouts = useCallback(() => {
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
  }, [timeoutSeconds, warningSeconds, logout, clearTimeouts, timeoutMinutes, warningMinutes])

  // Actualizar tiempo restante cada segundo
  useEffect(() => {
    if (!showWarning) return

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
  }, [showWarning])

  // Configurar listeners de actividad
  useEffect(() => {
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'scroll',
      'click'
    ]

    const handleActivity = () => {
      console.log("Actividad detectada")
      recordActivity()
    }

    // Agregar listeners con throttling para evitar muchas llamadas
    let lastCall = 0
    const throttledHandleActivity = () => {
      const now = Date.now()
      if (now - lastCall > 1000) { // Máximo una vez por segundo
        lastCall = now
        handleActivity()
      }
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, { passive: true })
    })

    // Inicializar timeouts
    resetTimeouts()

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity)
      })
      
      clearTimeouts()
    }
  }, [recordActivity, resetTimeouts, clearTimeouts])

  // Verificar actividad al cambiar de pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Pestaña activa, registrando actividad")
        recordActivity()
      }
    }

    const handleFocus = () => {
      console.log("Ventana enfocada, registrando actividad")
      recordActivity()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [recordActivity])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout,
    recordActivity
  }
}
