"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Shield, Wrench, User, Mail, Calendar, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

type UserRole = "admin" | "docente" | "tecnico" | "estudiante"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

interface UserData {
  user: any
  profile: UserProfile
}

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()

      if (!data.user) {
        router.push("/login")
        return
      }

      setUserData(data)
    } catch (error) {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setLoggingOut(false)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5" />
      case "tecnico":
        return <Wrench className="w-5 h-5" />
      case "docente":
        return <User className="w-5 h-5" />
      case "estudiante":
        return <User className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      admin: "bg-red-500/10 text-red-500 border-red-500/20",
      docente: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      tecnico: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      estudiante: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }

    const labels = {
      admin: "Administrador",
      docente: "Docente",
      tecnico: "Técnico",
      estudiante: "Estudiante",
    }

    return (
      <Badge variant="outline" className={`${colors[role]} text-base py-1.5 px-3`}>
        {getRoleIcon(role)}
        <span className="ml-2">{labels[role]}</span>
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-bg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!userData) {
    return null
  }

  const { user, profile } = userData

  return (
    <div className="min-h-screen bg-secondary-bg py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-border">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg">
                <Image
                  src="/images/ingenieria-20-282-29.jpeg"
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {profile.full_name || "Mi Perfil"}
                </h1>
                <p className="text-secondary-text">Información de tu cuenta</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {profile.full_name && (
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-text mb-1">Nombre Completo</p>
                    <p className="text-lg font-semibold text-foreground">{profile.full_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-text mb-1">Correo Electrónico</p>
                  <p className="text-lg font-semibold text-foreground break-all">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getRoleIcon(profile.role)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-text mb-2">Rol en el Sistema</p>
                  {getRoleBadge(profile.role)}
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-text mb-1">Fecha de Registro</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(profile.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-text mb-1">ID de Usuario</p>
                  <p className="text-sm font-mono text-foreground break-all">{user.id}</p>
                </div>
              </div>
            </div>

            {profile.role === "admin" && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-600">Permisos de Administrador</p>
                    <p className="text-sm text-red-600/80 mt-0.5">
                      Tienes acceso completo al panel de administración y gestión de usuarios
                    </p>
                  </div>
                </div>
              </div>
            )}

            {profile.role === "tecnico" && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wrench className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="font-semibold text-blue-600">Permisos Técnicos</p>
                    <p className="text-sm text-blue-600/80 mt-0.5">
                      Tienes acceso a funciones técnicas avanzadas del sistema
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
              {profile.role === "admin" && (
                <Button onClick={() => router.push("/gestion-usuarios")} className="flex-1" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Panel de Administración
                </Button>
              )}
              <Button onClick={handleLogout} disabled={loggingOut} variant="destructive" className="flex-1">
                {loggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cerrando sesión...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => router.push("/")}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
