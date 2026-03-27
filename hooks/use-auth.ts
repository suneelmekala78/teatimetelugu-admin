"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api";

function clearAuthCookies() {
  document.cookie = "role=;path=/;max-age=0";
}

export function useAuth({ requireAuth = true, requiredRole }: { requireAuth?: boolean; requiredRole?: "admin" } = {}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const checkedRef = useRef(false);

  useEffect(() => {
    const { setUser, clearUser, setLoading } = useAuthStore.getState();

    function handleUnauthenticated() {
      clearUser();
      localStorage.removeItem("accessToken");
      clearAuthCookies();
      if (requireAuth) router.replace("/login");
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      handleUnauthenticated();
      return;
    }

    // Already checked & authenticated — just validate role
    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.user) {
      if (requiredRole && state.user.role !== requiredRole) {
        router.replace("/");
        return;
      }
      setLoading(false);
      return;
    }

    // Prevent duplicate getMe calls in strict mode
    if (checkedRef.current) return;
    checkedRef.current = true;

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
        checkedRef.current = false;
        handleUnauthenticated();
      });
  }, [requireAuth, requiredRole, router]);

  return { user, isAuthenticated, isLoading };
}
