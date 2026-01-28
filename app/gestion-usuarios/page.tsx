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

interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  profile: UserProfile | null
  banned_until: string | null
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

  const [suspendUser, setSuspendUser] = useState<UserData | null>(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [suspendAction, setSuspendAction] = useState<"suspend" | "reactivate">("suspend")

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
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

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
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("es-ES") : "Nunca"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
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
                          {inactive ? (
                            // Reactivate button for suspended users
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSuspendUser(user)
                                setSuspendAction("reactivate")
                                setSuspendOpen(true)
                              }}
                              disabled={user.id === currentUser?.user?.id}
                              title="Reanudar usuario"
                              className="border-green-500/20 text-green-600 hover:bg-green-500/30 hover:text-green-700 hover:scale-110 transition-all duration-300 bg-secondary-bg"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              <span className="hidden lg:inline">Reanudar</span>
                            </Button>
                          ) : (
                            // Suspend button for active users
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

      <AlertDialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <AlertDialogContent className="bg-white border-border animate-in zoom-in-95 duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendAction === "suspend" ? "¿Suspender usuario?" : "¿Reanudar usuario?"}
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
                  Reanudar
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
