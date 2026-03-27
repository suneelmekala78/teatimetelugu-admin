"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
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
  Smartphone,
  Laptop,
  Pencil,
  Lock,
  Globe,
  Wifi,
  History,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
import { PageHeader } from "@/components/common";
import { ImageUpload } from "@/components/common/image-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ── UA Parsing helpers ────────────────────────────────────────────── */

function parseOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) {
    return /Windows NT 10\.0.*Build\/(2[2-9]\d{3}|[3-9]\d{4})/.test(ua)
      ? "Windows 11"
      : "Windows 10";
  }
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Mac OS X/.test(ua)) {
    const m = ua.match(/Mac OS X (\d+[._]\d+)/);
    return m ? `macOS ${m[1].replace(/_/g, ".")}` : "macOS";
  }
  if (/CrOS/.test(ua)) return "Chrome OS";
  if (/Android/.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/);
    return m ? `Android ${m[1]}` : "Android";
  }
  if (/iPhone|iPad|iPod/.test(ua)) {
    const m = ua.match(/OS (\d+[._]\d+)/);
    return m ? `iOS ${m[1].replace(/_/g, ".")}` : "iOS";
  }
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown OS";
}

function parseBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Browser";
}

function parseDevice(ua: string): { icon: typeof Monitor; label: string; os: string; browser: string } {
  const os = parseOS(ua);
  const browser = parseBrowser(ua);

  if (/iPhone/.test(ua)) return { icon: Smartphone, label: "iPhone", os, browser };
  if (/iPad/.test(ua)) return { icon: Smartphone, label: "iPad", os, browser };
  if (/Android/.test(ua) && /Mobile/.test(ua)) {
    const m = ua.match(/;\s*([^;)]+)\s*Build/);
    return { icon: Smartphone, label: m ? m[1].trim() : "Android Phone", os, browser };
  }
  if (/Android/.test(ua)) return { icon: Smartphone, label: "Android Tablet", os, browser };
  return { icon: Laptop, label: os, os, browser };
}

/* ── Logout helper ────────────────────────────────────────────────── */

function useLogoutAndRedirect() {
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);
  return () => {
    clearUser();
    localStorage.removeItem("accessToken");
    document.cookie = "role=;path=/;max-age=0";
    router.replace("/login");
  };
}

/* ── Session Row (reused in both active & history) ─────────────────── */

