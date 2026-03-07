"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Plus,
  MessageCircle,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import StatsCards from "./components/StatsCards";
import MoodChart from "./components/MoodChart";
import SleepChart from "./components/SleepChart";
import StressChart from "./components/StressChart";
import EntryForm from "./components/EntryForm";
import InsightsPanel from "./components/InsightsPanel";
import type { IAnalytics, IEntry } from "@/types";

interface DashboardData {
  analytics: IAnalytics | null;
  chartData: { date: string; mood: number; sleep: number; stress: number }[];
  todayEntry: IEntry | null;
}

interface UserData {
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, userRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/auth/me"),
        ]);

        if (!analyticsRes.ok || !userRes.ok) {
          if (analyticsRes.status === 401 || userRes.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch data");
        }

        const analyticsData = await analyticsRes.json();
        const userData = await userRes.json();

        setData(analyticsData);
        setUser(userData.user);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Mental Health Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setShowEntryForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Entry</span>
            </Button>

            <Link href="/chat">
              <Button variant="outline" size="icon">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </Link>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <StatsCards
          analytics={data?.analytics || null}
          todayEntry={data?.todayEntry || null}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MoodChart data={data?.chartData || []} />
          <SleepChart data={data?.chartData || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StressChart data={data?.chartData || []} />
          </div>
          <InsightsPanel insights={data?.analytics?.insights || []} />
        </div>
      </main>

      <EntryForm
        open={showEntryForm}
        onOpenChange={setShowEntryForm}
        existingEntry={data?.todayEntry}
      />
    </div>
  );
}
