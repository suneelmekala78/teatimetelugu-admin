import api from "./client";
import type { News, ApiResponse } from "@/types";

export interface NewsQuery {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  author?: string;
  search?: string;
  sortBy?: "createdAt" | "publishedAt" | "viewCount" | "reactionsCount" | "commentsCount";
  order?: "asc" | "desc";
}

interface NewsListResponse {
  success: boolean;
  news: News[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const newsApi = {
  getAll(params?: NewsQuery) {
    return api.get<NewsListResponse>("/news", { params });
  },

  getById(id: string) {
    return api.get<{ success: boolean; news: News }>("/news/" + id);
  },

  create(data: Record<string, unknown>) {
    return api.post<{ success: boolean; news: News }>("/news", data);
  },

  update(id: string, data: Record<string, unknown>) {
    return api.patch<{ success: boolean; news: News }>("/news/" + id, data);
  },

  delete(id: string) {
    return api.delete<ApiResponse<null>>("/news/" + id);
  },
};
