"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadApi } from "@/lib/api";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: "news" | "gallery" | "video" | "avatar" | "poster" | "ad" | "general";
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "general",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setIsUploading(true);
      try {
        const { data } = await uploadApi.single(file, folder);
        onChange(data.file.url);
        toast.success("Image uploaded");
      } catch {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onChange]
  );

  return (
    <div className={className}>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border/50 shadow-sm">
          <Image
            src={value}
            alt="Uploaded"
            width={400}
            height={225}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-lg"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          ) : (
            <>
              <div className="p-3 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/15 transition-colors">
                <Upload className="h-5 w-5 text-primary/70" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Click to upload
              </span>
              <span className="text-xs text-muted-foreground/70 mt-1">
                JPG, PNG, WebP or GIF (max 10MB)
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
