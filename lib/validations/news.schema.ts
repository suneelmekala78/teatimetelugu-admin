import { z } from "zod/v4";

export const newsSchema = z.object({
  title: z.object({
    en: z.string().min(1, "English title is required"),
    te: z.string().min(1, "Telugu title is required"),
  }),
  shortNews: z
    .object({
      en: z.string(),
      te: z.string(),
    })
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const checkLang = (text: string) =>
          text === "" || (text.length >= 180 && text.length <= 400);
        return checkLang(val.en) && checkLang(val.te);
      },
      { message: "Short news must be 180–400 characters (or empty)" },
    ),
  thumbnail: z.string().min(1, "Thumbnail is required"),
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
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().nullable().optional(),
  movieRating: z.number().min(0).max(5).nullable().optional(),
  tags: z
    .object({
      en: z.array(z.string()),
      te: z.array(z.string()),
    })
    .optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export type NewsFormValues = z.infer<typeof newsSchema>;
