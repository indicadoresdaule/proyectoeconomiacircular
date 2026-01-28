import { createBrowserClient } from "@supabase/ssr"

export type UserRole = "admin" | "docente" | "tecnico" | "estudiante"

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return profile?.role as UserRole | null
}

// Verificar acceso a reportes (admin, docente, tecnico - NO estudiantes)
export async function canAccessReportes(): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false
  return ["admin", "docente", "tecnico"].includes(role)
}

// Verificar acceso a formularios (todos los usuarios autenticados)
export async function canAccessFormularios(): Promise<boolean> {
  const role = await getUserRole()
  return role !== null
}

// Verificar si es administrador
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === "admin"
}

// Verificar acceso general basado en ruta
export async function checkRouteAccess(pathname: string): Promise<{
  allowed: boolean
  message?: string
}> {
  const role = await getUserRole()
  
  // Rutas públicas
  const publicRoutes = ["/", "/login", "/metas", "/acerca-de"]
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return { allowed: true }
  }

  // Si no hay usuario autenticado
  if (!role) {
    return { 
      allowed: false, 
      message: "Debes iniciar sesión para acceder a esta página" 
    }
  }

  // Rutas de reportes (NO estudiantes)
  if (pathname.startsWith("/reportes")) {
    if (["estudiante"].includes(role)) {
      return { 
        allowed: false, 
        message: "Los estudiantes no tienen acceso a los reportes" 
      }
    }
    return { allowed: true }
  }

  // Rutas de admin (solo admin)
  if (pathname.startsWith("/admin") || pathname.startsWith("/gestion-usuarios")) {
    if (role !== "admin") {
      return { 
        allowed: false, 
        message: "Solo los administradores pueden acceder a esta sección" 
      }
    }
    return { allowed: true }
  }

  // Rutas de formularios (todos autenticados)
  if (pathname.startsWith("/formularios")) {
    return { allowed: true }
  }

  // Rutas que requieren autenticación general
  const authRoutes = ["/perfil", "/avances"]
  if (authRoutes.some(route => pathname.startsWith(route))) {
    return { allowed: true }
  }

  // Por defecto, denegar acceso
  return { 
    allowed: false, 
    message: "Acceso no autorizado" 
  }
}
