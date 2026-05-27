export interface Business {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  slug: string;
  dueno_id: number;
  dueno?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface CreateBusinessPayload {
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  slug: string;
  dueno: {
    connect: {
      id: number;
    };
  };
}

export interface UpdateBusinessPayload {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
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
