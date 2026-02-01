import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PUT: Actualizar una imagen (solo admins)
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
        { error: "Solo administradores pueden actualizar imágenes" },
        { status: 403 }
      )
    }

    // Obtener datos del request
    const body = await request.json()
    const { imagen_url, alt_text, orden, is_active } = body

    const updateData: Record<string, unknown> = {}
    if (imagen_url !== undefined) updateData.imagen_url = imagen_url
    if (alt_text !== undefined) updateData.alt_text = alt_text
    if (orden !== undefined) updateData.orden = orden
    if (is_active !== undefined) updateData.is_active = is_active

    // Actualizar la imagen
    const { data: updatedImage, error: updateError } = await supabase
      .from("hero_images")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating image:", updateError)
      return NextResponse.json(
        { error: "Error al actualizar imagen" },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error("Error in PUT /api/hero-images/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar una imagen (solo admins)
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
        { error: "Solo administradores pueden eliminar imágenes" },
        { status: 403 }
      )
    }

    // Eliminar la imagen
    const { error: deleteError } = await supabase
      .from("hero_images")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting image:", deleteError)
      return NextResponse.json(
        { error: "Error al eliminar imagen" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Imagen eliminada exitosamente" })
  } catch (error) {
    console.error("Error in DELETE /api/hero-images/[id]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}