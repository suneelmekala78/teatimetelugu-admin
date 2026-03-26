import api from "./client";
import type { Video, ApiResponse } from "@/types";

export interface VideoQuery {
  page?: number;
  limit?: number;
  status?: string;
  subCategory?: string;
  author?: string;
  sortBy?: "createdAt" | "publishedAt" | "viewCount";
  order?: "asc" | "desc";
}

interface VideoListResponse {
  success: boolean;
  videos: Video[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const videoApi = {
  getAll(params?: VideoQuery) {
    return api.get<VideoListResponse>("/videos", { params });
  },

  getById(id: string) {
    return api.get<{ success: boolean; video: Video }>("/videos/" + id);
  },

  create(data: Record<string, unknown>) {
    return api.post<{ success: boolean; video: Video }>("/videos", data);
  },

  update(id: string, data: Record<string, unknown>) {
    return api.patch<{ success: boolean; video: Video }>("/videos/" + id, data);
  },

  delete(id: string) {
    return api.delete<ApiResponse<null>>("/videos/" + id);
  },
};
