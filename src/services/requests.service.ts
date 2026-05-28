import { apiClient } from "@/lib/axios";
import type { Solicitud, SolicitudCliente, CreateSolicitudPayload, EstadoSolicitud, RequestMessage } from "@/types/request.types";

export const requestsService = {
  async getMine(): Promise<SolicitudCliente[]> {
    const { data } = await apiClient.get<SolicitudCliente[]>("/requests/mine");
    return data;
  },

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

  async getMensajes(id: number): Promise<RequestMessage[]> {
    const { data } = await apiClient.get<RequestMessage[]>(`/requests/${id}/mensajes`);
    return data;
  },

  async addMensaje(
    id: number,
    payload: { autor_id: number; autor_nombre: string; autor_tipo: "cliente" | "negocio"; texto: string },
  ): Promise<RequestMessage> {
    const { data } = await apiClient.post<RequestMessage>(`/requests/${id}/mensaje`, payload);
    return data;
  },
};
