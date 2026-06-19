import { apiClient, tokenStorage } from "@/lib/axios";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth.types";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    tokenStorage.set(data.token, data.refreshToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("aionios_user", JSON.stringify(data.user));
    }
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
    tokenStorage.set(data.token, data.refreshToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("aionios_user", JSON.stringify(data.user));
    }
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefresh();
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refreshToken });
      } catch {
        // Si falla la revocación en el servidor, igual limpiamos local
      }
    }
    tokenStorage.remove();
  },
};
