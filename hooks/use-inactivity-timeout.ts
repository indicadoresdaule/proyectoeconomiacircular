"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface UseInactivityTimeoutProps {
  timeoutMinutes: number
  warningMinutes: number
}

export function useInactivityTimeout({
  timeoutMinutes,
  warningMinutes,
}: UseInactivityTimeoutProps) {
  const [inactive, setInactive] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [warningId, setWarningId] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Función para actualizar la última actividad en Supabase
  const updateUserActivity = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Actualizar en la tabla profiles
        await supabase
          .from('profiles')
          .update({ 
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error("Error actualizando actividad:", error)
    }
  }, [])

  // Función para verificar la última actividad del servidor
  const checkServerActivity = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_activity')
          .eq('id', user.id)
          .single()
        
        if (profile?.last_activity) {
          const lastActivity = new Date(profile.last_activity)
          const now = new Date()
          const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
          
          // Si hay más de timeoutMinutes de inactividad en el servidor
          if (diffMinutes > timeoutMinutes) {
            logout()
          }
        }
      }
    } catch (error) {
      console.error("Error verificando actividad del servidor:", error)
    }
  }, [timeoutMinutes])

  const startTimer = useCallback(() => {
    // Limpiar timers anteriores
    if (timeoutId) clearTimeout(timeoutId)
    if (warningId) clearTimeout(warningId)

    // Actualizar actividad en base de datos
    updateUserActivity()

    // Timer para mostrar advertencia
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000
    const warningTimer = setTimeout(() => {
      setShowWarning(true)
      setRemainingTime(warningMinutes * 60)
      
      // Contador regresivo para la advertencia
      const countdownInterval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            logout()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Guardar referencia al intervalo
      setWarningId(countdownInterval as unknown as NodeJS.Timeout)
    }, warningTime)

    // Timer para cierre de sesión completo
    const logoutTimer = setTimeout(() => {
      logout()
    }, timeoutMinutes * 60 * 1000)

    setTimeoutId(logoutTimer)
  }, [timeoutMinutes, warningMinutes, updateUserActivity])

  const resetTimer = useCallback(() => {
    setShowWarning(false)
    setInactive(false)
    if (warningId) {
      clearInterval(warningId)
      setWarningId(null)
    }
    startTimer()
  }, [startTimer, warningId])

  const extendSession = useCallback(async () => {
    await updateUserActivity()
    resetTimer()
  }, [updateUserActivity, resetTimer])

  const logout = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login?message=session_expired")
    } catch (error) {
      console.error("Error cerrando sesión:", error)
    }
  }, [router])

  // Setup de event listeners para actividad
  useEffect(() => {
    const handleActivity = () => {
      if (!inactive) {
        resetTimer()
      }
    }

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown', 'mousemove', 'keydown', 
      'scroll', 'touchstart', 'click'
    ]

    events.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    // Verificar actividad del servidor periódicamente
    const serverCheckInterval = setInterval(() => {
      checkServerActivity()
    }, 60000) // Cada minuto

    // Iniciar el timer
    startTimer()

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      
      if (timeoutId) clearTimeout(timeoutId)
      if (warningId) clearInterval(warningId)
      clearInterval(serverCheckInterval)
    }
  }, [startTimer, resetTimer, checkServerActivity])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout,
    inactive,
    setInactive
  }
}
