import { apiClient } from "@/lib/axios";

export interface BloqueoPayload {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo?: string;
}

export const horariosService = {
  async getByNegocio(negocioId: number) {
    const { data } = await apiClient.get(`/horarios/negocio/${negocioId}`);
    return data;
  },

  async addBloqueo(negocioId: number, payload: BloqueoPayload) {
    const { data } = await apiClient.post(`/horarios/negocio/${negocioId}/bloqueo`, payload);
    return data;
  },

  async removeBloqueo(negocioId: number, index: number) {
    await apiClient.delete(`/horarios/negocio/${negocioId}/bloqueo/${index}`);
  },
};
