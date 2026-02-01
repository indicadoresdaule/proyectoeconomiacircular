import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET: Obtener todos los videos activos (público)
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: videos, error } = await supabase
      .from("home_videos")
      .select("*")
      .eq("is_active", true)
      .order("orden", { ascending: true })

    if (error) {
      console.error("Error fetching videos:", error)
      // Si la tabla no existe, retornar array vacío
      if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
        return NextResponse.json([])
      }
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(videos || [])
  } catch (error) {
    console.error("Error in GET /api/home-videos:", error)
    // Retornar array vacío en caso de error para evitar fallos en el cliente
    return NextResponse.json([])
  }
}

// POST: Crear un nuevo video (solo admins)
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
        { error: "Solo administradores pueden crear videos" },
        { status: 403 }
      )
    }

    // Obtener datos del request
    const body = await request.json()
    const { titulo, descripcion, video_url, orden = 0 } = body

    if (!titulo || !descripcion || !video_url) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: titulo, descripcion, video_url" },
        { status: 400 }
      )
    }

    // Crear el video
    const { data: newVideo, error: insertError } = await supabase
      .from("home_videos")
      .insert({
        admin_id: user.id,
        titulo,
        descripcion,
        video_url,
        orden,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating video:", insertError)
      return NextResponse.json(
        { error: "Error al crear video" },
        { status: 500 }
      )
    }

    return NextResponse.json(newVideo, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/home-videos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}