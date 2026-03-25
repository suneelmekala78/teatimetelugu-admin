import api from "./client";
import type { UploadedFile } from "@/types";

type Folder = "news" | "gallery" | "video" | "avatar" | "poster" | "ad" | "audio" | "general";

export const uploadApi = {
  single(file: File, folder: Folder = "general") {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ success: boolean; file: UploadedFile }>(
      "/upload/single",
      formData,
      { params: { folder }, headers: { "Content-Type": undefined } }
    );
  },

  multiple(files: File[], folder: Folder = "general") {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return api.post<{ success: boolean; files: UploadedFile[] }>(
      "/upload/multiple",
      formData,
      { params: { folder }, headers: { "Content-Type": undefined } }
    );
  },

  delete(key: string) {
    return api.delete<{ success: boolean; message: string }>("/upload", { data: { key } });
  },
};
