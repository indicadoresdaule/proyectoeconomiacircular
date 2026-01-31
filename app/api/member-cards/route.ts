import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Obtener todas las tarjetas activas (público) o la tarjeta del usuario actual
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const myCard = searchParams.get("my-card") === "true"

    if (myCard) {
      // Solo usuarios autenticados pueden ver su propia tarjeta
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
      }

      const { data: card, error } = await supabase
        .from("member_cards")
        .select(`
          *,
          profiles:user_id (
            email,
            role
          )
        `)
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user card:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Transformar para incluir email y tipo
      const transformedCard = card ? {
        ...card,
        email: card.profiles?.email || user.email,
        tipo: card.profiles?.role || "estudiante",
        profiles: undefined
      } : null

      return NextResponse.json({ card: transformedCard })
    }

    // Obtener todas las tarjetas activas usando la vista
    const { data: cards, error } = await supabase
      .from("member_cards_with_profile")
      .select("*")
      .eq("is_active", true)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching member cards:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ cards: cards || [] })
  } catch (error) {
    console.error("Error in GET /api/member-cards:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nueva tarjeta para el usuario actual
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación - solo usuarios autenticados pueden crear
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar si el usuario ya tiene una tarjeta
    const { data: existingCard } = await supabase
      .from("member_cards")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (existingCard) {
      return NextResponse.json({ error: "Ya tienes una tarjeta creada. Solo puedes tener una." }, { status: 400 })
    }

    const body = await request.json()
    const { nombre, descripcion, institucion, telefono, linkedin, orcid, foto_url } = body

    // Validaciones
    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }

    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json({ error: "La descripción es obligatoria" }, { status: 400 })
    }

    // Crear la tarjeta
    const { data: card, error } = await supabase
      .from("member_cards")
      .insert({
        user_id: user.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        institucion: institucion?.trim() || null,
        telefono: telefono?.trim() || null,
        linkedin: linkedin?.trim() || null,
        orcid: orcid?.trim() || null,
        foto_url: foto_url?.trim() || null,
        is_active: true
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creating member card:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obtener información del perfil/email
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const transformedCard = {
      ...card,
      email: user.email,
      tipo: profile?.role || "estudiante"
    }

    return NextResponse.json({ card: transformedCard }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/member-cards:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}