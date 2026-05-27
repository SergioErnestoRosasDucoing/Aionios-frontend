export type TicketEstado = "abierto" | "en_proceso" | "resuelto";
export type TicketPrioridad = "baja" | "media" | "alta";

export interface TicketMensaje {
  autor_id: number;
  autor_nombre?: string;
  texto: string;
  fecha: string;
}

export interface Ticket {
  _id: string;
  usuario_id: number;
  asunto: string;
  categoria: string;
  prioridad: TicketPrioridad;
  estado: TicketEstado;
  mensajes: TicketMensaje[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  asunto: string;
  categoria: string;
  prioridad: TicketPrioridad;
  mensaje_inicial: string;
}
