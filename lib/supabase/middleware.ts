import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Definir rutas
  const reportesRoute = "/reportes"
  const formulariosRoute = "/formularios"
  const metasRoute = "/metas"
  const adminRoutes = ["/admin", "/gestion-usuarios"]
  const authRoutes = ["/perfil", "/avances", ...adminRoutes]

  const isReportesRoute = request.nextUrl.pathname.startsWith(reportesRoute)
  const isFormulariosRoute = request.nextUrl.pathname.startsWith(formulariosRoute)
  const isMetasRoute = request.nextUrl.pathname.startsWith(metasRoute)
  const isAdminRoute = adminRoutes.some(r => request.nextUrl.pathname.startsWith(r))
  const isAuthRoute = authRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  // Página pública
  if (isMetasRoute) return supabaseResponse

  // Verificar acceso - USUARIO NO AUTENTICADO
  if ((isAuthRoute || isReportesRoute || isFormulariosRoute) && !user) {
    const safeMessage = "🔒 Acceso Restringido\\n\\nDebes iniciar sesión para acceder a esta página. Serás redirigido automáticamente al inicio de sesión."
    
    return new Response(
      `<html><head><meta charset="UTF-8"><script>
        alert("${safeMessage}");
        window.location.href = '/login?redirectedFrom=${encodeURIComponent(request.nextUrl.pathname)}';
      </script></head><body></body></html>`,
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
        } 
      }
    )
  }

  // USUARIO AUTENTICADO - Verificar roles
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const userRole = profile?.role as "admin" | "docente" | "tecnico" | "estudiante" | null

    // Reportes: NO estudiantes (solo admin, docente, tecnico)
    if (isReportesRoute && userRole && !["admin", "docente", "tecnico"].includes(userRole)) {
      const safeMessage = "🚫 Acceso Denegado\\n\\nSolo administradores, docentes y técnicos pueden acceder a los reportes. Los estudiantes no tienen permiso para esta sección."
      
      return new Response(
        `<html><head><meta charset="UTF-8"><script>
          alert("${safeMessage}");
          window.location.href = '/';
        </script></head><body></body></html>`,
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
          } 
        }
      )
    }

    // Admin: SOLO administradores
    if (isAdminRoute && userRole !== "admin") {
      const safeMessage = "👑 Acceso Exclusivo\\n\\nEsta sección es exclusiva para administradores del sistema. No tienes los permisos necesarios."
      
      return new Response(
        `<html><head><meta charset="UTF-8"><script>
          alert("${safeMessage}");
          window.location.href = '/';
        </script></head><body></body></html>`,
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
          } 
        }
      )
    }

    // Formularios: Verificar que tenga rol (todos los autenticados con rol)
    if (isFormulariosRoute && !userRole) {
      const safeMessage = "⚠️ Error de Permisos\\n\\nNo se pudo verificar tu rol de usuario. Por favor, contacta al administrador."
      
      return new Response(
        `<html><head><meta charset="UTF-8"><script>
          alert("${safeMessage}");
          window.location.href = '/';
        </script></head><body></body></html>`,
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
          } 
        }
      )
    }
  }

  // Redirigir desde login si ya está autenticado
  if (request.nextUrl.pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return supabaseResponse
}
