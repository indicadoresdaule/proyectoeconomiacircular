import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PUT: Actualizar un video (solo admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el usuario es admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Error al verificar perfil" },
        { status: 403 }
      )
    }

    if (profile.role !== "admin" || profile.status !== "active") {
      return NextResponse.json(
        { error: "Solo administradores pueden actualizar videos" },
        { status: 403 }
      )
    }

    // Obtener datos del request
    const body = await request.json()
    const { titulo, descripcion, video_url, orden, is_active } = body

    const updateData: Record<string, unknown> = {}
    if (titulo !== undefined) updateData.titulo = titulo
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (video_url !== undefined) updateData.video_url = video_url
    if (orden !== undefined) updateData.orden = orden
    if (is_active !== undefined) updateData.is_active = is_active

    // Actualizar el video
    const { data: updatedVideo, error: updateError } = await supabase
      .from("home_videos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating video:", updateError)
      return NextResponse.json(
        { error: "Error al actualizar video" },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedVideo)
  } catch (error) {
    console.error("Error in PUT /api/home-videos/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un video (solo admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el usuario es admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Error al verificar perfil" },
        { status: 403 }
      )
    }

    if (profile.role !== "admin" || profile.status !== "active") {
      return NextResponse.json(
        { error: "Solo administradores pueden eliminar videos" },
        { status: 403 }
      )
    }

    // Eliminar el video
    const { error: deleteError } = await supabase
      .from("home_videos")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting video:", deleteError)
      return NextResponse.json(
        { error: "Error al eliminar video" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Video eliminado exitosamente" })
  } catch (error) {
    console.error("Error in DELETE /api/home-videos/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}