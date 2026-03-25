"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Shield, Bell, Sliders, User, Lock, AlertTriangle } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
}

interface TrackingPrefs {
  sleepGoal: string;
  stressBaseline: string;
  reminderTime: string;
}

interface NotificationPrefs {
  emailNotifications: boolean;
  dailyReminder: boolean;
  weeklyReport: boolean;
  streakAlerts: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [tracking, setTracking] = useState<TrackingPrefs>({
    sleepGoal: "8",
    stressBaseline: "5",
    reminderTime: "09:00",
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    emailNotifications: true,
    dailyReminder: true,
    weeklyReport: false,
    streakAlerts: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data.user);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast({ title: "Profile updated", description: "Your name has been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters.", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Password changed", description: "Your password has been updated." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveTracking = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleepHours: Number(tracking.sleepGoal),
          stressBaseline: Number(tracking.stressBaseline),
          reminderTime: tracking.reminderTime,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Tracking preferences saved" });
    } catch {
      toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: notifications.emailNotifications }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Notification preferences saved" });
    } catch {
      toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindtrack-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete", description: "Your data has been downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <DashboardHeader title="Settings" />
        <div className="p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="Settings" description="Manage your account and preferences" />
      <div className="p-6 max-w-3xl">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Profile</TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-1.5"><Sliders className="h-3.5 w-3.5" />Tracking</TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" />Notifications</TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your display name and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile?.name || ""}
                    onChange={(e) => setProfile(profile ? { ...profile, name: e.target.value } : null)}
                    placeholder="Your name"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={isChangingPassword || !newPassword}>
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Tracking Goals</CardTitle>
                <CardDescription>Set your personal baselines and targets used in analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Sleep Goal (hours per night)</Label>
                  <Select value={tracking.sleepGoal} onValueChange={(v) => setTracking({ ...tracking, sleepGoal: v })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["5", "6", "7", "8", "9", "10"].map((h) => (
                        <SelectItem key={h} value={h}>{h} hours</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Used to highlight nights you fell short of your goal.</p>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <Label>Stress Baseline (1–10)</Label>
                  <Select value={tracking.stressBaseline} onValueChange={(v) => setTracking({ ...tracking, stressBaseline: v })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((n) => (
                        <SelectItem key={n} value={n}>{n} — {Number(n) <= 3 ? "Low" : Number(n) <= 6 ? "Moderate" : "High"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Entries above this are flagged as high-stress days.</p>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <Label htmlFor="reminder-time">Daily Check-in Reminder Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={tracking.reminderTime}
                    onChange={(e) => setTracking({ ...tracking, reminderTime: e.target.value })}
                    className="w-40"
                  />
                  <p className="text-xs text-muted-foreground">Your preferred time to log a daily entry.</p>
                </div>

                <Button onClick={handleSaveTracking} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What to Track</CardTitle>
                <CardDescription>Choose which metrics appear on your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Mood Score", desc: "Daily 1–10 mood rating", enabled: true },
                  { label: "Sleep Duration", desc: "Hours of sleep per night", enabled: true },
                  { label: "Stress Level", desc: "Daily 1–10 stress rating", enabled: true },
                  { label: "Emotions", desc: "Tag emotions alongside each entry", enabled: true },
                  { label: "Triggers", desc: "Log what caused stress or mood shifts", enabled: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how and when MindTrack reaches you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates and summaries via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(v) => setNotifications({ ...notifications, emailNotifications: v })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Daily Check-in Reminder</p>
                    <p className="text-xs text-muted-foreground">Get reminded to log your daily entry</p>
                  </div>
                  <Switch
                    checked={notifications.dailyReminder}
                    onCheckedChange={(v) => setNotifications({ ...notifications, dailyReminder: v })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Weekly Summary Report</p>
                    <p className="text-xs text-muted-foreground">Receive a weekly summary of your mental health trends</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(v) => setNotifications({ ...notifications, weeklyReport: v })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Streak Alerts</p>
                    <p className="text-xs text-muted-foreground">Be notified when you&apos;re about to break a logging streak</p>
                  </div>
                  <Switch
                    checked={notifications.streakAlerts}
                    onCheckedChange={(v) => setNotifications({ ...notifications, streakAlerts: v })}
                  />
                </div>
                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Notifications"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Download className="h-4 w-4" /> Export Your Data</CardTitle>
                <CardDescription>Download a full copy of all your journal entries and analytics data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your export will include all journal entries, mood logs, sleep records, stress data, goals, and account metadata in JSON format.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Journal Entries</Badge>
                  <Badge variant="outline">Mood Data</Badge>
                  <Badge variant="outline">Sleep Records</Badge>
                  <Badge variant="outline">Stress Logs</Badge>
                  <Badge variant="outline">Goals</Badge>
                </div>
                <Button onClick={handleExportData} disabled={isExporting} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export All Data"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
                <CardDescription>How your data is stored and handled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Your data is private</p>
                    <p className="text-xs text-muted-foreground">All journal entries and personal data are stored securely and are never shared with third parties.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Encrypted storage</p>
                    <p className="text-xs text-muted-foreground">Passwords are hashed and sensitive data is encrypted at rest.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" /> Danger Zone
                </CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div>
                    <p className="text-sm font-medium">Delete All Journal Entries</p>
                    <p className="text-xs text-muted-foreground">Permanently removes all your logged entries. Cannot be undone.</p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Entries
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Account
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Contact support to perform account deletion.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
