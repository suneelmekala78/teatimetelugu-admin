"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
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
  const replaceInputRef = useRef<HTMLInputElement>(null);

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
        // Reset input so same file can be re-selected
        e.target.value = "";
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
          {/* Hover overlay with change & remove actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-3 pointer-events-none">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto" />
            ) : (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-lg pointer-events-auto"
                  onClick={() => replaceInputRef.current?.click()}
                >
                  <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                  Change
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-lg pointer-events-auto"
                  onClick={() => onChange("")}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              </>
            )}
          </div>
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
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
