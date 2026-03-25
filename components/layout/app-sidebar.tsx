"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Video,
  Images,
  MessageSquare,
  Users,
  Bell,
  Settings,
  Home,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "News", href: "/news", icon: Newspaper },
  { title: "Videos", href: "/videos", icon: Video },
  { title: "Gallery", href: "/gallery", icon: Images },
//   { title: "Comments", href: "/comments", icon: MessageSquare },
];

const adminItems = [
  { title: "Home Config", href: "/home-config", icon: Home },
  { title: "Users", href: "/users", icon: Users },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/en-fav-logo.png"
            alt="Tea Time Telugu"
            className="h-9 w-9 shrink-0 object-contain rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-[15px] font-bold font-heading tracking-tight text-sidebar-foreground leading-tight">
              Tea Time Telugu
            </span>
            <span className="text-[11px] text-sidebar-foreground/50 font-medium uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold px-3 mb-1">
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="group/nav"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="text-[13px] font-medium">
                        {item.title}
                      </span>
                      {isActive && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold px-3 mb-1">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        className="group/nav"
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="text-[13px] font-medium">
                          {item.title}
                        </span>
                        {isActive && (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {user?.fullName}
            </p>
            <p className="text-[11px] text-sidebar-foreground/50 capitalize font-medium">
              {user?.role}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
