"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { videoApi, type VideoQuery } from "@/lib/api/videos";
import { userApi } from "@/lib/api/users";
import type { Video } from "@/types";
import { DataTable, PageHeader, StatusBadge, ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_OPTIONS, SITE_URLS } from "@/constants";
import { getSubCategoryOptions } from "@/constants/categories";
import { Label } from "@/components/ui/label";

const videoSubcategories = getSubCategoryOptions("videos");

const columns: ColumnDef<Video>[] = [
  {
    accessorKey: "thumbnail",
    header: "",
    cell: ({ row }) => (
      <img src={row.original.thumbnail} alt="" className="h-10 w-16 rounded object-cover" />
    ),
    size: 64,
  },
  {
    accessorKey: "title.en",
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="font-medium truncate">{row.original.title.en}</p>
        <p className="text-xs text-muted-foreground truncate">{row.original.title.te}</p>
      </div>
    ),
  },
  {
    accessorKey: "subCategory",
    header: "Sub-category",
    cell: ({ row }) => <span className="capitalize">{row.original.subCategory.replace(/-/g, " ")}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: "viewCount", header: "Views" },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "MMM dd, yyyy, hh:mm a"),
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      return <VideoActions video={row.original} />;
    },
  },
];

function VideoActions({ video }: { video: Video }) {
  const [showDelete, setShowDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => videoApi.delete(video._id),
    onSuccess: () => {
      toast.success("Video deleted");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setShowDelete(false);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete";
      toast.error(message);
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
            <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => window.open(`${SITE_URLS.english}/videos/v/${video.slug}`, '_blank', 'noopener')}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> View (English)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(`${SITE_URLS.telugu}/videos/v/${video.slug}`, '_blank', 'noopener')}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> View (Telugu)
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/videos/${video._id}/edit`} />}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Video"
        description={`Delete "${video.title.en}"? This cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default function VideosPage() {
  const [filters, setFilters] = useState<VideoQuery>({ page: 1, limit: 10, status: "", subCategory: "", author: "", sortBy: "createdAt", order: "desc" });

  const { data, isLoading } = useQuery({
    queryKey: ["videos", filters],
    queryFn: () => videoApi.getAll(filters),
    select: (res) => res.data,
  });

  const { data: writersData } = useQuery({
    queryKey: ["writers"],
    queryFn: () => userApi.getAll({ role: "writer", limit: 100 }),
    select: (res) => res.data.users,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Videos" description="Manage video content" createHref="/videos/create" createLabel="Add Video" />
      <div className="flex gap-4 flex-wrap">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={filters.status || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, status: !v || v === "all" ? "" : v, page: 1 }))}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Sub-category</Label>
          <Select value={filters.subCategory || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, subCategory: !v || v === "all" ? "" : v, page: 1 }))}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sub-category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-categories</SelectItem>
              {videoSubcategories.map((sc) => <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Writer</Label>
          <Select value={filters.author || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, author: !v || v === "all" ? "" : v, page: 1 }))}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Writer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Writers</SelectItem>
              {writersData?.map((u) => <SelectItem key={u._id} value={u._id}>{u.fullName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable columns={columns} data={data?.videos ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
    </div>
  );
}
