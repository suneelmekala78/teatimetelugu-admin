"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { searchApi } from "@/lib/api/search";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  useAuth({ requiredRole: "admin" });
  const reindexMutation = useMutation({
    mutationFn: () => searchApi.reindex(),
    onSuccess: () => toast.success("Re-index triggered successfully"),
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Re-index failed";
      toast.error(message);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Application settings and maintenance" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Re-index</CardTitle>
            <CardDescription>
              Rebuild Meilisearch indexes for all News, Gallery, and Video content. This syncs the search engine with the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => reindexMutation.mutate()}
              disabled={reindexMutation.isPending}
              variant="outline"
            >
              {reindexMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Trigger Re-index
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
