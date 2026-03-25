"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  news: "News",
  videos: "Videos",
  gallery: "Gallery",
  comments: "Comments",
  "home-config": "Home Config",
  users: "Users",
  notifications: "Notifications",
  settings: "Settings",
  create: "Create",
  edit: "Edit",
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <span className="text-sm font-medium text-foreground">Dashboard</span>
    );
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Dashboard
      </Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const label = routeLabels[segment] || segment;

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AppHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // proceed even if logout API fails
    }
    localStorage.removeItem("accessToken");
    document.cookie = "role=;path=/;max-age=0";
    clearUser();
    toast.success("Logged out");
    router.replace("/login");
  }

  return (
    <>
      <header className="flex h-14 items-center gap-3 border-b bg-card/50 backdrop-blur-sm px-6 sticky top-0 z-30">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5" />
        <Breadcrumbs />
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span className="font-medium text-foreground text-[13px]">
              {user?.fullName}
            </span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogoutDialog(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline text-[13px]">Logout</span>
          </Button>
        </div>
      </header>

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Confirm Logout"
        description="Are you sure you want to log out? You'll need to sign in again to access the dashboard."
        onConfirm={handleLogout}
        variant="destructive"
        confirmText="Logout"
      />
    </>
  );
}
