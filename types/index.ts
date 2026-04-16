// Common API response types
// Backend returns flat responses: { success, ...fields } not { success, data: {...} }
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Bilingual field
export interface BilingualText {
  en: string;
  te: string;
}

// Bilingual description with text + html
export interface BilingualDescription {
  en: { text: string; html: string };
  te: { text: string; html: string };
}

// User
export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "admin" | "writer";
  authProvider: "local" | "google";
  avatar: string;
  isActive: boolean;
  preferredLang: "en" | "te";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth
export interface LoginResponse {
  accessToken: string;
  user: User;
}

// News
export interface News {
  _id: string;
  author: User | string;
  slug: string;
  title: BilingualText;
  shortNews: BilingualText;
  thumbnail: string;
  description: BilingualDescription;
  category: string;
  subCategory: string | null;
  movieRating: number | null;
  audio: { en: string | null; te: string | null };
  tags: { en: string[]; te: string[] };
  viewCount: number;
  reactionsCount: number;
  commentsCount: number;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Video
export interface Video {
  _id: string;
  author: User | string;
  slug: string;
  title: BilingualText;
  thumbnail: string;
  videoUrl: string;
  subCategory: string;
  tags: { en: string[]; te: string[] };
  viewCount: number;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Gallery
export interface Gallery {
  _id: string;
  author: User | string;
  slug: string;
  name: BilingualText;
  title: BilingualText;
  thumbnail: string | null;
  description: BilingualDescription;
  subCategory: string;
  images: string[];
  tags: { en: string[]; te: string[] };
  audio: { en: string | null; te: string | null };
  viewCount: number;
  reactionsCount: number;
  commentsCount: number;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Comment
export interface Comment {
  _id: string;
  target: string;
  targetModel: "News" | "Gallery";
  author: User | null;
  text: string;
  language: "en" | "te";
  parentComment: string | null;
  likes: string[];
  dislikes: string[];
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Home Config
export interface MediaLink {
  image: string;
  url: string;
}

export interface PositionedRef {
  news: string | News;
  position: number;
}

export interface MovieEntry {
  movie: BilingualText;
  releaseDate: BilingualText;
  category: BilingualText;
}

export interface CollectionEntry {
  movie: BilingualText;
  amount: BilingualText;
  category: BilingualText;
}

export interface HomeConfig {
  _id: string;
  breakingNews: PositionedRef[];
  trendingNews: PositionedRef[];
  hotTopics: PositionedRef[];
  movieReleases: MovieEntry[];
  movieCollections: CollectionEntry[];
  posters: {
    popup: MediaLink;
    movie: MediaLink;
    navbar: MediaLink;
  };
  ads: {
    homeLong: MediaLink;
    homeShort: MediaLink;
    categoryLong: MediaLink;
    categoryShort: MediaLink;
    newsLong: MediaLink;
    newsShort: MediaLink;
  };
  extraLinks: string[];
  createdAt: string;
  updatedAt: string;
}

// Upload
export interface UploadedFile {
  key: string;
  url: string;
  mimetype: string;
  size: number;
}

