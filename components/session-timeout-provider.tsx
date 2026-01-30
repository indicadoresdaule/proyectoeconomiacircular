"use client"

import React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSimpleTimeout } from "@/hooks/use-simple-timeout"
import { InactivityWarningDialog } from "@/components/inactivity-warning-dialog"

export function SessionTimeoutProvider({ children }: React.PropsWithChildren) {
  const [hasSession, setHasSession] = useState(false)
  const [checking, setChecking] = useState(true)

  const { showWarning, timeLeft, logout, resetTimer } = useSimpleTimeout()

  const extendSession = () => {
    console.log("✅ Usuario extendió sesión")
    resetTimer()
  }

  useEffect(() => {
    const supabase = createClient()
    
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log("🔍 Sesión encontrada:", !!session)
      setHasSession(!!session)
      setChecking(false)
    }
    
    check()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check()
    })
    
    return () => subscription.unsubscribe()
  }, [])

  if (checking) {
    return <>{children}</>
  }

  console.log("🎯 Estado final - Sesión:", hasSession)

  if (!hasSession) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <InactivityWarningDialog
        open={showWarning}
        remainingTime={timeLeft}
        onExtend={extendSession}
        onLogout={logout}
      />
    </>
  )
}
