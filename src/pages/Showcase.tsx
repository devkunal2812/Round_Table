import { useState, useEffect } from "react";
import { Plus, ExternalLink, Heart, MessageCircle, Share2, Github, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShareShowcaseDialog } from "@/components/ShareShowcaseDialog";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type Project = {
  id: string;
  title: string;
  description: string | null;
  project_link: string | null;
  github_link: string | null;
  cover_image_url: string | null;
  tags: string[];
  likes: number;
  niche: string | null;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; username: string | null };
  liked?: boolean;
};

const GRADIENTS = [
  "from-dot-purple/20 to-dot-blue/20",
  "from-dot-pink/20 to-dot-purple/20",
  "from-dot-green/20 to-dot-blue/20",
  "from-dot-orange/20 to-dot-pink/20",
  "from-dot-blue/20 to-dot-green/20",
];

export default function Showcase() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    const sub = supabase.channel("showcase-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "showcase_projects" }, () => fetchProjects())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("showcase_projects")
      .select("*, profiles(full_name, username)")
      .order("created_at", { ascending: false });
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  };

  const handleLike = async (p: Project) => {
    if (!user) return;
    const newLikes = p.liked ? p.likes - 1 : p.likes + 1;
    await supabase.from("showcase_projects").update({ likes: newLikes }).eq("id", p.id);
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, likes: newLikes, liked: !p.liked } : x));
  };

  const handleDelete = async (id: string) => {
    await supabase.from("showcase_projects").delete().eq("id", id);
    setProjects(prev => prev.filter(p => p.id !== id));
    toast({ title: "Project removed" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold italic text-foreground">Showcase</h1>
          <p className="text-muted-foreground mt-1">Projects built by your community</p>
        </div>
        <ShareShowcaseDialog onAdd={(p) => setProjects(prev => [p as Project, ...prev])}>
          <Button className="bg-dot-green text-white shadow-soft hover:shadow-lg transition-all duration-300 rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Showcase your work
          </Button>
        </ShareShowcaseDialog>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No projects yet. Be the first to showcase!</p>
          <ShareShowcaseDialog onAdd={(p) => setProjects(prev => [p as Project, ...prev])}>
            <Button className="bg-gradient-primary text-white">
              <Plus className="mr-2 h-4 w-4" /> Add your project
            </Button>
          </ShareShowcaseDialog>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((p, i) => {
            const profile = p.profiles as any;
            const name = profile?.full_name || profile?.username || "Anonymous";
            const handle = profile?.username || "user";
            const initials = name[0]?.toUpperCase() ?? "?";
            const gradient = GRADIENTS[i % GRADIENTS.length];

            return (
              <Card key={p.id} className="bg-gradient-card shadow-card border-border/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  {/* Cover */}
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={p.title}
                      className="w-full h-48 object-cover rounded-xl border border-border/30" />
                  ) : (
                    <div className={`w-full h-48 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center border border-border/30`}>
                      <div className="text-center space-y-2">
                        <div className="text-4xl">🚀</div>
                        <p className="text-sm font-medium text-foreground/70">{p.title}</p>
                      </div>
                    </div>
                  )}

                  {/* Creator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-gradient-primary">
                        <AvatarFallback className="bg-transparent text-white text-sm font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">@{handle} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                    {p.niche && <Badge variant="secondary" className="text-xs">{p.niche}</Badge>}
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-foreground">{p.title}</h3>
                    {p.description && <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>}
                  </div>

                  {/* Tags */}
                  {p.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {p.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm"
                        className={`gap-1.5 text-xs ${p.liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => handleLike(p)}>
                        <Heart className={`h-3.5 w-3.5 ${p.liked ? "fill-current" : ""}`} />
                        {p.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground"
                        onClick={() => { navigator.clipboard.writeText(p.project_link ?? window.location.href); toast({ title: "Link copied!" }); }}>
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                      {p.user_id === user?.id && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {p.github_link && (
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-lg"
                          onClick={() => window.open(p.github_link!, "_blank")}>
                          <Github className="h-3.5 w-3.5" /> Code
                        </Button>
                      )}
                      {p.project_link && (
                        <Button size="sm" className="bg-dot-blue text-white hover:bg-dot-blue/90 rounded-lg gap-1.5 text-xs"
                          onClick={() => window.open(p.project_link!, "_blank")}>
                          View Live <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
