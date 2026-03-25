import api from "./client";
import type { HomeConfig, MovieEntry, CollectionEntry } from "@/types";

export const homeApi = {
  get() {
    return api.get<{ success: boolean; config: HomeConfig }>("/home");
  },

  update(data: Record<string, unknown>) {
    return api.patch<{ success: boolean; config: HomeConfig }>("/home", data);
  },

  addMovieRelease(data: MovieEntry) {
    return api.post<{ success: boolean; movieReleases: MovieEntry[] }>(
      "/home/movie-releases",
      data
    );
  },

  removeMovieRelease(index: number) {
    return api.delete<{ success: boolean; movieReleases: MovieEntry[] }>(
      `/home/movie-releases/${index}`
    );
  },

  addMovieCollection(data: CollectionEntry) {
    return api.post<{ success: boolean; movieCollections: CollectionEntry[] }>(
      "/home/movie-collections",
      data
    );
  },

  removeMovieCollection(index: number) {
    return api.delete<{ success: boolean; movieCollections: CollectionEntry[] }>(
      `/home/movie-collections/${index}`
    );
  },
};
