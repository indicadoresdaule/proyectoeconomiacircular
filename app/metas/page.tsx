import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function MetasPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="gradient-eco text-white py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="container-safe relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-4">
              METAS OPERACIONALES
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-balance leading-tight">
              Metas del Proyecto
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl text-balance leading-relaxed">
              Objetivos específicos para la gestión integral de residuos sólidos domiciliarios bajo criterios de economía circular.
            </p>
          </div>
        </section>

        {/* Contenido Principal - Metas */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-background">
          <div className="container-safe">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-lighter text-primary font-medium text-xs mb-6">
              METAS ESPECÍFICAS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-text mb-6 sm:mb-8">
              Metas Estratégicas para la Gestión de Residuos
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Meta 1: Registro y Análisis */}
              <div className="card-elevated p-6 sm:p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold text-primary-text mb-4">
                  Registro y Caracterización de Residuos
                </h3>
                <ul className="space-y-3 flex-grow">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Registrar y sistematizar información sobre generación y composición de residuos sólidos domiciliarios</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Analizar datos para clasificación precisa de residuos</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Identificar oportunidades de reutilización, reciclaje y valorización</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Establecer base de datos confiable para toma de decisiones</p>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    ECONOMÍA CIRCULAR
                  </span>
                </div>
              </div>

              {/* Meta 2: Monitoreo e Implementación */}
              <div className="card-elevated p-6 sm:p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold text-primary-text mb-4">
                  Monitoreo y Optimización
                </h3>
                <ul className="space-y-3 flex-grow">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Monitorear implementación de estrategias de manejo de residuos</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Aplicar guías metodológicas y buenas prácticas establecidas</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Implementar procesos de capacitación comunitaria</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Reducir impactos ambientales y riesgos para la salud</p>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    GESTIÓN OPTIMIZADA
                  </span>
                </div>
              </div>

              {/* Meta 3: Evaluación del Comportamiento */}
              <div className="card-elevated p-6 sm:p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold text-primary-text mb-4">
                  Evaluación del Comportamiento Proambiental
                </h3>
                <ul className="space-y-3 flex-grow">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Evaluar evolución del comportamiento proambiental de la población</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Medir prácticas de reducción, reutilización y reciclaje</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Desarrollar e implementar indicadores específicos</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-secondary-text text-sm sm:text-base">Integrar resultados en sistema de gestión proambiental</p>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    INDICADORES DE IMPACTO
                  </span>
                </div>
              </div>
            </div>

            {/* Sección de Enfoque Integrado */}
            <div className="mt-12 sm:mt-16 md:mt-20">
              <div className="card-elevated p-6 sm:p-8 md:p-10 bg-gradient-to-r from-primary-lighter/20 to-primary/5 border border-primary/10">
                <h3 className="text-xl sm:text-2xl font-bold text-primary-text mb-4">
                  Enfoque Integrado de Gestión
                </h3>
                <p className="text-secondary-text text-base sm:text-lg leading-relaxed mb-6">
                  Estas metas operacionales forman parte de un sistema integrado que combina la recopilación de datos técnicos, 
                  la implementación práctica de estrategias y la evaluación continua del impacto conductual, todo orientado hacia 
                  la economía circular y la sostenibilidad comunitaria.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Sostenibilidad Comunitaria
                  </span>
                  <span className="inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Gestión Basada en Datos
                  </span>
                  <span className="inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Capacitación Continua
                  </span>
                  <span className="inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Evaluación de Impacto
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
