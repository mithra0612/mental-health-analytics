"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronUp, User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface UserData {
  name: string;
  email: string;
}

export function UserMenu() {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // silent
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-2
          text-left text-sm transition-all duration-150 hover:bg-accent active:scale-[0.98]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {/* Avatar */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md
            bg-foreground text-background text-xs font-semibold">
            {user ? initials : <User2 className="h-3.5 w-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate leading-tight">
              {user?.name ?? "Loading..."}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {user?.email ?? ""}
            </p>
          </div>
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform
            group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-52 rounded-xl border border-border bg-card shadow-lg"
      >
        <div className="px-3 py-2.5">
          <p className="text-xs font-semibold text-foreground">{user?.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer mx-1 mb-1 rounded-lg"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span className="text-sm">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
