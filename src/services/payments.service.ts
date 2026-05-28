import { apiClient } from "@/lib/axios";
import type { Pago, CreatePaymentPayload, EstadoPago } from "@/types/payment.types";

export const paymentsService = {
  async getByNegocio(negocioId: number): Promise<Pago[]> {
    const { data } = await apiClient.get<Pago[]>(`/payments/negocio/${negocioId}`);
    return data;
  },

  async create(payload: CreatePaymentPayload): Promise<Pago> {
    const { data } = await apiClient.post<Pago>("/payments", payload);
    return data;
  },

  async updateEstado(id: number, estado_pago: EstadoPago): Promise<Pago> {
    const { data } = await apiClient.patch<Pago>(`/payments/${id}`, { estado_pago });
    return data;
  },

  async update(id: number, payload: { monto?: number; metodo_pago?: string; estado_pago?: EstadoPago }): Promise<Pago> {
    const { data } = await apiClient.patch<Pago>(`/payments/${id}`, payload);
    return data;
  },
};
