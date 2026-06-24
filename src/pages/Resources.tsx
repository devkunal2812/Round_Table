import { useState } from "react";
import { Plus, ThumbsUp, ThumbsDown, MessageCircle, Share, ExternalLink, BookOpen, Video, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShareResourceDialog } from "@/components/ShareResourceDialog";
import { Input } from "@/components/ui/input";

interface Resource {
  id: number;
  title: string;
  description: string;
  sharedBy: string;
  type: "article" | "video" | "doc" | "link";
  niche: string;
  link?: string;
  likes: number;
  dislikes: number;
  comments: number;
  liked?: boolean;
  disliked?: boolean;
}

const initialResources: Resource[] = [
  {
    id: 1,
    title: "React Performance Optimization Guide",
    description: "A deep dive into React rendering patterns, memoization strategies, and how to profile your app for bottlenecks.",
    sharedBy: "krisharj",
    type: "article",
    niche: "Dev",
    link: "https://react.dev/learn",
    likes: 14,
    dislikes: 1,
    comments: 3,
  },
  {
    id: 2,
    title: "Figma Auto Layout Masterclass",
    description: "Learn how to use Figma's Auto Layout to build responsive, scalable UI components from scratch.",
    sharedBy: "kunal_c",
    type: "video",
    niche: "Design",
    link: "https://figma.com",
    likes: 22,
    dislikes: 0,
    comments: 7,
  },
  {
    id: 3,
    title: "System Design Interview Handbook",
    description: "Comprehensive guide covering distributed systems, databases, caching, and real-world architecture patterns.",
    sharedBy: "dnyanesh_c",
    type: "doc",
    niche: "Dev",
    link: "https://github.com",
    likes: 31,
    dislikes: 2,
    comments: 11,
  },
  {
    id: 4,
    title: "Tailwind CSS Tips & Tricks",
    description: "Hidden Tailwind utilities and patterns that will supercharge your workflow and make your CSS cleaner.",
    sharedBy: "jay_n",
    type: "article",
    niche: "Dev",
    link: "https://tailwindcss.com",
    likes: 18,
    dislikes: 0,
    comments: 5,
  },
  {
    id: 5,
    title: "Content Strategy for Developers",
    description: "How to build a personal brand online as a developer — writing, positioning, and growing your audience.",
    sharedBy: "srujal_s",
    type: "doc",
    niche: "Content",
    link: "#",
    likes: 9,
    dislikes: 1,
    comments: 2,
  },
  {
    id: 6,
    title: "TypeScript Advanced Patterns",
    description: "Utility types, conditional types, infer keyword, and other advanced TS patterns for building robust apps.",
    sharedBy: "krisharj",
    type: "link",
    niche: "Dev",
    link: "https://typescriptlang.org",
    likes: 26,
    dislikes: 0,
    comments: 8,
  },
];

const typeIcon = (type: Resource["type"]) => {
  switch (type) {
    case "article": return <BookOpen className="h-4 w-4" />;
    case "video": return <Video className="h-4 w-4" />;
    case "doc": return <FileText className="h-4 w-4" />;
    case "link": return <Link2 className="h-4 w-4" />;
  }
};

const typeColor = (type: Resource["type"]) => {
  switch (type) {
    case "article": return "bg-dot-blue/10 text-dot-blue border-dot-blue/30";
    case "video": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400";
    case "doc": return "bg-dot-purple/10 text-dot-purple border-dot-purple/30";
    case "link": return "bg-dot-green/20 text-dot-green border-dot-green/30";
  }
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleLike = (id: number) => {
    setResources(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        if (r.liked) return { ...r, liked: false, likes: r.likes - 1 };
        return { ...r, liked: true, likes: r.likes + 1, disliked: false, dislikes: r.disliked ? r.dislikes - 1 : r.dislikes };
      })
    );
  };

  const toggleDislike = (id: number) => {
    setResources(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        if (r.disliked) return { ...r, disliked: false, dislikes: r.dislikes - 1 };
        return { ...r, disliked: true, dislikes: r.dislikes + 1, liked: false, likes: r.liked ? r.likes - 1 : r.likes };
      })
    );
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.niche.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold italic text-foreground">Resources</h1>
          <p className="text-muted-foreground mt-1">Knowledge shared by your community</p>
        </div>
        <ShareResourceDialog>
          <Button className="bg-dot-green text-white shadow-soft hover:shadow-lg transition-all duration-300 rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Share resource
          </Button>
        </ShareResourceDialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4 bg-background border-border"
        />
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="bg-gradient-card shadow-card border-border/50 hover:shadow-soft transition-all duration-300">
            <CardContent className="p-6 space-y-4">
              {/* Type badge + niche */}
              <div className="flex items-center justify-between">
                <Badge className={`flex items-center gap-1.5 text-xs border ${typeColor(resource.type)}`}>
                  {typeIcon(resource.type)}
                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">{resource.niche}</Badge>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground leading-snug">{resource.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
              </div>

              {/* Shared by */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 bg-dot-purple">
                  <AvatarFallback className="bg-transparent text-white text-xs">
                    {resource.sharedBy[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">@{resource.sharedBy}</span>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 text-xs transition-colors ${resource.liked ? "text-dot-blue" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => toggleLike(resource.id)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {resource.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1 text-xs transition-colors ${resource.disliked ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => toggleDislike(resource.id)}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {resource.dislikes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {resource.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Share className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="bg-dot-blue text-white hover:bg-dot-blue/90 rounded-lg gap-1 text-xs"
                  onClick={() => resource.link && resource.link !== "#" && window.open(resource.link, "_blank")}
                >
                  Go through
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No resources match your search</p>
          <Button variant="outline" onClick={() => setSearchTerm("")}>Clear search</Button>
        </div>
      )}
    </div>
  );
}
