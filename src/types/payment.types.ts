export type EstadoPago = "PENDIENTE" | "COMPLETADO" | "FALLIDO" | "REEMBOLSADO";

export interface PagoUsuario {
  id: number;
  nombre: string;
  apellido: string;
}

export interface PagoCita {
  id: number;
  id_servicio_nosql: string;
  fecha_hora_propuesta: string;
  usuario: PagoUsuario;
}

export interface Pago {
  id: number;
  id_cita: number;
  monto: string;
  metodo_pago: string;
  estado_pago: EstadoPago;
  transaccion_id: string | null;
  cita: PagoCita;
}

export interface CreatePaymentPayload {
  id_cita: number;
  monto: number;
  metodo_pago: string;
  transaccion_id?: string;
  estado_pago?: EstadoPago;
}
