"use client";

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"

export default function AvancesPage() {
  const driveFolderUrl = "https://drive.google.com/embeddedfolderview?id=1OuiRdKB0fTZ6IufXDE2mkzwDhAsqMjaG#list"
  const [leafPositions, setLeafPositions] = useState<Array<{left: string, top: string, delay: string, duration: string, rotation: string}>>([])
  const [waterDrops, setWaterDrops] = useState<Array<{left: string, delay: string, duration: string}>>([])
  const [isClient, setIsClient] = useState(false)

  // Inicializar en el cliente con valores consistentes
  useEffect(() => {
    setIsClient(true)
    
    // Generar posiciones fijas basadas en índices (consistente entre server y client)
    const newLeafPositions = Array.from({ length: 12 }, (_, i) => {
      // Usar un valor determinístico basado en el índice
      const baseValue = i * 5.987 // Valor constante para distribución
      return {
        left: `${(Math.sin(baseValue) * 0.45 + 0.5) * 100}%`,
        top: `${(Math.cos(baseValue * 1.2) * 0.45 + 0.5) * 100}%`,
        delay: `${(i * 1.6) % 10}s`,
        duration: `${20 + (i * 1.2) % 20}s`,
        rotation: `${(i * 28) % 360}deg`
      }
    })
    
    const newWaterDrops = Array.from({ length: 8 }, (_, i) => {
      const baseDelay = i * 0.75
      return {
        left: `${10 + (i * 12)}%`,
        delay: `${(baseDelay * 1.25) % 3}s`,
        duration: `${2 + (baseDelay * 0.45) % 2}s`
      }
    })
    
    setLeafPositions(newLeafPositions)
    setWaterDrops(newWaterDrops)
  }, [])

  const handleRefresh = () => {
    // Obtener el iframe
    const iframe = document.querySelector('iframe[title="Google Drive - Progreso Ecológico"]') as HTMLIFrameElement
    if (iframe) {
      // Recargar el iframe forzando una nueva carga
      const currentSrc = iframe.src
      iframe.src = ''
      setTimeout(() => {
        iframe.src = currentSrc
      }, 100)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="flex-grow w-full">
        {/* Hero Section Mejorado con Animaciones */}
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
                SEGUIMIENTO Y PROGRESO
              </span>
            </div>

            {/* Título con animación de revelado */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight animate-text-reveal">
              Avances
            </h1>

            {/* Descripción con animación retrasada */}
            <div className="max-w-2xl">
              <p className="text-base sm:text-lg md:text-xl text-white/90 text-balance leading-relaxed animate-text-reveal-delay">
                Monitoreo del avance en la implementación de programas ecológicos y cumplimiento de objetivos.
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
                  Monitoreo • Progreso • Resultados
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

        {/* Sección principal de Google Drive */}
        <section className="py-12 sm:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Panel izquierdo - Información */}
              <div className="lg:col-span-1">
                <div className="card-elevated p-6 h-fit">
                  <h2 className="text-2xl font-bold text-primary-text mb-6">VISTA DIRECTA</h2>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-gray-700">Archivos sincronizados automáticamente</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-gray-700">Acceso protegido y restringido</span>
                      </li>
                    </ul>
                  </div>

                  <a
                    href="https://drive.google.com/drive/folders/1OuiRdKB0fTZ6IufXDE2mkzwDhAsqMjaG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/>
                    </svg>
                    <span className="font-semibold">Ver en Google Drive</span>
                  </a>
                </div>
              </div>

              {/* Panel derecho - Vista de Google Drive */}
              <div className="lg:col-span-2">
                <div className="card-elevated p-0 overflow-hidden h-[700px]">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Google Drive - Documentos del Proyecto
                        </h3>
                      </div>
                      <button 
                        onClick={handleRefresh}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white text-sm font-medium rounded hover:from-[#1B5E20] hover:to-[#2E7D32] transition-all shadow-sm hover:shadow"
                      >
                        Refrescar
                      </button>
                    </div>
                  </div>

                  {/* Vista embebida de Google Drive - Sin scroll */}
                  <div className="h-[calc(700px-73px)] overflow-hidden">
                    <iframe
                      src={driveFolderUrl}
                      className="w-full h-full border-0"
                      title="Google Drive - Progreso Ecológico"
                      allow="autoplay; fullscreen"
                      loading="lazy"
                    />
                  </div>
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