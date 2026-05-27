import { apiClient } from "@/lib/axios";
import type { User, Role, CreateUserPayload, UpdateUserPayload, CreateRolePayload } from "@/types/user.types";

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>("/users");
    return data;
  },

  async getById(id: number): Promise<User> {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await apiClient.post<User>("/users", payload);
    return data;
  },

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    const { data } = await apiClient.patch<User>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  roles: {
    async getAll(): Promise<Role[]> {
      const { data } = await apiClient.get<Role[]>("/users/roles");
      return data;
    },

    async create(payload: CreateRolePayload): Promise<Role> {
      const { data } = await apiClient.post<Role>("/users/roles", payload);
      return data;
    },

    async update(id: number, payload: Partial<CreateRolePayload>): Promise<Role> {
      const { data } = await apiClient.patch<Role>(`/users/roles/${id}`, payload);
      return data;
    },

    async remove(id: number): Promise<void> {
      await apiClient.delete(`/users/roles/${id}`);
    },
  },
};
