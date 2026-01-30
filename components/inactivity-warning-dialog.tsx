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
import { Clock, LogOut } from "lucide-react"

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
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
    return `${seconds} segundos`
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            Sesion por expirar
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Tu sesion esta a punto de cerrarse por inactividad.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-700 mb-1">Tiempo restante:</p>
              <p className="text-2xl font-bold text-amber-800">{formatTime()}</p>
            </div>
            <p className="text-sm">
              Haz clic en &quot;Continuar sesion&quot; para mantener tu sesion activa, o en &quot;Cerrar sesion&quot; si deseas salir.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onExtend}
            className="bg-primary hover:bg-primary/90"
          >
            Continuar sesion
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
