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

interface SessionDevice {
  userAgent: string;
  ip: string;
  name: string | null;
}

interface Session {
  _id: string;
  device: SessionDevice;
  createdAt: string;
  expiresAt: string;
}

interface SessionsApiResponse {
  success: boolean;
  sessions: Session[];
}

export const authApi = {
  login(email: string, password: string) {
    return api.post<LoginApiResponse>("/auth/login", { email, password });
  },

  getMe() {
    return api.get<MeApiResponse>("/auth/me");
  },

  getSessions() {
    return api.get<SessionsApiResponse>("/auth/sessions");
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
