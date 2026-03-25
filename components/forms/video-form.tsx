"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/common";
import { videoSchema, type VideoFormValues } from "@/lib/validations";
import { videoApi } from "@/lib/api";
import { getSubCategoryOptions, STATUS_OPTIONS } from "@/constants";
import type { Video } from "@/types";

const videoSubcategories = getSubCategoryOptions("videos");

interface VideoFormProps {
  initialData?: Video;
}

export function VideoForm({ initialData }: VideoFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          thumbnail: initialData.thumbnail,
          videoUrl: initialData.videoUrl,
          subCategory: initialData.subCategory,
          tags: initialData.tags,
          status: initialData.status,
        }
      : {
          title: { en: "", te: "" },
          thumbnail: "",
          videoUrl: "",
          subCategory: "",
          tags: { en: [], te: [] },
          status: "draft",
        },
  });

  const mutation = useMutation({
    mutationFn: (values: VideoFormValues) =>
      isEdit
        ? videoApi.update(initialData!._id, values as Record<string, unknown>)
        : videoApi.create(values as Record<string, unknown>),
    onSuccess: () => {
      toast.success(isEdit ? "Video updated" : "Video created");
      router.push("/videos");
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Something went wrong";
      toast.error(message);
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="space-y-6"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title-en">English Title</Label>
                <Input id="title-en" {...register("title.en")} />
                {errors.title?.en && (
                  <p className="text-sm text-destructive mt-1">{errors.title.en.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="title-te">Telugu Title</Label>
                <Input id="title-te" {...register("title.te")} />
                {errors.title?.te && (
                  <p className="text-sm text-destructive mt-1">{errors.title.te.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input id="videoUrl" placeholder="https://youtube.com/..." {...register("videoUrl")} />
                {errors.videoUrl && (
                  <p className="text-sm text-destructive mt-1">{errors.videoUrl.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Controller control={control} name="status" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Update" : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Thumbnail</CardTitle></CardHeader>
            <CardContent>
              <Controller control={control} name="thumbnail" render={({ field }) => (
                <ImageUpload value={field.value} onChange={field.onChange} folder="video" />
              )} />
              {errors.thumbnail && <p className="text-sm text-destructive mt-1">{errors.thumbnail.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sub-category</CardTitle></CardHeader>
            <CardContent>
              <Controller control={control} name="subCategory" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select sub-category" /></SelectTrigger>
                  <SelectContent>
                    {videoSubcategories.map((sc) => <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {errors.subCategory && <p className="text-sm text-destructive mt-1">{errors.subCategory.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vtags-en">English Tags (comma-separated)</Label>
                <Input id="vtags-en" defaultValue={watch("tags.en")?.join(", ") || ""} onChange={(e) => setValue("tags.en", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
              </div>
              <div>
                <Label htmlFor="vtags-te">Telugu Tags (comma-separated)</Label>
                <Input id="vtags-te" defaultValue={watch("tags.te")?.join(", ") || ""} onChange={(e) => setValue("tags.te", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
