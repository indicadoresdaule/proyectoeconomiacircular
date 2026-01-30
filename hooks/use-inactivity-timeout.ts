// hooks/use-inactivity-timeout-simple.ts
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export function useInactivityTimeout({
  timeoutMinutes = 1,
  warningMinutes = 5
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

  const timeoutSeconds = timeoutMinutes * 60
  const warningSeconds = warningMinutes * 60

  const recordActivity = useCallback(async () => {
    if (showWarning) {
      setShowWarning(false)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
    
    // Limpiar timeouts anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    // Registrar actividad en Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            last_sign_in_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error("Error registrando actividad:", error)
    }
    
    // Timeout para advertencia
    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setRemainingTime(warningSeconds)
    }, (timeoutSeconds - warningSeconds) * 1000)
    
    // Timeout para logout
    timeoutRef.current = setTimeout(() => {
      supabase.auth.signOut()
      window.location.href = '/login?message=session_expired'
    }, timeoutSeconds * 1000)
  }, [showWarning, supabase, timeoutSeconds, warningSeconds])

  const extendSession = useCallback(() => {
    recordActivity()
    setShowWarning(false)
  }, [recordActivity])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login?message=session_expired'
  }, [supabase])

  // Actualizar cuenta regresiva
  useEffect(() => {
    if (!showWarning) return
    
    intervalRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [showWarning])

  // Configurar listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click']
    
    const handleActivity = () => recordActivity()
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })
    
    recordActivity() // Iniciar el timer
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [recordActivity])

  return {
    showWarning,
    remainingTime,
    extendSession,
    logout
  }
}
