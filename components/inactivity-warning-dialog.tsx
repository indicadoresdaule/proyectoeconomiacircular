"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Clock, AlertTriangle, RefreshCw, LogOut } from "lucide-react"
import { useEffect, useState } from "react"

interface InactivityWarningDialogProps {
  open: boolean
  remainingTime: number
  onExtend: () => void
  onLogout: () => void
}

export function InactivityWarningDialog({
  open,
  remainingTime,
  onExtend,
  onLogout,
}: InactivityWarningDialogProps) {
  const minutes = Math.floor(remainingTime / 60)
  const seconds = remainingTime % 60

  const formatTime = () => {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Determinar nivel de urgencia
  const isCritical = remainingTime <= 30
  const isWarning = remainingTime <= 60

  // Estado para controlar la animación del botón
  const [isPulsing, setIsPulsing] = useState(false)

  // Efecto para controlar la animación de pulso en estado crítico
  useEffect(() => {
    if (isCritical && open) {
      setIsPulsing(true)
    } else {
      setIsPulsing(false)
    }
  }, [isCritical, open])

  // Función para manejar el clic en "Mantener sesión"
  const handleExtendClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPulsing(false) // Detener animación inmediatamente
    onExtend()
  }

  // Función para manejar el clic en "Cerrar ahora"
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onLogout()
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent 
        className="max-w-md border-0 shadow-2xl"
        id="inactivity-dialog"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative p-1">
          {/* Indicador de tiempo crítico */}
          {isCritical && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1 w-1 animate-ping rounded-full bg-red-500"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          
          <AlertDialogHeader className="space-y-4">
            {/* Icono animado */}
            <div className="flex items-center justify-center">
              <div className={`relative flex h-16 w-16 items-center justify-center rounded-full ${
                isCritical 
                  ? "bg-red-50 animate-pulse" 
                  : isWarning 
                  ? "bg-amber-50" 
                  : "bg-blue-50"
              }`}>
                {isCritical ? (
                  <div className="relative">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                ) : (
                  <Clock className="h-8 w-8 text-amber-600" />
                )}
              </div>
            </div>
            
            {/* Título */}
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                {isCritical ? "¡Sesión por expirar!" : "Sesión inactiva"}
              </AlertDialogTitle>
              
              <AlertDialogDescription className="text-base text-muted-foreground">
                {isCritical 
                  ? "Tu sesión se cerrará automáticamente por seguridad."
                  : "Tu sesión se cerrará pronto debido a inactividad."
                }
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          {/* Contador regresivo */}
          <div className="my-6 space-y-3">
            <div className="text-center">
              <span className="text-sm font-medium text-muted-foreground">
                {isCritical ? "Tiempo restante" : "Dispones de"}
              </span>
            </div>
            
            <div className={`relative mx-auto w-fit overflow-hidden rounded-2xl p-1 ${
              isCritical 
                ? "bg-gradient-to-r from-red-500/20 to-orange-500/20" 
                : "bg-gradient-to-r from-blue-500/20 to-amber-500/20"
            }`}>
              {/* Barra de progreso animada */}
              <div 
                className={`absolute bottom-0 left-0 h-1 ${
                  isCritical ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-amber-500"
                }`}
                style={{ 
                  width: `${(remainingTime / 300) * 100}%`, // 5 minutos = 300 segundos
                  transition: "width 1s linear"
                }}
              />
              
              <div 
                className={`relative rounded-xl border px-8 py-6 backdrop-blur-sm ${
                  isCritical 
                    ? "border-red-200/50 bg-gradient-to-b from-red-50/80 to-white" 
                    : "border-amber-200/50 bg-gradient-to-b from-amber-50/50 to-white"
                }`}
              >
                <div className="text-center">
                  <div className={`text-5xl font-bold font-mono tracking-tighter ${
                    isCritical 
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600"
                      : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-amber-600"
                  }`}>
                    {formatTime()}
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    minutos : segundos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleLogoutClick}
              size="lg"
              className="flex-1 h-11 px-6 border-2 hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive gap-2 transition-all duration-200 text-nowrap"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </Button>
            
            <Button
              onClick={handleExtendClick}
              size="lg"
              className={`
                flex-1 h-11 px-6 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 
                text-white shadow-lg hover:shadow-xl transition-all duration-300 text-nowrap gap-2
                ${isCritical && isPulsing ? "animate-pulse" : ""}
              `}
              autoFocus
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              {isCritical ? "¡Mantener sesión!" : "Continuar trabajando"}
            </Button>
          </AlertDialogFooter>

          {/* Mensaje de ayuda */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Tu sesión se cerrará automáticamente si no realizas ninguna acción
            </p>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
