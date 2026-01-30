"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export function useSimpleTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const logout = useCallback(async () => {
    console.log("🚀 EJECUTANDO LOGOUT AHORA")
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    await supabase.auth.signOut()
    // Forzar redirección
    window.location.assign('/login?message=session_expired')
  }, [supabase])

  const resetTimer = useCallback(() => {
    console.log("🔁 Reiniciando timer...")
    
    // Limpiar timer anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Ocultar advertencia si está visible
    if (showWarning) {
      setShowWarning(false)
    }
    
    // Configurar NUEVO timer
    timeoutRef.current = setTimeout(() => {
      console.log("⚠️ Timer expirado - mostrando advertencia")
      setShowWarning(true)
      setTimeLeft(5) // 5 segundos para responder
      
      // Configurar logout automático después de 5 segundos más
      const logoutTimer = setTimeout(() => {
        console.log("⏰ Tiempo de advertencia agotado - logout")
        logout()
      }, 5000)
      
      // Guardar referencia
      timeoutRef.current = logoutTimer
    }, 10000) // 10 segundos de inactividad
  }, [showWarning, logout])

  // Contador regresivo
  useEffect(() => {
    if (!showWarning) return
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [showWarning])

  // Configurar listeners
  useEffect(() => {
    console.log("🎯 Configurando listeners SIMPLES")
    
    const handleActivity = () => {
      resetTimer()
    }
    
    const events = ['mousedown', 'keydown']
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })
    
    // Iniciar timer
    resetTimer()
    
    return () => {
      console.log("🧹 Limpiando listeners")
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [resetTimer])

  return {
    showWarning,
    timeLeft,
    logout,
    resetTimer
  }
}
