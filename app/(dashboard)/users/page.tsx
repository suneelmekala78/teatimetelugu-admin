"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Shield, ShieldOff, Pencil, KeyRound } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useAuth } from "@/hooks/use-auth";
import { userApi, type UserQuery } from "@/lib/api/users";
import type { User } from "@/types";
import { DataTable, PageHeader, ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "writer", label: "Writer" },
  { value: "admin", label: "Admin" },
];

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "default" as const;
    case "writer":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "avatar",
    header: "",
    cell: ({ row }) => (
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {row.original.avatar ? (
          <img src={row.original.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-medium">
            {row.original.fullName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    ),
    size: 40,
  },
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.fullName}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={roleBadgeVariant(row.original.role)} className="capitalize">
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "authProvider",
    header: "Provider",
    cell: ({ row }) => (
      <span className="capitalize text-sm">{row.original.authProvider}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "outline" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => format(new Date(row.original.createdAt), "MMM dd, yyyy"),
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      return <UserActions user={row.original} />;
    },
  },
];

function UserActions({ user }: { user: User }) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [newPassword, setNewPassword] = useState("");
  const queryClient = useQueryClient();

  const roleMutation = useMutation({
    mutationFn: () => userApi.updateRole(user._id, selectedRole),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowRoleDialog(false);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update role";
      toast.error(message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => userApi.toggleActive(user._id),
    onSuccess: () => {
      toast.success(user.isActive ? "User deactivated" : "User activated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowToggleDialog(false);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update status";
      toast.error(message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => userApi.changePassword(user._id, newPassword),
    onSuccess: () => {
      toast.success("Password changed. Notification email sent to the user.");
      setShowPasswordDialog(false);
      setNewPassword("");
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to change password";
      toast.error(message);
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/users/${user._id}/edit`} />}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={user.isActive ? "text-destructive" : ""}
            onClick={() => setShowToggleDialog(true)}
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            {user.isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Role Dialog */}
      <ConfirmDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        title="Change User Role"
        description={
          <div className="space-y-3">
            <p>
              Change role for <strong>{user.fullName}</strong>:
            </p>
            <Select
              value={selectedRole}
              onValueChange={(v) => {
                if (v) setSelectedRole(v as User["role"]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        onConfirm={() => roleMutation.mutate()}
        isLoading={roleMutation.isPending}
        variant="default"
        confirmText="Update Role"
      />

      {/* Toggle Active Dialog */}
      <ConfirmDialog
        open={showToggleDialog}
        onOpenChange={setShowToggleDialog}
        title={user.isActive ? "Deactivate User" : "Activate User"}
        description={`Are you sure you want to ${user.isActive ? "deactivate" : "activate"} "${user.fullName}"?`}
        onConfirm={() => toggleMutation.mutate()}
        isLoading={toggleMutation.isPending}
        confirmText={user.isActive ? "Deactivate" : "Activate"}
      />

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{user.fullName}</strong>. A
              notification email will be sent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setNewPassword("");
              }}
              disabled={passwordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => passwordMutation.mutate()}
              disabled={passwordMutation.isPending || newPassword.length < 6}
            >
              {passwordMutation.isPending ? "Saving..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function UsersPage() {
  useAuth({ requiredRole: "admin" });

  const [filters, setFilters] = useState<UserQuery>({
    page: 1,
    limit: 20,
    role: "",
    search: "",
    sortBy: "createdAt",
    order: "desc",
  });

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => userApi.getAll(filters),
    select: (res) => res.data,
  });

  const handleSearch = () => {
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage user accounts and roles"
        createHref="/users/create"
        createLabel="Create Writer"
      />

      <div className="flex gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-[250px]"
          />
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>

        <Select
          value={filters.role || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({
              ...f,
              role: !v || v === "all" ? "" : v,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.users ?? []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
      />
    </div>
  );
}
