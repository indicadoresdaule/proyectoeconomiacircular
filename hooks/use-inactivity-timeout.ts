"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseInactivityTimeoutProps {
  timeoutMinutes: number
  warningMinutes: number
}

export function useInactivityTimeout({
  timeoutMinutes = 1, // 1 minuto para testing
  warningMinutes = 0.5 // 30 segundos de advertencia
}: UseInactivityTimeoutProps) {
  const [isActive, setIsActive] = useState(true)
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [debug, setDebug] = useState<string[]>([])

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // Calcular tiempos en segundos
  const timeoutSeconds = timeoutMinutes * 60
  const warningSeconds = warningMinutes * 60

  // Función para agregar logs de depuración
  const addDebug = useCallback((message: string) => {
    console.log(`[Timeout Debug] ${message}`)
    setDebug(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Función para registrar actividad
  const recordActivity = useCallback(async () => {
    addDebug(`Actividad detectada - Reiniciando timers`)
    setIsActive(true)
    
    if (showWarning) {
      addDebug(`Advertencia cerrada por actividad`)
      setShowWarning(false)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
    
    // Reiniciar todos los timeouts
    resetTimeouts()
    
    // Actualizar last_sign_in_at en la tabla profiles
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        addDebug(`Usuario encontrado: ${user.email}`)
        
        const updateResult = await supabase
          .from('profiles')
          .update({ 
            last_sign_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateResult.error) {
          addDebug(`Error actualizando perfil: ${updateResult.error.message}`)
        } else {
          addDebug(`Perfil actualizado exitosamente`)
        }
      } else {
        addDebug(`No hay usuario autenticado`)
      }
    } catch (error) {
      addDebug(`Error registrando actividad: ${error}`)
      console.error("Error registrando actividad:", error)
    }
  }, [showWarning, supabase, addDebug])

  // Función para extender sesión
  const extendSession = useCallback(() => {
    addDebug(`Usuario extendió sesión manualmente`)
    recordActivity()
    setShowWarning(false)
  }, [recordActivity, addDebug])

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    addDebug(`Cerrando sesión por inactividad`)
    setShowWarning(false)
    await supabase.auth.signOut()
    window.location.href = '/login?message=session_expired'
  }, [supabase, addDebug])

  // Limpiar timeouts
  const clearTimeouts = useCallback(() => {
    addDebug(`Limpiando timeouts anteriores`)
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
  }, [addDebug])

  // Reiniciar timeouts
  const resetTimeouts = useCallback(() => {
    addDebug(`Reiniciando timeouts: ${timeoutSeconds}s total, ${warningSeconds}s advertencia`)
    clearTimeouts()

    // Timeout para mostrar advertencia
    const warningTimeoutMs = (timeoutSeconds - warningSeconds) * 1000
    addDebug(`Advertencia programada en: ${warningTimeoutMs/1000}s`)
    
    warningRef.current = setTimeout(() => {
      addDebug(`Mostrando advertencia de inactividad`)
      setShowWarning(true)
      setRemainingTime(warningSeconds)
    }, warningTimeoutMs)

    // Timeout para cerrar sesión
    const logoutTimeoutMs = timeoutSeconds * 1000
    addDebug(`Cierre de sesión programado en: ${logoutTimeoutMs/1000}s`)
    
    timeoutRef.current = setTimeout(() => {
      addDebug(`Timeout alcanzado - ejecutando logout`)
      logout()
    }, logoutTimeoutMs)
  }, [timeoutSeconds, warningSeconds, logout, clearTimeouts, addDebug])

  // Actualizar tiempo restante cada segundo cuando se muestra la advertencia
  useEffect(() => {
    if (!showWarning) return

    addDebug(`Iniciando cuenta regresiva: ${remainingTime}s restantes`)
    
    intervalRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          addDebug(`Tiempo de advertencia agotado`)
          if (intervalRef.current) clearInterval(intervalRef.current)
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
  }, [showWarning, addDebug])

  // Configurar listeners de actividad
  useEffect(() => {
    addDebug(`Configurando listeners de actividad`)
    
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'scroll',
      'click'
    ]

    const handleActivity = () => {
      addDebug(`Evento de actividad capturado`)
      recordActivity()
    }

    // Agregar listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
      addDebug(`Listener agregado para: ${event}`)
    })

    // Inicializar timeouts
    addDebug(`Inicializando timeouts por primera vez`)
    resetTimeouts()

    return () => {
      addDebug(`Limpiando listeners`)
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      
      clearTimeouts()
    }
  }, [recordActivity, resetTimeouts, clearTimeouts, addDebug])

  // Verificar sesión al cargar/cambiar pestaña
  useEffect(() => {
    addDebug(`Configurando listeners de visibilidad`)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        addDebug(`Página visible nuevamente`)
        recordActivity()
      }
    }

    const handleFocus = () => {
      addDebug(`Ventana enfocada`)
      recordActivity()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [recordActivity, addDebug])

  // Componente de depuración (solo para desarrollo)
  const DebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null
    
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        fontSize: '12px',
        maxWidth: '400px',
        maxHeight: '200px',
        overflow: 'auto',
        zIndex: 9999
      }}>
        <h4>Debug Timeout:</h4>
        <div>Timeout: {timeoutMinutes} min</div>
        <div>Warning: {warningMinutes} min</div>
        <div>Mostrando advertencia: {showWarning ? 'Sí' : 'No'}</div>
        <div>Tiempo restante: {remainingTime}s</div>
        <button 
          onClick={() => recordActivity()} 
          style={{margin: '5px', padding: '5px'}}
        >
          Simular Actividad
        </button>
        <button 
          onClick={() => logout()} 
          style={{margin: '5px', padding: '5px'}}
        >
          Forzar Logout
        </button>
        <div style={{marginTop: '10px'}}>
          <strong>Logs:</strong>
          {debug.slice(-5).map((log, i) => (
            <div key={i} style={{borderBottom: '1px solid #444', padding: '2px'}}>
              {log}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return {
    isActive,
    showWarning,
    remainingTime,
    extendSession,
    logout,
    recordActivity,
    DebugPanel // Exportar el panel de debug
  }
}
