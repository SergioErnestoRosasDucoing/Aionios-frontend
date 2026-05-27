import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://aionios-backend.onrender.com";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Inject Bearer token on every request
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("aionios_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear session and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("aionios_token");
      localStorage.removeItem("aionios_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const tokenStorage = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("aionios_token") : null,

  set: (token: string): void => {
    if (typeof window !== "undefined") localStorage.setItem("aionios_token", token);
  },

  remove: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aionios_token");
      localStorage.removeItem("aionios_user");
    }
  },
};
