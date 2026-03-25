"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { newsApi, type NewsQuery } from "@/lib/api/news";
import type { News } from "@/types";
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
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "@/constants";

const columns: ColumnDef<News>[] = [
  {
    accessorKey: "thumbnail",
    header: "",
    cell: ({ row }) => (
      <img
        src={row.original.thumbnail}
        alt=""
        className="h-10 w-16 rounded object-cover"
      />
    ),
    size: 64,
  },
  {
    accessorKey: "title.en",
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="font-medium truncate">{row.original.title.en}</p>
        <p className="text-xs text-muted-foreground truncate">
          {row.original.title.te}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.category}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "viewCount",
    header: "Views",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "MMM dd, yyyy"),
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      return <NewsActions news={row.original} />;
    },
  },
];

function NewsActions({ news }: { news: News }) {
  const [showDelete, setShowDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => newsApi.delete(news._id),
    onSuccess: () => {
      toast.success("Article deleted");
      queryClient.invalidateQueries({ queryKey: ["news"] });
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
          <DropdownMenuItem render={<Link href={`/news/${news._id}/edit`} />}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Article"
        description={`Are you sure you want to delete "${news.title.en}"? This cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default function NewsPage() {
  const [filters, setFilters] = useState<NewsQuery>({
    page: 1,
    limit: 10,
    status: "",
    category: "",
    sortBy: "createdAt",
    order: "desc",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["news", filters],
    queryFn: () => newsApi.getAll(filters),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="News"
        description="Manage news articles"
        createHref="/news/create"
        createLabel="New Article"
      />

      <div className="flex gap-3">
        <Select
          value={filters.status || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, status: !v || v === "all" ? "" : v, page: 1 }))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category || "all"}
          onValueChange={(v) =>
            setFilters((f) => ({
              ...f,
              category: !v || v === "all" ? "" : v,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.news ?? []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
      />
    </div>
  );
}
