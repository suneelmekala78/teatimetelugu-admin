"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Search,
  ArrowUp,
  ArrowDown,
  Zap,
  TrendingUp,
  Flame,
  Film,
  DollarSign,
  Image as ImageIcon,
  Megaphone,
  AlertCircle,
} from "lucide-react";

import { homeApi } from "@/lib/api/home";
import { newsApi } from "@/lib/api/news";
import { PageHeader, ImageUpload, ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MovieEntry,
  CollectionEntry,
  HomeConfig,
  News,
  PositionedRef,
} from "@/types";

/* ── Movie category options ─────────────────────────────────────── */

const RELEASE_CATEGORIES = [
  { value: "movie", en: "Movie", te: "సినిమా" },
  { value: "ott", en: "OTT", te: "ఓటీటీ" },
] as const;

const COLLECTION_CATEGORIES = [
  { value: "1st-day-ap&ts", en: "1st Day AP&TS", te: "మొదటి రోజు AP&TS" },
  { value: "1st-day-ww", en: "1st Day WW", te: "మొదటి రోజు WW" },
  { value: "closing-ww", en: "Total WW", te: "మొత్తం WW" },
] as const;

/* ===================================================================
   Main Page
   =================================================================== */

export default function HomeConfigPage() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["home-config"],
    queryFn: () => homeApi.get(),
    select: (res) => res.data.config,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => homeApi.update(data),
    onSuccess: () => {
      toast.success("Home config updated");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Update failed";
      toast.error(message);
    },
  });

  if (isLoading)
    return (
      <div className="space-y-6">
        <PageHeader title="Home Configuration" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading configuration...
        </div>
      </div>
    );

  if (!config)
    return (
      <div className="space-y-6">
        <PageHeader title="Home Configuration" />
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-2 py-6 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Configuration not found. Please contact an administrator.
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home Configuration"
        description="Manage the homepage sections — curated news, movies, posters and ads."
      />

      <Tabs defaultValue="breaking">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="breaking" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Breaking News
          </TabsTrigger>
          <TabsTrigger value="trending" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="hot" className="gap-1.5">
            <Flame className="h-3.5 w-3.5" />
            Hot Topics
          </TabsTrigger>
          <TabsTrigger value="movies" className="gap-1.5">
            <Film className="h-3.5 w-3.5" />
            Movie Releases
          </TabsTrigger>
          <TabsTrigger value="collections" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="posters" className="gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            Posters
          </TabsTrigger>
          <TabsTrigger value="ads" className="gap-1.5">
            <Megaphone className="h-3.5 w-3.5" />
            Ads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breaking" className="mt-6">
          <CuratedNewsSection
            title="Breaking News"
            description="Feature urgent/breaking news on the homepage ticker. These appear at the very top."
            icon={<Zap className="h-5 w-5 text-red-500" />}
            items={config.breakingNews}
            fieldKey="breakingNews"
            onSave={(items) =>
              updateMutation.mutate({ breakingNews: items })
            }
            isSaving={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          <CuratedNewsSection
            title="Trending News"
            description="Curate up to 5 trending articles shown in the trending grid on the homepage."
            icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
            items={config.trendingNews}
            fieldKey="trendingNews"
            maxItems={5}
            onSave={(items) =>
              updateMutation.mutate({ trendingNews: items })
            }
            isSaving={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="hot" className="mt-6">
          <CuratedNewsSection
            title="Hot Topics"
            description="Pick up to 10 hot topic articles for the scrollable section on the homepage."
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            items={config.hotTopics}
            fieldKey="hotTopics"
            maxItems={10}
            onSave={(items) =>
              updateMutation.mutate({ hotTopics: items })
            }
            isSaving={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="movies" className="mt-6">
          <MovieReleasesSection releases={config.movieReleases} />
        </TabsContent>

        <TabsContent value="collections" className="mt-6">
          <MovieCollectionsSection collections={config.movieCollections} />
        </TabsContent>

        <TabsContent value="posters" className="mt-6">
          <PostersSection
            config={config}
            onUpdate={(data) => updateMutation.mutate(data)}
            isUpdating={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="ads" className="mt-6">
          <AdsSection
            config={config}
            onUpdate={(data) => updateMutation.mutate(data)}
            isUpdating={updateMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ===================================================================
   Curated News Section (Breaking / Trending / Hot Topics)
   =================================================================== */

function CuratedNewsSection({
  title,
  description,
  icon,
  items,
  fieldKey,
  maxItems,
  onSave,
  isSaving,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: PositionedRef[];
  fieldKey: string;
  maxItems?: number;
  onSave: (items: { news: string; position: number }[]) => void;
  isSaving: boolean;
}) {
  const [localItems, setLocalItems] = useState<PositionedRef[]>(
    () => [...items].sort((a, b) => a.position - b.position),
  );
  const [search, setSearch] = useState("");

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["news-search", search],
    queryFn: () =>
      newsApi.getAll({
        page: 1,
        limit: 10,
        status: "published",
        ...(search ? {} : { sortBy: "createdAt", order: "desc" }),
      }),
    select: (res) => res.data.news,
    enabled: true,
  });

  const selectedIds = useMemo(
    () => new Set(localItems.map((i) => getNewsId(i.news))),
    [localItems],
  );

  const filteredResults = useMemo(() => {
    if (!searchResults) return [];
    let results = searchResults.filter((n) => !selectedIds.has(n._id));
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (n) =>
          n.title.en.toLowerCase().includes(q) ||
          n.title.te.toLowerCase().includes(q),
      );
    }
    return results;
  }, [searchResults, selectedIds, search]);

  const addItem = (newsItem: News) => {
    if (maxItems && localItems.length >= maxItems) {
      toast.error(`Maximum ${maxItems} items allowed`);
      return;
    }
    const nextPos =
      localItems.length > 0
        ? Math.max(...localItems.map((i) => i.position)) + 1
        : 1;
    setLocalItems((prev) => [...prev, { news: newsItem, position: nextPos }]);
    setSearch("");
  };

  const removeItem = (index: number) => {
    setLocalItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((item, i) => ({ ...item, position: i + 1 }));
    });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    setLocalItems((prev) => {
      const arr = [...prev];
      const swapIdx = direction === "up" ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;
      [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
      return arr.map((item, i) => ({ ...item, position: i + 1 }));
    });
  };

  const handleSave = () => {
    const payload = localItems.map((item, i) => ({
      news: getNewsId(item.news),
      position: i + 1,
    }));
    onSave(payload);
  };

  const hasChanges =
    JSON.stringify(
      localItems.map((i) => ({ news: getNewsId(i.news), position: i.position })),
    ) !==
    JSON.stringify(
      [...items]
        .sort((a, b) => a.position - b.position)
        .map((i) => ({ news: getNewsId(i.news), position: i.position })),
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          {maxItems && (
            <Badge variant="outline" className="w-fit mt-2">
              {localItems.length} / {maxItems} slots used
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current items */}
          {localItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              No articles added yet. Search and add articles below.
            </div>
          ) : (
            <div className="space-y-2">
              {localItems.map((item, index) => {
                const news = getNewsObj(item.news);
                return (
                  <div
                    key={getNewsId(item.news)}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    {news?.thumbnail && (
                      <img
                        src={news.thumbnail}
                        alt=""
                        className="h-10 w-14 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {news?.title?.en || getNewsId(item.news)}
                      </p>
                      {news?.title?.te && (
                        <p className="text-xs text-muted-foreground truncate">
                          {news.title.te}
                        </p>
                      )}
                    </div>
                    {news?.category && (
                      <Badge variant="secondary" className="shrink-0 capitalize text-xs">
                        {news.category}
                      </Badge>
                    )}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveItem(index, "down")}
                        disabled={index === localItems.length - 1}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Separator />

          {/* Search to add */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add Articles</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search published articles by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {filteredResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                {filteredResults.map((n) => (
                  <button
                    key={n._id}
                    type="button"
                    className="flex items-center gap-3 w-full p-3 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => addItem(n)}
                    disabled={
                      !!maxItems && localItems.length >= maxItems
                    }
                  >
                    {n.thumbnail && (
                      <img
                        src={n.thumbnail}
                        alt=""
                        className="h-9 w-12 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {n.title.en}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {n.title.te}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize text-xs">
                      {n.category}
                    </Badge>
                    <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {search && filteredResults.length === 0 && !isSearching && (
              <p className="text-sm text-muted-foreground text-center py-3">
                No matching published articles found.
              </p>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {hasChanges
                ? "You have unsaved changes"
                : "All changes saved"}
            </p>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save {title}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===================================================================
   Movie Releases
   =================================================================== */

function MovieReleasesSection({
  releases,
}: {
  releases: MovieEntry[];
}) {
  const queryClient = useQueryClient();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    movie: { en: "", te: "" },
    releaseDate: { en: "", te: "" },
    category: { en: "", te: "" },
  });

  const resetForm = () => setForm({
    movie: { en: "", te: "" },
    releaseDate: { en: "", te: "" },
    category: { en: "", te: "" },
  });

  const addMutation = useMutation({
    mutationFn: () => homeApi.addMovieRelease(form as MovieEntry),
    onSuccess: () => {
      toast.success("Movie release added");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      resetForm();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to add";
      toast.error(message);
    },
  });

  const editMutation = useMutation({
    mutationFn: () => homeApi.editMovieRelease(editIndex!, form as MovieEntry),
    onSuccess: () => {
      toast.success("Movie release updated");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      resetForm();
      setEditIndex(null);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update";
      toast.error(message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (index: number) => homeApi.removeMovieRelease(index),
    onSuccess: () => {
      toast.success("Removed");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      setDeleteIndex(null);
    },
  });

  const startEdit = (index: number) => {
    const r = releases[index];
    setForm({
      movie: { en: r.movie.en, te: r.movie.te },
      releaseDate: { en: r.releaseDate.en, te: r.releaseDate.te },
      category: { en: r.category.en, te: r.category.te },
    });
    setEditIndex(index);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Film className="h-5 w-5 text-violet-500" />
          <div>
            <CardTitle>Movie Releases</CardTitle>
            <CardDescription className="mt-1">
              Manage upcoming movie release information shown on the homepage.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {releases.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            No movie releases added yet.
          </div>
        ) : (
          <div className="space-y-2">
            {releases.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {r.movie.en}{" "}
                    <span className="text-muted-foreground">/ {r.movie.te}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Release: {r.releaseDate.en} · Category: {r.category.en}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => startEdit(i)}
                    disabled={editIndex !== null}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteIndex(i)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={deleteIndex !== null}
          onOpenChange={(open) => !open && setDeleteIndex(null)}
          title="Delete Movie Release"
          description={
            deleteIndex !== null
              ? `Are you sure you want to delete "${releases[deleteIndex]?.movie?.en}"? This action cannot be undone.`
              : ""
          }
          onConfirm={() => deleteIndex !== null && removeMutation.mutate(deleteIndex)}
          isLoading={removeMutation.isPending}
        />

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {editIndex !== null ? "Edit Release" : "Add New Release"}
            </Label>
            {editIndex !== null && (
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Movie (EN)</Label>
              <Input
                value={form.movie.en}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    movie: { ...f.movie, en: e.target.value },
                  }))
                }
                placeholder="Movie name in English"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Movie (TE)</Label>
              <Input
                value={form.movie.te}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    movie: { ...f.movie, te: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Release Date (EN)</Label>
              <Input
                value={form.releaseDate.en}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    releaseDate: { ...f.releaseDate, en: e.target.value },
                  }))
                }
                placeholder="e.g. March 28, 2026"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Release Date (TE)</Label>
              <Input
                value={form.releaseDate.te}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    releaseDate: { ...f.releaseDate, te: e.target.value },
                  }))
                }
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={form.category.en || undefined}
                onValueChange={(v) => {
                  const opt = RELEASE_CATEGORIES.find((c) => c.value === v);
                  if (opt) setForm((f) => ({ ...f, category: { en: opt.value, te: opt.te } }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {RELEASE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {editIndex !== null ? (
            <Button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending || !form.movie.en || !form.movie.te}
            >
              {editMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Update Release
            </Button>
          ) : (
            <Button
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending || !form.movie.en || !form.movie.te}
            >
              {addMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Release
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ===================================================================
   Movie Collections
   =================================================================== */

function MovieCollectionsSection({
  collections,
}: {
  collections: CollectionEntry[];
}) {
  const queryClient = useQueryClient();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    movie: { en: "", te: "" },
    amount: { en: "", te: "" },
    category: { en: "", te: "" },
  });

  const resetForm = () => setForm({
    movie: { en: "", te: "" },
    amount: { en: "", te: "" },
    category: { en: "", te: "" },
  });

  const addMutation = useMutation({
    mutationFn: () => homeApi.addMovieCollection(form as CollectionEntry),
    onSuccess: () => {
      toast.success("Collection added");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      resetForm();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to add";
      toast.error(message);
    },
  });

  const editMutation = useMutation({
    mutationFn: () => homeApi.editMovieCollection(editIndex!, form as CollectionEntry),
    onSuccess: () => {
      toast.success("Collection updated");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      resetForm();
      setEditIndex(null);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update";
      toast.error(message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (index: number) => homeApi.removeMovieCollection(index),
    onSuccess: () => {
      toast.success("Removed");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      setDeleteIndex(null);
    },
  });

  const startEdit = (index: number) => {
    const c = collections[index];
    setForm({
      movie: { en: c.movie.en, te: c.movie.te },
      amount: { en: c.amount.en, te: c.amount.te },
      category: { en: c.category.en, te: c.category.te },
    });
    setEditIndex(index);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          <div>
            <CardTitle>Movie Collections</CardTitle>
            <CardDescription className="mt-1">
              Track box office collection data displayed on the homepage.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {collections.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            No collections added yet.
          </div>
        ) : (
          <div className="space-y-2">
            {collections.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {c.movie.en}{" "}
                    <span className="text-muted-foreground">/ {c.movie.te}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Amount: {c.amount.en} · Category: {c.category.en}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => startEdit(i)}
                    disabled={editIndex !== null}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteIndex(i)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={deleteIndex !== null}
          onOpenChange={(open) => !open && setDeleteIndex(null)}
          title="Delete Movie Collection"
          description={
            deleteIndex !== null
              ? `Are you sure you want to delete "${collections[deleteIndex]?.movie?.en}"? This action cannot be undone.`
              : ""
          }
          onConfirm={() => deleteIndex !== null && removeMutation.mutate(deleteIndex)}
          isLoading={removeMutation.isPending}
        />

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {editIndex !== null ? "Edit Collection" : "Add New Collection"}
            </Label>
            {editIndex !== null && (
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Movie (EN)</Label>
              <Input
                value={form.movie.en}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    movie: { ...f.movie, en: e.target.value },
                  }))
                }
                placeholder="Movie name"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Movie (TE)</Label>
              <Input
                value={form.movie.te}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    movie: { ...f.movie, te: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Amount (EN)</Label>
              <Input
                value={form.amount.en}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: { ...f.amount, en: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Amount (TE)</Label>
              <Input
                value={form.amount.te}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: { ...f.amount, te: e.target.value },
                  }))
                }
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={form.category.en || undefined}
                onValueChange={(v) => {
                  const opt = COLLECTION_CATEGORIES.find((c) => c.value === v);
                  if (opt) setForm((f) => ({ ...f, category: { en: opt.value, te: opt.te } }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COLLECTION_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {editIndex !== null ? (
            <Button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending || !form.movie.en || !form.movie.te}
            >
              {editMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Update Collection
            </Button>
          ) : (
            <Button
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending || !form.movie.en || !form.movie.te}
            >
              {addMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Collection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ===================================================================
   Posters
   =================================================================== */

function PostersSection({
  config,
  onUpdate,
  isUpdating,
}: {
  config: HomeConfig;
  onUpdate: (data: Record<string, unknown>) => void;
  isUpdating: boolean;
}) {
  const [posters, setPosters] = useState(config.posters);

  const updatePoster = (
    slot: "popup" | "movie" | "navbar",
    field: "image" | "url",
    value: string,
  ) => {
    setPosters((p) => ({ ...p, [slot]: { ...p[slot], [field]: value } }));
  };

  const slotLabels: Record<string, string> = {
    popup: "Popup Poster",
    movie: "Movie Poster",
    navbar: "Navbar Banner",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-pink-500" />
          <div>
            <CardTitle>Posters</CardTitle>
            <CardDescription className="mt-1">
              Upload promotional posters and banners for different homepage
              placements.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {(["popup", "movie", "navbar"] as const).map((slot) => (
            <div key={slot} className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-medium text-sm">{slotLabels[slot]}</h4>
              <ImageUpload
                value={posters[slot].image}
                onChange={(url) => updatePoster(slot, "image", url)}
                folder="poster"
              />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Link URL</Label>
                <Input
                  value={posters[slot].url}
                  onChange={(e) => updatePoster(slot, "url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={() => onUpdate({ posters })} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Posters
        </Button>
      </CardContent>
    </Card>
  );
}

/* ===================================================================
   Ads
   =================================================================== */

function AdsSection({
  config,
  onUpdate,
  isUpdating,
}: {
  config: HomeConfig;
  onUpdate: (data: Record<string, unknown>) => void;
  isUpdating: boolean;
}) {
  const [ads, setAds] = useState(config.ads);
  const adSlots = [
    "homeLong",
    "homeShort",
    "categoryLong",
    "categoryShort",
    "newsLong",
    "newsShort",
  ] as const;

  const slotLabels: Record<string, string> = {
    homeLong: "Home — Long Banner",
    homeShort: "Home — Short Banner",
    categoryLong: "Category — Long Banner",
    categoryShort: "Category — Short Banner",
    newsLong: "News — Long Banner",
    newsShort: "News — Short Banner",
  };

  const updateAd = (
    slot: (typeof adSlots)[number],
    field: "image" | "url",
    value: string,
  ) => {
    setAds((a) => ({ ...a, [slot]: { ...a[slot], [field]: value } }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Megaphone className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle>Advertisements</CardTitle>
            <CardDescription className="mt-1">
              Manage ad banners across different pages and placements.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {adSlots.map((slot) => (
            <div key={slot} className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-medium text-sm">{slotLabels[slot]}</h4>
              <ImageUpload
                value={ads[slot].image}
                onChange={(url) => updateAd(slot, "image", url)}
                folder="ad"
              />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Link URL</Label>
                <Input
                  value={ads[slot].url}
                  onChange={(e) => updateAd(slot, "url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={() => onUpdate({ ads })} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Ads
        </Button>
      </CardContent>
    </Card>
  );
}

/* ===================================================================
   Helpers
   =================================================================== */

function getNewsId(news: string | News): string {
  return typeof news === "string" ? news : news._id;
}

function getNewsObj(news: string | News): News | null {
  return typeof news === "object" ? news : null;
}
