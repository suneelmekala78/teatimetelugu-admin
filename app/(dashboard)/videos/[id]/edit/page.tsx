"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { videoApi } from "@/lib/api";
import { VideoForm } from "@/components/forms/video-form";
import { PageHeader } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["videos", id],
    queryFn: () => videoApi.getById(id),
    select: (res) => res.data.video,
  });

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-[400px] w-full" /></div>;
  if (!data) return <p>Video not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Video" />
      <VideoForm initialData={data} />
    </div>
  );
}
