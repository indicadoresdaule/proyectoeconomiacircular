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
import { Clock, LogOut, AlertTriangle } from "lucide-react"

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

  // Determinar color basado en tiempo restante
  const getWarningLevel = () => {
    const totalSeconds = remainingTime
    if (totalSeconds <= 30) return "red"
    if (totalSeconds <= 90) return "amber"
    return "blue"
  }

  const warningLevel = getWarningLevel()
  const colorMap = {
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      title: "text-red-600",
      number: "text-red-800",
      icon: "text-red-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      title: "text-amber-600",
      number: "text-amber-800",
      icon: "text-amber-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      title: "text-blue-600",
      number: "text-blue-800",
      icon: "text-blue-600",
    },
  }

  const colors = colorMap[warningLevel]

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md border-2" role="alertdialog" aria-labelledby="inactivity-title">
        <AlertDialogHeader>
          <AlertDialogTitle className={`flex items-center gap-2 ${colors.title}`} id="inactivity-title">
            {warningLevel === "red" ? (
              <AlertTriangle className={`h-6 w-6 ${colors.icon}`} />
            ) : (
              <Clock className={`h-5 w-5 ${colors.icon}`} />
            )}
            {warningLevel === "red" ? "¡Sesión a cerrarse!" : "Sesión por expirar"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                Por tu seguridad, tu sesión se cerrará automáticamente por inactividad.
              </p>
              <p className="text-sm">
                {warningLevel === "red"
                  ? "¡Rápido! Tu sesión se cierra en unos momentos."
                  : "No hemos detectado actividad en los últimos minutos."}
              </p>
            </div>

            <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 text-center`}>
              <p className={`text-sm ${colors.text} mb-2 font-medium`}>Tiempo restante:</p>
              <p className={`text-4xl font-bold ${colors.number} font-mono tracking-wider`}>
                {formatTime()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Nota:</strong> Si cierras esta pestaña y no vuelves en 5 minutos, tu sesión se cerrará automáticamente.
              </p>
            </div>

            <p className="text-sm text-foreground">
              Haz clic en &quot;<strong>Continuar sesión</strong>&quot; para seguir trabajando.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onLogout}
            className="flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onExtend}
            className={`${
              warningLevel === "red"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary/90"
            } flex items-center justify-center gap-2`}
          >
            <Clock className="h-4 w-4" />
            Continuar sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
