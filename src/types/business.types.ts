export interface Business {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono_comercial: string | null;
  slug: string;
  id_dueno: number;
}

export interface CreateBusinessPayload {
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono_comercial: string;
  slug: string;
  id_dueno: number;
}

export interface UpdateBusinessPayload {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  telefono_comercial?: string;
  slug?: string;
}

export interface StaffMember {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface AssignStaffPayload {
  usuarioId: number;
}
