"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  UserPlus,
  Shield,
  Wrench,
  User,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  UserX,
  UserCheck,
  ArrowLeft,
  Clock,
  History,
  Monitor,
  Globe,
  Calendar,
  Fingerprint,
  Mail,
  ChevronRight,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type UserRole = "admin" | "docente" | "tecnico" | "estudiante"
type UserStatus = "active" | "inactive" | "pending"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

interface LoginHistory {
  id: string
  user_id: string
  email: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  profile: UserProfile | null
  banned_until: string | null
  login_history?: LoginHistory[]
}

export default function GestionUsuariosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Create user states
  const [createEmail, setCreateEmail] = useState("")
  const [createPassword, setCreatePassword] = useState("")
  const [createFullName, setCreateFullName] = useState("")
  const [createRole, setCreateRole] = useState<UserRole>("estudiante")
  const [creating, setCreating] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  // Edit user states
  const [editUser, setEditUser] = useState<UserData | null>(null)
  const [editRole, setEditRole] = useState<UserRole>("estudiante")
  const [editEmail, setEditEmail] = useState("")
  const [editFullName, setEditFullName] = useState("")
  const [editOpen, setEditOpen] = useState(false)

  // Delete user states
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Suspend user states
  const [suspendUser, setSuspendUser] = useState<UserData | null>(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspendAction, setSuspendAction] = useState<"suspend" | "reactivate">("suspend")

  // Login history states
  const [historyUser, setHistoryUser] = useState<UserData | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [userHistory, setUserHistory] = useState<LoginHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedSession, setSelectedSession] = useState<LoginHistory | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    checkAuth()
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()

      if (!data.user || !data.profile || data.profile.role !== "admin") {
        router.push("/")
        return
      }

      setCurrentUser(data)
    } catch (error) {
      router.push("/")
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
        
        const usersWithHistory = await Promise.all(
          data.users.map(async (user: UserData) => {
            try {
              const historyResponse = await fetch(`/api/admin/users/${user.id}/login-history`)
              if (historyResponse.ok) {
                const historyData = await historyResponse.json()
                return {
                  ...user,
                  login_history: historyData.history || []
                }
              }
              return {
                ...user,
                login_history: []
              }
            } catch (error) {
              console.error(`Error loading history for user ${user.id}:`, error)
              return {
                ...user,
                login_history: []
              }
            }
          })
        )
        
        setUsers(usersWithHistory)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserHistory = async (userId: string) => {
    if (!userId) {
      console.error('Error: userId es undefined o null')
      setUserHistory([])
      setLoadingHistory(false)
      return
    }

    setLoadingHistory(true)
    setUserHistory([])
    setSelectedSession(null)
    setActiveTab("all")
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/login-history`)
      const data = await response.json()
      
      if (response.ok) {
        setUserHistory(data.history || [])
        if (data.history && data.history.length > 0) {
          setSelectedSession(data.history[0])
        }
      } else {
        console.error('Error en respuesta:', data.error)
        setUserHistory([])
      }
    } catch (error) {
      console.error('Error loading history:', error)
      setUserHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.profile?.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.profile?.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleCreate = async () => {
    if (!createEmail || !createPassword) return

    setCreating(true)

    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          role: createRole,
          full_name: createFullName || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Usuario creado correctamente" })
        setCreateEmail("")
        setCreatePassword("")
        setCreateFullName("")
        setCreateRole("estudiante")
        setCreateOpen(false)
        loadUsers()
      } else {
        setMessage({ type: "error", text: data.error || "Error al crear usuario" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al crear usuario" })
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = async () => {
    if (!editUser) return

    try {
      const updates: any = { role: editRole, full_name: editFullName }

      if (editEmail && editEmail !== editUser.email) {
        updates.email = editEmail
      }

      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Usuario actualizado correctamente" })
        setEditOpen(false)
        setEditUser(null)
        loadUsers()
      } else {
        setMessage({ type: "error", text: data.error || "Error al actualizar usuario" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al actualizar usuario" })
    }
  }

  const handleSuspendConfirm = async () => {
    if (!suspendUser) return

    const suspended = suspendAction === "suspend"

    try {
      const response = await fetch(`/api/admin/users/${suspendUser.id}/suspend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspended }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: suspended ? "Usuario suspendido correctamente" : "Usuario reactivado correctamente",
        })
        loadUsers()
      } else {
        setMessage({ type: "error", text: data.error || "Error al actualizar usuario" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al actualizar usuario" })
    } finally {
      setSuspendOpen(false)
      setSuspendUser(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return

    try {
      const response = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Usuario eliminado correctamente" })
        setDeleteOpen(false)
        setDeleteUser(null)
        loadUsers()
      } else {
        setMessage({ type: "error", text: data.error || "Error al eliminar usuario" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al eliminar usuario" })
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />
      case "docente":
        return <User className="w-4 h-4" />
      case "tecnico":
        return <Wrench className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      admin: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/30 hover:scale-105 transition-transform duration-200",
      docente: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/30 hover:scale-105 transition-transform duration-200",
      tecnico: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/30 hover:scale-105 transition-transform duration-200",
      estudiante: "bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/30 hover:scale-105 transition-transform duration-200",
    }

    const labels = {
      admin: "Administrador",
      docente: "Docente",
      tecnico: "Técnico",
      estudiante: "Estudiante",
    }

    return (
      <Badge variant="outline" className={colors[role]}>
        {getRoleIcon(role)}
        <span className="ml-1">{labels[role]}</span>
      </Badge>
    )
  }

  const getStatusBadge = (user: UserData) => {
    const status = user.profile?.status || "active"

    switch (status) {
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/30 hover:scale-105 transition-transform duration-200">
            <UserX className="w-3 h-3 mr-1" />
            Suspendido
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/30 hover:scale-105 transition-transform duration-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/30 hover:scale-105 transition-transform duration-200">
            <UserCheck className="w-3 h-3 mr-1" />
            Activo
          </Badge>
        )
    }
  }

  const isInactive = (user: UserData) => {
    return user.profile?.status === "inactive"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Hace unos segundos'
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    return formatDate(dateString)
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const filteredHistory = activeTab === "all" 
    ? userHistory 
    : userHistory.filter(h => {
        const date = new Date(h.created_at)
        const now = new Date()
        switch(activeTab) {
          case "today":
            return date.toDateString() === now.toDateString()
          case "week":
            const weekAgo = new Date(now.setDate(now.getDate() - 7))
            return date >= weekAgo
          case "month":
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
            return date >= monthAgo
          default:
            return true
        }
      })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-bg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-bg py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.push("/perfil")} 
              title="Volver al perfil"
              className="hover:bg-red-100 hover:text-red-600 hover:scale-110 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
              <p className="text-secondary-text mt-1">Administra los usuarios del sistema</p>
            </div>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto hover:scale-105 transition-transform duration-300">
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white animate-in zoom-in-95 duration-300">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription className="text-secondary-text">
                  Crea una nueva cuenta de usuario con acceso inmediato al sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder=""
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    className="bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={createRole} onValueChange={(value) => setCreateRole(value as UserRole)}>
                    <SelectTrigger className="bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-100 border-border">
                      <SelectItem value="estudiante" className="hover:bg-gray-200 transition-colors duration-200">
                        Estudiante
                      </SelectItem>
                      <SelectItem value="docente" className="hover:bg-gray-200 transition-colors duration-200">
                        Docente
                      </SelectItem>
                      <SelectItem value="tecnico" className="hover:bg-gray-200 transition-colors duration-200">
                        Técnico
                      </SelectItem>
                      <SelectItem value="admin" className="hover:bg-gray-200 transition-colors duration-200">
                        Administrador
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setCreateOpen(false)}
                  className="bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 hover:scale-105 transition-all duration-300"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={creating || !createEmail || !createPassword}
                  className="hover:scale-105 transition-transform duration-300"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20 hover:scale-[1.02] transition-all duration-300"
                : "bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500/20 hover:scale-[1.02] transition-all duration-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <p>{message.text}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border shadow-lg p-4 mb-6 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, email o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white hover:bg-gray-50 focus:bg-white transition-colors duration-300"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-white hover:bg-gray-50 transition-colors duration-300">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-border">
                  <SelectItem value="all" className="hover:bg-gray-100 transition-colors duration-200">
                    Todos los roles
                  </SelectItem>
                  <SelectItem value="admin" className="hover:bg-gray-100 transition-colors duration-200">
                    Administradores
                  </SelectItem>
                  <SelectItem value="docente" className="hover:bg-gray-100 transition-colors duration-200">
                    Docentes
                  </SelectItem>
                  <SelectItem value="tecnico" className="hover:bg-gray-100 transition-colors duration-200">
                    Técnicos
                  </SelectItem>
                  <SelectItem value="estudiante" className="hover:bg-gray-100 transition-colors duration-200">
                    Estudiantes
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white hover:bg-gray-50 transition-colors duration-300">
                  <UserCheck className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-border">
                  <SelectItem value="all" className="hover:bg-gray-100 transition-colors duration-200">
                    Todos los estados
                  </SelectItem>
                  <SelectItem value="active" className="hover:bg-gray-100 transition-colors duration-200">
                    Activos
                  </SelectItem>
                  <SelectItem value="inactive" className="hover:bg-gray-100 transition-colors duration-200">
                    Suspendidos
                  </SelectItem>
                  <SelectItem value="pending" className="hover:bg-gray-100 transition-colors duration-200">
                    Pendientes
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 text-sm text-secondary-text">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Usuario</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Rol</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Registro</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Último Acceso</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Total Accesos</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const inactive = isInactive(user)
                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-muted/20 transition-all duration-300 ${inactive ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${inactive ? "bg-red-500/10 hover:bg-red-500/20" : "bg-primary/10 hover:bg-primary/20"} transition-colors duration-300`}
                          >
                            <User className={`w-5 h-5 ${inactive ? "text-red-500" : "text-primary"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground hover:text-blue-600 transition-colors duration-300">{user.profile?.full_name || user.email}</p>
                            <p className="text-xs text-secondary-text">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.profile ? getRoleBadge(user.profile.role) : <Badge className="hover:scale-105 transition-transform duration-200">Sin perfil</Badge>}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user)}</td>
                      <td className="px-6 py-4 text-sm text-secondary-text hover:text-foreground transition-colors duration-300">
                        {new Date(user.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-text hover:text-foreground transition-colors duration-300">
                        {user.last_sign_in_at ? formatRelativeTime(user.last_sign_in_at) : "Nunca"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          <History className="w-3 h-3 mr-1" />
                          {(user as any).login_history?.length || 0}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* History Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!user?.id) return
                              setHistoryUser(user)
                              loadUserHistory(user.id)
                              setHistoryOpen(true)
                            }}
                            title="Ver historial de accesos"
                            className="bg-secondary-bg hover:bg-purple-100 hover:text-purple-600 hover:scale-110 transition-all duration-300"
                          >
                            <History className="w-4 h-4" />
                          </Button>

                          {/* Edit Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditUser(user)
                              setEditRole(user.profile?.role || "estudiante")
                              setEditEmail(user.email)
                              setEditFullName(user.profile?.full_name || "")
                              setEditOpen(true)
                            }}
                            title="Editar usuario"
                            className="bg-secondary-bg hover:bg-blue-100 hover:text-blue-600 hover:scale-110 transition-all duration-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          {/* Suspend/Reactivate Button */}
                          {inactive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSuspendUser(user)
                                setSuspendAction("reactivate")
                                setSuspendOpen(true)
                              }}
                              disabled={user.id === currentUser?.user?.id}
                              title="Reactivar usuario"
                              className="border-green-500/20 text-green-600 hover:bg-green-500/30 hover:text-green-700 hover:scale-110 transition-all duration-300 bg-secondary-bg"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              <span className="hidden lg:inline">Reactivar</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSuspendUser(user)
                                setSuspendAction("suspend")
                                setSuspendOpen(true)
                              }}
                              disabled={user.id === currentUser?.user?.id}
                              title="Suspender usuario"
                              className="border-orange-500/20 text-orange-600 hover:bg-orange-500/30 hover:text-orange-700 hover:scale-110 transition-all duration-300 bg-secondary-bg"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              <span className="hidden lg:inline">Suspender</span>
                            </Button>
                          )}

                          {/* Delete Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteUser(user)
                              setDeleteOpen(true)
                            }}
                            disabled={user.id === currentUser?.user?.id}
                            title="Eliminar usuario"
                            className="border-red-500/20 text-red-600 hover:bg-red-500/30 hover:text-red-700 hover:scale-110 transition-all duration-300 bg-secondary-bg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* History Dialog - Profesional */}
      <Dialog open={historyOpen} onOpenChange={(open) => {
        setHistoryOpen(open)
        if (!open) {
          setSelectedSession(null)
          setActiveTab("all")
        }
      }}>
        <DialogContent className="bg-white sm:max-w-4xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <History className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                    Historial de Accesos
                  </DialogTitle>
                  <DialogDescription asChild className="text-gray-500">
                    <div>
                      {historyUser && (
                        <>
                          <span className="font-medium text-gray-700">{historyUser.email}</span>
                          <span className="text-gray-300 mx-1">•</span>
                          <span className="text-sm">{userHistory.length} accesos registrados</span>
                        </>
                      )}
                    </div>
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 px-3 py-1">
                <Clock className="w-3 h-3 mr-1" />
                Último acceso: {userHistory[0] ? formatRelativeTime(userHistory[0].created_at) : 'N/A'}
              </Badge>
            </div>
          </DialogHeader>

          <Separator />

          <div className="grid grid-cols-12 divide-x divide-gray-200">
            {/* Sidebar - Lista de sesiones */}
            <div className="col-span-4 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 bg-gray-200 p-1">
                    <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                    <TabsTrigger value="today" className="text-xs">Hoy</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs">Semana</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs">Mes</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <ScrollArea className="h-[400px]">
                {loadingHistory ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No hay accesos registrados</p>
                    <p className="text-sm text-gray-400 mt-1">En este período no se encontraron inicios de sesión</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredHistory.map((login, index) => (
                      <button
                        key={login.id}
                        onClick={() => setSelectedSession(login)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          selectedSession?.id === login.id
                            ? 'bg-purple-50 border-2 border-purple-200 shadow-sm'
                            : 'hover:bg-white hover:shadow-sm border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            index === 0 ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Monitor className={`w-4 h-4 ${
                              index === 0 ? 'text-green-600' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-800 truncate">
                                {index === 0 ? 'Sesión actual' : `Acceso #${filteredHistory.length - index}`}
                              </p>
                              <ChevronRight className={`w-4 h-4 ${
                                selectedSession?.id === login.id ? 'text-purple-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeTime(login.created_at)}
                            </p>
                            {login.ip_address && (
                              <p className="text-xs text-gray-400 mt-1">
                                IP: {login.ip_address}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Main Content - Detalles de la sesión */}
            <div className="col-span-8 bg-white">
              {selectedSession ? (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles del Acceso</h3>
                  
                  <div className="space-y-4">
                    {/* Fecha y Hora */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700">Fecha y Hora</span>
                      </div>
                      <p className="text-gray-600 ml-9">{formatDate(selectedSession.created_at)}</p>
                    </div>

                    {/* Información del Usuario */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Mail className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-700">Usuario</span>
                      </div>
                      <div className="ml-9">
                        <p className="text-gray-600">{selectedSession.email}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {selectedSession.user_id}</p>
                      </div>
                    </div>

                    {/* Dirección IP */}
                    {selectedSession.ip_address && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Globe className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium text-gray-700">Dirección IP</span>
                        </div>
                        <p className="text-gray-600 ml-9 font-mono">{selectedSession.ip_address}</p>
                      </div>
                    )}

                    {/* User Agent */}
                    {selectedSession.user_agent && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Monitor className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-700">Navegador / Dispositivo</span>
                        </div>
                        <p className="text-gray-600 ml-9 text-sm break-words">
                          {selectedSession.user_agent}
                        </p>
                      </div>
                    )}

                    {/* ID de Sesión */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <Fingerprint className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-700">ID de Registro</span>
                      </div>
                      <p className="text-gray-600 ml-9 text-xs font-mono">{selectedSession.id}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Selecciona una sesión</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Haz clic en cualquier acceso de la lista para ver los detalles
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  Total: {userHistory.length} accesos
                </Badge>
                {filteredHistory.length !== userHistory.length && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                    Filtrados: {filteredHistory.length}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setHistoryOpen(false)
                  setSelectedSession(null)
                  setActiveTab("all")
                }}
                className="bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 hover:scale-105 transition-all duration-300"
              >
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white animate-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription className="text-secondary-text">
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                type="text"
                placeholder="Juan Pérez"
                className="bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-blue-500 transition-colors duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                type="email"
                className="bg-gray-100 hover:bg-gray-200 focus:bg-white focus:border-blue-500 transition-colors duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as UserRole)}>
                <SelectTrigger className="bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 border-border">
                  <SelectItem value="estudiante" className="hover:bg-gray-200 transition-colors duration-200">
                    Estudiante
                  </SelectItem>
                  <SelectItem value="docente" className="hover:bg-gray-200 transition-colors duration-200">
                    Docente
                  </SelectItem>
                  <SelectItem value="tecnico" className="hover:bg-gray-200 transition-colors duration-200">
                    Técnico
                  </SelectItem>
                  <SelectItem value="admin" className="hover:bg-gray-200 transition-colors duration-200">
                    Administrador
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditOpen(false)}
              className="bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 hover:scale-105 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEdit}
              className="hover:scale-105 transition-transform duration-300"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend/Reactivate Dialog */}
      <AlertDialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <AlertDialogContent className="bg-white border-border animate-in zoom-in-95 duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendAction === "suspend" ? "¿Suspender usuario?" : "¿Reactivar usuario?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-secondary-text">
              {suspendAction === "suspend" ? (
                <>
                  El usuario <strong className="text-foreground">{suspendUser?.email}</strong> no podrá acceder al
                  sistema mientras esté suspendido. Podrás reactivar su cuenta en cualquier momento.
                </>
              ) : (
                <>
                  El usuario <strong className="text-foreground">{suspendUser?.email}</strong> volverá a tener acceso al
                  sistema con sus permisos anteriores.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white hover:bg-red-100 hover:text-red-600 hover:scale-105 transition-all duration-300">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendConfirm}
              className={
                suspendAction === "suspend"
                  ? "bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 transition-all duration-300"
                  : "bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all duration-300"
              }
            >
              {suspendAction === "suspend" ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Suspender
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Reactivar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-white border-border animate-in zoom-in-95 duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary-text">
              Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta de{" "}
              <strong className="text-foreground">{deleteUser?.email}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white hover:bg-red-100 hover:text-red-600 hover:scale-105 transition-all duration-300">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 text-white hover:bg-red-700 hover:scale-105 transition-all duration-300"
            >
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
