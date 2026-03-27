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
  lastUsedAt: string;
  expiresAt: string;
}

interface SessionsApiResponse {
  success: boolean;
  sessions: Session[];
}

interface HistorySession {
  _id: string;
  device: SessionDevice;
  createdAt: string;
  lastUsedAt: string;
  updatedAt: string;
}

interface HistoryApiResponse {
  success: boolean;
  history: HistorySession[];
}

interface UpdateMePayload {
  fullName?: string;
  email?: string;
  avatar?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login(email: string, password: string) {
    return api.post<LoginApiResponse>("/auth/login", { email, password });
  },

  getMe() {
    return api.get<MeApiResponse>("/auth/me");
  },

  updateMe(data: UpdateMePayload) {
    return api.patch<MeApiResponse>("/auth/me", data);
  },

  changeMyPassword(data: ChangePasswordPayload) {
    return api.patch("/auth/me/password", data);
  },

  getSessions() {
    return api.get<SessionsApiResponse>("/auth/sessions");
  },

  getLoginHistory() {
    return api.get<HistoryApiResponse>("/auth/sessions/history");
  },

  logoutSession(sessionId: string) {
    return api.delete(`/auth/sessions/${sessionId}`);
  },

  logout() {
    return api.post("/auth/logout");
  },

  logoutAll() {
    return api.post("/auth/logout-all");
  },

  logoutOthers() {
    return api.post("/auth/logout-others");
  },

  refreshToken() {
    return api.post<RefreshApiResponse>("/auth/refresh");
  },
};
