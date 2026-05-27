import { apiClient } from "@/lib/axios";
import type {
  Business,
  CreateBusinessPayload,
  UpdateBusinessPayload,
  StaffMember,
  AssignStaffPayload,
} from "@/types/business.types";

export const businessService = {
  async getAll(): Promise<Business[]> {
    const { data } = await apiClient.get<Business[]>("/business");
    return data;
  },

  async getMine(): Promise<Business | null> {
    const { data } = await apiClient.get<Business | null>("/business/mine");
    return data;
  },

  async getById(id: number): Promise<Business> {
    const { data } = await apiClient.get<Business>(`/business/${id}`);
    return data;
  },

  async create(payload: CreateBusinessPayload): Promise<Business> {
    const { data } = await apiClient.post<Business>("/business", payload);
    return data;
  },

  async update(id: number, payload: UpdateBusinessPayload): Promise<Business> {
    const { data } = await apiClient.patch<Business>(`/business/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/business/${id}`);
  },

  async getStaff(businessId: number): Promise<StaffMember[]> {
    const { data } = await apiClient.get<StaffMember[]>(`/business/${businessId}/staff`);
    return data;
  },

  async assignStaff(businessId: number, payload: AssignStaffPayload): Promise<void> {
    await apiClient.post(`/business/${businessId}/staff`, payload);
  },

  async removeStaff(businessId: number): Promise<void> {
    await apiClient.delete(`/business/${businessId}/staff`);
  },
};
