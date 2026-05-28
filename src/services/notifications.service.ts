import { apiClient } from "@/lib/axios";
import type { Notificacion } from "@/types/notification.types";

export const notificationsService = {
  async getByUser(usuarioId: number, limit = 10): Promise<Notificacion[]> {
    const { data } = await apiClient.get<Notificacion[]>(
      `/notifications/user/${usuarioId}`,
      { params: { limit } }
    );
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async markRead(id: string): Promise<Notificacion> {
    const { data } = await apiClient.patch<Notificacion>(
      `/notifications/${id}`,
      { leido: true }
    );
    return data;
  },

  /** Elimina en la BD todas las notificaciones genéricas antiguas del interceptor */
  async clearLegacy(usuarioId: number): Promise<void> {
    await apiClient.delete(`/notifications/user/${usuarioId}/legacy`);
  },
};
