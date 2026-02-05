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
import { Clock, AlertTriangle, RefreshCw } from "lucide-react"
import { useRef } from "react"

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

  // Función para manejar el clic en "Mantener sesión"
  const handleExtendClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
        className="max-w-md inactivity-dialog"
        id="inactivity-dialog"
        onMouseMove={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <div 
            className="flex items-center justify-center mb-4"
            onMouseMove={(e) => e.stopPropagation()}
          >
            {isCritical ? (
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75"></div>
                <AlertTriangle className="relative h-12 w-12 text-red-600" />
              </div>
            ) : (
              <Clock className="h-12 w-12 text-amber-600" />
            )}
          </div>
          
          <AlertDialogTitle className="text-center text-xl">
            {isCritical ? "¡Sesión por cerrarse!" : "Sesión inactiva"}
          </AlertDialogTitle>
          
          <AlertDialogDescription asChild>
            <div 
              className="space-y-4 pt-2 text-center"
              onMouseMove={(e) => e.stopPropagation()}
            >
              <p className="text-foreground">
                {isCritical 
                  ? "Tu sesión se cerrará en instantes por seguridad."
                  : "Tu sesión se cerrará pronto por inactividad."
                }
              </p>
              
              {/* Contador regresivo */}
              <div 
                className={`mx-auto w-fit rounded-lg border p-4 ${
                  isCritical 
                    ? "border-red-200 bg-red-50 animate-pulse" 
                    : isWarning 
                    ? "border-amber-200 bg-amber-50" 
                    : "border-blue-200 bg-blue-50"
                }`}
                onMouseMove={(e) => e.stopPropagation()}
              >
                <p className="text-sm font-medium mb-1">
                  {isCritical ? "¡Apúrate!" : "Tiempo restante"}
                </p>
                <p className={`text-3xl font-bold font-mono ${
                  isCritical ? "text-red-700" :
                  isWarning ? "text-amber-700" :
                  "text-blue-700"
                }`}>
                  {formatTime()}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  minutos : segundos
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter 
          className="flex-col sm:flex-row gap-3"
          onMouseMove={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            onClick={handleLogoutClick}
            onMouseDown={(e) => e.stopPropagation()}
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Cerrar ahora
          </Button>
          
          <AlertDialogAction 
            onClick={handleExtendClick}
            onMouseDown={(e) => e.stopPropagation()}
            className={`flex items-center gap-2 ${
              isCritical 
                ? "bg-red-600 hover:bg-red-700 animate-bounce" 
                : "bg-primary hover:bg-primary/90"
            }`}
            autoFocus
          >
            <RefreshCw className="h-4 w-4" />
            {isCritical ? "¡Mantener sesión!" : "Continuar trabajando"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
