import { z } from "zod/v4";

export const videoSchema = z.object({
  title: z.object({
    en: z.string().min(1, "English title is required"),
    te: z.string().min(1, "Telugu title is required"),
  }),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  videoUrl: z.string().min(1, "Video URL is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  tags: z
    .object({
      en: z.array(z.string()),
      te: z.array(z.string()),
    })
    .optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export type VideoFormValues = z.infer<typeof videoSchema>;
