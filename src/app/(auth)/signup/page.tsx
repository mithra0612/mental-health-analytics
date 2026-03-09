"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      toast({
        title: "Account created!",
        description: "Let's set up your dashboard.",
      });

      router.push("/onboarding");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Signup failed",
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
              &ldquo;A few minutes of reflection a day builds a lifetime of self-awareness.&rdquo;
            </p>
            <footer className="text-sm text-background/50">Mental Wellness Analytics</footer>
          </blockquote>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Daily Check-ins", "Track mood, sleep & stress"],
            ["AI Insights", "Personalized analysis"],
            ["Trend Reports", "Visualize your progress"],
            ["Private & Secure", "Your data, your control"],
          ].map(([title, desc]) => (
            <div key={title} className="space-y-0.5">
              <p className="text-xs font-medium text-background/80">{title}</p>
              <p className="text-xs text-background/40">{desc}</p>
            </div>
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
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start your mental wellness journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="pl-9 h-10 transition-all duration-150 focus:border-foreground"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-10 transition-all duration-150 focus:border-foreground"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <><Loader2 className="h-4 w-4 animate-spin" />Creating account...</>
              ) : (
                <>Create account <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline transition-all"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
