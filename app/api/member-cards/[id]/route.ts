import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Obtener una tarjeta específica (público)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Usar la vista para obtener la tarjeta
    const { data: card, error } = await supabase
      .from("member_cards_with_profile")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 })
      }
      console.error("Error fetching member card:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ card })
  } catch (error) {
    console.error("Error in GET /api/member-cards/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT - Actualizar tarjeta (solo usuario dueño o admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticación - solo usuarios autenticados pueden actualizar
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que la tarjeta existe
    const { data: existingCard } = await supabase
      .from("member_cards")
      .select("user_id, is_active")
      .eq("id", id)
      .single()

    if (!existingCard) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 })
    }

    // Verificar permisos: solo dueño o admin
    if (existingCard.user_id !== user.id) {
      // Verificar si es admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "No tienes permisos para editar esta tarjeta" }, { status: 403 })
      }
    }

    const body = await request.json()
    const { nombre, descripcion, institucion, telefono, linkedin, orcid, foto_url, is_active } = body

    // Validaciones
    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }

    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json({ error: "La descripción es obligatoria" }, { status: 400 })
    }

    // Actualizar la tarjeta
    const updateData: any = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      institucion: institucion?.trim() || null,
      telefono: telefono?.trim() || null,
      linkedin: linkedin?.trim() || null,
      orcid: orcid?.trim() || null,
      foto_url: foto_url?.trim() || null
    }

    // Solo admin puede cambiar is_active
    if (is_active !== undefined) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role === "admin") {
        updateData.is_active = is_active
      }
    }

    const { data: card, error } = await supabase
      .from("member_cards")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating member card:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obtener información del perfil/email
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", card.user_id)
      .single()

    const { data: authUser } = await supabase.auth.admin.getUserById(card.user_id)

    const transformedCard = {
      ...card,
      email: authUser?.user?.email || null,
      tipo: userProfile?.role || "estudiante"
    }

    return NextResponse.json({ card: transformedCard })
  } catch (error) {
    console.error("Error in PUT /api/member-cards/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar tarjeta (solo usuario dueño o admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticación - solo usuarios autenticados pueden eliminar
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que la tarjeta existe
    const { data: existingCard } = await supabase
      .from("member_cards")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existingCard) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 })
    }

    // Verificar permisos: solo dueño o admin
    if (existingCard.user_id !== user.id) {
      // Verificar si es admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "No tienes permisos para eliminar esta tarjeta" }, { status: 403 })
      }
    }

    // Eliminar la tarjeta
    const { error } = await supabase
      .from("member_cards")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting member card:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Tarjeta eliminada correctamente" })
  } catch (error) {
    console.error("Error in DELETE /api/member-cards/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}