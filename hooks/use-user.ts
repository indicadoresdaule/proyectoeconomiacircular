"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Cache global para el usuario (solo en cliente)
let cachedUser: User | null = null
let cachedLoading = true

export function useUser() {
  const [user, setUser] = useState<User | null>(cachedUser)
  const [loading, setLoading] = useState(cachedLoading)
  const supabase = createClient()

  const updateCache = useCallback((newUser: User | null, isLoading: boolean) => {
    cachedUser = newUser
    cachedLoading = isLoading
    setUser(newUser)
    setLoading(isLoading)
  }, [])

  useEffect(() => {
    // Si ya tenemos datos en cache y no estamos cargando, usarlos
    if (cachedUser && !cachedLoading) {
      setUser(cachedUser)
      setLoading(false)
      return
    }

    let isMounted = true

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (isMounted) {
          updateCache(user, false)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        if (isMounted) {
          updateCache(null, false)
        }
      }
    }

    getUser()

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        updateCache(session?.user ?? null, false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, updateCache])

  return { user, loading }
}
