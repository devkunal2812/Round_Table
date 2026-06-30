import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface ShareResourceDialogProps {
  children: React.ReactNode;
  onAdd?: (resource: any) => void;
}

const NICHES = ["Dev", "Design", "Content", "Product", "Marketing", "Other"];

export function ShareResourceDialog({ children, onAdd }: ShareResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    title: "", description: "", link: "",
    type: "link" as "article" | "video" | "doc" | "link",
    niche: "Dev",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("resources")
      .insert({ user_id: user.id, title: formData.title, description: formData.description, link: formData.link, type: formData.type, niche: formData.niche, likes: 0 })
      .select().single();

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }

    // Attach current user's profile info for immediate display
    const { data: profile } = await supabase.from("profiles").select("full_name, username").eq("id", user.id).single();
    const enriched = { ...data, profiles: profile };

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }

    toast({ title: "Resource shared!", description: `"${formData.title}" is now visible to everyone.` });
    onAdd?.(enriched);
    setFormData({ title: "", description: "", link: "", type: "link", niche: "Dev" });
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <div className="p-6">
          <h2 className="text-2xl font-light italic text-foreground mb-6">Share a Resource</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Title" value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="h-12 bg-background border-border" required />
            <Textarea name="description" placeholder="Description" value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="min-h-24 bg-background border-border resize-none" />
            <div className="relative">
              <Link2 className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input name="link" placeholder="URL / Link" value={formData.link}
                onChange={e => setFormData(p => ({ ...p, link: e.target.value }))}
                className="h-12 pl-10 bg-background border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as any }))}>
                <SelectTrigger className="h-12 bg-background border-border">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.niche} onValueChange={v => setFormData(p => ({ ...p, niche: v }))}>
                <SelectTrigger className="h-12 bg-background border-border">
                  <SelectValue placeholder="Niche" />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={saving}
              className="w-full h-12 bg-dot-blue text-white hover:bg-dot-blue/90 rounded-xl">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sharing...</> : "Share Resource"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
