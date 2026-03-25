"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsApi } from "@/lib/api";
import { NewsForm } from "@/components/forms";
import { PageHeader } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: () => newsApi.getById(id),
    select: (res) => res.data.news,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!data) return <p>Article not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit News Article" />
      <NewsForm initialData={data} />
    </div>
  );
}
