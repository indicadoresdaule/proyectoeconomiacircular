import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET: Obtener todas las imágenes activas (público)
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: images, error } = await supabase
      .from("hero_images")
      .select("*")
      .eq("is_active", true)
      .order("orden", { ascending: true })

    if (error) {
      console.error("Error fetching images:", error)
      // Si la tabla no existe, retornar array vacío
      if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
        return NextResponse.json([])
      }
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(images || [])
  } catch (error) {
    console.error("Error in GET /api/hero-images:", error)
    return NextResponse.json([])
  }
}

// POST: Crear una nueva imagen (solo admins)
export async function POST(request: NextRequest) {
  try {
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
        { error: "Solo administradores pueden crear imágenes" },
        { status: 403 }
      )
    }

    // Obtener datos del request
    const body = await request.json()
    const { imagen_url, alt_text = "", orden = 0 } = body

    if (!imagen_url) {
      return NextResponse.json(
        { error: "Falta campo obligatorio: imagen_url" },
        { status: 400 }
      )
    }

    // Crear la imagen
    const { data: newImage, error: insertError } = await supabase
      .from("hero_images")
      .insert({
        admin_id: user.id,
        imagen_url,
        alt_text,
        orden,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating image:", insertError)
      return NextResponse.json(
        { error: "Error al crear imagen" },
        { status: 500 }
      )
    }

    return NextResponse.json(newImage, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/hero-images:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}