import api from "./client";
import type { Comment } from "@/types";

export interface CommentQuery {
  page?: number;
  limit?: number;
}

interface CommentListResponse {
  success: boolean;
  comments: Comment[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const commentApi = {
  getByTarget(targetModel: string, targetId: string, params?: CommentQuery) {
    return api.get<CommentListResponse>(
      `/comments/${targetModel}/${targetId}`,
      { params }
    );
  },

  delete(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/comments/${id}`);
  },
};
