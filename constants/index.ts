export { CATEGORIES, CATEGORY_OPTIONS, getSubCategoryOptions } from "./categories";
export type { CategoryKey } from "./categories";

export const USER_ROLES = ["user", "admin", "writer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const CONTENT_STATUS = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUS)[number];

export const STATUS_OPTIONS = CONTENT_STATUS.map((s) => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}));

export const SITE_URLS = {
  english: "https://english.teatimetelugu.com",
  telugu: "https://teatimetelugu.com",
} as const;
