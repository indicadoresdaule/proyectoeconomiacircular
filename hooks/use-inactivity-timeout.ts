"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseInactivityTimeoutProps {
  timeoutMinutes: number
  warningMinutes: number
}

export function useInactivityTimeout({
  timeoutMinutes = 0.1,
  warningMinutes = 0.06
}: UseInactivityTimeoutProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [userActivity, setUserActivity] = useState<Date>(new Date())
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const timeoutSeconds = timeoutMinutes * 60
  const warningSeconds = warningMinutes * 60

  // Función para registrar actividad en Supabase
  const updateLastActivityInSupabase = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Actualizar el campo last_activity_at en la tabla profiles
        const { error } = await supabase
          .from('profiles')
          .update({ 
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) {
          console.error("Error actualizando actividad:", error)
          
          // Si no existe el campo, intentar usar last_sign_in_at
          await supabase
            .from('profiles')
            .update({ 
              last_sign_in_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
        }
        
        // También registrar en una tabla de auditoría si lo deseas
        await supabase
          .from('user_activity_logs') // Crear esta tabla si quieres logs detallados
          .insert({
            user_id: user.id,
            activity_type: 'user_interaction',
            created_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error("Error en updateLastActivityInSupabase:", error)
    }
  }, [supabase])

  // Función para verificar si la sesión ha expirado
  const checkSessionExpiration = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return true // No hay usuario, considerar expirada

      // Obtener el último registro de actividad del perfil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('last_activity_at, last_sign_in_at')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error("Error obteniendo perfil:", error)
        return false // En caso de error, no cerrar sesión
      }

      // Usar last_activity_at si existe, sino last_sign_in_at
      const lastActivityTime = profile.last_activity_at || profile.last_sign_in_at
      
      if (!lastActivityTime) {
        // Si nunca ha tenido actividad, usar fecha actual menos el timeout
        return false
      }

      const now = new Date()
      const lastActivity = new Date(lastActivityTime)
      const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60)

      // Si ha pasado más del tiempo permitido, cerrar sesión
      return diffMinutes > timeoutMinutes

    } catch (error) {
      console.error("Error en checkSessionExpiration:", error)
      return false
    }
  }, [supabase, timeoutMinutes])

  // Registrar actividad local y en Supabase
  const recordActivity = useCallback(async () => {
    setUserActivity(new Date())
    
    if (showWarning) {
      setShowWarning(false)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
    
    // Reiniciar timeouts
    resetTimeouts()
    
    // Actualizar en Supabase
    await updateLastActivityInSupabase()
  }, [showWarning, updateLastActivityInSupabase])

  // Extender sesión
  const extendSession = useCallback(() => {
    recordActivity()
    setShowWarning(false)
  }, [recordActivity])

  // Cerrar sesión forzadamente
  const forceLogout = useCallback(async () => {
    try {
      // Primero registrar el logout
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            status: 'inactive', // Opcional: cambiar estado
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
      
      // Luego cerrar sesión
      await supabase.auth.signOut()
      
      // Redirigir a login con mensaje
      window.location.href = '/login?message=session_expired'
      
    } catch (error) {
      console.error("Error en forceLogout:", error)
      // Forzar redirección aunque falle
      window.location.href = '/login'
    }
  }, [supabase])

  // Cerrar sesión manual
  const logout = useCallback(async () => {
    setShowWarning(false)
    await forceLogout()
  }, [forceLogout])

  // Limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
  }, [])

  // Reiniciar timeouts
  const resetTimeouts = useCallback(() => {
    clearTimeouts()

    // Timeout para advertencia
    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      const startTime = timeoutSeconds - warningSeconds
      setRemainingTime(startTime)
    }, (timeoutSeconds - warningSeconds) * 1000)

    // Timeout para cerrar sesión
    timeoutRef.current = setTimeout(async () => {
      // Verificar una última vez antes de cerrar
      const isExpired = await checkSessionExpiration()
      if (isExpired) {
        await forceLogout()
      } else {
        // Si no ha expirado según Supabase, reiniciar
        resetTimeouts()
      }
    }, timeoutSeconds * 1000)
  }, [timeoutSeconds, warningSeconds, clearTimeouts, checkSessionExpiration, forceLogout])

  // Actualizar tiempo restante
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

  // Verificar sesión periódicamente
  useEffect(() => {
    const checkSession = async () => {
      const isExpired = await checkSessionExpiration()
      if (isExpired) {
        await forceLogout()
      }
    }

    // Verificar cada 5 minutos
    const sessionCheckInterval = setInterval(checkSession, 5 * 60 * 1000)

    return () => clearInterval(sessionCheckInterval)
  }, [checkSessionExpiration, forceLogout])

  // Configurar listeners de actividad
  useEffect(() => {
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 
      'touchstart', 'scroll', 'click',
      'wheel', 'input', 'change'
    ]

    const handleActivity = () => recordActivity()

    // Agregar listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Registrar actividad en intervalos para actividad de fondo
    const activityInterval = setInterval(() => {
      if (document.hasFocus()) {
        recordActivity()
      }
    }, 2 * 60 * 1000) // Cada 2 minutos

    // Inicializar timeouts
    resetTimeouts()

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearTimeouts()
      clearInterval(activityInterval)
    }
  }, [recordActivity, resetTimeouts, clearTimeouts])

  // Manejar cambios de pestaña/ventana
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordActivity()
      }
    }

    const handleFocus = () => recordActivity()

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
    recordActivity,
    userActivity
  }
}
