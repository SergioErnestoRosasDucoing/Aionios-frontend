import { apiClient } from "@/lib/axios";
import type { Review, CreateReviewPayload } from "@/types/review.types";

export const reviewsService = {
  async getMine(): Promise<Review[]> {
    const { data } = await apiClient.get<Review[]>("/reviews/mine");
    return data;
  },

  async getByNegocio(negocioId: number): Promise<Review[]> {
    const { data } = await apiClient.get<Review[]>(`/reviews/negocio/${negocioId}`);
    return data;
  },

  async create(payload: CreateReviewPayload): Promise<Review> {
    const { data } = await apiClient.post<Review>("/reviews", payload);
    return data;
  },

  async addRespuesta(id: string, respuesta: string): Promise<Review> {
    const { data } = await apiClient.post<Review>(`/reviews/${id}/respuesta`, { respuesta });
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`);
  },
};
