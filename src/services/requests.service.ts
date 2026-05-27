import { apiClient } from "@/lib/axios";
import type { Solicitud, CreateSolicitudPayload, EstadoSolicitud } from "@/types/request.types";

export const requestsService = {
  async getByNegocio(negocioId: number): Promise<Solicitud[]> {
    const { data } = await apiClient.get<Solicitud[]>(`/requests/negocio/${negocioId}`);
    return data;
  },

  async create(payload: CreateSolicitudPayload): Promise<Solicitud> {
    const { data } = await apiClient.post<Solicitud>("/requests", payload);
    return data;
  },

  async updateEstado(id: number, estado: EstadoSolicitud): Promise<Solicitud> {
    const { data } = await apiClient.patch<Solicitud>(`/requests/${id}`, { estado });
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/requests/${id}`);
  },
};
