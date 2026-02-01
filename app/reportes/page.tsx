"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaracterizacionReportes } from "@/components/caracterizacion-reportes"
import { AutosustentabilidadReportes } from "@/components/autosustentabilidad-reportes"
import { Recycle, Users, FileText, Download, BarChart3 } from "lucide-react"

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState("caracterizacion")
  const [leafPositions, setLeafPositions] = useState<Array<{left: string, top: string, delay: string, duration: string, rotation: string}>>([])
  const [waterDrops, setWaterDrops] = useState<Array<{left: string, delay: string, duration: string}>>([])
  const [isClient, setIsClient] = useState(false)

  // Inicializar en el cliente con valores consistentes
  useEffect(() => {
    setIsClient(true)
    
    // Generar posiciones fijas basadas en índices (consistente entre server y client)
    const newLeafPositions = Array.from({ length: 12 }, (_, i) => {
      // Usar un valor determinístico basado en el índice
      const baseValue = i * 6.123 // Valor constante para distribución
      return {
        left: `${(Math.sin(baseValue) * 0.42 + 0.5) * 100}%`,
        top: `${(Math.cos(baseValue * 1.15) * 0.42 + 0.5) * 100}%`,
        delay: `${(i * 1.55) % 10}s`,
        duration: `${20 + (i * 1.15) % 20}s`,
        rotation: `${(i * 27) % 360}deg`
      }
    })
    
    const newWaterDrops = Array.from({ length: 8 }, (_, i) => {
      const baseDelay = i * 0.72
      return {
        left: `${10 + (i * 12)}%`,
        delay: `${(baseDelay * 1.22) % 3}s`,
        duration: `${2 + (baseDelay * 0.42) % 2}s`
      }
    })
    
    setLeafPositions(newLeafPositions)
    setWaterDrops(newWaterDrops)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="flex-grow w-full">
        {/* Hero Section Mejorado */}
        <section className="gradient-eco text-white py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden">
          {/* Hojas flotantes animadas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Renderizar en el cliente para evitar mismatch de hydratación */}
            {isClient && leafPositions.map((pos, i) => (
              <div
                key={i}
                className="absolute opacity-20 animate-leaf-float"
                style={{
                  left: pos.left,
                  top: pos.top,
                  animationDelay: pos.delay,
                  animationDuration: pos.duration,
                  transform: `rotate(${pos.rotation})`,
                }}
              >
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="text-white/30"
                >
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.85C7.14 19.15 7.71 18.44 8.29 17.74C9.73 16.06 11.09 14.38 12.27 12.91C14.77 14.825 17.11 16.325 19.34 17.56C19.65 17.74 19.94 17.91 20.23 18.07L22 16.92C21.43 14.1 20.34 10.73 17 8M10 5C10 5 11 4 12 2C13 4 14 5 14 5C14 5 13 6 12 8C11 6 10 5 10 5Z" />
                </svg>
              </div>
            ))}
          </div>

          {/* Gotas de agua cayendo - Solo en cliente */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {isClient && waterDrops.map((drop, i) => (
              <div
                key={i}
                className="absolute w-2 h-8 animate-water-drop"
                style={{
                  left: drop.left,
                  animationDelay: drop.delay,
                  animationDuration: drop.duration,
                }}
              >
                <div className="w-full h-full bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Plantas decorativas en los bordes */}
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-48 h-48 animate-plant-sway">
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100"
                fill="currentColor"
                className="text-white/20"
              >
                <path d="M30,95 Q40,70 50,85 Q60,70 70,95" />
                <path d="M40,95 Q45,80 50,90 Q55,80 60,95" />
              </svg>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-48 h-48 animate-plant-sway-reverse">
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100"
                fill="currentColor"
                className="text-white/20"
              >
                <path d="M70,95 Q60,70 50,85 Q40,70 30,95" />
                <path d="M60,95 Q55,80 50,90 Q45,80 40,95" />
              </svg>
            </div>
          </div>

          {/* Brillo sutil en el centro */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/10 to-emerald-500/0 blur-3xl animate-shimmer-slow"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Badge con efecto glow */}
            <div className="inline-block relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-400/20 to-emerald-500/20 rounded-full blur animate-glow"></div>
              <span className="relative inline-block px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium backdrop-blur-sm">
                REPORTES Y EXPORTACIÓN
              </span>
            </div>

            {/* Título con animación de revelado */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight animate-text-reveal">
              Centro de Reportes
            </h1>

            {/* Descripción con animación retrasada */}
            <div className="max-w-2xl">
              <p className="text-base sm:text-lg md:text-xl text-white/90 text-balance leading-relaxed animate-text-reveal-delay">
                Visualiza, filtra y exporta datos de caracterización de desechos sólidos y autosustentabilidad en múltiples formatos.
              </p>
              
              {/* Elemento decorativo de hojas */}
              <div className="mt-6 flex items-center gap-3 animate-text-reveal-delay">
                <div className="flex">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-4 h-4 -ml-1 opacity-60">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="text-emerald-300">
                        <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5 s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z"/>
                      </svg>
                    </div>
                  ))}
                </div>
                <span className="text-sm text-emerald-300/70 font-medium">
                  Visualización • Análisis • Exportación
                </span>
              </div>
            </div>
          </div>

          {/* Estilos de animación */}
          <style jsx global>{`
            @keyframes leaf-float {
              0%, 100% { 
                transform: translateY(0) translateX(0) rotate(var(--start-rotate, 0deg));
              }
              25% { 
                transform: translateY(-40px) translateX(20px) rotate(calc(var(--start-rotate, 0deg) + 90deg));
              }
              50% { 
                transform: translateY(-20px) translateX(-20px) rotate(calc(var(--start-rotate, 0deg) + 180deg));
              }
              75% { 
                transform: translateY(20px) translateX(30px) rotate(calc(var(--start-rotate, 0deg) + 270deg));
              }
            }

            @keyframes water-drop {
              0% {
                transform: translateY(-100px);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(300px);
                opacity: 0;
              }
            }

            @keyframes plant-sway {
              0%, 100% { transform: translateX(0) rotate(-2deg); }
              50% { transform: translateX(10px) rotate(2deg); }
            }

            @keyframes plant-sway-reverse {
              0%, 100% { transform: translateX(0) rotate(2deg); }
              50% { transform: translateX(-10px) rotate(-2deg); }
            }

            @keyframes glow {
              0%, 100% { 
                box-shadow: 0 0 5px rgba(72, 187, 120, 0.3);
              }
              50% { 
                box-shadow: 0 0 20px rgba(72, 187, 120, 0.6);
              }
            }

            @keyframes text-reveal {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes shimmer-slow {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }

            .animate-leaf-float {
              animation: leaf-float linear infinite;
            }

            .animate-water-drop {
              animation: water-drop linear infinite;
            }

            .animate-plant-sway {
              animation: plant-sway 8s ease-in-out infinite;
            }

            .animate-plant-sway-reverse {
              animation: plant-sway-reverse 8s ease-in-out infinite;
            }

            .animate-glow {
              animation: glow 3s ease-in-out infinite;
            }

            .animate-text-reveal {
              animation: text-reveal 1s ease-out forwards;
            }

            .animate-text-reveal-delay {
              animation: text-reveal 1s ease-out 0.5s forwards;
              opacity: 0;
            }

            .animate-shimmer-slow {
              animation: shimmer-slow 8s infinite linear;
            }

            /* Mantener el color original del hero */
            .gradient-eco {
              background: linear-gradient(135deg, #0e8b4d 0%, #24b12f 25%, #17a72f 50%, #13642e 75%, #0b632d 100%);
              position: relative;
              overflow: hidden;
            }

            /* Efecto de luz solar filtrada */
            .gradient-eco::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: 
                radial-gradient(
                  circle at 20% 80%,
                  rgba(34, 197, 94, 0.15) 0%,
                  transparent 50%
                ),
                radial-gradient(
                  circle at 80% 20%,
                  rgba(20, 184, 166, 0.15) 0%,
                  transparent 50%
                );
              pointer-events: none;
              animation: sunlight-shift 20s ease-in-out infinite alternate;
            }

            @keyframes sunlight-shift {
              0% {
                background-position: 20% 80%, 80% 20%;
              }
              100% {
                background-position: 30% 70%, 70% 30%;
              }
            }

            /* Patrón de hojas muy sutiles de fondo */
            .gradient-eco::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: 
                radial-gradient(circle at 10% 20%, rgba(11, 65, 30, 0.03) 0%, transparent 2%),
                radial-gradient(circle at 90% 40%, rgba(14, 247, 99, 0.03) 0%, transparent 2%),
                radial-gradient(circle at 50% 80%, rgba(34, 197, 94, 0.03) 0%, transparent 2%),
                radial-gradient(circle at 30% 60%, rgba(34, 197, 94, 0.03) 0%, transparent 2%),
                radial-gradient(circle at 70% 10%, rgba(34, 197, 94, 0.03) 0%, transparent 2%);
              background-size: 200px 200px;
              pointer-events: none;
            }
          `}</style>
        </section>

        {/* Main Content */}
        <section className="py-8 sm:py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs responsivos con texto ajustado */}
              <TabsList className="flex w-full mb-8 h-auto p-1 overflow-x-auto">
                <TabsTrigger 
                  value="caracterizacion" 
                  className="flex-1 min-w-0 text-xs sm:text-sm md:text-base py-3 px-2 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center justify-center gap-1 sm:gap-2 truncate"
                >
                  <Recycle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate px-1">
                    <span className="hidden xs:inline">Caracterización</span>
                    <span className="xs:hidden">Caracterización</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="autosustentabilidad" 
                  className="flex-1 min-w-0 text-xs sm:text-sm md:text-base py-3 px-2 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center justify-center gap-1 sm:gap-2 truncate"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate px-1">
                    <span className="hidden sm:inline">Autosustentabilidad</span>
                    <span className="sm:hidden">Autosust.</span>
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="caracterizacion" className="mt-0">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                    <span className="hidden sm:inline">Caracterización de Desechos Sólidos</span>
                    <span className="sm:hidden">Caracterización Desechos</span>
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    <span className="hidden sm:inline">
                      Genera reportes de la caracterización de desechos sólidos domiciliarios con gráficos, tablas y exportación en múltiples formatos.
                    </span>
                    <span className="sm:hidden">
                      Reportes de desechos sólidos con gráficos, tablas y exportación.
                    </span>
                  </p>
                </div>
                <CaracterizacionReportes />
              </TabsContent>

              <TabsContent value="autosustentabilidad" className="mt-0">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                    <span className="hidden sm:inline">Autosustentabilidad y Comportamiento Proambiental</span>
                    <span className="sm:hidden">Autosustentabilidad</span>
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    <span className="hidden md:inline">
                      Genera reportes del cuestionario de comportamiento proambiental con análisis por secciones: Distribución Demográfica, Determinantes Socioculturales, Afectivos, Cognitivos, Sustentabilidad Ambiental, Económica y Desarrollo Comunitario.
                    </span>
                    <span className="hidden sm:inline md:hidden">
                      Reportes de comportamiento proambiental con análisis por secciones: Sociocultural, Afectivo, Cognitivo, Sustentabilidad.
                    </span>
                    <span className="sm:hidden">
                      Reportes de comportamiento proambiental con análisis completo.
                    </span>
                  </p>
                </div>
                <AutosustentabilidadReportes />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}