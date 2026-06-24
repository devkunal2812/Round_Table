import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link2, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareResourceDialogProps {
  children: React.ReactNode;
}

export function ShareResourceDialog({ children }: ShareResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    links: "",
    niche: "Dev",
    resources: [] as File[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleResourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, resources: [...prev.resources, ...files] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Resource shared!", description: `"${formData.title}" has been shared with your community.` });
    setFormData({ title: "", description: "", links: "", niche: "Dev", resources: [] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <div className="p-6">
          <h2 className="text-2xl font-light italic text-foreground mb-6">Share a resource</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Input
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleInputChange}
                className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="min-h-32 bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                required
              />
            </div>

            {/* Links */}
            <div className="relative">
              <Link2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                name="links"
                placeholder="Links"
                value={formData.links}
                onChange={handleInputChange}
                className="h-12 pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Niche */}
            <div className="flex items-center justify-between">
              <span className="text-foreground">Niche</span>
              <Badge className="bg-dot-pink text-foreground px-4 py-1 rounded-full">
                {formData.niche}
              </Badge>
            </div>

            {/* Upload Resources */}
            <div>
              <Button
                type="button"
                variant="outline"
                className="h-12 bg-background border-border text-foreground hover:bg-muted"
                onClick={() => document.getElementById('share-resource-upload')?.click()}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Upload resources
              </Button>
              <input
                id="share-resource-upload"
                type="file"
                multiple
                onChange={handleResourceUpload}
                className="hidden"
              />
            </div>

            {/* Share Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-dot-blue text-white hover:bg-dot-blue/90 rounded-xl text-base font-medium"
            >
              Share
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}