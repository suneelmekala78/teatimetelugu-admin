"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { commentApi } from "@/lib/api/comments";
import { newsApi } from "@/lib/api/news";
import { galleryApi } from "@/lib/api/gallery";
import type { Comment, News, Gallery } from "@/types";
import { DataTable, PageHeader, ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CommentsPage() {
  const [targetModel, setTargetModel] = useState("News");
  const [targetId, setTargetId] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch items based on selected target model
  const { data: newsData } = useQuery({
    queryKey: ["news", { page: 1, limit: 20 }],
    queryFn: () => newsApi.getAll({ page: 1, limit: 20 }),
    select: (res) => res.data.news,
    enabled: targetModel === "News",
  });

  const { data: galleryData } = useQuery({
    queryKey: ["gallery", { page: 1, limit: 20 }],
    queryFn: () => galleryApi.getAll({ page: 1, limit: 20 }),
    select: (res) => res.data.galleries,
    enabled: targetModel === "Gallery",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["comments", targetModel, targetId, page],
    queryFn: () => commentApi.getByTarget(targetModel, targetId, { page, limit: 20 }),
    select: (res) => res.data,
    enabled: !!targetId,
  });

  const columns: ColumnDef<Comment>[] = [
    {
      accessorKey: "text",
      header: "Comment",
      cell: ({ row }) => (
        <div className="max-w-[400px]">
          <p className="truncate">{row.original.text}</p>
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => {
        const author = row.original.author;
        return author ? author.fullName : <span className="text-muted-foreground">Deleted</span>;
      },
    },
    {
      accessorKey: "language",
      header: "Lang",
      cell: ({ row }) => <Badge variant="outline">{row.original.language.toUpperCase()}</Badge>,
    },
    {
      accessorKey: "likes",
      header: "Likes",
      cell: ({ row }) => row.original.likes.length,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM dd, yyyy"),
    },
    {
      id: "actions",
      cell: function ActionsCell({ row }) {
        const [showDelete, setShowDelete] = useState(false);
        const deleteMutation = useMutation({
          mutationFn: () => commentApi.delete(row.original._id),
          onSuccess: () => {
            toast.success("Comment deleted");
            queryClient.invalidateQueries({ queryKey: ["comments"] });
            setShowDelete(false);
          },
          onError: (err: unknown) => {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete";
            toast.error(message);
          },
        });

        if (row.original.isDeleted) return <Badge variant="secondary">Deleted</Badge>;

        return (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <ConfirmDialog
              open={showDelete}
              onOpenChange={setShowDelete}
              title="Delete Comment"
              description="This will soft-delete the comment. The user will see [deleted]."
              onConfirm={() => deleteMutation.mutate()}
              isLoading={deleteMutation.isPending}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Comments" description="Moderate user comments" />

      <div className="flex gap-3 items-end">
        <div>
          <Label>Content Type</Label>
          <Select value={targetModel} onValueChange={(v) => { if (v) { setTargetModel(v); setTargetId(""); } }}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="News">News</SelectItem>
              <SelectItem value="Gallery">Gallery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label>Select {targetModel === "News" ? "Article" : "Gallery"}</Label>
          {(targetModel === "News" ? newsData : galleryData) ? (
            <Select value={targetId} onValueChange={(v) => { if (v) { setTargetId(v); setPage(1); } }}>
              <SelectTrigger><SelectValue placeholder={`Select a ${targetModel.toLowerCase()} to view comments`} /></SelectTrigger>
              <SelectContent>
                {targetModel === "News"
                  ? newsData?.map((n: News) => (
                      <SelectItem key={n._id} value={n._id}>{n.title.en}</SelectItem>
                    ))
                  : galleryData?.map((g: Gallery) => (
                      <SelectItem key={g._id} value={g._id}>{g.title.en}</SelectItem>
                    ))}
              </SelectContent>
            </Select>
          ) : (
            <Input placeholder="Enter target ID" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
          )}
        </div>
      </div>

      {targetId ? (
        <DataTable
          columns={columns}
          data={data?.comments ?? []}
          isLoading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      ) : (
        <div className="flex h-48 items-center justify-center text-muted-foreground border rounded-md">
          Select an article above to view its comments
        </div>
      )}
    </div>
  );
}
