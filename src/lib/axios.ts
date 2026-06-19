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

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
}

// On 401: try refresh token before redirecting to login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !originalRequest._retry
    ) {
      const refreshToken = localStorage.getItem("aionios_refresh_token");

      if (!refreshToken) {
        tokenStorage.remove();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        tokenStorage.set(data.token, data.refreshToken);
        processQueue(data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return apiClient(originalRequest);
      } catch {
        tokenStorage.remove();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const tokenStorage = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("aionios_token") : null,

  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("aionios_refresh_token") : null,

  set: (token: string, refreshToken: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aionios_token", token);
      localStorage.setItem("aionios_refresh_token", refreshToken);
    }
  },

  remove: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aionios_token");
      localStorage.removeItem("aionios_refresh_token");
      localStorage.removeItem("aionios_user");
    }
  },
};
