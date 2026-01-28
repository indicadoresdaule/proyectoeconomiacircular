import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const type = searchParams.get("type")

  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"
  
  const getRedirectUrl = (path: string) => {
    if (isLocalEnv) {
      return `${origin}${path}`
    } else if (forwardedHost) {
      return `https://${forwardedHost}${path}`
    } else {
      return `${origin}${path}`
    }
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Si es un recovery (reset password), redirigir a la pagina de cambio de contrasena
      if (type === "recovery") {
        return NextResponse.redirect(getRedirectUrl("/auth/reset-password?verified=true"))
      }
      return NextResponse.redirect(getRedirectUrl(next))
    } else {
      console.error("[Auth Callback] Error exchanging code:", error.message)
    }
  }

  // Si hay error, redirigir al login con mensaje de error
  return NextResponse.redirect(getRedirectUrl("/login?error=auth_error"))
}
