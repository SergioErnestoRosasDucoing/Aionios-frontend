import { apiClient } from "@/lib/axios";
import type { Ticket, TicketEstado, CreateTicketPayload } from "@/types/ticket.types";

export const ticketsService = {
  async getMine(): Promise<Ticket[]> {
    const { data } = await apiClient.get<Ticket[]>("/support-tickets/mine");
    return data;
  },

  async create(payload: CreateTicketPayload & { usuario_id: number; autor_nombre?: string }): Promise<Ticket> {
    const { mensaje_inicial, autor_nombre, ...rest } = payload;
    const { data } = await apiClient.post<Ticket>("/support-tickets", {
      ...rest,
      mensajes: mensaje_inicial
        ? [{ autor_id: rest.usuario_id, autor_nombre, texto: mensaje_inicial, fecha: new Date().toISOString() }]
        : [],
    });
    return data;
  },

  async addMensaje(id: string, texto: string, autor_id: number, autor_nombre?: string): Promise<Ticket> {
    const { data } = await apiClient.post<Ticket>(`/support-tickets/${id}/mensaje`, {
      texto,
      autor_id,
      autor_nombre,
    });
    return data;
  },

  async updateEstado(id: string, estado: TicketEstado): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/support-tickets/${id}`, { estado });
    return data;
  },

  async getAll(): Promise<Ticket[]> {
    const { data } = await apiClient.get<Ticket[]>("/support-tickets");
    return data;
  },
};
