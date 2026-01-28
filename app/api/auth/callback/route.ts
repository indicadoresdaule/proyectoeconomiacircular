import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const type = searchParams.get("type") // 'recovery', 'signup', etc.
    const next = searchParams.get("next") ?? "/"

    if (!code) {
      return NextResponse.redirect(`${origin}/auth/error?error=missing_code`)
    }

    const supabase = await createClient()

    // Para flujos de recuperación de contraseña, necesitas un manejo especial
    if (type === "recovery") {
      // Verifica el token de recuperación
      const { error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: "recovery",
      })

      if (error) {
        console.error("[Auth] Recovery token error:", error)
        return NextResponse.redirect(`${origin}/auth/reset-password?error=invalid_token`)
      }

      // Redirige a la página de restablecimiento
      return NextResponse.redirect(`${origin}/auth/reset-password`)
    } else {
      // Para otros flujos (inicio de sesión, registro)
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[Auth] Exchange error:", error)
        return NextResponse.redirect(`${origin}/auth/error?error=auth_failed`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  } catch (error: any) {
    console.error("[Auth] Callback error:", error)
    return NextResponse.redirect(`${origin}/auth/error?error=internal_error`)
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const supabase = await createClient()

    if (type === "recovery") {
      // Para PKCE flow de recuperación
      const { error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: "recovery",
      })

      if (error) {
        console.error("[Auth] Recovery verification error:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    } else {
      // Para otros flujos
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[Auth] Exchange error:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }
  } catch (error: any) {
    console.error("[Auth] Callback POST error:", error)
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 })
  }
}
