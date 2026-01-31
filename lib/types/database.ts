export type UserRole = "admin" | "tecnico" | "docente" | "estudiante"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  status: "active" | "inactive" | "pending"
  last_sign_in_at: string | null
  created_at: string
  updated_at: string
}

export interface UserWithProfile {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  profile: Profile
}

export interface MemberCard {
  id: string
  user_id: string
  nombre: string
  descripcion: string
  institucion: string | null
  telefono: string | null
  linkedin: string | null
  orcid: string | null
  foto_url: string | null
  orden: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Campos del join con profiles
  email?: string | null
  tipo?: UserRole
}
