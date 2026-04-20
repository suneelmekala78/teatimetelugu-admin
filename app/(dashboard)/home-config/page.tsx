"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
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
  Settings2,
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  MovieEntry,
  CollectionEntry,
  HomeConfig,
  News,
  PositionedRef,
} from "@/types";

/* ── Constants ─────────────────────────────────────────────────── */

const RELEASE_CATEGORIES = [
  { value: "movie", en: "Movie", te: "సినిమా" },
  { value: "ott", en: "OTT", te: "ఓటీటీ" },
] as const;

const COLLECTION_CATEGORIES = [
  { value: "1st-day-ap&ts", en: "1st Day AP&TS", te: "మొదటి రోజు AP&TS" },
  { value: "1st-day-ww", en: "1st Day WW", te: "మొదటి రోజు WW" },
  { value: "closing-ww", en: "Total WW", te: "మొత్తం WW" },
] as const;

type SectionId =
  | "breaking"
  | "trending"
  | "hot"
  | "movies"
  | "collections"
  | "posters"
  | "ads";

const SECTIONS: {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "breaking", label: "Breaking News", icon: Zap, color: "text-red-500" },
  { id: "trending", label: "Trending", icon: TrendingUp, color: "text-blue-500" },
  { id: "hot", label: "Hot Topics", icon: Flame, color: "text-orange-500" },
  { id: "movies", label: "Movie Releases", icon: Film, color: "text-violet-500" },
  { id: "collections", label: "Collections", icon: DollarSign, color: "text-emerald-500" },
  { id: "posters", label: "Posters", icon: ImageIcon, color: "text-pink-500" },
  { id: "ads", label: "Advertisements", icon: Megaphone, color: "text-amber-500" },
];

/* ===================================================================
   Main Page
   =================================================================== */

