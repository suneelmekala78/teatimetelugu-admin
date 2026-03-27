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
  Pencil,
  ExternalLink,
  MoreVertical,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SITE_URLS } from "@/constants";

function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-14 mt-4" />
      </CardContent>
    </Card>
  );
}

function ArticleRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-1">
      <Skeleton className="h-12 w-18 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-4 w-10" />
    </div>
  );
}

function ArticleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border/50">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleRowSkeleton key={i} />
      ))}
    </div>
  );
}

function ArticleRow({
  article,
  metric,
  rank,
}: {
  article: News;
  metric: React.ReactNode;
  rank?: number;
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-1 group">
      {rank != null && (
        <span className="text-xs font-bold text-muted-foreground/60 w-5 text-center tabular-nums shrink-0">
          {rank}
        </span>
      )}
      <img
        src={article.thumbnail}
        alt=""
        className="h-12 w-18 rounded-lg object-cover ring-1 ring-border/40 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate leading-snug">
          {article.title.en}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {format(new Date(article.createdAt), "MMM dd, yyyy")}
          </p>
          <StatusBadge status={article.status} />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {metric}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              />
            }
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/news/${article._id}/edit`} />}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `${SITE_URLS.english}/${article.category}/${article.slug}`,
                  "_blank",
                  "noopener"
                )
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View (English)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `${SITE_URLS.telugu}/${article.category}/${article.slug}`,
                  "_blank",
                  "noopener"
                )
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View (Telugu)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ArticleListCard({
  title,
  description,
  icon,
  viewAllHref,
  articles,
  isLoading,
  metricFn,
  showRank,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  viewAllHref?: string;
  articles: News[] | undefined;
  isLoading: boolean;
  metricFn: (article: News) => React.ReactNode;
  showRank?: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="text-base font-heading">{title}</CardTitle>
              <CardDescription className="mt-0 text-xs">
                {description}
              </CardDescription>
            </div>
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <ArticleListSkeleton />
        ) : articles?.length ? (
          <div className="divide-y divide-border/50">
            {articles.map((article, i) => (
              <ArticleRow
                key={article._id}
                article={article}
                rank={showRank ? i + 1 : undefined}
                metric={metricFn(article)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Newspaper className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No data yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: newsData, isPending: newsLoading } = useQuery({
    queryKey: ["news", { page: 1, limit: 5, sortBy: "createdAt", order: "desc" }],
    queryFn: () =>
      newsApi.getAll({ page: 1, limit: 5, sortBy: "createdAt", order: "desc" }),
    select: (res) => res.data,
  });

  const { data: mostViewedData, isPending: viewedLoading } = useQuery({
    queryKey: ["news", { page: 1, limit: 5, sortBy: "viewCount", order: "desc" }],
    queryFn: () =>
      newsApi.getAll({ page: 1, limit: 5, sortBy: "viewCount", order: "desc" }),
    select: (res) => res.data,
  });

  const { data: mostReactedData, isPending: reactedLoading } = useQuery({
    queryKey: ["news", { page: 1, limit: 5, sortBy: "reactionsCount", order: "desc" }],
    queryFn: () =>
      newsApi.getAll({
        page: 1,
        limit: 5,
        sortBy: "reactionsCount",
        order: "desc",
      }),
    select: (res) => res.data,
  });

  const { data: mostCommentedData, isPending: commentedLoading } = useQuery({
    queryKey: ["news", { page: 1, limit: 5, sortBy: "commentsCount", order: "desc" }],
    queryFn: () =>
      newsApi.getAll({
        page: 1,
        limit: 5,
        sortBy: "commentsCount",
        order: "desc",
      }),
    select: (res) => res.data,
  });

  const { data: videoData, isPending: videoLoading } = useQuery({
    queryKey: ["videos", { page: 1, limit: 1 }],
    queryFn: () => videoApi.getAll({ page: 1, limit: 1 }),
    select: (res) => res.data,
  });

  const { data: galleryData, isPending: galleryLoading } = useQuery({
    queryKey: ["gallery", { page: 1, limit: 1 }],
    queryFn: () => galleryApi.getAll({ page: 1, limit: 1 }),
    select: (res) => res.data,
  });

  const statsLoading = newsLoading || videoLoading || galleryLoading;

  const stats = [
    {
      title: "Total News",
      value: newsData?.pagination?.total ?? 0,
      icon: Newspaper,
      href: "/news",
      iconColor: "text-blue-600 bg-blue-500/10",
    },
    {
      title: "Total Videos",
      value: videoData?.pagination?.total ?? 0,
      icon: Video,
      href: "/videos",
      iconColor: "text-violet-600 bg-violet-500/10",
    },
    {
      title: "Gallery Albums",
      value: galleryData?.pagination?.total ?? 0,
      icon: Images,
      href: "/gallery",
      iconColor: "text-emerald-600 bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your content and recent activity."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => (
              <Link key={stat.title} href={stat.href} className="group">
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <span className="text-3xl font-bold font-heading tracking-tight">
                          {stat.value.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={`p-2.5 rounded-xl ${stat.iconColor} transition-transform group-hover:scale-110`}
                      >
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <span>View all</span>
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {/* Recent Articles */}
      <ArticleListCard
        title="Recent Articles"
        description="Latest published and draft articles"
        icon={<Newspaper className="h-4 w-4 text-primary" />}
        viewAllHref="/news"
        articles={newsData?.news}
        isLoading={newsLoading}
        metricFn={(a) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <Eye className="h-3 w-3" />
            {a.viewCount.toLocaleString()}
          </div>
        )}
      />

      {/* Most Viewed & Most Reacted */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ArticleListCard
          title="Most Viewed"
          description="Top articles by view count"
          icon={<Eye className="h-4 w-4 text-blue-500" />}
          articles={mostViewedData?.news}
          isLoading={viewedLoading}
          showRank
          metricFn={(a) => (
            <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <Eye className="h-3 w-3" />
              {a.viewCount.toLocaleString()}
            </div>
          )}
        />
        <ArticleListCard
          title="Most Reacted"
          description="Top articles by reactions"
          icon={<Heart className="h-4 w-4 text-red-500" />}
          articles={mostReactedData?.news}
          isLoading={reactedLoading}
          showRank
          metricFn={(a) => (
            <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <Heart className="h-3 w-3" />
              {a.reactionsCount.toLocaleString()}
            </div>
          )}
        />
      </div>

      {/* Most Commented */}
      <ArticleListCard
        title="Most Commented"
        description="Top articles by comment count"
        icon={<MessageCircle className="h-4 w-4 text-emerald-500" />}
        articles={mostCommentedData?.news}
        isLoading={commentedLoading}
        showRank
        metricFn={(a) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <MessageCircle className="h-3 w-3" />
            {a.commentsCount.toLocaleString()}
          </div>
        )}
      />
    </div>
  );
}
