import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateSpaceDialogProps {
  children: React.ReactNode;
}

export function CreateSpaceDialog({ children }: CreateSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
    toast({ title: "Space created!", description: `"${formData.name}" is ready for collaboration.` });
    setFormData({ name: "", description: "", coverImage: null });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <div className="p-6">
          <h2 className="text-2xl font-light italic text-foreground mb-6"> Create Table</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image Upload */}
            <div className="space-y-3">
              <div className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/30">
                <div className="text-center">
                  <p className="text-foreground font-medium mb-2">Add cover image</p>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-dot-blue text-white hover:bg-dot-blue/90"
                    onClick={() => document.getElementById('cover-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Space Name */}
            <div>
              <Input
                name="name"
                placeholder="Give your Space a name"
                value={formData.name}
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
                className="min-h-20 bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                required
              />
            </div>

            {/* Create Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-dot-blue text-white hover:bg-dot-blue/90 rounded-xl text-base font-medium"
            >
              Create
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
