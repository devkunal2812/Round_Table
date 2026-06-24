
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddGoalDialogProps {
  children: React.ReactNode;
  onAddGoal: (goalData: any) => void;
}

export function AddGoalDialog({ children, onAddGoal }: AddGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    niche: "Dev",
    setPriority: false,
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
    onAddGoal({
      title: formData.title,
      deadline: formData.dueDate,
      priority: formData.setPriority ? "High" : "Medium"
    });
    toast({ title: "Goal added!", description: `"${formData.title}" has been added to your goals.` });
    // Reset form
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      niche: "Dev",
      setPriority: false,
      resources: []
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <div className="p-6">
          <h2 className="text-2xl font-light italic text-foreground mb-6">Add goal</h2>
          
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

            {/* Due Date */}
            <div>
              <Input
                name="dueDate"
                type="date"
                placeholder="Due date"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Niche */}
            <div className="flex items-center justify-between">
              <span className="text-foreground">Niche</span>
              <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full">
                {formData.niche}
              </Badge>
            </div>

            {/* Set Priority */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="priority"
                checked={formData.setPriority}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, setPriority: checked as boolean }))
                }
              />
              <label htmlFor="priority" className="text-foreground">Set priority</label>
            </div>

            {/* Upload Resources */}
            <div>
              <Button
                type="button"
                variant="outline"
                className="h-12 bg-background border-border text-foreground hover:bg-muted"
                onClick={() => document.getElementById('resource-upload')?.click()}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Upload resources
              </Button>
              <input
                id="resource-upload"
                type="file"
                multiple
                onChange={handleResourceUpload}
                className="hidden"
              />
            </div>

            {/* Add Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-medium"
            >
              Add
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
