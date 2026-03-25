"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { galleryApi } from "@/lib/api";
import { GalleryForm } from "@/components/forms/gallery-form";
import { PageHeader } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["gallery", id],
    queryFn: () => galleryApi.getById(id),
    select: (res) => res.data.gallery,
  });

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-[400px] w-full" /></div>;
  if (!data) return <p>Gallery not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Gallery" />
      <GalleryForm initialData={data} />
    </div>
  );
}
