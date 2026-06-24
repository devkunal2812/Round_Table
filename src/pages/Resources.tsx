import { useState, useEffect } from "react";
import { Plus, ThumbsUp, MessageCircle, Share, ExternalLink, BookOpen, Video, FileText, Link2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ShareResourceDialog } from "@/components/ShareResourceDialog";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  type: "article" | "video" | "doc" | "link";
  niche: string | null;
  likes: number;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; username: string | null };
  liked?: boolean;
};

const typeIcon = (type: string) => {
  switch (type) {
    case "article": return <BookOpen className="h-4 w-4" />;
    case "video":   return <Video className="h-4 w-4" />;
    case "doc":     return <FileText className="h-4 w-4" />;
    default:        return <Link2 className="h-4 w-4" />;
  }
};

const typeColor = (type: string) => {
  switch (type) {
    case "article": return "bg-dot-blue/10 text-dot-blue border-dot-blue/30";
    case "video":   return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400";
    case "doc":     return "bg-dot-purple/10 text-dot-purple border-dot-purple/30";
    default:        return "bg-dot-green/10 text-dot-green border-dot-green/30";
  }
};

export default function Resources() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResources();
    const sub = supabase.channel("resources-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "resources" }, () => fetchResources())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*, profiles(full_name, username)")
      .order("created_at", { ascending: false });
    setResources((data as Resource[]) ?? []);
    setLoading(false);
  };

  const handleLike = async (r: Resource) => {
    if (!user) return;
    const newLikes = r.liked ? r.likes - 1 : r.likes + 1;
    await supabase.from("resources").update({ likes: newLikes }).eq("id", r.id);
    setResources(prev => prev.map(x => x.id === r.id ? { ...x, likes: newLikes, liked: !r.liked } : x));
  };

  const handleDelete = async (id: string) => {
    await supabase.from("resources").delete().eq("id", id);
    setResources(prev => prev.filter(r => r.id !== id));
    toast({ title: "Resource deleted" });
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.niche ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold italic text-foreground">Resources</h1>
          <p className="text-muted-foreground mt-1">Knowledge shared by your community</p>
        </div>
        <ShareResourceDialog onAdd={(r) => setResources(prev => [r as Resource, ...prev])}>
          <Button className="bg-dot-green text-white shadow-soft hover:shadow-lg transition-all duration-300 rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Share resource
          </Button>
        </ShareResourceDialog>
      </div>

      <div className="relative max-w-md">
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-4 bg-background border-border"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(r => {
          const sharedBy = (r.profiles as any)?.username || (r.profiles as any)?.full_name || "unknown";
          return (
            <Card key={r.id} className="bg-gradient-card shadow-card border-border/50 hover:shadow-soft transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`flex items-center gap-1.5 text-xs border ${typeColor(r.type)}`}>
                    {typeIcon(r.type)}
                    {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                  </Badge>
                  {r.niche && <Badge variant="outline" className="text-xs">{r.niche}</Badge>}
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground leading-snug">{r.title}</h3>
                  {r.description && <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 bg-dot-purple">
                      <AvatarFallback className="bg-transparent text-white text-xs">
                        {sharedBy[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">@{sharedBy}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="sm"
                      className={`gap-1 text-xs ${r.liked ? "text-dot-blue" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => handleLike(r)}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {r.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground"
                      onClick={() => { navigator.clipboard.writeText(r.link ?? window.location.href); toast({ title: "Link copied!" }); }}>
                      <Share className="h-3.5 w-3.5" />
                    </Button>
                    {r.user_id === user?.id && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  {r.link && (
                    <Button size="sm" className="bg-dot-blue text-white hover:bg-dot-blue/90 rounded-lg gap-1 text-xs"
                      onClick={() => window.open(r.link!, "_blank")}>
                      Go through <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">{searchTerm ? "No resources match your search" : "No resources yet. Be the first to share!"}</p>
          {searchTerm && <Button variant="outline" onClick={() => setSearchTerm("")}>Clear search</Button>}
        </div>
      )}
    </div>
  );
}
