import { NextResponse, type NextRequest } from "next/server"

type UserRole = "admin" | "docente" | "tecnico" | "estudiante"

interface RouteConfig {
  path: string
  requiresAuth: boolean
  allowedRoles?: UserRole[]
  isPublic?: boolean
}

// Configuración centralizada de rutas y permisos
const ROUTE_CONFIGS: RouteConfig[] = [
  // Rutas públicas
  { path: "/metas", requiresAuth: false, isPublic: true },
  { path: "/login", requiresAuth: false, isPublic: true },

  // Rutas solo para administradores
  { path: "/admin", requiresAuth: true, allowedRoles: ["admin"] },
  { path: "/gestion-usuarios", requiresAuth: true, allowedRoles: ["admin"] },

  // Rutas para usuarios autenticados (excepto estudiantes)
  { path: "/reportes", requiresAuth: true, allowedRoles: ["admin", "docente", "tecnico"] },

  // Rutas para todos los usuarios autenticados
  { path: "/formularios", requiresAuth: true, allowedRoles: ["admin", "docente", "tecnico", "estudiante"] },
  { path: "/perfil", requiresAuth: true, allowedRoles: ["admin", "docente", "tecnico", "estudiante"] },
  { path: "/avances", requiresAuth: true, allowedRoles: ["admin", "docente", "tecnico", "estudiante"] },
]

// Mensajes de error personalizados
const ERROR_MESSAGES = {
  NOT_AUTHENTICATED:
    "🔒 Acceso Restringido\\n\\nDebes iniciar sesión para acceder a esta página. Serás redirigido automáticamente al inicio de sesión.",
  INSUFFICIENT_PERMISSIONS: "🚫 Acceso Denegado\\n\\nNo tienes los permisos necesarios para acceder a esta sección.",
  ADMIN_ONLY: "👑 Acceso Exclusivo\\n\\nEsta sección es exclusiva para administradores del sistema.",
  NO_STUDENTS: "🚫 Acceso Denegado\\n\\nSolo administradores, docentes y técnicos pueden acceder a los reportes.",
  NO_ROLE: "⚠️ Error de Permisos\\n\\nNo se pudo verificar tu rol de usuario. Por favor, contacta al administrador.",
}

function findMatchingRoute(pathname: string): RouteConfig | null {
  return ROUTE_CONFIGS.find((config) => pathname.startsWith(config.path)) || null
}

function createAlertResponse(message: string, redirectUrl: string, status = 403) {
  return new Response(
    `<html><head><meta charset="UTF-8"><script>
      alert("${message}");
      window.location.href = '${redirectUrl}';
    </script></head><body></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  )
}

export async function checkRouteAccess(request: NextRequest, supabase: any) {
  const pathname = request.nextUrl.pathname
  const matchedRoute = findMatchingRoute(pathname)

  // Si la ruta no está configurada o es pública, permitir acceso
  if (!matchedRoute || matchedRoute.isPublic) {
    return null // null significa "permitir acceso"
  }

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verificar si requiere autenticación
  if (matchedRoute.requiresAuth && !user) {
    return createAlertResponse(
      ERROR_MESSAGES.NOT_AUTHENTICATED,
      `/login?redirectedFrom=${encodeURIComponent(pathname)}`,
      401,
    )
  }

  // Si el usuario está autenticado y la ruta tiene restricciones de rol
  if (user && matchedRoute.allowedRoles && matchedRoute.allowedRoles.length > 0) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    const userRole = profile?.role as UserRole | null

    if (!userRole) {
      return createAlertResponse(ERROR_MESSAGES.NO_ROLE, "/")
    }

    // Verificar si el rol del usuario está permitido
    if (!matchedRoute.allowedRoles.includes(userRole)) {
      // Mensaje personalizado según la ruta
      let errorMessage = ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS

      if (pathname.startsWith("/admin") || pathname.startsWith("/gestion-usuarios")) {
        errorMessage = ERROR_MESSAGES.ADMIN_ONLY
      } else if (pathname.startsWith("/reportes")) {
        errorMessage = ERROR_MESSAGES.NO_STUDENTS
      }

      return createAlertResponse(errorMessage, "/")
    }
  }

  // Redirigir desde login si ya está autenticado
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return null // Permitir acceso
}
