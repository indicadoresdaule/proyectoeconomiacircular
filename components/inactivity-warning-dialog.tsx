"use client"

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
import { Clock, LogOut, AlertCircle } from "lucide-react"
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
  const [timeLeft, setTimeLeft] = useState(remainingTime)

  useEffect(() => {
    setTimeLeft(remainingTime)
  }, [remainingTime])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const formatTime = () => {
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
    return `${seconds} segundos`
  }

  // Estilos dinámicos según el tiempo restante
  const getTimeColor = () => {
    if (timeLeft < 60) return "text-red-600 bg-red-50 border-red-200"
    if (timeLeft < 120) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-amber-800 bg-amber-50 border-amber-200"
  }

  const getTitleColor = () => {
    if (timeLeft < 60) return "text-red-600"
    return "text-amber-600"
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md animate-in fade-in-0 zoom-in-95">
        <AlertDialogHeader>
          <AlertDialogTitle className={`flex items-center gap-2 ${getTitleColor()}`}>
            {timeLeft < 60 ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            {timeLeft < 60 ? "¡Sesión a punto de expirar!" : "Sesión por expirar"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-gray-600">
              {timeLeft < 60 
                ? "¡Tu sesión está a punto de cerrarse! Por favor, elige una opción rápidamente."
                : "Tu sesión se cerrará automáticamente por inactividad en:"}
            </p>
            
            <div className={`border rounded-lg p-4 text-center transition-colors ${getTimeColor()}`}>
              <p className="text-sm mb-1">Tiempo restante:</p>
              <p className="text-2xl font-bold tracking-wider">{formatTime()}</p>
              {timeLeft < 30 && (
                <p className="text-xs mt-1 text-red-500">
                  ¡La sesión se cerrará automáticamente!
                </p>
              )}
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Tu trabajo no guardado podría perderse</p>
              <p>• Serás redirigido a la página de inicio de sesión</p>
              <p className="pt-2">Haz clic en "Continuar sesión" para mantener tu sesión activa.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onLogout}
            className="flex items-center gap-2 order-2 sm:order-1 hover:bg-gray-100"
            variant="outline"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión ahora
          </AlertDialogCancel>
          
          <AlertDialogAction 
            onClick={onExtend}
            className="bg-primary hover:bg-primary/90 order-1 sm:order-2"
            autoFocus
          >
            Continuar sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
