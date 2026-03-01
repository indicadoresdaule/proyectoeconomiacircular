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
  AlertCircle,
  CalendarRange,
  ChevronLeft,
  ChevronDown,
  CalendarDays,
  Calendar as CalendarIcon,
  FilterX
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { es } from "date-fns/locale"
import { format, subDays, subWeeks, subMonths, isWithinInterval, startOfDay, endOfDay } from "date-fns"

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

type DateRangeType = "all" | "today" | "yesterday" | "custom"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
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
  
  // Nuevos estados para el filtro de fechas
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("all")
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  })
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Message state with auto-dismiss
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Auto-dismiss message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [message])

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
    setDateRangeType("all")
    setCustomDateRange({ from: undefined, to: undefined })
    
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

  const formatShortDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: es })
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

  // Función para filtrar el historial por rango de fechas
  const getFilteredHistoryByDate = () => {
    const now = new Date()
    
    switch (dateRangeType) {
      case "all":
        return userHistory
        
      case "today":
        return userHistory.filter(h => 
          format(new Date(h.created_at), "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
        )
        
      case "yesterday":
        const yesterday = subDays(now, 1)
        return userHistory.filter(h => 
          format(new Date(h.created_at), "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
        )
        
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          return userHistory.filter(h => {
            const date = new Date(h.created_at)
            const from = startOfDay(customDateRange.from!)
            const to = endOfDay(customDateRange.to!)
            return date >= from && date <= to
          })
        }
        return userHistory
        
      default:
        return userHistory
    }
  }

  // Función para obtener el texto del filtro actual
  const getDateRangeLabel = () => {
    switch (dateRangeType) {
      case "all":
        return "Todo el historial"
      case "today":
        return "Hoy"
      case "yesterday":
        return "Ayer"
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          return `${formatShortDate(customDateRange.from)} - ${formatShortDate(customDateRange.to)}`
        }
        return "Rango personalizado"
      default:
        return "Seleccionar fechas"
    }
  }

  // Función para aplicar un rango predefinido
  const applyPresetRange = (preset: DateRangeType) => {
    setDateRangeType(preset)
    if (preset !== "custom") {
      setCustomDateRange({ from: undefined, to: undefined })
    }
  }

  // Función para limpiar filtros
  const clearDateFilters = () => {
    setDateRangeType("all")
    setCustomDateRange({ from: undefined, to: undefined })
  }

  const filteredHistory = getFilteredHistoryByDate()

  // Agrupar historial por fecha para mostrar en el sidebar
  const groupHistoryByDate = () => {
    const groups: { [key: string]: LoginHistory[] } = {}
    
    filteredHistory.forEach(item => {
      const date = format(new Date(item.created_at), "yyyy-MM-dd")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(item)
    })
    
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }

  const groupedHistory = groupHistoryByDate()

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

  return (
    <div className="min-h-screen bg-secondary-bg py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.push("/")} 
              title="Volver a inicio"
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

        {/* Message with auto-dismiss */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20 transition-all duration-300"
                : "bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500/20 transition-all duration-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <p>{message.text}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessage(null)}
                className="h-6 w-6 p-0 hover:bg-transparent hover:scale-110"
              >
                <XCircle className="w-4 h-4 opacity-50 hover:opacity-100" />
              </Button>
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

{/* History Dialog - Mejorado con filtro de fechas dinámico */}
<Dialog open={historyOpen} onOpenChange={(open) => {
  setHistoryOpen(open)
  if (!open) {
    setSelectedSession(null)
    setDateRangeType("all")
    setCustomDateRange({ from: undefined, to: undefined })
  }
}}>
  <DialogContent className="bg-white sm:max-w-5xl p-0 gap-0 overflow-hidden">
    <DialogHeader className="p-6 pb-4">
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

    {/* Nuevo filtro de fechas dinámico - más compacto */}
    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <CalendarRange className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrar:</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant={dateRangeType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => applyPresetRange("all")}
            className={`h-8 text-xs px-3 ${dateRangeType === "all" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
          >
            Todos
          </Button>
          <Button
            variant={dateRangeType === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => applyPresetRange("today")}
            className={`h-8 text-xs px-3 ${dateRangeType === "today" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
          >
            Hoy
          </Button>
          <Button
            variant={dateRangeType === "yesterday" ? "default" : "outline"}
            size="sm"
            onClick={() => applyPresetRange("yesterday")}
            className={`h-8 text-xs px-3 ${dateRangeType === "yesterday" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
          >
            Ayer
          </Button>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={dateRangeType === "custom" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs gap-1 px-3 ${
                  dateRangeType === "custom" 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                }`}
              >
                <CalendarIcon className="w-3 h-3" />
                {dateRangeType === "custom" && customDateRange.from && customDateRange.to
                  ? getDateRangeLabel()
                  : "Personalizado"}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 bg-white border border-gray-200 shadow-lg rounded-lg" 
              align="start"
              onInteractOutside={(e) => {
                // Prevenir cierre si estamos seleccionando fechas y no tenemos el rango completo
                if (!customDateRange.from || !customDateRange.to) {
                  e.preventDefault();
                }
              }}
              onEscapeKeyDown={(e) => {
                // Prevenir cierre con ESC si estamos seleccionando fechas
                if (!customDateRange.from || !customDateRange.to) {
                  e.preventDefault();
                }
              }}
            >
              <CalendarComponent
                mode="range"
                selected={customDateRange}
                onSelect={(range) => {
                  // Solo actualizar el estado, NO cerrar automáticamente
                  setCustomDateRange({
                    from: range?.from,
                    to: range?.to
                  })
                }}
                numberOfMonths={2}
                locale={es}
                className="bg-white rounded-lg"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-gray-900",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-purple-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-purple-100 rounded-md",
                  day_selected: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white focus:bg-purple-600 focus:text-white",
                  day_today: "bg-gray-100 text-gray-900",
                  day_outside: "text-gray-400 opacity-50",
                  day_disabled: "text-gray-400 opacity-50",
                  day_range_middle: "aria-selected:bg-purple-100 aria-selected:text-gray-900",
                  day_hidden: "invisible",
                }}
              />
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="text-xs text-gray-500">
                  {!customDateRange.from && !customDateRange.to && "Selecciona fecha inicial"}
                  {customDateRange.from && !customDateRange.to && "Selecciona fecha final"}
                  {customDateRange.from && customDateRange.to && "Rango seleccionado - Haz clic en 'Aplicar'"}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setCustomDateRange({ from: undefined, to: undefined })
                    }}
                  >
                    Limpiar
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!customDateRange.from || !customDateRange.to}
                    onClick={() => {
                      if (customDateRange.from && customDateRange.to) {
                        setDateRangeType("custom")
                        setCalendarOpen(false)
                      }
                    }}
                  >
                    Aplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => {
                      setCalendarOpen(false)
                      // Solo limpiar si no hay rango completo
                      if (!customDateRange.from || !customDateRange.to) {
                        setDateRangeType("all")
                        setCustomDateRange({ from: undefined, to: undefined })
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {dateRangeType !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilters}
              className="h-8 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <FilterX className="w-3 h-3" />
            </Button>
          )}
        </div>

        <Badge variant="outline" className="ml-auto bg-white text-xs h-7">
          <CalendarDays className="w-3 h-3 mr-1" />
          {filteredHistory.length} de {userHistory.length}
        </Badge>
      </div>
    </div>

    <div className="grid grid-cols-12 divide-x divide-gray-200">
      {/* Sidebar - Lista de sesiones agrupadas por fecha */}
      <div className="col-span-4 bg-gray-50">
        <div className="p-3 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Sesiones
            </span>
            <Badge variant="outline" className="bg-white text-xs">
              {filteredHistory.length}
            </Badge>
          </div>
        </div>

        <ScrollArea className="h-[380px]">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No hay accesos en este período</p>
              {dateRangeType === "custom" && (!customDateRange.from || !customDateRange.to) && (
                <p className="text-xs text-purple-600 mt-2">
                  Selecciona ambas fechas en el calendario
                </p>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-3">
              {groupedHistory.map(([date, sessions]) => (
                <div key={date}>
                  <div className="px-3 py-1.5 bg-gray-200 rounded-md mb-1.5">
                    <p className="text-xs font-semibold text-gray-600">
                      {format(new Date(date), "EEEE, d MMM", { locale: es })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sessions.length} {sessions.length === 1 ? 'acceso' : 'accesos'}
                    </p>
                  </div>
                  <div className="space-y-1 pl-1">
                    {sessions.map((login, index) => (
                      <button
                        key={login.id}
                        onClick={() => setSelectedSession(login)}
                        className={`w-full text-left p-2 rounded-md transition-all duration-200 ${
                          selectedSession?.id === login.id
                            ? 'bg-purple-50 border border-purple-200 shadow-sm'
                            : 'hover:bg-white hover:shadow-sm border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`p-1 rounded-full ${
                            index === 0 && sessions.length > 0 ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Clock className={`w-2.5 h-2.5 ${
                              index === 0 && sessions.length > 0 ? 'text-green-600' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-800">
                                {format(new Date(login.created_at), "HH:mm:ss")}
                              </p>
                              <ChevronRight className={`w-3 h-3 ${
                                selectedSession?.id === login.id ? 'text-purple-600' : 'text-gray-300'
                              }`} />
                            </div>
                            {login.ip_address && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {login.ip_address}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Content - Detalles de la sesión */}
      <div className="col-span-8 bg-white">
        {selectedSession ? (
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800">Detalles del Acceso</h3>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                ID: {selectedSession.id.slice(0, 8)}...
              </Badge>
            </div>
            
            <div className="space-y-3">
              {/* Fecha y Hora */}
              <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-purple-100 rounded-md">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Fecha y Hora</span>
                </div>
                <p className="text-sm text-gray-700 ml-7">{formatDate(selectedSession.created_at)}</p>
                <p className="text-xs text-purple-600 ml-7 mt-0.5">
                  {formatRelativeTime(selectedSession.created_at)}
                </p>
              </div>

              {/* Información del Usuario */}
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Usuario</span>
                </div>
                <p className="text-sm text-gray-700 ml-7">{selectedSession.email}</p>
                <p className="text-xs text-blue-600 ml-7 mt-0.5 break-all">ID: {selectedSession.user_id}</p>
              </div>

              {/* Dirección IP */}
              {selectedSession.ip_address && (
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-indigo-100 rounded-md">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Dirección IP</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-7 font-mono bg-white p-1.5 rounded border border-indigo-100">
                    {selectedSession.ip_address}
                  </p>
                </div>
              )}

              {/* User Agent */}
              {selectedSession.user_agent && (
                <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-green-100 rounded-md">
                      <Monitor className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Navegador / Dispositivo</span>
                  </div>
                  <div className="ml-7 bg-white p-2 rounded border border-green-100 text-xs text-gray-600 break-words max-h-20 overflow-y-auto">
                    {selectedSession.user_agent}
                  </div>
                </div>
              )}

              {/* ID de Sesión */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-gray-200 rounded-md">
                    <Fingerprint className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">ID de Registro</span>
                </div>
                <p className="text-xs text-gray-600 ml-7 font-mono bg-gray-50 p-1.5 rounded border border-gray-200 break-all">
                  {selectedSession.id}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <History className="w-8 h-8 text-purple-300" />
              </div>
              <p className="text-sm text-gray-500">Selecciona una sesión</p>
            </div>
          </div>
        )}
      </div>
    </div>

    <DialogFooter className="p-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white text-xs px-2 py-0.5">
            Total: {userHistory.length}
          </Badge>
          {filteredHistory.length !== userHistory.length && (
            <Badge className="bg-purple-600 text-white border-purple-600 text-xs px-2 py-0.5">
              Filtrados: {filteredHistory.length}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setHistoryOpen(false)
            setSelectedSession(null)
            setDateRangeType("all")
            setCustomDateRange({ from: undefined, to: undefined })
          }}
          className="h-8 text-xs bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
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
