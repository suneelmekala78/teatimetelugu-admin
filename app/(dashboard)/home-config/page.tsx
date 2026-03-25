"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { homeApi } from "@/lib/api/home";
import { PageHeader } from "@/components/common";
import { ImageUpload } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MovieEntry, CollectionEntry, HomeConfig } from "@/types";

export default function HomeConfigPage() {
  useAuth({ requiredRole: "admin" });
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
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Update failed";
      toast.error(message);
    },
  });

  if (isLoading) return <div className="space-y-6"><PageHeader title="Home Configuration" /><p className="text-muted-foreground">Loading...</p></div>;
  if (!config) return <div><PageHeader title="Home Configuration" /><p>Config not found</p></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Home Configuration" description="Manage homepage layout, movie releases, and collections" />

      <Tabs defaultValue="movies">
        <TabsList>
          <TabsTrigger value="movies">Movie Releases</TabsTrigger>
          <TabsTrigger value="collections">Movie Collections</TabsTrigger>
          <TabsTrigger value="posters">Posters</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
        </TabsList>

        <TabsContent value="movies" className="mt-6">
          <MovieReleasesSection releases={config.movieReleases} />
        </TabsContent>

        <TabsContent value="collections" className="mt-6">
          <MovieCollectionsSection collections={config.movieCollections} />
        </TabsContent>

        <TabsContent value="posters" className="mt-6">
          <PostersSection config={config} onUpdate={(data) => updateMutation.mutate(data)} isUpdating={updateMutation.isPending} />
        </TabsContent>

        <TabsContent value="ads" className="mt-6">
          <AdsSection config={config} onUpdate={(data) => updateMutation.mutate(data)} isUpdating={updateMutation.isPending} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MovieReleasesSection({ releases }: { releases: MovieEntry[] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ movie: { en: "", te: "" }, releaseDate: { en: "", te: "" }, category: { en: "", te: "" } });

  const addMutation = useMutation({
    mutationFn: () => homeApi.addMovieRelease(form as MovieEntry),
    onSuccess: () => {
      toast.success("Movie release added");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      setForm({ movie: { en: "", te: "" }, releaseDate: { en: "", te: "" }, category: { en: "", te: "" } });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add";
      toast.error(message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (index: number) => homeApi.removeMovieRelease(index),
    onSuccess: () => {
      toast.success("Removed");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>Movie Releases</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {releases.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
            <div className="flex-1">
              <p className="font-medium">{r.movie.en} / {r.movie.te}</p>
              <p className="text-sm text-muted-foreground">Release: {r.releaseDate.en} | Category: {r.category.en}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeMutation.mutate(i)} disabled={removeMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <div><Label>Movie (EN)</Label><Input value={form.movie.en} onChange={(e) => setForm((f) => ({ ...f, movie: { ...f.movie, en: e.target.value } }))} /></div>
          <div><Label>Movie (TE)</Label><Input value={form.movie.te} onChange={(e) => setForm((f) => ({ ...f, movie: { ...f.movie, te: e.target.value } }))} /></div>
          <div><Label>Release Date (EN)</Label><Input value={form.releaseDate.en} onChange={(e) => setForm((f) => ({ ...f, releaseDate: { ...f.releaseDate, en: e.target.value } }))} /></div>
          <div><Label>Release Date (TE)</Label><Input value={form.releaseDate.te} onChange={(e) => setForm((f) => ({ ...f, releaseDate: { ...f.releaseDate, te: e.target.value } }))} /></div>
          <div><Label>Category (EN)</Label><Input value={form.category.en} onChange={(e) => setForm((f) => ({ ...f, category: { ...f.category, en: e.target.value } }))} /></div>
          <div><Label>Category (TE)</Label><Input value={form.category.te} onChange={(e) => setForm((f) => ({ ...f, category: { ...f.category, te: e.target.value } }))} /></div>
        </div>
        <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !form.movie.en}>
          {addMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Release
        </Button>
      </CardContent>
    </Card>
  );
}

function MovieCollectionsSection({ collections }: { collections: CollectionEntry[] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ movie: { en: "", te: "" }, amount: { en: "", te: "" }, category: { en: "", te: "" } });

  const addMutation = useMutation({
    mutationFn: () => homeApi.addMovieCollection(form as CollectionEntry),
    onSuccess: () => {
      toast.success("Collection added");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
      setForm({ movie: { en: "", te: "" }, amount: { en: "", te: "" }, category: { en: "", te: "" } });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add";
      toast.error(message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (index: number) => homeApi.removeMovieCollection(index),
    onSuccess: () => {
      toast.success("Removed");
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>Movie Collections</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {collections.map((c, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
            <div className="flex-1">
              <p className="font-medium">{c.movie.en} / {c.movie.te}</p>
              <p className="text-sm text-muted-foreground">Amount: {c.amount.en} | Category: {c.category.en}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeMutation.mutate(i)} disabled={removeMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <div><Label>Movie (EN)</Label><Input value={form.movie.en} onChange={(e) => setForm((f) => ({ ...f, movie: { ...f.movie, en: e.target.value } }))} /></div>
          <div><Label>Movie (TE)</Label><Input value={form.movie.te} onChange={(e) => setForm((f) => ({ ...f, movie: { ...f.movie, te: e.target.value } }))} /></div>
          <div><Label>Amount (EN)</Label><Input value={form.amount.en} onChange={(e) => setForm((f) => ({ ...f, amount: { ...f.amount, en: e.target.value } }))} /></div>
          <div><Label>Amount (TE)</Label><Input value={form.amount.te} onChange={(e) => setForm((f) => ({ ...f, amount: { ...f.amount, te: e.target.value } }))} /></div>
          <div><Label>Category (EN)</Label><Input value={form.category.en} onChange={(e) => setForm((f) => ({ ...f, category: { ...f.category, en: e.target.value } }))} /></div>
          <div><Label>Category (TE)</Label><Input value={form.category.te} onChange={(e) => setForm((f) => ({ ...f, category: { ...f.category, te: e.target.value } }))} /></div>
        </div>
        <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !form.movie.en}>
          {addMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Collection
        </Button>
      </CardContent>
    </Card>
  );
}

function PostersSection({ config, onUpdate, isUpdating }: { config: HomeConfig; onUpdate: (data: Record<string, unknown>) => void; isUpdating: boolean }) {
  const [posters, setPosters] = useState(config.posters);

  const updatePoster = (slot: "popup" | "movie" | "navbar", field: "image" | "url", value: string) => {
    setPosters((p) => ({ ...p, [slot]: { ...p[slot], [field]: value } }));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Posters</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {(["popup", "movie", "navbar"] as const).map((slot) => (
          <div key={slot} className="space-y-3 p-4 border rounded-md">
            <h4 className="font-medium capitalize">{slot} Poster</h4>
            <ImageUpload value={posters[slot].image} onChange={(url) => updatePoster(slot, "image", url)} folder="poster" />
            <div>
              <Label>Link URL</Label>
              <Input value={posters[slot].url} onChange={(e) => updatePoster(slot, "url", e.target.value)} placeholder="https://..." />
            </div>
          </div>
        ))}
        <Button onClick={() => onUpdate({ posters })} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Posters
        </Button>
      </CardContent>
    </Card>
  );
}

function AdsSection({ config, onUpdate, isUpdating }: { config: HomeConfig; onUpdate: (data: Record<string, unknown>) => void; isUpdating: boolean }) {
  const [ads, setAds] = useState(config.ads);
  const adSlots = ["homeLong", "homeShort", "categoryLong", "categoryShort", "newsLong", "newsShort"] as const;

  const updateAd = (slot: typeof adSlots[number], field: "image" | "url", value: string) => {
    setAds((a) => ({ ...a, [slot]: { ...a[slot], [field]: value } }));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Advertisements</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {adSlots.map((slot) => (
            <div key={slot} className="space-y-3 p-4 border rounded-md">
              <h4 className="font-medium">{slot.replace(/([A-Z])/g, " $1").trim()}</h4>
              <ImageUpload value={ads[slot].image} onChange={(url) => updateAd(slot, "image", url)} folder="ad" />
              <div>
                <Label>Link URL</Label>
                <Input value={ads[slot].url} onChange={(e) => updateAd(slot, "url", e.target.value)} placeholder="https://..." />
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
