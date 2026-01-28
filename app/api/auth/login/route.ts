import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 })
      }
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json({ error: "Por favor, confirma tu correo electrónico" }, { status: 401 })
      }
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    return NextResponse.json({
      success: true,
      user: data.user,
      profile,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al iniciar sesión" }, { status: 500 })
  }
}
