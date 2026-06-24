import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareShowcaseDialogProps {
  children: React.ReactNode;
}

export function ShareShowcaseDialog({ children }: ShareShowcaseDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    projectTitle: "",
    projectDescription: "",
    projectLink: "",
    niche: "Dev",
    coverImage: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Project showcased!", description: `"${formData.projectTitle}" is now live on the Showcase.` });
    setFormData({ projectTitle: "", projectDescription: "", projectLink: "", niche: "Dev", coverImage: null });
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
            {/* Cover Image Upload */}
            <div className="space-y-3">
              <div className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/30">
                {formData.coverImage ? (
                  <div className="text-center">
                    <p className="text-sm text-foreground">{formData.coverImage.name}</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted rounded-xl"></div>
                )}
              </div>
              <div>
                <p className="text-foreground font-medium mb-2">Add cover image</p>
                <Button
                  type="button"
                  size="sm"
                  className="bg-dot-blue text-white hover:bg-dot-blue/90"
                  onClick={() => document.getElementById('showcase-cover-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <input
                  id="showcase-cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Project Title */}
            <div>
              <Input
                name="projectTitle"
                placeholder="Project Title"
                value={formData.projectTitle}
                onChange={handleInputChange}
                className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Project Description */}
            <div>
              <Textarea
                name="projectDescription"
                placeholder="Project Description"
                value={formData.projectDescription}
                onChange={handleInputChange}
                className="min-h-32 bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                required
              />
            </div>

            {/* Project Link */}
            <div className="relative">
              <Link2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                name="projectLink"
                placeholder="Link to your project"
                value={formData.projectLink}
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

            {/* Showcase Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-dot-blue text-white hover:bg-dot-blue/90 rounded-xl text-base font-medium"
            >
              Showcase
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}