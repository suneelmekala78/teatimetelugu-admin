"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api";

function clearAuthCookies() {
  document.cookie = "role=;path=/;max-age=0";
}

export function useAuth({ requireAuth = true, requiredRole }: { requireAuth?: boolean; requiredRole?: "admin" } = {}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading } =
    useAuthStore();

  const handleUnauthenticated = useCallback(() => {
    clearUser();
    localStorage.removeItem("accessToken");
    clearAuthCookies();
    if (requireAuth) router.replace("/login");
  }, [requireAuth, clearUser, router]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      handleUnauthenticated();
      return;
    }

    if (isAuthenticated && user) {
      // Check role requirement even if already authenticated
      if (requiredRole && user.role !== requiredRole) {
        router.replace("/");
        return;
      }
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then(({ data }) => {
        const u = data.user;
        if (u.role !== "admin" && u.role !== "writer") {
          handleUnauthenticated();
          return;
        }
        if (requiredRole && u.role !== requiredRole) {
          setUser(u);
          router.replace("/");
          return;
        }
        setUser(u);
      })
      .catch(() => {
        handleUnauthenticated();
      });
  }, [requireAuth, requiredRole, isAuthenticated, user, setLoading, setUser, handleUnauthenticated, router]);

  return { user, isAuthenticated, isLoading };
}
