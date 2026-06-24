import { useState } from "react";
import { Plus, ExternalLink, Heart, MessageCircle, Share2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShareShowcaseDialog } from "@/components/ShareShowcaseDialog";

interface Project {
  id: number;
  title: string;
  description: string;
  creator: string;
  creatorHandle: string;
  avatarColor: string;
  tags: string[];
  likes: number;
  comments: number;
  link?: string;
  githubLink?: string;
  liked?: boolean;
  gradient: string;
}

const initialProjects: Project[] = [
  {
    id: 1,
    title: "Roundtable – Productivity Platform",
    description: "A modern productivity and collaboration platform built for individuals and teams to manage goals, tasks, and projects — all in one unified workspace.",
    creator: "Kunal Chauhan",
    creatorHandle: "kunal_c",
    avatarColor: "bg-dot-blue",
    tags: ["React", "TypeScript", "Tailwind"],
    likes: 42,
    comments: 8,
    link: "https://round-table-zeta.vercel.app/",
    githubLink: "https://github.com/devkunal2812/Round_Table",
    gradient: "from-dot-purple/20 to-dot-blue/20",
  },
  {
    id: 2,
    title: "DesignKit — UI Component Library",
    description: "A fully accessible, customizable component library built on Radix UI and Tailwind CSS. Includes 50+ production-ready components.",
    creator: "Krish Prajapati",
    creatorHandle: "krisharj",
    avatarColor: "bg-dot-pink",
    tags: ["Design System", "Figma", "React"],
    likes: 87,
    comments: 19,
    gradient: "from-dot-pink/20 to-dot-purple/20",
  },
  {
    id: 3,
    title: "DevMetrics — GitHub Analytics Dashboard",
    description: "Real-time analytics for your GitHub repositories. Track commits, PRs, issues, and contributor activity with beautiful visualizations.",
    creator: "Dnyanesh Chaudhari",
    creatorHandle: "dnyanesh_c",
    avatarColor: "bg-dot-green",
    tags: ["Next.js", "GitHub API", "Recharts"],
    likes: 61,
    comments: 14,
    gradient: "from-dot-green/20 to-dot-blue/20",
  },
];

export default function Showcase() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const toggleLike = (id: number) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        return p.liked
          ? { ...p, liked: false, likes: p.likes - 1 }
          : { ...p, liked: true, likes: p.likes + 1 };
      })
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold italic text-foreground">Showcase</h1>
          <p className="text-muted-foreground mt-1">Projects built by your community</p>
        </div>
        <ShareShowcaseDialog>
          <Button className="bg-dot-green text-white shadow-soft hover:shadow-lg transition-all duration-300 rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Showcase your work
          </Button>
        </ShareShowcaseDialog>
      </div>

      {/* Projects Feed */}
      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="bg-gradient-card shadow-card border-border/50 hover:shadow-soft transition-all duration-300">
            <CardContent className="p-6 space-y-4">
              {/* Project Cover */}
              <div className={`w-full h-48 bg-gradient-to-br ${project.gradient} rounded-xl flex items-center justify-center border border-border/30`}>
                <div className="text-center space-y-2">
                  <div className="text-4xl">🚀</div>
                  <p className="text-sm font-medium text-foreground/70">{project.title}</p>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <Avatar className={`h-8 w-8 ${project.avatarColor}`}>
                  <AvatarFallback className="bg-transparent text-white text-sm">
                    {project.creator[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{project.creator}</p>
                  <p className="text-xs text-muted-foreground">@{project.creatorHandle}</p>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-foreground leading-snug">{project.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1.5 text-xs transition-colors ${project.liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => toggleLike(project.id)}
                  >
                    <Heart className={`h-3.5 w-3.5 ${project.liked ? "fill-current" : ""}`} />
                    {project.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {project.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  {project.githubLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs rounded-lg"
                      onClick={() => window.open(project.githubLink, "_blank")}
                    >
                      <Github className="h-3.5 w-3.5" />
                      Code
                    </Button>
                  )}
                  {project.link && (
                    <Button
                      size="sm"
                      className="bg-dot-blue text-white hover:bg-dot-blue/90 rounded-lg gap-1.5 text-xs"
                      onClick={() => window.open(project.link, "_blank")}
                    >
                      View Live
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
