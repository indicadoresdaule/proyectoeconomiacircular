"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Loader2, 
  Shield, 
  Wrench, 
  User, 
  Mail, 
  Calendar, 
  LogOut,
  Home,
  Copy,
  CheckCircle2,
  Clock,
  BadgeCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

// Types
type UserRole = "admin" | "docente" | "tecnico" | "estudiante"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

interface UserData {
  user: { id: string; email: string }
  profile: UserProfile
}

// Constants
const ROLE_CONFIG = {
  admin: { 
    icon: Shield, 
    label: "Administrador", 
    color: "bg-red-500 text-white",
    badgeColor: "bg-red-500/10 text-red-600 border-red-500/20",
    gradient: "from-red-500/20 to-orange-500/20"
  },
  docente: { 
    icon: BadgeCheck, 
    label: "Docente", 
    color: "bg-purple-500 text-white",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    gradient: "from-purple-500/20 to-blue-500/20"
  },
  tecnico: { 
    icon: Wrench, 
    label: "Técnico", 
    color: "bg-blue-500 text-white",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  estudiante: { 
    icon: User, 
    label: "Estudiante", 
    color: "bg-emerald-500 text-white",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    gradient: "from-emerald-500/20 to-teal-500/20"
  }
} as const

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/auth/session")
      const data = await res.json()
      if (!data.user) return router.push("/login")
      setUserData(data)
    } catch {
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
    } finally {
      setLoggingOut(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-bg to-background">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/20 animate-ping absolute"></div>
          <div className="w-20 h-20 rounded-full bg-primary/30 animate-pulse flex items-center justify-center relative">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        </div>
      </div>
    </div>
  )

  if (!userData) return null

  const { user, profile } = userData
  const roleConfig = ROLE_CONFIG[profile.role]
  const RoleIcon = roleConfig.icon
  const userInitials = getInitials(profile.full_name)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-secondary-bg to-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb simple */}
          <div className="flex items-center gap-2 text-sm text-secondary-text mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="h-8 px-2">
              <Home className="w-4 h-4" />
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">Mi Perfil</span>
          </div>

          <Card className="border-border shadow-lg overflow-hidden">
            {/* Banner con gradiente según rol */}
            <div className="h-24 bg-gradient-to-r from-green-500/20 to-emerald-500/20" />
            
            {/* Contenido principal */}
            <CardContent className="relative px-6 pb-6">
              {/* Avatar flotante */}
              <div className="flex justify-between items-start -mt-12 mb-4">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                      <AvatarImage src="/images/ingenieria-20-282-29.jpeg" />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${roleConfig.color} flex items-center justify-center ring-2 ring-background`}>
                      <RoleIcon className="w-3 h-3" />
                    </div>
                  </div>
                  
                  <div className="pb-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {profile.full_name || "Usuario"}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={roleConfig.badgeColor}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {roleConfig.label}
                      </Badge>
                      
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Grid de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="group p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-secondary-text mb-1">Correo Electrónico</p>
                      <p className="text-sm font-medium text-foreground break-all">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* ID Usuario */}
                <div className="group p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <div className="text-primary font-mono font-bold text-sm">#</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-secondary-text mb-1">ID de Usuario</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-background px-2 py-1 rounded border border-border font-mono">
                          {user.id.slice(0, 12)}...
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(user.id)}
                        >
                          {copied ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fecha registro detallada */}
                <div className="group p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-secondary-text mb-1">Fecha de Registro</p>
                      <p className="text-sm font-medium">
                        {new Date(profile.created_at).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones principales */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {profile.role === "admin" && (
                  <Button 
                    onClick={() => router.push("/gestion-usuarios")} 
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                    size="lg"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Panel de Administración
                  </Button>
                )}
                
                <Button 
                  onClick={handleLogout} 
                  disabled={loggingOut}
                  variant="destructive" 
                  size="lg"
                  className="flex-1"
                >
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

            </CardContent>
          </Card>

          {/* Mensaje de bienvenida personalizado */}
          <div className="mt-4 text-center text-sm text-secondary-text">
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
