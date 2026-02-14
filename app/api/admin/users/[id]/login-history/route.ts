import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // En Next.js 15+, params es una Promise que debe ser await
    const { id } = await params
    
    console.log('API - Recibida petición para userId:', id)

    if (!id) {
      return NextResponse.json(
        { error: "ID de usuario no proporcionado" }, 
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar rol de admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener historial de login
    const { data: history, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching login history:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`API - Encontrados ${history?.length || 0} registros para usuario ${id}`)
    return NextResponse.json({ history: history || [] })

  } catch (error: any) {
    console.error('Error in login history API:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener historial' },
      { status: 500 }
    )
  }

}
