import { apiClient } from "@/lib/axios";
import type { Service, CreateServicePayload, UpdateServicePayload } from "@/types/service.types";

export const servicesService = {
  async getAll(): Promise<Service[]> {
    const { data } = await apiClient.get<Service[]>("/services");
    return data;
  },

  async getById(mongoId: string): Promise<Service> {
    const { data } = await apiClient.get<Service>(`/services/${mongoId}`);
    return data;
  },

  async getByBusiness(negocioId: number): Promise<Service[]> {
    const { data } = await apiClient.get<Service[]>(`/services/negocio/${negocioId}`);
    return data;
  },

  async create(payload: CreateServicePayload): Promise<Service> {
    const { data } = await apiClient.post<Service>("/services", payload);
    return data;
  },

  async update(mongoId: string, payload: UpdateServicePayload): Promise<Service> {
    const { data } = await apiClient.patch<Service>(`/services/${mongoId}`, payload);
    return data;
  },

  async remove(mongoId: string): Promise<void> {
    await apiClient.delete(`/services/${mongoId}`);
  },
};
