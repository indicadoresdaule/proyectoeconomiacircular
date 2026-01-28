"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CardNavegacion } from "@/components/card-navegacion"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full">
        {/* Hero Section Profesional */}
        <section className="gradient-eco text-white py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="container-safe relative z-10">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-4">
                Sistema de Seguimiento e Indicadores
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight">
                Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 text-balance leading-relaxed">
                Plataforma integral de monitoreo y evaluación para la gestión sostenible de residuos. 
                Consulte métricas, indicadores de desempeño y objetivos ambientales
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Tarjetas Mejorada */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-background">
          <div className="container-safe">
            <div className="mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-accent-lighter text-accent font-medium text-xs mb-3">
                SECCIONES PRINCIPALES
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Navega por el contenido
              </h2>
              <p className="text-foreground/60 max-w-2xl text-base sm:text-lg">
                Accede a detalles sobre nuestros compromisos ecológicos y métricas 
                actualizadas de manejo de desechos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <CardNavegacion
                href="/metas"
                titulo="Metas"
                descripcion="Objetivos y compromisos ecológicos establecidos para optimizar el manejo de desechos."
                color="primary"
              />
              <CardNavegacion
                href="/indicadores"
                titulo="Indicadores"
                descripcion="Datos actualizados y visualizaciones sobre composición de desechos y prácticas sostenibles."
                color="accent"
              />
              <CardNavegacion
                href="/avances"
                titulo="Avances"
                descripcion="Monitoreo del progreso e implementación de nuestros programas ecológicos."
                color="accent2"
                deshabilitado={true}
              />
              <CardNavegacion
                href="/reportes"
                titulo="Reportes"
                descripcion="Documentos técnicos, análisis detallados y estudios completos."
                color="accent4"
                deshabilitado={true}
              />
              <CardNavegacion
                href="/formularios"
                titulo="Formularios"
                descripcion="Participa en nuestras encuestas y contribuye con información para mejorar políticas."
                color="accent3"
                deshabilitado={true}
              />
              <CardNavegacion
                href="/integrantes"
                titulo="Nuestro Equipo"
                descripcion="Conoce a los profesionales responsables de la gestión ecológica."
                color="primary"
                deshabilitado={true}
              />
            </div>
          </div>
        </section>

        {/* Sección Informativa Profesional */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-secondary-bg border-y border-border">
          <div className="container-safe">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-lighter text-primary font-medium text-xs mb-6">
              SOBRE ESTE PROYECTO
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-8 sm:mb-12">
              Compromiso ecológico
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="card-elevated p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Nuestra Visión</h3>
                <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">
                  Promovemos la sostenibilidad y el manejo responsable de desechos. 
                  Este sitio web muestra nuestro trabajo por transparencia, participación 
                  comunitaria y mejora continua en políticas ecológicas.
                </p>
              </div>
              
              <div className="card-elevated p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">Economía Circular Aplicada</h3>
                <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">
                  Implementamos principios circulares que transforman externalidades negativas 
                  en capital ecológico y comunitario. Nuestro enfoque integra análisis de ciclo 
                  de vida, diseño regenerativo y cadenas de valor cerradas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