export default function HomeConfigPage() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<SectionId>("breaking");

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

  const getCounts = (cfg: HomeConfig): Record<SectionId, number> => ({
    breaking: cfg.breakingNews.length,
    trending: cfg.trendingNews.length,
    hot: cfg.hotTopics.length,
    movies: cfg.movieReleases.length,
    collections: cfg.movieCollections.length,
    posters: [cfg.posters.popup, cfg.posters.movie, cfg.posters.navbar].filter(
      (p) => p.image,
    ).length,
    ads: [
      cfg.ads.homeLong, cfg.ads.homeShort, cfg.ads.categoryLong,
      cfg.ads.categoryShort, cfg.ads.newsLong, cfg.ads.newsShort,
    ].filter((a) => a.image).length,
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

  const counts = getCounts(config);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home Configuration"
        description="Manage the homepage sections — curated news, movies, posters and ads."
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const count = counts[section.id];
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary-foreground" : section.color,
                  )}
                />
                <span className="flex-1 truncate">{section.label}</span>
                {count > 0 && (
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className={cn(
                      "h-5 min-w-[20px] justify-center text-[10px] px-1.5",
                      isActive && "bg-primary-foreground/20 text-primary-foreground border-0",
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="min-w-0">
          {activeSection === "breaking" && (
            <CuratedNewsSection
              title="Breaking News"
              description="Feature urgent/breaking news on the homepage ticker. These appear at the very top."
              icon={<Zap className="h-5 w-5 text-red-500" />}
              items={config.breakingNews}
              fieldKey="breakingNews"
              onSave={(items) => updateMutation.mutate({ breakingNews: items })}
              isSaving={updateMutation.isPending}
            />
          )}
          {activeSection === "trending" && (
            <CuratedNewsSection
              title="Trending News"
              description="Curate up to 5 trending articles shown in the trending grid on the homepage."
              icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
              items={config.trendingNews}
              fieldKey="trendingNews"
              maxItems={5}
              onSave={(items) => updateMutation.mutate({ trendingNews: items })}
              isSaving={updateMutation.isPending}
            />
          )}
          {activeSection === "hot" && (
            <CuratedNewsSection
              title="Hot Topics"
              description="Pick up to 10 hot topic articles for the scrollable section on the homepage."
              icon={<Flame className="h-5 w-5 text-orange-500" />}
              items={config.hotTopics}
              fieldKey="hotTopics"
              maxItems={10}
              onSave={(items) => updateMutation.mutate({ hotTopics: items })}
              isSaving={updateMutation.isPending}
            />
          )}
          {activeSection === "movies" && (
            <MovieReleasesSection releases={config.movieReleases} />
          )}
          {activeSection === "collections" && (
            <MovieCollectionsSection collections={config.movieCollections} />
          )}
          {activeSection === "posters" && (
            <PostersSection
              config={config}
              onUpdate={(data) => updateMutation.mutate(data)}
              isUpdating={updateMutation.isPending}
            />
          )}
          {activeSection === "ads" && (
            <AdsSection
              config={config}
              onUpdate={(data) => updateMutation.mutate(data)}
              isUpdating={updateMutation.isPending}
            />
          )}
        </div>
      </div>
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
    <div className="space-y-4">
      <SectionHeader icon={icon} title={title} description={description}>
        {maxItems && (
          <Badge variant="outline">
            {localItems.length} / {maxItems}
          </Badge>
        )}
      </SectionHeader>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Current items */}
          {localItems.length === 0 ? (
            <EmptyState message="No articles added yet. Search and add articles below." />
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

function MovieReleasesSection({ releases }: { releases: MovieEntry[] }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    movie: { en: "", te: "" },
    releaseDate: { en: "", te: "" },
    category: { en: "", te: "" },
  });

  const resetForm = () =>
    setForm({ movie: { en: "", te: "" }, releaseDate: { en: "", te: "" }, category: { en: "", te: "" } });

  const openAdd = () => { resetForm(); setEditIndex(null); setDialogOpen(true); };

  const openEdit = (index: number) => {
    const r = releases[index];
    setForm({
      movie: { en: r.movie.en, te: r.movie.te },
      releaseDate: { en: r.releaseDate.en, te: r.releaseDate.te },
      category: { en: r.category.en, te: r.category.te },
    });
    setEditIndex(index);
    setDialogOpen(true);
  };

  const addMutation = useMutation({
    mutationFn: () => homeApi.addMovieRelease(form as MovieEntry),
    onSuccess: () => {
      toast.success("Movie release added");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      resetForm();
      setDialogOpen(false);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add";
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
      setDialogOpen(false);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update";
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

  const isFormValid = form.movie.en && form.movie.te;
  const isMutating = addMutation.isPending || editMutation.isPending;

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Film className="h-5 w-5 text-violet-500" />}
        title="Movie Releases"
        description="Manage upcoming movie release information shown on the homepage."
      >
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Release
        </Button>
      </SectionHeader>

      <Card>
        <CardContent className="p-0">
          {releases.length === 0 ? (
            <div className="p-6">
              <EmptyState message="No movie releases added yet." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Movie</TableHead>
                  <TableHead>Release Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {releases.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{r.movie.en}</p>
                        <p className="text-xs text-muted-foreground">{r.movie.te}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{r.releaseDate.en}</p>
                        <p className="text-xs text-muted-foreground">{r.releaseDate.te}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{r.category.en}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(i)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteIndex(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Movie Release" : "Add Movie Release"}</DialogTitle>
            <DialogDescription>{editIndex !== null ? "Update the movie release details below." : "Fill in the details for the new movie release."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Movie (EN)</Label>
                <Input value={form.movie.en} onChange={(e) => setForm((f) => ({ ...f, movie: { ...f.movie, en: e.target.value } }))} placeholder="Movie name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Movie (TE)</Label>
                <Input value={form.movie.te} onChange={(e) => setForm((f) => ({ ...f, movie: { ...f.movie, te: e.target.value } }))} placeholder="సినిమా పేరు" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Release Date (EN)</Label>
                <Input value={form.releaseDate.en} onChange={(e) => setForm((f) => ({ ...f, releaseDate: { ...f.releaseDate, en: e.target.value } }))} placeholder="e.g. March 28, 2026" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Release Date (TE)</Label>
                <Input value={form.releaseDate.te} onChange={(e) => setForm((f) => ({ ...f, releaseDate: { ...f.releaseDate, te: e.target.value } }))} placeholder="మార్చి 28, 2026" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={form.category.en || undefined} onValueChange={(v) => { const opt = RELEASE_CATEGORIES.find((c) => c.value === v); if (opt) setForm((f) => ({ ...f, category: { en: opt.value, te: opt.te } })); }}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{RELEASE_CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.en}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button onClick={() => editIndex !== null ? editMutation.mutate() : addMutation.mutate()} disabled={isMutating || !isFormValid}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editIndex !== null ? "Update" : "Add"} Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        title="Delete Movie Release"
        description={deleteIndex !== null ? `Are you sure you want to delete "${releases[deleteIndex]?.movie?.en}"? This action cannot be undone.` : ""}
        onConfirm={() => deleteIndex !== null && removeMutation.mutate(deleteIndex)}
        isLoading={removeMutation.isPending}
      />
    </div>
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
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const openAdd = () => { resetForm(); setEditIndex(null); setDialogOpen(true); };

  const openEdit = (index: number) => {
    const c = collections[index];
    setForm({
      movie: { en: c.movie.en, te: c.movie.te },
      amount: { en: c.amount.en, te: c.amount.te },
      category: { en: c.category.en, te: c.category.te },
    });
    setEditIndex(index);
    setDialogOpen(true);
  };

  const addMutation = useMutation({
    mutationFn: () => homeApi.addMovieCollection(form as CollectionEntry),
    onSuccess: () => {
      toast.success("Collection added");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      resetForm();
      setDialogOpen(false);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add";
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
      setDialogOpen(false);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update";
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

  const isFormValid = form.movie.en && form.movie.te;
  const isMutating = addMutation.isPending || editMutation.isPending;

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
        title="Movie Collections"
        description="Track box office collection data displayed on the homepage."
      >
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Collection
        </Button>
      </SectionHeader>

      <Card>
        <CardContent className="p-0">
          {collections.length === 0 ? (
            <div className="p-6">
              <EmptyState message="No collections added yet." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Movie</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{c.movie.en}</p>
                        <p className="text-xs text-muted-foreground">{c.movie.te}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{c.amount.en}</p>
                        <p className="text-xs text-muted-foreground">{c.amount.te}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{c.category.en}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(i)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteIndex(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Movie Collection" : "Add Movie Collection"}</DialogTitle>
            <DialogDescription>{editIndex !== null ? "Update the collection details below." : "Fill in the details for the new collection entry."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Movie (EN)</Label>
                <Input value={form.movie.en} onChange={(e) => setForm((f) => ({ ...f, movie: { ...f.movie, en: e.target.value } }))} placeholder="Movie name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Movie (TE)</Label>
                <Input value={form.movie.te} onChange={(e) => setForm((f) => ({ ...f, movie: { ...f.movie, te: e.target.value } }))} placeholder="సినిమా పేరు" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (EN)</Label>
                <Input value={form.amount.en} onChange={(e) => setForm((f) => ({ ...f, amount: { ...f.amount, en: e.target.value } }))} placeholder="e.g. ₹150 Cr" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (TE)</Label>
                <Input value={form.amount.te} onChange={(e) => setForm((f) => ({ ...f, amount: { ...f.amount, te: e.target.value } }))} placeholder="₹150 కోట్లు" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={form.category.en || undefined} onValueChange={(v) => { const opt = COLLECTION_CATEGORIES.find((c) => c.value === v); if (opt) setForm((f) => ({ ...f, category: { en: opt.value, te: opt.te } })); }}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{COLLECTION_CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.en}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button onClick={() => editIndex !== null ? editMutation.mutate() : addMutation.mutate()} disabled={isMutating || !isFormValid}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editIndex !== null ? "Update" : "Add"} Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        title="Delete Movie Collection"
        description={deleteIndex !== null ? `Are you sure you want to delete "${collections[deleteIndex]?.movie?.en}"? This action cannot be undone.` : ""}
        onConfirm={() => deleteIndex !== null && removeMutation.mutate(deleteIndex)}
        isLoading={removeMutation.isPending}
      />
    </div>
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

  const slotLabels: Record<string, { label: string; description: string }> = {
    popup: { label: "Popup Poster", description: "Full-screen promotional popup on page load" },
    movie: { label: "Movie Poster", description: "Featured movie poster on the homepage" },
    navbar: { label: "Navbar Banner", description: "Slim banner displayed in the navigation bar" },
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<ImageIcon className="h-5 w-5 text-pink-500" />}
        title="Posters"
        description="Upload promotional posters and banners for different homepage placements."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {(["popup", "movie", "navbar"] as const).map((slot) => (
          <Card key={slot}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{slotLabels[slot].label}</CardTitle>
              <CardDescription className="text-xs">{slotLabels[slot].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ImageUpload
                value={posters[slot].image}
                onChange={(url) => updatePoster(slot, "image", url)}
                folder="poster"
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Link URL</Label>
                <Input
                  value={posters[slot].url}
                  onChange={(e) => updatePoster(slot, "url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onUpdate({ posters })} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Posters
        </Button>
      </div>
    </div>
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
    { key: "homeLong" as const, label: "Home — Long Banner", group: "Home" },
    { key: "homeShort" as const, label: "Home — Short Banner", group: "Home" },
    { key: "categoryLong" as const, label: "Category — Long Banner", group: "Category" },
    { key: "categoryShort" as const, label: "Category — Short Banner", group: "Category" },
    { key: "newsLong" as const, label: "News — Long Banner", group: "News" },
    { key: "newsShort" as const, label: "News — Short Banner", group: "News" },
  ];

  const updateAd = (
    slot: (typeof adSlots)[number]["key"],
    field: "image" | "url",
    value: string,
  ) => {
    setAds((a) => ({ ...a, [slot]: { ...a[slot], [field]: value } }));
  };

  const groups = ["Home", "Category", "News"] as const;

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Megaphone className="h-5 w-5 text-amber-500" />}
        title="Advertisements"
        description="Manage ad banners across different pages and placements."
      />

      {groups.map((group) => (
        <div key={group} className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">{group} Page</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {adSlots.filter((s) => s.group === group).map((slot) => (
              <Card key={slot.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{slot.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ImageUpload
                    value={ads[slot.key].image}
                    onChange={(url) => updateAd(slot.key, "image", url)}
                    folder="ad"
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Link URL</Label>
                    <Input
                      value={ads[slot.key].url}
                      onChange={(e) => updateAd(slot.key, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={() => onUpdate({ ads })} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Ads
        </Button>
      </div>
    </div>
  );
}

/* ===================================================================
   Shared Components
   =================================================================== */

function SectionHeader({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold font-heading">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Settings2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ===================================================================
   Helpers
   =================================================================== */

function getNewsId(news: string | News | null): string {
  if (!news) return "";
  return typeof news === "string" ? news : news._id;
}

function getNewsObj(news: string | News | null): News | null {
  return news && typeof news === "object" ? news : null;
}
