export type UnidadDuracion = "minutos" | "horas" | "dias" | "semanas" | "meses" | "a_convenir";

export interface Service {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number | null;
  unidadDuracion: UnidadDuracion;
  negocio_id: number;
}

export interface CreateServicePayload {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number | null;
  unidadDuracion: UnidadDuracion;
  negocio_id: number;
}

export interface UpdateServicePayload {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracion?: number | null;
  unidadDuracion?: UnidadDuracion;
}

export function formatDuracion(duracion: number | null, unidad: UnidadDuracion): string {
  if (unidad === "a_convenir") return "A convenir";
  if (!duracion) return "—";
  const labels: Record<UnidadDuracion, string> = {
    minutos:    duracion === 1 ? "minuto"  : "minutos",
    horas:      duracion === 1 ? "hora"    : "horas",
    dias:       duracion === 1 ? "día"     : "días",
    semanas:    duracion === 1 ? "semana"  : "semanas",
    meses:      duracion === 1 ? "mes"     : "meses",
    a_convenir: "",
  };
  return `${duracion} ${labels[unidad]}`;
}

export function duracionEnMinutos(duracion: number | null, unidad: UnidadDuracion): number {
  if (!duracion || unidad === "a_convenir") return 60;
  const factores: Record<UnidadDuracion, number> = {
    minutos:    1,
    horas:      60,
    dias:       60 * 8,
    semanas:    60 * 8 * 5,
    meses:      60 * 8 * 20,
    a_convenir: 60,
  };
  return duracion * factores[unidad];
}
