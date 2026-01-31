"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  User, Mail, Phone, Linkedin, 
  Users, Shield, Briefcase, GraduationCap,
  Loader2, ExternalLink, Building, Plus, Pencil, Trash2, X, Save, ImageIcon,
  Eye, EyeOff
} from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import type { MemberCard, UserRole } from "@/lib/types/database"

// Configuración de filtros
const filtrosConfig = [
  {
    id: "todos",
    label: "Todos",
    icon: Users,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    activeColor: "bg-blue-600 text-white"
  },
  {
    id: "admin",
    label: "Liderazgo",
    icon: Shield,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    activeColor: "bg-purple-600 text-white"
  },
  {
    id: "tecnico",
    label: "Tecnicos",
    icon: Briefcase,
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    activeColor: "bg-green-600 text-white"
  },
  {
    id: "docente",
    label: "Docentes",
    icon: GraduationCap,
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    activeColor: "bg-amber-600 text-white"
  },
  {
    id: "estudiante",
    label: "Estudiantes",
    icon: User,
    color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    activeColor: "bg-indigo-600 text-white"
  }
]

const titulosPorTipo: Record<UserRole, string> = {
  admin: "Equipo de Liderazgo",
  tecnico: "Especialistas Tecnicos",
  docente: "Cuerpo Docente",
  estudiante: "Estudiantes Investigadores"
}

interface CardFormData {
  nombre: string
  descripcion: string
  institucion: string
  telefono: string
  linkedin: string
  orcid: string
  foto_url: string
}

const initialFormData: CardFormData = {
  nombre: "",
  descripcion: "",
  institucion: "",
  telefono: "",
  linkedin: "",
  orcid: "",
  foto_url: ""
}

