"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import {
  Newspaper,
  Video,
  Images,
  Eye,
  ArrowUpRight,
  Clock,
  MessageCircle,
  Heart,
} from "lucide-react";

import { newsApi } from "@/lib/api/news";
import { videoApi } from "@/lib/api/videos";
import { galleryApi } from "@/lib/api/gallery";
import type { News } from "@/types";
import { PageHeader, StatusBadge } from "@/components/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ArticleRow({ article, metric }: { article: News; metric: React.ReactNode }) {
  return (
    <Link
      href={`/news/${article._id}/edit`}
      className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 hover:bg-muted/30 -mx-6 px-6 transition-colors"
    >
      <img
        src={article.thumbnail}
        alt=""
        className="h-14 w-22 rounded-lg object-cover ring-1 ring-border/50 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate leading-snug">
          {article.title.en}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {format(new Date(article.createdAt), "MMM dd, yyyy")}
          </p>
        </div>
      </div>
      <StatusBadge status={article.status} />
      {metric}
    </Link>
  );
}

export default function DashboardPage() {
  const { data: newsData } = useQuery({
    queryKey: ["news", { page: 1, limit: 5, sortBy: "createdAt", order: "desc" }],
    queryFn: () => newsApi.getAll({ page: 1, limit: 5, sortBy: "createdAt", order: "desc" }),
    select: (res) => res.data,
  });

  const { data: mostViewedData } = useQuery({
    queryKey: ["news", { page: 1, limit: 5, sortBy: "viewCount", order: "desc" }],
    queryFn: () => newsApi.getAll({ page: 1, limit: 5, sortBy: "viewCount", order: "desc" }),
    select: (res) => res.data,
  });

  const { data: mostReactedData } = useQuery({
    queryKey: ["news", { page: 1, limit: 5, sortBy: "reactionsCount", order: "desc" }],
    queryFn: () => newsApi.getAll({ page: 1, limit: 5, sortBy: "reactionsCount", order: "desc" }),
    select: (res) => res.data,
  });

  const { data: mostCommentedData } = useQuery({
    queryKey: ["news", { page: 1, limit: 5, sortBy: "commentsCount", order: "desc" }],
    queryFn: () => newsApi.getAll({ page: 1, limit: 5, sortBy: "commentsCount", order: "desc" }),
    select: (res) => res.data,
  });

  const { data: videoData } = useQuery({
    queryKey: ["videos", { page: 1, limit: 1 }],
    queryFn: () => videoApi.getAll({ page: 1, limit: 1 }),
    select: (res) => res.data,
  });

  const { data: galleryData } = useQuery({
    queryKey: ["gallery", { page: 1, limit: 1 }],
    queryFn: () => galleryApi.getAll({ page: 1, limit: 1 }),
    select: (res) => res.data,
  });

  const stats = [
    {
      title: "Total News",
      value: newsData?.pagination?.total ?? "—",
      icon: Newspaper,
      href: "/news",
      color: "from-blue-500/15 to-indigo-500/5",
      iconColor: "text-blue-600 bg-blue-500/10",
    },
    {
      title: "Total Videos",
      value: videoData?.pagination?.total ?? "—",
      icon: Video,
      href: "/videos",
      color: "from-violet-500/15 to-purple-500/5",
      iconColor: "text-violet-600 bg-violet-500/10",
    },
    {
      title: "Gallery Albums",
      value: galleryData?.pagination?.total ?? "—",
      icon: Images,
      href: "/gallery",
      color: "from-emerald-500/15 to-teal-500/5",
      iconColor: "text-emerald-600 bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your content and recent activity."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="group">
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br ${stat.color}">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-heading tracking-tight">
                        {stat.value}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl ${stat.iconColor} transition-transform group-hover:scale-110`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  <span>View all</span>
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Articles */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading">
                Recent Articles
              </CardTitle>
              <CardDescription className="mt-0.5">
                Latest published and draft articles
              </CardDescription>
            </div>
            <Link
              href="/news"
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {newsData?.news?.length ? (
            <div className="divide-y divide-border/50">
              {newsData.news.map((article: News) => (
                <ArticleRow
                  key={article._id}
                  article={article}
                  metric={
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                      <Eye className="h-3 w-3" />
                      {article.viewCount.toLocaleString()}
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Newspaper className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No articles yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Most Viewed & Most Interacted side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Viewed */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-lg font-heading">Most Viewed</CardTitle>
            </div>
            <CardDescription className="mt-0.5">
              Top articles by view count
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {mostViewedData?.news?.length ? (
              <div className="divide-y divide-border/50">
                {mostViewedData.news.map((article: News) => (
                  <ArticleRow
                    key={article._id}
                    article={article}
                    metric={
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                        <Eye className="h-3 w-3" />
                        {article.viewCount.toLocaleString()}
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Most Reacted */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <CardTitle className="text-lg font-heading">Most Reacted</CardTitle>
            </div>
            <CardDescription className="mt-0.5">
              Top articles by reactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {mostReactedData?.news?.length ? (
              <div className="divide-y divide-border/50">
                {mostReactedData.news.map((article: News) => (
                  <ArticleRow
                    key={article._id}
                    article={article}
                    metric={
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                        <Heart className="h-3 w-3" />
                        {article.reactionsCount.toLocaleString()}
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Commented */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-lg font-heading">Most Commented</CardTitle>
          </div>
          <CardDescription className="mt-0.5">
            Top articles by comment count
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {mostCommentedData?.news?.length ? (
            <div className="divide-y divide-border/50">
              {mostCommentedData.news.map((article: News) => (
                <ArticleRow
                  key={article._id}
                  article={article}
                  metric={
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                      <MessageCircle className="h-3 w-3" />
                      {article.commentsCount.toLocaleString()}
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">No data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
