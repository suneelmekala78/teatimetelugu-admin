import api from "./client";
import type { User } from "@/types";

// Backend returns flat JSON: { success, accessToken, user }
interface LoginApiResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

interface MeApiResponse {
  success: boolean;
  user: User;
}

interface RefreshApiResponse {
  success: boolean;
  accessToken: string;
}

export const authApi = {
  login(email: string, password: string) {
    return api.post<LoginApiResponse>("/auth/login", { email, password });
  },

  getMe() {
    return api.get<MeApiResponse>("/auth/me");
  },

  logout() {
    return api.post("/auth/logout");
  },

  logoutAll() {
    return api.post("/auth/logout-all");
  },

  refreshToken() {
    return api.post<RefreshApiResponse>("/auth/refresh");
  },
};