function SessionRow({
  session,
  isActive,
  onTerminate,
}: {
  session: { _id: string; device?: { userAgent?: string; ip?: string; name?: string | null }; createdAt: string; lastUsedAt?: string; updatedAt?: string };
  isActive?: boolean;
  onTerminate?: (id: string) => void;
}) {
  const ua = session.device?.userAgent || "";
  const info = parseDevice(ua);
  const DeviceIcon = info.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <DeviceIcon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{info.label}</p>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {info.browser}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {info.os}
          </span>
          {session.device?.ip && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              {session.device.ip}
            </span>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isActive
              ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
              : format(new Date(session.createdAt), "MMM dd, yyyy, hh:mm a")}
          </span>
        </div>
      </div>
      {isActive && onTerminate && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onTerminate(session._id)}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { user } = useAuth({ requiredRole: "admin" });
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const doLogoutRedirect = useLogoutAndRedirect();

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Logout dialogs
  const [logoutDialog, setLogoutDialog] = useState<null | "this" | "all" | "others">(null);
  const [sessionToKill, setSessionToKill] = useState<string | null>(null);

  // Active sessions
  const { data: sessions, isPending: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => authApi.getSessions(),
    select: (res) => res.data.sessions,
  });

  // Login history
  const { data: history, isPending: historyLoading } = useQuery({
    queryKey: ["login-history"],
    queryFn: () => authApi.getLoginHistory(),
    select: (res) => res.data.history,
  });

  // Mutations
  const updateMeMutation = useMutation({
    mutationFn: (data: { fullName?: string; email?: string; avatar?: string }) =>
      authApi.updateMe(data),
    onSuccess: (res) => {
      setUser(res.data.user);
      toast.success("Profile updated");
      setEditMode(false);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to update profile"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changeMyPassword(data),
    onSuccess: () => {
      toast.success("Password changed. Please login again.");
      setShowPasswordDialog(false);
      doLogoutRedirect();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to change password"),
  });

  const logoutThisMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => { toast.success("Logged out"); doLogoutRedirect(); },
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => { toast.success("Logged out from all devices"); doLogoutRedirect(); },
  });

  const logoutOthersMutation = useMutation({
    mutationFn: () => authApi.logoutOthers(),
    onSuccess: () => {
      toast.success("All other sessions terminated");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["login-history"] });
      setLogoutDialog(null);
    },
    onError: () => toast.error("Failed to terminate other sessions"),
  });

  const killSessionMutation = useMutation({
    mutationFn: (id: string) => authApi.logoutSession(id),
    onSuccess: () => {
      toast.success("Session terminated");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["login-history"] });
      setSessionToKill(null);
    },
    onError: () => toast.error("Failed to terminate session"),
  });

  function startEdit() {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
    setAvatar(user.avatar || "");
    setEditMode(true);
  }

  function handleSaveProfile() {
    const changes: Record<string, string> = {};
    if (fullName.trim() && fullName.trim() !== user?.fullName) changes.fullName = fullName.trim();
    if (email.trim() && email.trim() !== user?.email) changes.email = email.trim();
    if (avatar !== (user?.avatar || "")) changes.avatar = avatar;
    if (Object.keys(changes).length === 0) { setEditMode(false); return; }
    updateMeMutation.mutate(changes);
  }

  function handleChangePassword() {
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Account details and session management"
      />

      {/* ── Profile Card ──────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </div>
          {user && !editMode && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
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
          ) : editMode ? (
            <div className="space-y-4 max-w-md">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <ImageUpload
                    value={avatar}
                    onChange={setAvatar}
                    folder="avatar"
                    className="!w-24 !h-24 !rounded-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveProfile} disabled={updateMeMutation.isPending} size="sm">
                  {updateMeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditMode(false)} disabled={updateMeMutation.isPending}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-border" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border">
                    <UserIcon className="h-7 w-7 text-primary" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="capitalize">{user.role}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}</span>
                </div>
                {user.lastLoginAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Last login {format(new Date(user.lastLoginAt), "MMM dd, yyyy, hh:mm a")}</span>
                  </div>
                )}
              </div>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setShowPasswordDialog(true);
                }}
              >
                <Lock className="h-4 w-4 mr-1" />
                Change Password
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Active Sessions Card ──────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Devices
              {sessions && (
                <Badge variant="secondary" className="ml-1">{sessions.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Devices currently logged into your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sessions?.length ? (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <SessionRow
                    key={session._id}
                    session={session}
                    isActive
                    onTerminate={setSessionToKill}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active sessions found</p>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setLogoutDialog("this")}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout this device
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLogoutDialog("others")}>
                <Monitor className="mr-2 h-4 w-4" />
                Logout other devices
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setLogoutDialog("all")}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout all devices
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Login History Card ─────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Login History
            </CardTitle>
            <CardDescription>
              Recent login sessions (logged out or expired)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history?.length ? (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {history.map((session) => (
                  <SessionRow key={session._id} session={session} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No login history yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Change Password Dialog ────────────────────────────────── */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              All your sessions will be logged out after changing the password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currentPwd">Current Password</Label>
              <Input id="currentPwd" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPwd">New Password</Label>
              <Input id="newPwd" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPwd">Confirm New Password</Label>
              <Input id="confirmPwd" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} disabled={changePasswordMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
            >
              {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Logout Confirmation Dialogs ───────────────────────────── */}
      <Dialog open={logoutDialog !== null} onOpenChange={(open) => !open && setLogoutDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {logoutDialog === "this" && "Logout from this device?"}
              {logoutDialog === "all" && "Logout from all devices?"}
              {logoutDialog === "others" && "Logout from all other devices?"}
            </DialogTitle>
            <DialogDescription>
              {logoutDialog === "this" && "You will be redirected to the login page."}
              {logoutDialog === "all" && "All sessions including this one will be terminated. You will need to login again."}
              {logoutDialog === "others" && "All sessions except the current one will be terminated. Other devices will need to login again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialog(null)}>Cancel</Button>
            {logoutDialog === "this" && (
              <Button variant="destructive" onClick={() => logoutThisMutation.mutate()} disabled={logoutThisMutation.isPending}>
                {logoutThisMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Logout
              </Button>
            )}
            {logoutDialog === "all" && (
              <Button variant="destructive" onClick={() => logoutAllMutation.mutate()} disabled={logoutAllMutation.isPending}>
                {logoutAllMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Logout All
              </Button>
            )}
            {logoutDialog === "others" && (
              <Button variant="destructive" onClick={() => logoutOthersMutation.mutate()} disabled={logoutOthersMutation.isPending}>
                {logoutOthersMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Logout Others
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Kill Specific Session Dialog ──────────────────────────── */}
      <Dialog open={sessionToKill !== null} onOpenChange={(open) => !open && setSessionToKill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate session?</DialogTitle>
            <DialogDescription>This device will be logged out and need to sign in again.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionToKill(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => sessionToKill && killSessionMutation.mutate(sessionToKill)}
              disabled={killSessionMutation.isPending}
            >
              {killSessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
