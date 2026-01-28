import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("[v0] No active session for password update:", userError)
      return NextResponse.json({ error: "Auth session missing!" }, { status: 400 })
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      console.error("[v0] Error updating password:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" })
  } catch (error: any) {
    console.error("[v0] Update password error:", error)
    return NextResponse.json({ error: error.message || "Error al actualizar contraseña" }, { status: 500 })
  }
}
