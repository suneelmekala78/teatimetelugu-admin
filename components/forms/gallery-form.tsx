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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload, MultiImageUpload } from "@/components/common";
import { RichEditor } from "@/components/forms/rich-editor";
import { gallerySchema, type GalleryFormValues } from "@/lib/validations";
import { galleryApi } from "@/lib/api";
import { getSubCategoryOptions, STATUS_OPTIONS } from "@/constants";
import type { Gallery } from "@/types";

const gallerySubcategories = getSubCategoryOptions("gallery");

interface GalleryFormProps {
  initialData?: Gallery;
}

export function GalleryForm({ initialData }: GalleryFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          title: initialData.title,
          description: initialData.description,
          thumbnail: initialData.thumbnail,
          subCategory: initialData.subCategory,
          images: initialData.images,
          tags: initialData.tags,
          status: initialData.status,
        }
      : {
          name: { en: "", te: "" },
          title: { en: "", te: "" },
          description: { en: { text: "", html: "" }, te: { text: "", html: "" } },
          thumbnail: null,
          subCategory: "",
          images: [],
          tags: { en: [], te: [] },
          status: "draft",
        },
  });

  const mutation = useMutation({
    mutationFn: (values: GalleryFormValues) =>
      isEdit
        ? galleryApi.update(initialData!._id, values as Record<string, unknown>)
        : galleryApi.create(values as Record<string, unknown>),
    onSuccess: () => {
      toast.success(isEdit ? "Gallery updated" : "Gallery created");
      router.push("/gallery");
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong";
      toast.error(message);
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Name & Title</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name-en">Name (EN)</Label>
                  <Input id="name-en" {...register("name.en")} />
                  {errors.name?.en && <p className="text-sm text-destructive mt-1">{errors.name.en.message}</p>}
                </div>
                <div>
                  <Label htmlFor="name-te">Name (TE)</Label>
                  <Input id="name-te" {...register("name.te")} />
                  {errors.name?.te && <p className="text-sm text-destructive mt-1">{errors.name.te.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gtitle-en">Title (EN)</Label>
                  <Input id="gtitle-en" {...register("title.en")} />
                  {errors.title?.en && <p className="text-sm text-destructive mt-1">{errors.title.en.message}</p>}
                </div>
                <div>
                  <Label htmlFor="gtitle-te">Title (TE)</Label>
                  <Input id="gtitle-te" {...register("title.te")} />
                  {errors.title?.te && <p className="text-sm text-destructive mt-1">{errors.title.te.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="en">
                <TabsList><TabsTrigger value="en">English</TabsTrigger><TabsTrigger value="te">Telugu</TabsTrigger></TabsList>
                <TabsContent value="en" className="mt-4">
                  <Controller control={control} name="description.en" render={({ field }) => (
                    <RichEditor content={field.value?.html || ""} onChange={(html, text) => field.onChange({ html, text })} placeholder="English description..." />
                  )} />
                </TabsContent>
                <TabsContent value="te" className="mt-4">
                  <Controller control={control} name="description.te" render={({ field }) => (
                    <RichEditor content={field.value?.html || ""} onChange={(html, text) => field.onChange({ html, text })} placeholder="తెలుగు వివరణ..." />
                  )} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent>
              <Controller control={control} name="images" render={({ field }) => (
                <MultiImageUpload value={field.value} onChange={field.onChange} folder="gallery" />
              )} />
              {errors.images && <p className="text-sm text-destructive mt-1">{errors.images.message}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Controller control={control} name="status" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
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
                <ImageUpload value={field.value || ""} onChange={field.onChange} folder="gallery" />
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sub-category</CardTitle></CardHeader>
            <CardContent>
              <Controller control={control} name="subCategory" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{gallerySubcategories.map((sc) => <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.subCategory && <p className="text-sm text-destructive mt-1">{errors.subCategory.message}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
