import axios from "axios";

// All requests go through Next.js rewrites (same-origin) so cookies work properly.
// The rewrite proxies /api/* to the backend URL set in NEXT_PUBLIC_API_URL.
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 — attempt token refresh once
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only skip refresh for public auth endpoints (login, register, refresh, etc.)
    // Protected endpoints like /auth/me MUST go through the refresh flow
    const publicAuthPaths = ["/auth/login", "/auth/register", "/auth/verify-registration", "/auth/refresh", "/auth/google", "/auth/forgot-password", "/auth/verify-otp", "/auth/reset-password"];
    const isPublicAuth = publicAuthPaths.some((p) => originalRequest.url === p);
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuth) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = data.accessToken;
        localStorage.setItem("accessToken", newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        if (typeof window !== "undefined") {
          document.cookie = "role=;path=/;max-age=0";
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
