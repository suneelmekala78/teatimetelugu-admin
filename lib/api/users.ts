import api from "./client";
import type { User } from "@/types";

export interface UserQuery {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: string;
  search?: string;
  sortBy?: "createdAt" | "lastLoginAt" | "fullName";
  order?: "asc" | "desc";
}

interface UserListResponse {
  success: boolean;
  users: User[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface CreateWriterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
}

export const userApi = {
  getAll(params?: UserQuery) {
    return api.get<UserListResponse>("/users", { params });
  },

  getById(id: string) {
    return api.get<{ success: boolean; user: User }>(`/users/${id}`);
  },

  createWriter(data: CreateWriterPayload) {
    return api.post<{ success: boolean; user: User }>("/users", data);
  },

  updateUser(id: string, data: UpdateUserPayload) {
    return api.patch<{ success: boolean; user: User }>(`/users/${id}`, data);
  },

  changePassword(id: string, password: string) {
    return api.patch<{ success: boolean; message: string }>(
      `/users/${id}/password`,
      { password }
    );
  },

  updateRole(id: string, role: string) {
    return api.patch<{ success: boolean; user: User }>(`/users/${id}/role`, { role });
  },

  toggleActive(id: string) {
    return api.patch<{ success: boolean; user: User }>(`/users/${id}/toggle-active`);
  },
};
