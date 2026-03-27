"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Clock,
  Monitor,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user } = useAuth({ requiredRole: "admin" });
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);

  const { data: sessions, isPending: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => authApi.getSessions(),
    select: (res) => res.data.sessions,
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => {
      toast.success("Logged out from all devices");
      clearUser();
      localStorage.removeItem("accessToken");
      document.cookie = "role=;path=/;max-age=0";
      router.replace("/login");
    },
    onError: () => toast.error("Failed to logout from all devices"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Account details and session management"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border">
                      <UserIcon className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      Role: <span className="font-medium capitalize">{user.role}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      Joined:{" "}
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>
                        Last login:{" "}
                        {format(
                          new Date(user.lastLoginAt),
                          "MMM dd, yyyy, hh:mm a"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Devices currently logged into your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sessions?.length ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <Monitor className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">
                        {session.device?.name ||
                          (session.device?.userAgent?.substring(0, 60) +
                            (session.device?.userAgent?.length > 60
                              ? "..."
                              : "")) ||
                          "Unknown device"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Since{" "}
                        {format(
                          new Date(session.createdAt),
                          "MMM dd, yyyy, hh:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active sessions found
              </p>
            )}

            <div className="pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => logoutAllMutation.mutate()}
                disabled={logoutAllMutation.isPending}
              >
                {logoutAllMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Logout from all devices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
