import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Github, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface ShareShowcaseDialogProps {
  children: React.ReactNode;
  onAdd?: (project: any) => void;
}

const NICHES = ["Dev", "Design", "Content", "Product", "Marketing", "Other"];

export function ShareShowcaseDialog({ children, onAdd }: ShareShowcaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    title: "", description: "", projectLink: "", githubLink: "",
    niche: "Dev", tags: [] as string[],
  });

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData(p => ({ ...p, tags: [...p.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("showcase_projects")
      .insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        project_link: formData.projectLink || null,
        github_link: formData.githubLink || null,
        tags: formData.tags,
        niche: formData.niche,
        likes: 0,
      })
      .select().single();

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }

    // Attach profile for immediate display
    const { data: profile } = await supabase.from("profiles").select("full_name, username").eq("id", user.id).single();
    const enriched = { ...data, profiles: profile };

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }

    toast({ title: "Project showcased!", description: `"${formData.title}" is now live.` });
    onAdd?.(enriched);
    setFormData({ title: "", description: "", projectLink: "", githubLink: "", niche: "Dev", tags: [] });
    setTagInput("");
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <div className="p-6">
          <h2 className="text-2xl font-light italic text-foreground mb-6">Showcase your Work</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Project title" value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="h-12 bg-background border-border" required />
            <Textarea placeholder="Describe your project..." value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="min-h-24 bg-background border-border resize-none" />
            <div className="relative">
              <Link2 className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Live project URL" value={formData.projectLink}
                onChange={e => setFormData(p => ({ ...p, projectLink: e.target.value }))}
                className="h-12 pl-10 bg-background border-border" />
            </div>
            <div className="relative">
              <Github className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="GitHub repository URL" value={formData.githubLink}
                onChange={e => setFormData(p => ({ ...p, githubLink: e.target.value }))}
                className="h-12 pl-10 bg-background border-border" />
            </div>
            <Select value={formData.niche} onValueChange={v => setFormData(p => ({ ...p, niche: v }))}>
              <SelectTrigger className="h-12 bg-background border-border">
                <SelectValue placeholder="Select niche" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            {/* Tags */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Add a tag (e.g. React)" value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  className="h-10 bg-background border-border" />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={saving}
              className="w-full h-12 bg-dot-blue text-white hover:bg-dot-blue/90 rounded-xl">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</> : "Showcase Project"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
