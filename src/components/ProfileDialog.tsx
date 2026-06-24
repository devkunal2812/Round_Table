import { useState, useEffect } from "react";
import { User, Mail, Shield, Calendar, Star, CheckCircle, FolderOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

export function ProfileDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();

  const [profile, setProfile] = useState<{
    full_name: string | null;
    username: string | null;
    role: string | null;
    bio: string | null;
    created_at: string;
  } | null>(null);

  const [stats, setStats] = useState({ tasksCompleted: 0, activeGoals: 0, spacesJoined: 0 });
  const [recentTasks, setRecentTasks] = useState<{ title: string; status: string }[]>([]);

  useEffect(() => {
    if (!open || !user) return;

    // Load profile
    supabase.from("profiles").select("full_name, username, role, bio, created_at")
      .eq("id", user.id).single()
      .then(({ data }) => setProfile(data));

    // Load stats
    Promise.all([
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "Completed"),
      supabase.from("goals").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", false),
      supabase.from("space_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([tasks, goals, spaces]) => {
      setStats({
        tasksCompleted: tasks.count ?? 0,
        activeGoals: goals.count ?? 0,
        spacesJoined: spaces.count ?? 0,
      });
    });

    // Recent tasks
    supabase.from("tasks").select("title, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setRecentTasks(data ?? []));

  }, [open, user]);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.username?.[0]?.toUpperCase() ?? "?";

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors w-full">
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Profile Overview</DialogTitle>
        </DialogHeader>

        {/* Scrollable body — max height so it never overflows the screen */}
        <ScrollArea className="max-h-[75vh] px-6 pb-6 mt-4">
          <div className="space-y-5">

            {/* Avatar + name */}
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 bg-gradient-primary flex-shrink-0">
                <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-foreground truncate">
                  {profile?.full_name || profile?.username || user?.email?.split("@")[0]}
                </h2>
                <p className="text-muted-foreground text-sm">{profile?.role || "Member"}</p>
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground mt-1 italic">"{profile.bio}"</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {profile?.username && (
                    <Badge variant="outline" className="text-xs">@{profile.username}</Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm mb-3">Contact Information</h3>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">Active since {joinDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats from DB */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-dot-green mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{stats.tasksCompleted}</div>
                  <div className="text-xs text-muted-foreground">Tasks Done</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FolderOpen className="h-5 w-5 text-dot-blue mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{stats.activeGoals}</div>
                  <div className="text-xs text-muted-foreground">Active Goals</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-5 w-5 text-dot-purple mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{stats.spacesJoined}</div>
                  <div className="text-xs text-muted-foreground">Spaces</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent tasks from DB */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3">Recent Tasks</h3>
                {recentTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentTasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                        <Star className="h-3 w-3 text-dot-orange flex-shrink-0" />
                        <span className="flex-1 truncate">{task.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs flex-shrink-0 ${
                            task.status === "Completed"
                              ? "border-dot-green text-dot-green"
                              : task.status === "In Progress"
                              ? "border-dot-blue text-dot-blue"
                              : "border-muted-foreground"
                          }`}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 pb-1">
              <Button
                className="flex-1 bg-gradient-primary text-white"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link to="/settings">Edit Profile</Link>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
