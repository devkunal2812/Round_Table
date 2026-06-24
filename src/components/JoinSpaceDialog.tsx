import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface JoinSpaceDialogProps {
  children: React.ReactNode;
  onJoined?: (space: any) => void;
}

export function JoinSpaceDialog({ children, onJoined }: JoinSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [spaceCode, setSpaceCode] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { data: space, error: findError } = await supabase
      .from("spaces")
      .select("*")
      .eq("invite_code", spaceCode.toUpperCase().trim())
      .single();

    if (findError || !space) {
      toast({ title: "Space not found", description: "Check the invite code and try again.", variant: "destructive" });
      setSaving(false); return;
    }

    const { error } = await supabase.from("space_members").insert({ space_id: space.id, user_id: user.id, role: "member" });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already a member", description: `You're already in "${space.name}"` });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setSaving(false); return;
    }

    toast({ title: "Joined!", description: `Welcome to "${space.name}"` });
    onJoined?.(space);
    setSpaceCode("");
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm bg-card border-border">
        <div className="p-6">
          <h2 className="text-2xl font-light italic text-foreground mb-8">Join Space</h2>
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Enter invite code (e.g. HANG01)"
                value={spaceCode}
                onChange={e => setSpaceCode(e.target.value)}
                className="h-12 bg-background border-border uppercase"
                required
              />
              <Button type="submit" disabled={saving}
                className="w-full h-12 bg-dot-blue text-white hover:bg-dot-blue/90 rounded-xl">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Joining...</> : "Join Space"}
              </Button>
            </form>
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl"
              onClick={() => { toast({ title: "Request sent!", description: "The space admin will review your request." }); setOpen(false); }}>
              Request to join
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
