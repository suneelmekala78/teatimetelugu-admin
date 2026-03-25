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
import { ImageUpload } from "@/components/common";
import { RichEditor } from "@/components/forms/rich-editor";
import { newsSchema, type NewsFormValues } from "@/lib/validations";
import { newsApi } from "@/lib/api";
import {
  CATEGORY_OPTIONS,
  getSubCategoryOptions,
  STATUS_OPTIONS,
  type CategoryKey,
} from "@/constants";
import type { News } from "@/types";

interface NewsFormProps {
  initialData?: News;
}

export function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          thumbnail: initialData.thumbnail,
          description: initialData.description,
          category: initialData.category,
          subCategory: initialData.subCategory,
          movieRating: initialData.movieRating,
          tags: initialData.tags,
          status: initialData.status,
        }
      : {
          title: { en: "", te: "" },
          thumbnail: "",
          description: {
            en: { text: "", html: "" },
            te: { text: "", html: "" },
          },
          category: "",
          subCategory: null,
          movieRating: null,
          tags: { en: [], te: [] },
          status: "draft",
        },
  });

  const category = watch("category");
  const subCategories = category
    ? getSubCategoryOptions(category as CategoryKey)
    : [];

  const mutation = useMutation({
    mutationFn: (values: NewsFormValues) =>
      isEdit
        ? newsApi.update(initialData!._id, values as Record<string, unknown>)
        : newsApi.create(values as Record<string, unknown>),
    onSuccess: () => {
      toast.success(isEdit ? "Article updated" : "Article created");
      router.push("/news");
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
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Title</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title-en">English Title</Label>
                <Input id="title-en" {...register("title.en")} />
                {errors.title?.en && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.title.en.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="title-te">Telugu Title</Label>
                <Input id="title-te" {...register("title.te")} />
                {errors.title?.te && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.title.te.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="te">Telugu</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="mt-4">
                  <Controller
                    control={control}
                    name="description.en"
                    render={({ field }) => (
                      <RichEditor
                        content={field.value?.html || ""}
                        onChange={(html, text) =>
                          field.onChange({ html, text })
                        }
                        placeholder="Write English description..."
                      />
                    )}
                  />
                  {errors.description?.en?.text && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.description.en.text.message}
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="te" className="mt-4">
                  <Controller
                    control={control}
                    name="description.te"
                    render={({ field }) => (
                      <RichEditor
                        content={field.value?.html || ""}
                        onChange={(html, text) =>
                          field.onChange({ html, text })
                        }
                        placeholder="తెలుగు వివరణ రాయండి..."
                      />
                    )}
                  />
                  {errors.description?.te?.text && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.description.te.text.message}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? "Update" : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="thumbnail"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="news"
                  />
                )}
              />
              {errors.thumbnail && (
                <p className="text-sm text-destructive mt-1">
                  {errors.thumbnail.message}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        if (v) { field.onChange(v); setValue("subCategory", null); }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
              {subCategories.length > 0 && (
                <div>
                  <Label>Sub-category</Label>
                  <Controller
                    control={control}
                    name="subCategory"
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-category" />
                        </SelectTrigger>
                        <SelectContent>
                          {subCategories.map((sc) => (
                            <SelectItem key={sc.value} value={sc.value}>
                              {sc.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tags-en">English Tags (comma-separated)</Label>
                <Input
                  id="tags-en"
                  defaultValue={watch("tags.en")?.join(", ") || ""}
                  onChange={(e) =>
                    setValue(
                      "tags.en",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="tags-te">Telugu Tags (comma-separated)</Label>
                <Input
                  id="tags-te"
                  defaultValue={watch("tags.te")?.join(", ") || ""}
                  onChange={(e) =>
                    setValue(
                      "tags.te",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
