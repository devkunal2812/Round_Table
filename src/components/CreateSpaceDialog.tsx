import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface CreateSpaceDialogProps {
  children: React.ReactNode;
  onCreated?: (space: any) => void;
}

export function CreateSpaceDialog({ children, onCreated }: CreateSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({ name: "", description: "", isPublic: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: space, error } = await supabase
      .from("spaces")
      .insert({ owner_id: user.id, name: formData.name, description: formData.description, is_public: formData.isPublic, invite_code: inviteCode })
      .select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSaving(false); return;
    }

    // Add creator as admin member
    await supabase.from("space_members").insert({ space_id: space.id, user_id: user.id, role: "admin" });

    toast({ title: "Space created!", description: `Invite code: ${inviteCode}` });
    onCreated?.(space);
    setFormData({ name: "", description: "", isPublic: true });
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <div className="p-6">
          <h2 className="text-2xl font-light italic text-foreground mb-6">Create Space</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="name"
              placeholder="Space name"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="h-12 bg-background border-border"
              required
            />
            <Textarea
              name="description"
              placeholder="What's this space about?"
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="min-h-24 bg-background border-border resize-none"
            />
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <Label className="text-sm font-medium">Public space</Label>
                <p className="text-xs text-muted-foreground">Anyone can discover and join</p>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={v => setFormData(p => ({ ...p, isPublic: v }))}
              />
            </div>
            <Button type="submit" disabled={saving}
              className="w-full h-12 bg-dot-blue text-white hover:bg-dot-blue/90 rounded-xl">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Space"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