export default function IntegrantesPage() {
  const { user, loading: userLoading } = useUser()
  const [integrantes, setIntegrantes] = useState<MemberCard[]>([])
  const [myCard, setMyCard] = useState<MemberCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtroActivo, setFiltroActivo] = useState<string>("todos")
  
  // Estados para el modal de edicion/creacion
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CardFormData>(initialFormData)
  const [formError, setFormError] = useState<string | null>(null)

  // Cargar tarjetas públicas
  const fetchCards = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/member-cards")
      const data = await response.json()
      
      if (response.ok) {
        setIntegrantes(data.cards || [])
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar la tarjeta del usuario actual
  const fetchMyCard = useCallback(async () => {
    if (!user) {
      setMyCard(null)
      return
    }
    
    try {
      const response = await fetch("/api/member-cards?my-card=true")
      const data = await response.json()
      
      if (response.ok) {
        setMyCard(data.card || null)
      }
    } catch (error) {
      console.error("Error fetching my card:", error)
    }
  }, [user])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  useEffect(() => {
    if (!userLoading) {
      fetchMyCard()
    }
  }, [user, userLoading, fetchMyCard])

  // Abrir modal para crear
  const handleCreate = () => {
    setFormData(initialFormData)
    setFormError(null)
    setIsDialogOpen(true)
  }

  // Abrir modal para editar
  const handleEdit = () => {
    if (myCard) {
      setFormData({
        nombre: myCard.nombre || "",
        descripcion: myCard.descripcion || "",
        institucion: myCard.institucion || "",
        telefono: myCard.telefono || "",
        linkedin: myCard.linkedin || "",
        orcid: myCard.orcid || "",
        foto_url: myCard.foto_url || ""
      })
      setFormError(null)
      setIsDialogOpen(true)
    }
  }

  // Guardar tarjeta (crear o actualizar)
  const handleSave = async () => {
    setFormError(null)
    
    if (!formData.nombre.trim()) {
      setFormError("El nombre es obligatorio")
      return
    }
    
    if (!formData.descripcion.trim()) {
      setFormError("La descripcion es obligatoria")
      return
    }

    setIsSubmitting(true)
    
    try {
      const url = myCard ? `/api/member-cards/${myCard.id}` : "/api/member-cards"
      const method = myCard ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setFormError(data.error || "Error al guardar la tarjeta")
        return
      }
      
      setIsDialogOpen(false)
      await fetchCards()
      await fetchMyCard()
    } catch (error) {
      console.error("Error saving card:", error)
      setFormError("Error al guardar la tarjeta")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar tarjeta
  const handleDelete = async () => {
    if (!myCard) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/member-cards/${myCard.id}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setMyCard(null)
        await fetchCards()
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrar integrantes
  const integrantesFiltrados = filtroActivo === "todos" 
    ? integrantes 
    : integrantes.filter(integrante => integrante.tipo === filtroActivo)

  // Agrupar por tipo para vista de "todos"
  const integrantesPorTipo = integrantesFiltrados.reduce((acc, integrante) => {
    const tipo = integrante.tipo || "estudiante"
    if (!acc[tipo]) {
      acc[tipo] = []
    }
    acc[tipo].push(integrante)
    return acc
  }, {} as Record<UserRole, MemberCard[]>)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow w-full">
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Encabezado */}
            <div className="mb-12 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-accent-lighter text-accent font-medium text-xs mb-3">
                EQUIPO
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Nuestro Equipo
              </h1>
              <p className="text-foreground/60 max-w-2xl mx-auto text-base sm:text-lg">
                Conoce al equipo multidisciplinario comprometido con la investigación y desarrollo.
              </p>
            </div>

            {/* Boton para crear/editar mi tarjeta - Solo visible para usuarios logueados */}
            {user && !userLoading && (
              <div className="mb-8 flex justify-center">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-medium text-foreground">
                      {myCard ? "Tu tarjeta de integrante" : "Aún no tienes una tarjeta"}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {myCard 
                        ? "Puedes editar o eliminar tu tarjeta" 
                        : "Crea tu tarjeta para aparecer en el equipo"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {myCard ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEdit}
                          className="gap-2 bg-transparent"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleCreate}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Crear mi tarjeta
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Filtros */}
            <div className="mb-12">
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Filtrar por categoría:</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {filtrosConfig.map((filtro) => {
                    const Icon = filtro.icon
                    const isActive = filtroActivo === filtro.id
                    
                    return (
                      <button
                        key={filtro.id}
                        onClick={() => setFiltroActivo(filtro.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                          isActive ? filtro.activeColor : filtro.color
                        } ${isActive ? 'shadow-md scale-105' : 'shadow-sm hover:scale-105'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {filtro.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Contador de resultados */}
              <div className="text-center mb-8">
                <p className="text-foreground/70">
                  Mostrando <span className="font-semibold text-accent">{integrantesFiltrados.length}</span> integrantes
                </p>
              </div>
            </div>

            {/* Contenido principal */}
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="inline-block w-12 h-12 text-accent animate-spin mb-4" />
                <p className="text-foreground/50">Cargando información del equipo...</p>
              </div>
            ) : integrantes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-foreground/50 mb-4">No hay integrantes registrados</p>
                <p className="text-foreground/40 text-sm">
                  Los integrantes se mostrarán aquí una vez agregados al sistema.
                </p>
                {user && !myCard && (
                  <Button onClick={handleCreate} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Sé el primero en crear tu tarjeta
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Vista por categoría seleccionada */}
                {filtroActivo !== "todos" ? (
                  <div>
                    <div className="mb-8 text-center">
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {titulosPorTipo[filtroActivo as UserRole]}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {integrantesFiltrados.map((integrante) => (
                        <IntegranteCard 
                          key={integrante.id} 
                          integrante={integrante}
                          isOwner={user?.id === integrante.user_id}
                          canEdit={user !== null} // Solo usuarios autenticados pueden ver opciones de edición
                          onEdit={handleEdit}
                          onDelete={() => setIsDeleteDialogOpen(true)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  // Vista de todos los integrantes agrupados por tipo
                  <div className="space-y-16">
                    {(["admin", "tecnico", "docente", "estudiante"] as UserRole[]).map((tipo) => {
                      const integrantesDelTipo = integrantesPorTipo[tipo] || []
                      if (integrantesDelTipo.length === 0) return null
                      
                      return (
                        <div key={tipo}>
                          <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                              {filtrosConfig.find(f => f.id === tipo)?.icon && (
                                <div className={`p-2 rounded-lg ${
                                  filtrosConfig.find(f => f.id === tipo)?.color.split(' ')[0]
                                }`}>
                                  {(() => {
                                    const Icon = filtrosConfig.find(f => f.id === tipo)?.icon!
                                    return <Icon className="w-6 h-6" />
                                  })()}
                                </div>
                              )}
                              <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-foreground">
                                  {titulosPorTipo[tipo]}
                                </h2>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                  {integrantesDelTipo.length} integrantes
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {integrantesDelTipo.map((integrante) => (
                              <IntegranteCard 
                                key={integrante.id} 
                                integrante={integrante}
                                isOwner={user?.id === integrante.user_id}
                                canEdit={user !== null} // Solo usuarios autenticados pueden ver opciones de edición
                                onEdit={handleEdit}
                                onDelete={() => setIsDeleteDialogOpen(true)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Dialog para crear/editar tarjeta - Solo visible para usuarios autenticados */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {myCard ? "Editar mi tarjeta" : "Crear mi tarjeta"}
            </DialogTitle>
            <DialogDescription>
              Completa la información para {myCard ? "actualizar" : "crear"} tu tarjeta de integrante.
              Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Tu nombre completo"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Una breve descripción sobre ti, tu experiencia y especialidad..."
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="institucion">Institución</Label>
              <Input
                id="institucion"
                value={formData.institucion}
                onChange={(e) => setFormData(prev => ({ ...prev, institucion: e.target.value }))}
                placeholder="Universidad, empresa u organización"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+593 99 123 4567"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/tu-perfil"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="orcid">ORCID URL</Label>
              <Input
                id="orcid"
                value={formData.orcid}
                onChange={(e) => setFormData(prev => ({ ...prev, orcid: e.target.value }))}
                placeholder="https://orcid.org/0000-0000-0000-0000"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="foto_url">URL de la foto</Label>
              <Input
                id="foto_url"
                value={formData.foto_url}
                onChange={(e) => setFormData(prev => ({ ...prev, foto_url: e.target.value }))}
                placeholder="https://ejemplo.com/mi-foto.jpg"
              />
              {formData.foto_url && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border">
                    <Image
                      src={formData.foto_url || "/placeholder.svg"}
                      alt="Vista previa"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                  <p className="text-xs text-foreground/60">Vista previa de la imagen</p>
                </div>
              )}
              <p className="text-xs text-foreground/50">
                Pega la URL de tu foto. Formatos recomendados: JPG, PNG. Tamaño ideal: 400x400px o superior.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {myCard ? "Guardar cambios" : "Crear tarjeta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tarjeta</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar su tarjeta de integrante? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Componente para la tarjeta de integrante
function IntegranteCard({ 
  integrante, 
  isOwner,
  canEdit,
  onEdit,
  onDelete
}: { 
  integrante: MemberCard
  isOwner: boolean
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [imageError, setImageError] = useState(false)

  // Obtener config del tipo
  const tipoConfig = filtrosConfig.find(f => f.id === integrante.tipo)

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-2">
     
      
      
      {/* Badge de tipo 
      <div className="absolute top-4 left-4 z-10">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          tipoConfig?.color || 'bg-gray-100 text-gray-800'
        }`}>
          {tipoConfig?.icon && (() => {
            const Icon = tipoConfig.icon
            return <Icon className="w-3 h-3" />
          })()}
          {tipoConfig?.label}
        </span>
      </div>
       */}

      
      {/* Indicador de tarjeta propia - Solo visible si es dueño Y puede editar */}
      {isOwner && canEdit && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-accent text-white">
            Mi tarjeta
          </span>
        </div>
      )}

      {/* Foto */}
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
        {integrante.foto_url && !imageError ? (
          <Image
            src={integrante.foto_url || "/placeholder.svg"}
            alt={integrante.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center ${
              tipoConfig?.color.split(' ')[0] || 'bg-gray-200'
            }`}>
              {tipoConfig?.icon ? (() => {
                const Icon = tipoConfig.icon
                return <Icon className="w-12 h-12 text-white" />
              })() : <User className="w-12 h-12 text-white" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ImageIcon className="w-4 h-4" />
              <span>Sin foto</span>
            </div>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
            {integrante.nombre}
          </h3>

          {integrante.institucion && (
            <div className="flex items-start text-sm text-foreground/70 mb-3">
              <Building className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{integrante.institucion}</span>
            </div>
          )}
        </div>

        <p className="text-foreground/70 text-sm mb-6 line-clamp-4">
          {integrante.descripcion}
        </p>

        {/* Información de contacto */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          {integrante.email && (
            <div className="flex items-center text-sm text-foreground/60 hover:text-foreground transition-colors">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              <a 
                href={`mailto:${integrante.email}`}
                className="truncate hover:text-accent"
                title={integrante.email}
              >
                {integrante.email}
              </a>
            </div>
          )}

          {integrante.telefono && (
            <div className="flex items-center text-sm text-foreground/60 hover:text-foreground transition-colors">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <a 
                href={`tel:${integrante.telefono}`}
                className="hover:text-accent truncate"
                title={integrante.telefono}
              >
                {integrante.telefono}
              </a>
            </div>
          )}

          {/* Enlaces a redes profesionales */}
          <div className="flex flex-wrap gap-2 pt-3">
            {integrante.linkedin && (
              <a
                href={integrante.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {integrante.orcid && (
              <a
                href={integrante.orcid}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium transition-colors px-3 py-1.5 bg-green-50 rounded-lg hover:bg-green-100"
                title="ORCID"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zM7.369 4.378c.525 0 .946.431.946.956s-.421.957-.946.957a.95.95 0 0 1-.946-.957c0-.525.421-.956.946-.956zm2.48 0c.58 0 1.054.474 1.054 1.055s-.474 1.055-1.054 1.055c-.582 0-1.055-.474-1.055-1.055s.473-1.055 1.055-1.055zm2.566 0c.525 0 .946.431.946.956s-.421.957-.946.957a.95.95 0 0 1-.946-.957c0-.525.421-.956.946-.956zm2.48 0c.58 0 1.054.474 1.054 1.055s-.474 1.055-1.054 1.055c-.582 0-1.055-.474-1.055-1.055s.473-1.055 1.055-1.055zM5.5 7.5h13v9H5.5z"/>
                </svg>
                <span>ORCID</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Botones de acción - Solo visible para el dueño si puede editar */}
        {isOwner && canEdit && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-1 text-xs"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
