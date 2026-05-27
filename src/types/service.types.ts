export interface Service {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  negocio_id: number;
}

export interface CreateServicePayload {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  negocio_id: number;
}

export interface UpdateServicePayload {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracionMinutos?: number;
}
