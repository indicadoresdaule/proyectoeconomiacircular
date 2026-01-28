import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "El correo electrónico es requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    // El redirectTo debe apuntar al callback que intercambiara el codigo
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://proyectoeconomiacircular.vercel.app"}/auth/callback?type=recovery`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Correo de recuperación enviado" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al enviar correo" }, { status: 500 })
  }
}
