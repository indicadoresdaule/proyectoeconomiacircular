"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  User, Mail, Phone, Linkedin, 
  Users, Shield, Briefcase, GraduationCap,
  Loader2, ExternalLink, Building
} from "lucide-react"

// Tipos
type TipoIntegrante = "lider" | "tecnico" | "docente" | "estudiante"

interface Integrante {
  id: string
  user_id?: string
  nombre: string
  descripcion: string
  foto_url: string | null
  email: string | null
  telefono: string | null
  linkedin: string | null
  orcid: string | null
  tipo: TipoIntegrante
  institucion: string | null
  orden: number
  is_active: boolean
}

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
    id: "lider",
    label: "Liderazgo",
    icon: Shield,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    activeColor: "bg-purple-600 text-white"
  },
  {
    id: "tecnico",
    label: "Técnicos",
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

// Datos de ejemplo
const integrantesEjemplo: Integrante[] = [
  {
    id: "1",
    nombre: "Dr. Carlos Andrés Méndez",
    descripcion: "Doctor en Ciencias Ambientales con 20 años de experiencia en gestión y liderazgo de equipos multidisciplinarios. Especializado en políticas ambientales y desarrollo sostenible.",
    foto_url: null,
    email: "carlos.mendez@ejemplo.com",
    telefono: "+593 99 123 4567",
    linkedin: "https://linkedin.com/in/carlos-mendez",
    orcid: "https://orcid.org/0000-0002-1825-0097",
    tipo: "lider",
    institucion: "Universidad Central",
    orden: 1,
    is_active: true
  },
  {
    id: "2",
    nombre: "Ing. María Fernanda López",
    descripcion: "Ingeniera ambiental especializada en sistemas de monitoreo y evaluación de impacto ambiental. Ha trabajado en más de 50 proyectos de conservación a nivel nacional.",
    foto_url: null,
    email: "maria.lopez@ejemplo.com",
    telefono: "+593 98 765 4321",
    linkedin: "https://linkedin.com/in/maria-lopez",
    orcid: "https://orcid.org/0000-0001-2345-6789",
    tipo: "tecnico",
    institucion: "Ministerio del Ambiente",
    orden: 2,
    is_active: true
  },
  {
    id: "3",
    nombre: "Dra. Lucía Elizabeth Vargas",
    descripcion: "Doctora en Biología con especialización en ecología de sistemas acuáticos y conservación. Publicó más de 30 artículos científicos en revistas internacionales.",
    foto_url: null,
    email: "lucia.vargas@ejemplo.com",
    telefono: "+593 97 555 8888",
    linkedin: "https://linkedin.com/in/lucia-vargas",
    orcid: "https://orcid.org/0000-0003-4567-8901",
    tipo: "docente",
    institucion: "Universidad San Francisco",
    orden: 3,
    is_active: true
  },
  {
    id: "4",
    nombre: "Juan Pablo Ortega",
    descripcion: "Estudiante de maestría en Ciencias Ambientales, investigador en tratamiento de aguas residuales. Actualmente desarrolla su tesis sobre bioremediación de ecosistemas acuáticos.",
    foto_url: null,
    email: "juan.ortega@ejemplo.com",
    telefono: "+593 96 444 3333",
    linkedin: "https://linkedin.com/in/juan-ortega",
    orcid: "https://orcid.org/0000-0004-5678-9012",
    tipo: "estudiante",
    institucion: "Universidad Técnica",
    orden: 4,
    is_active: true
  }
]

const titulosPorTipo: Record<TipoIntegrante, string> = {
  lider: "Equipo de Liderazgo",
  tecnico: "Especialistas Técnicos",
  docente: "Cuerpo Docente",
  estudiante: "Estudiantes Investigadores"
}

export default function IntegrantesPage() {
  const [integrantes, setIntegrantes] = useState<Integrante[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroActivo, setFiltroActivo] = useState<string>("todos")

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntegrantes(integrantesEjemplo)
      setLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [])

  // Filtrar integrantes
  const integrantesFiltrados = filtroActivo === "todos" 
    ? integrantes 
    : integrantes.filter(integrante => integrante.tipo === filtroActivo)

  // Agrupar por tipo para vista de "todos"
  const integrantesPorTipo = integrantesFiltrados.reduce((acc, integrante) => {
    if (!acc[integrante.tipo]) {
      acc[integrante.tipo] = []
    }
    acc[integrante.tipo].push(integrante)
    return acc
  }, {} as Record<TipoIntegrante, Integrante[]>)

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
              </div>
            ) : (
              <>
                {/* Vista por categoría seleccionada */}
                {filtroActivo !== "todos" ? (
                  <div>
                    <div className="mb-8 text-center">
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {titulosPorTipo[filtroActivo as TipoIntegrante]}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {integrantesFiltrados.map((integrante) => (
                        <IntegranteCard key={integrante.id} integrante={integrante} />
                      ))}
                    </div>
                  </div>
                ) : (
                  // Vista de todos los integrantes agrupados por tipo
                  <div className="space-y-16">
                    {Object.entries(integrantesPorTipo).map(([tipo, integrantesDelTipo]) => (
                      integrantesDelTipo.length > 0 && (
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
                                  {titulosPorTipo[tipo as TipoIntegrante]}
                                </h2>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                  {integrantesDelTipo.length} integrantes
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {integrantesDelTipo.map((integrante) => (
                              <IntegranteCard key={integrante.id} integrante={integrante} />
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// Componente para la tarjeta de integrante
function IntegranteCard({ integrante }: { integrante: Integrante }) {
  const [imageError, setImageError] = useState(false)

  // Obtener config del tipo
  const tipoConfig = filtrosConfig.find(f => f.id === integrante.tipo)

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-2">
      {/* Badge de tipo */}
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

      {/* Foto */}
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
        {integrante.foto_url && !imageError ? (
          <Image
            src={integrante.foto_url}
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
            <p className="text-sm text-gray-500 text-center">Foto no disponible</p>
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
          <div className="flex gap-3 pt-3">
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
      </div>
    </div>
  )
}
