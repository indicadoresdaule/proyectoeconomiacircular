"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [verifyingSession, setVerifyingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const verifySession = async () => {
      const verified = searchParams.get("verified")
      const code = searchParams.get("code")

      console.log("[v0] Reset Password - verified:", verified, "code:", code ? "present" : "absent")

      // Si tiene un code, intentar intercambiarlo usando el cliente de Supabase
      if (code && !verified) {
        console.log("[v0] Attempting to exchange code for session...")
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error("[v0] Error exchanging code:", exchangeError.message)
            // El codigo ya fue usado o es invalido, verificar si ya hay sesion
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.user) {
              console.log("[v0] Found existing session after failed exchange")
              setHasValidSession(true)
              setVerifyingSession(false)
              return
            }

            setError("El enlace de recuperacion ha expirado o no es valido. Por favor, solicita uno nuevo.")
            setVerifyingSession(false)
            return
          }

          if (data?.session) {
            console.log("[v0] Code exchanged successfully, session established")
            setHasValidSession(true)
            setVerifyingSession(false)
            return
          }
        } catch (err) {
          console.error("[v0] Exception exchanging code:", err)
        }
      }

      // Verificar si ya hay una sesion activa
      try {
        console.log("[v0] Checking for existing session...")
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          console.log("[v0] Valid session found for user:", session.user.email)
          setHasValidSession(true)
          setVerifyingSession(false)
          return
        }

        console.log("[v0] No valid session found")
        // No hay sesion valida
        if (!verified && !code) {
          setError("El enlace de recuperacion no es valido. Por favor, solicita uno nuevo.")
        } else if (verified) {
          // Vino del callback pero no hay sesion - puede ser que las cookies no se establecieron
          setError("No se pudo establecer la sesion. Por favor, solicita un nuevo enlace de recuperacion.")
        } else {
          setError("Tu sesion ha expirado. Por favor, solicita un nuevo enlace de recuperacion.")
        }
        setVerifyingSession(false)
      } catch (err) {
        console.error("[v0] Error verifying session:", err)
        setError("Error al verificar la sesion. Por favor, intenta nuevamente.")
        setVerifyingSession(false)
      }
    }

    verifySession()
  }, [searchParams, supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Updating password...")
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.error("[v0] Error updating password:", updateError.message)
        setError(updateError.message || "Error al actualizar la contrasena")
        setLoading(false)
        return
      }

      console.log("[v0] Password updated successfully")
      setSuccess(true)
      setLoading(false)

      // Cerrar sesion despues de cambiar la contrasena
      await supabase.auth.signOut()

      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("[v0] Exception updating password:", err)
      setError(err.message || "Ocurrio un error al actualizar la contrasena")
      setLoading(false)
    }
  }

  if (verifyingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-bg px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border p-8 shadow-lg text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-secondary-text">Verificando enlace de recuperacion...</p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-bg px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">Contrasena Actualizada</h1>
              <p className="text-secondary-text mb-6">
                Tu contrasena ha sido actualizada exitosamente. Seras redirigido al inicio de sesion en unos momentos.
              </p>
              <Link
                href="/login"
                className="inline-block bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Ir al Inicio de Sesion
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si no hay sesion valida, mostrar el error
  if (!hasValidSession && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-bg px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-md">
                  <Image src="/images/ingenieria-20-282-29.jpeg" alt="Logo" fill className="object-cover" sizes="96px" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">Enlace Invalido</h1>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Link
                href="/auth/forgot-password"
                className="inline-block bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Solicitar Nuevo Enlace
              </Link>
              <div className="mt-4">
                <Link href="/login" className="text-sm text-secondary-text hover:text-foreground transition-colors">
                  Volver al inicio de sesion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-md">
                <Image src="/images/ingenieria-20-282-29.jpeg" alt="Logo" fill className="object-cover" sizes="96px" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Restablecer Contrasena</h1>
            <p className="text-secondary-text mt-2 text-sm">Ingresa tu nueva contrasena</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Nueva Contrasena
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-11 transition-all"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-secondary-text mt-1">Minimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirmar Contrasena
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-11 transition-all"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Contrasena"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link href="/login" className="text-sm text-secondary-text hover:text-foreground transition-colors">
              Volver al inicio de sesion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
