"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CardEncuesta } from "@/components/card-encuesta"
import { Info, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function FormulariosPage() {
  // Estado para manejar valores consistentes entre server y client
  const [leafPositions, setLeafPositions] = useState<Array<{left: string, top: string, delay: string, duration: string, rotation: string}>>([])
  const [waterDrops, setWaterDrops] = useState<Array<{left: string, delay: string, duration: string}>>([])
  const [isClient, setIsClient] = useState(false)

  // Inicializar en el cliente con valores consistentes
  useEffect(() => {
    setIsClient(true)
    
    // Generar posiciones fijas basadas en índices (consistente entre server y client)
    const newLeafPositions = Array.from({ length: 12 }, (_, i) => {
      // Usar un valor determinístico basado en el índice
      const baseValue = i * 5.834 // Valor constante para distribución
      return {
        left: `${(Math.sin(baseValue) * 0.43 + 0.5) * 100}%`,
        top: `${(Math.cos(baseValue * 1.18) * 0.43 + 0.5) * 100}%`,
        delay: `${(i * 1.58) % 10}s`,
        duration: `${20 + (i * 1.18) % 20}s`,
        rotation: `${(i * 26) % 360}deg`
      }
    })
    
    const newWaterDrops = Array.from({ length: 8 }, (_, i) => {
      const baseDelay = i * 0.74
      return {
        left: `${10 + (i * 12)}%`,
        delay: `${(baseDelay * 1.24) % 3}s`,
        duration: `${2 + (baseDelay * 0.43) % 2}s`
      }
    })
    
    setLeafPositions(newLeafPositions)
    setWaterDrops(newWaterDrops)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full">
        {/* Hero Section Profesional Mejorado */}
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
                ENCUESTAS Y PARTICIPACIÓN
              </span>
            </div>

            {/* Título con animación de revelado */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight animate-text-reveal">
              Encuestas y Formularios
            </h1>

            {/* Descripción con animación retrasada */}
            <div className="max-w-2xl">
              <p className="text-base sm:text-lg md:text-xl text-white/90 text-balance leading-relaxed animate-text-reveal-delay">
                Tu participación es fundamental para mejorar la gestión de residuos sólidos. Completa
                nuestras encuestas y aporta información valiosa para diseñar soluciones efectivas.
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
                  Participación • Información • Soluciones
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

        {/* Instrucciones de uso */}
        <section className="py-12 sm:py-16 md:py-20 bg-primary-lighter/10 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3 mb-6 sm:mb-8">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Cómo usar las encuestas
                </h2>
                <p className="text-foreground/60 text-base sm:text-lg">
                  Nuestras encuestas están alojadas en Tally, una plataforma segura y fácil de usar. Sigue estas
                  instrucciones para completar tu participación.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-card rounded-xl p-5 sm:p-6 border border-border shadow-sm transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-lighter flex items-center justify-center mb-4">
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base sm:text-lg">Puedes retroceder</h3>
                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                  Durante la encuesta, puedes retroceder a preguntas anteriores para revisar o modificar tus respuestas
                  antes de finalizar. No te preocupes si necesitas corregir algo.
                </p>
              </div>

              <div className="bg-white dark:bg-card rounded-xl p-5 sm:p-6 border border-border shadow-sm transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-lighter flex items-center justify-center mb-4">
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base sm:text-lg">Responde múltiples veces</h3>
                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                  Una vez finalizada la encuesta, puedes recargar la página del enlace para llenar una nueva encuesta.
                  Esto es útil si deseas proporcionar información adicional o de otro hogar.
                </p>
              </div>

              <div className="bg-white dark:bg-card rounded-xl p-5 sm:p-6 border border-border shadow-sm transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent3-lighter flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-accent3" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base sm:text-lg">Seguro y confidencial</h3>
                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                  Todas las encuestas están alojadas en Tally, una plataforma segura que protege tu información. Tus
                  respuestas son confidenciales y se utilizarán únicamente con fines de investigación.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-accent-lighter/20 border border-accent-lighter rounded-lg">
              <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
                <strong className="text-foreground">Nota:</strong> Las encuestas están optimizadas para funcionar en
                cualquier dispositivo. Te recomendamos completarlas en un ambiente tranquilo donde puedas concentrarte y
                proporcionar información precisa.
              </p>
            </div>
          </div>
        </section>

        {/* Encuestas */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 sm:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-accent-lighter text-accent font-medium text-xs mb-3">
                FORMULARIOS DISPONIBLES
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Encuestas disponibles</h2>
              <p className="text-foreground/60 max-w-3xl text-base sm:text-lg">
                Selecciona una encuesta para participar. Tu información nos ayudará a entender mejor las características
                de los desechos y los comportamientos proambientales de nuestra comunidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <CardEncuesta
                numero={1}
                titulo="Autosustentabilidad y comportamiento proambiental"
                objetivo="Recopilar información acerca de los factores que inciden en el comportamiento proambiental y la autosustentabilidad en el manejo de los desechos sólidos domiciliarios"
                enlace="https://tally.so/r/nrNo9M"
                color="accent"
              />
              <CardEncuesta
                numero={2}
                titulo="Caracterización de los desechos sólidos en la comunidad"
                objetivo="Caracterizar los desechos sólidos que se generan en los hogares"
                enlace="https://tally.so/r/3jd0da"
                color="primary"
              />
            </div>
          </div>
        </section>

        {/* Información adicional */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-secondary-bg border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-lighter text-primary font-medium text-xs mb-6">
              IMPORTANCIA DE TU PARTICIPACIÓN
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-8 sm:mb-12">
              ¿Por qué es importante tu respuesta?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="card-elevated p-6 sm:p-8">
                <div className="w-3 h-3 rounded-full bg-primary mb-4"></div>
                <h3 className="font-bold text-foreground mb-3 text-base sm:text-lg">Información confiable</h3>
                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                  Los datos que recopilas ayudan a crear una base de información sólida para la toma de decisiones
                  basadas en evidencia.
                </p>
              </div>
              <div className="card-elevated p-6 sm:p-8">
                <div className="w-3 h-3 rounded-full bg-accent mb-4"></div>
                <h3 className="font-bold text-foreground mb-3 text-base sm:text-lg">Mejora continua</h3>
                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                  Tu retroalimentación nos permite identificar áreas de mejora y diseñar programas y políticas más
                  efectivas.
                </p>
              </div>
              <div className="card-elevated p-6 sm:p-8">
                <div className="w-3 h-3 rounded-full bg-accent3 mb-4"></div>
                <h3 className="font-bold text-foreground mb-3 text-base sm:text-lg">Participación ciudadana</h3>
                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                  Tu voz importa. Sé parte de la solución para una comunidad más sostenible, limpia y responsable.
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