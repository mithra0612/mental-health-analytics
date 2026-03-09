"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch("/api/seed", { method: "GET" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Seeding failed");
      }

      setEmail(data.credentials.email);
      setPassword(data.credentials.password);

      toast({
        title: "Test user created",
        description: `Email: ${data.credentials.email}, Password: ${data.credentials.password}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Seeding failed",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      if (!data.user.onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/10">
            <Activity className="h-4 w-4 text-background" />
          </div>
          <span className="text-sm font-semibold tracking-tight">MindTrack</span>
        </div>
        <div>
          <blockquote className="space-y-3">
            <p className="text-2xl font-semibold leading-snug">
              &ldquo;Understanding your patterns is the first step toward lasting clarity.&rdquo;
            </p>
            <footer className="text-sm text-background/50">Mental Wellness Analytics</footer>
          </blockquote>
        </div>
        <div className="flex gap-3">
          {["Mood", "Sleep", "Stress", "Insights"].map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full border border-background/20 text-background/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col items-center justify-center px-8 py-12 bg-background">
        {/* Mobile brand */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <Activity className="h-3.5 w-3.5 text-background" />
          </div>
          <span className="text-sm font-semibold">MindTrack</span>
        </div>

        <div className="w-full max-w-sm fade-up">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your wellness dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9 h-10 transition-all duration-150 focus:border-foreground"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-10 transition-all duration-150 focus:border-foreground"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 gap-2 transition-all duration-150 active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 text-sm transition-all duration-150 active:scale-[0.98]"
            onClick={handleSeed}
            disabled={isSeeding}
          >
            {isSeeding ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Setting up...</>
            ) : (
              "Use demo account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline transition-all"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
