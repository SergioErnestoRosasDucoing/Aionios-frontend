import { apiClient } from "@/lib/axios";
import type { BusinessUiConfig } from "@/types/business-ui.types";

export const businessUiService = {
  async getByNegocio(negocioId: number): Promise<BusinessUiConfig | null> {
    const { data } = await apiClient.get<BusinessUiConfig | null>(`/business-ui/negocio/${negocioId}`);
    return data;
  },

  async upsert(
    negocioId: number,
    payload: { color_primario: string; slogan: string; descripcion_corta: string },
  ): Promise<BusinessUiConfig> {
    const { data } = await apiClient.put<BusinessUiConfig>(`/business-ui/negocio/${negocioId}`, payload);
    return data;
  },
};
