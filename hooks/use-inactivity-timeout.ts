"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export function useInactivityTimeout({
  timeoutMinutes = 0.5, // 30 segundos para testing
  warningMinutes = 0.25 // 15 segundos de advertencia
}: {
  timeoutMinutes: number
  warningMinutes: number
}) {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const supabase = createClient()
  
  // Calcular tiempos en segundos
  const timeoutSeconds = timeoutMinutes * 60
  const warningSeconds = warningMinutes * 60

  // Función para limpiar TODOS los timeouts
  const clearAllTimeouts = useCallback(() => {
    console.log("🧹 Limpiando todos los timeouts")
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    if (warningRef.current) {
      clearTimeout(warningRef.current)
      warningRef.current = null
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Función para manejar logout
  const handleLogout = useCallback(async () => {
    console.log("👋 EJECUTANDO logout...")
    
    // Limpiar todos los timeouts primero
    clearAllTimeouts()
    
    try {
      await supabase.auth.signOut()
      console.log("✅ Sesión cerrada exitosamente")
      // Redirigir después de un pequeño delay
      setTimeout(() => {
        window.location.href = '/login?message=session_expired'
      }, 100)
    } catch (error) {
      console.error("❌ Error cerrando sesión:", error)
      // Si hay error, redirigir de todos modos
      window.location.href = '/login?error=logout_failed'
    }
  }, [supabase, clearAllTimeouts])

  // Función principal para registrar actividad
  const recordActivity = useCallback(async () => {
    console.log("📝 Actividad registrada")
    
    // Ocultar advertencia si está visible
    if (showWarning) {
      setShowWarning(false)
    }
    
    // Limpiar timeouts anteriores
    clearAllTimeouts()
    
    // Actualizar última actividad en Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log("👤 Usuario encontrado:", user.email)
        
        await supabase
          .from('profiles')
          .update({ 
            last_sign_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error("❌ Error actualizando perfil:", error.message)
            } else {
              console.log("✅ Perfil actualizado")
            }
          })
      }
    } catch (error) {
      console.error("❌ Error registrando actividad:", error)
    }
    
    // Configurar nuevo timeout para advertencia (solo si hay usuario)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log("🚫 No hay usuario, no se configuran timeouts")
      return
    }
    
    const warningTimeMs = (timeoutSeconds - warningSeconds) * 1000
    console.log(`⏰ Advertencia en ${warningTimeMs/1000}s, Logout en ${timeoutSeconds}s`)
    
    // Timeout para advertencia
    warningRef.current = setTimeout(() => {
      console.log("⚠️ MOSTRANDO ADVERTENCIA")
      setShowWarning(true)
      setRemainingTime(warningSeconds)
    }, warningTimeMs)
    
    // Timeout para logout
    timeoutRef.current = setTimeout(() => {
      console.log("⏰ EJECUTANDO LOGOUT POR TIMEOUT")
      handleLogout()
    }, timeoutSeconds * 1000)
  }, [showWarning, supabase, timeoutSeconds, warningSeconds, handleLogout, clearAllTimeouts])

  // Función para extender sesión
  const extendSession = useCallback(() => {
    console.log("🔄 Usuario extendió sesión")
    recordActivity()
  }, [recordActivity])

  // Función para logout manual
  const logout = useCallback(() => {
    console.log("🖱️ Usuario solicitó logout manual")
    handleLogout()
  }, [handleLogout])

  // Actualizar cuenta regresiva
  useEffect(() => {
    if (!showWarning) return
    
    console.log("⏱️ Iniciando cuenta regresiva:", remainingTime, "s")
    
    intervalRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          console.log("⏰ Tiempo de advertencia agotado")
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [showWarning, remainingTime])

  // Configurar listeners UNA SOLA VEZ con useRef para prevenir múltiples registros
  const listenersInitialized = useRef(false)

  useEffect(() => {
    if (listenersInitialized.current) {
      console.log("🚫 Listeners ya estaban inicializados")
      return
    }
    
    console.log("🎯 INICIALIZANDO listeners de actividad...")
    listenersInitialized.current = true
    
    const activityEvents = [
      'mousedown',
      'keydown',
      'touchstart',
      'scroll'
    ]
    
    let lastActivityTime = Date.now()
    const ACTIVITY_THROTTLE = 1000 // Solo registrar actividad cada 1 segundo
    
    const handleActivity = () => {
      const now = Date.now()
      if (now - lastActivityTime > ACTIVITY_THROTTLE) {
        lastActivityTime = now
        console.log("🖱️ Actividad detectada")
        recordActivity()
      }
    }
    
    // Agregar listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })
    
    // También manejar visibilidad
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("👁️ Página visible")
        recordActivity()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Iniciar el timer inicial
    console.log("🚀 Iniciando timer inicial")
    recordActivity()
    
    return () => {
      console.log("🧹 Cleanup de listeners")
      
      // NO remover listeners aquí - pueden causar problemas en desarrollo
      // con Fast Refresh. En su lugar, limpiar timeouts
      clearAllTimeouts()
      listenersInitialized.current = false
    }
  }, [recordActivity, clearAllTimeouts])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout
  }
}
