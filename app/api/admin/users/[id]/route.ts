import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: userId } = await params

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
    }

    // Delete user using admin client
    const adminClient = getAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Usuario eliminado correctamente" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al eliminar usuario" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: userId } = await params
    const { role, email, full_name } = await request.json()

    // Update profile fields if provided
    const profileUpdates: Record<string, string> = {}
    if (role) profileUpdates.role = role
    if (full_name !== undefined) profileUpdates.full_name = full_name

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase.from("profiles").update(profileUpdates).eq("id", userId)

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    // Update email if provided
    if (email) {
      const adminClient = getAdminClient()
      const { error: emailError } = await adminClient.auth.admin.updateUserById(userId, { email })

      if (emailError) {
        return NextResponse.json({ error: emailError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Usuario actualizado correctamente" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar usuario" }, { status: 500 })
  }
}
