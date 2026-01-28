import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 })
    }

    const { email, password, role, full_name } = await request.json()

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, contraseña y rol son requeridos" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Validate role
    if (!["admin", "docente", "tecnico", "estudiante"].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingProfile } = await supabase.from("profiles").select("email").eq("email", email).single()

    if (existingProfile) {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 400 })
    }

    // Create user using admin client
    const adminClient = getAdminClient()
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role,
        full_name: full_name || null,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    if (!newUser.user) {
      return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
    }

    // Update profile with full_name if provided
    if (full_name) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name })
        .eq("id", newUser.user.id)

      if (profileError) {
        console.error("Error updating profile with full_name:", profileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Usuario creado correctamente",
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role,
        full_name: full_name || null,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear usuario" }, { status: 500 })
  }
}
