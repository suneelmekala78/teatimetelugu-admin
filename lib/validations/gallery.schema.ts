import { z } from "zod/v4";

export const gallerySchema = z.object({
  name: z.object({
    en: z.string().min(1, "English name is required"),
    te: z.string().min(1, "Telugu name is required"),
  }),
  title: z.object({
    en: z.string().min(1, "English title is required"),
    te: z.string().min(1, "Telugu title is required"),
  }),
  description: z.object({
    en: z.object({
      text: z.string().min(1, "English description is required"),
      html: z.string(),
    }),
    te: z.object({
      text: z.string().min(1, "Telugu description is required"),
      html: z.string(),
    }),
  }),
  thumbnail: z.string().nullable().optional(),
  subCategory: z.string().min(1, "Sub-category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  tags: z
    .object({
      en: z.array(z.string()),
      te: z.array(z.string()),
    })
    .optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export type GalleryFormValues = z.infer<typeof gallerySchema>;
