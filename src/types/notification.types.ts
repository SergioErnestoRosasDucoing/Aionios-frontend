export type NotificacionTipo = "recordatorio_cita" | "pago_exitoso" | "cancelacion";

export interface Notificacion {
  _id: string;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  leido: boolean;
  tipo: NotificacionTipo;
  createdAt: string;
  updatedAt: string;
}
