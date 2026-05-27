export interface Review {
  _id: string;
  negocio_id: number;
  usuario_id: number;
  nombre_cliente?: string;
  rating: number;
  comentario: string;
  fecha: string;
  respuesta?: string;
  fecha_respuesta?: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  negocio_id: number;
  usuario_id: number;
  nombre_cliente?: string;
  rating: number;
  comentario: string;
  fecha: string;
}
