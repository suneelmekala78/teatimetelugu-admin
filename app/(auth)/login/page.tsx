"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginForm) {
    setIsSubmitting(true);
    try {
      const { data } = await authApi.login(values.email, values.password);
      const { accessToken, user } = data;

      if (user.role !== "admin" && user.role !== "writer") {
        toast.error("Access denied. Admin or Writer role required.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      document.cookie = `role=${user.role};path=/;max-age=${60 * 60 * 24 * 7};samesite=lax`;
      setUser(user);
      toast.success("Welcome back!");

      const redirect = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      router.replace(redirect || "/");
      router.refresh();
    } catch (err: unknown) {
      console.error("Login failed", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-[480px] lg:max-w-[580px] border-0 shadow-2xl shadow-primary/10 backdrop-blur-sm bg-card/95">
      <CardHeader className="flex flex-col items-center gap-3 pb-2 pt-8">
        <img
          src="/icon.png"
          alt="Tea Time Telugu"
          className="h-16 w-16 object-contain rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-card"
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            Tea Time Telugu
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to continue to admin panel
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-8 px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@teatimetelugu.com"
                className="pl-10 h-11 bg-muted/50 border-input/50 focus:bg-background transition-colors"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 bg-muted/50 border-input/50 focus:bg-background transition-colors"
                {...register("password")}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
