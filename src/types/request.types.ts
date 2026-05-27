export type EstadoSolicitud = "PENDIENTE" | "CONFIRMADA" | "CANCELADA";

export interface SolicitudUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
}

export interface SolicitudNegocio {
  id: number;
  nombre: string;
  slug: string;
  direccion: string | null;
}

export interface Solicitud {
  id: number;
  id_usuario: number;
  id_negocio: number;
  id_servicio_nosql: string;
  fecha_hora_propuesta: string;
  estado: EstadoSolicitud;
  usuario: SolicitudUsuario;
}

export interface SolicitudPago {
  id: number;
  monto: string;
  metodo_pago: string;
  estado_pago: "PENDIENTE" | "COMPLETADO" | "FALLIDO" | "REEMBOLSADO";
}

export interface SolicitudCliente {
  id: number;
  id_usuario: number;
  id_negocio: number;
  id_servicio_nosql: string;
  fecha_hora_propuesta: string;
  estado: EstadoSolicitud;
  negocio: SolicitudNegocio;
  pagos: SolicitudPago[];
}

export interface CreateSolicitudPayload {
  id_usuario: number;
  id_negocio: number;
  id_servicio_nosql: string;
  fecha_hora_propuesta: string;
}

export interface Bloqueo {
  tipo: "bloqueo";
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo?: string;
}
