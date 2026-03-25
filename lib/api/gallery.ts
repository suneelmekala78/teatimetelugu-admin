import api from "./client";
import type { Gallery, ApiResponse } from "@/types";

export interface GalleryQuery {
  page?: number;
  limit?: number;
  status?: string;
  subCategory?: string;
  sortBy?: "createdAt" | "publishedAt" | "viewCount";
  order?: "asc" | "desc";
}

interface GalleryListResponse {
  success: boolean;
  galleries: Gallery[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const galleryApi = {
  getAll(params?: GalleryQuery) {
    return api.get<GalleryListResponse>("/gallery", { params });
  },

  getById(id: string) {
    return api.get<{ success: boolean; gallery: Gallery }>("/gallery/" + id);
  },

  create(data: Record<string, unknown>) {
    return api.post<{ success: boolean; gallery: Gallery }>("/gallery", data);
  },

  update(id: string, data: Record<string, unknown>) {
    return api.patch<{ success: boolean; gallery: Gallery }>("/gallery/" + id, data);
  },

  delete(id: string) {
    return api.delete<ApiResponse<null>>("/gallery/" + id);
  },
};
