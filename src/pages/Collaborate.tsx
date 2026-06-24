import { useState, useEffect } from "react";
import { Plus, Users, Target, Share2, Lock, Globe, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreateSpaceDialog } from "@/components/CreateSpaceDialog";
import { JoinSpaceDialog } from "@/components/JoinSpaceDialog";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { ShareResourceDialog } from "@/components/ShareResourceDialog";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type Space = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  invite_code: string | null;
  owner_id: string;
  memberCount?: number;
};

type Buddy = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string | null;
};

export default function Collaborate() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchSpaces(), fetchBuddies()]);
    setLoading(false);
  };

  const fetchSpaces = async () => {
    // Get all public spaces + spaces user is a member of
    const { data: memberRows } = await supabase
      .from("space_members")
      .select("space_id")
      .eq("user_id", user!.id);

    const memberSpaceIds = (memberRows ?? []).map(r => r.space_id);

    const { data } = await supabase
      .from("spaces")
      .select("*")
      .or(`is_public.eq.true,id.in.(${memberSpaceIds.length > 0 ? memberSpaceIds.join(",") : "null"})`);

    // Get member counts
    const spacesWithCounts = await Promise.all(
      (data ?? []).map(async (s) => {
        const { count } = await supabase
          .from("space_members")
          .select("*", { count: "exact", head: true })
          .eq("space_id", s.id);
        return { ...s, memberCount: count ?? 0 };
      })
    );
    setSpaces(spacesWithCounts);
  };

  const fetchBuddies = async () => {
    // Get all profiles except current user
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, username, role")
      .neq("id", user!.id)
      .limit(6);
    setBuddies(data ?? []);
  };

  const handleAddGoal = async (goalData: any) => {
    const { error } = await supabase.from("goals").insert({
      user_id: user!.id,
      title: goalData.title,
      due_date: goalData.deadline || null,
      priority: goalData.priority || "Medium",
      progress: 0,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleSpaceCreated = (space: Space) => {
    setSpaces(prev => [{ ...space, memberCount: 1 }, ...prev]);
  };

  const handleSpaceJoined = (space: Space) => {
    setSpaces(prev => prev.some(s => s.id === space.id) ? prev : [{ ...space, memberCount: (space.memberCount ?? 0) + 1 }, ...prev]);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Invite code copied!", description: code });
  };

  const AVATAR_COLORS = ["bg-dot-purple", "bg-dot-blue", "bg-dot-green", "bg-dot-pink", "bg-dot-orange"];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold italic text-foreground">Your Spaces</h1>
          <p className="text-muted-foreground mt-1">Collaborate with groups that share your goals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CreateSpaceDialog onCreated={handleSpaceCreated}>
            <Button className="bg-dot-green text-white shadow-soft hover:shadow-lg transition-all duration-300 rounded-lg">
              <Plus className="mr-2 h-4 w-4" /> Create space
            </Button>
          </CreateSpaceDialog>
          <JoinSpaceDialog onJoined={handleSpaceJoined}>
            <Button variant="outline" className="bg-dot-blue text-white hover:bg-dot-blue/90 border-dot-blue rounded-lg">
              <Users className="mr-2 h-4 w-4" /> Join space
            </Button>
          </JoinSpaceDialog>
          <AddGoalDialog onAddGoal={handleAddGoal}>
            <Button variant="outline" className="border-border hover:bg-muted rounded-lg">
              <Target className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </AddGoalDialog>
          <ShareResourceDialog onAdd={() => {}}>
            <Button variant="outline" className="border-border hover:bg-muted rounded-lg">
              <Share2 className="mr-2 h-4 w-4" /> Share Resource
            </Button>
          </ShareResourceDialog>
        </div>
      </div>

      {/* Spaces Grid */}
      {spaces.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No spaces yet. Create one or join with an invite code!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space, index) => (
            <Card key={space.id} className="bg-gradient-card shadow-card border-border/50 hover:shadow-soft transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Avatar className={`h-12 w-12 ${AVATAR_COLORS[index % AVATAR_COLORS.length]} group-hover:scale-105 transition-transform`}>
                    <AvatarFallback className="bg-transparent text-white text-xl font-bold">
                      {space.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs gap-1 flex items-center">
                      {space.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {space.is_public ? "Public" : "Private"}
                    </Badge>
                    {space.invite_code && space.owner_id === user?.id && (
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => copyInviteCode(space.invite_code!)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">{space.name}</h3>
                  {space.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{space.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{space.memberCount} member{space.memberCount !== 1 ? "s" : ""}</span>
                  </div>
                  {space.invite_code && space.owner_id === user?.id && (
                    <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                      Code: {space.invite_code}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Buddies from DB */}
      {buddies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold italic text-foreground">People on Roundtable</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {buddies.map((buddy, index) => (
              <Card key={buddy.id} className="bg-gradient-card shadow-card border-border/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-10 w-10 ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                        <AvatarFallback className="bg-transparent text-white font-bold">
                          {(buddy.full_name || buddy.username || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{buddy.full_name || buddy.username || "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">{buddy.role || "Member"}</div>
                      </div>
                    </div>
                    {buddy.username && (
                      <Badge variant="secondary" className="text-xs">@{buddy.username}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
