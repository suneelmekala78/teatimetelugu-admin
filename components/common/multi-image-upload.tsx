"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadApi } from "@/lib/api";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: "news" | "gallery" | "video" | "general";
  max?: number;
}

export function MultiImageUpload({
  value,
  onChange,
  folder = "general",
  max = 10,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      if (value.length + files.length > max) {
        toast.error(`Maximum ${max} images allowed`);
        return;
      }

      setIsUploading(true);
      try {
        const { data } = await uploadApi.multiple(files, folder);
        const newUrls = data.files.map((f) => f.url);
        onChange([...value, ...newUrls]);
        toast.success(`${newUrls.length} image(s) uploaded`);
      } catch {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, max, onChange, value]
  );

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden border border-border/50 shadow-sm">
            <Image
              src={url}
              alt={`Image ${i + 1}`}
              width={200}
              height={150}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-lg"
              onClick={() => removeImage(i)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {value.length < max && (
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
            ) : (
              <>
                <div className="p-2 rounded-full bg-primary/10 mb-2 group-hover:bg-primary/15 transition-colors">
                  <Upload className="h-4 w-4 text-primary/70" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Add images</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
