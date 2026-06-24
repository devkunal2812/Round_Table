import { useState, useEffect, useCallback } from "react";
import { Search, FileText, Target, Users, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/use-debounce";

type Result = { id: string; type: string; title: string; subtitle: string; url: string };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(o => !o); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!user || !open) return;
    if (debouncedQuery.length === 0) { setResults([]); return; }
    search(debouncedQuery);
  }, [debouncedQuery, open, user]);

  const search = async (q: string) => {
    setLoading(true);
    const pattern = `%${q}%`;

    const [tasks, goals, resources, spaces, projects] = await Promise.all([
      supabase.from("tasks").select("id,title,status").eq("user_id", user!.id).ilike("title", pattern).limit(3),
      supabase.from("goals").select("id,title,priority").eq("user_id", user!.id).ilike("title", pattern).limit(3),
      supabase.from("resources").select("id,title,type").ilike("title", pattern).limit(3),
      supabase.from("spaces").select("id,name,is_public").ilike("name", pattern).limit(3),
      supabase.from("showcase_projects").select("id,title,niche").ilike("title", pattern).limit(3),
    ]);

    const combined: Result[] = [
      ...(tasks.data ?? []).map(t => ({ id: t.id, type: "task", title: t.title, subtitle: t.status, url: "/tasks" })),
      ...(goals.data ?? []).map(g => ({ id: g.id, type: "goal", title: g.title, subtitle: g.priority + " priority", url: "/" })),
      ...(resources.data ?? []).map(r => ({ id: r.id, type: "resource", title: r.title, subtitle: r.type, url: "/resources" })),
      ...(spaces.data ?? []).map(s => ({ id: s.id, type: "space", title: s.name, subtitle: s.is_public ? "Public" : "Private", url: "/collaborate" })),
      ...(projects.data ?? []).map(p => ({ id: p.id, type: "project", title: p.title, subtitle: p.niche ?? "Showcase", url: "/showcase" })),
    ];

    setResults(combined);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "task":     return <FileText className="h-4 w-4 text-dot-blue" />;
      case "goal":     return <Target className="h-4 w-4 text-dot-purple" />;
      case "space":    return <Users className="h-4 w-4 text-dot-green" />;
      case "resource": return <BookOpen className="h-4 w-4 text-dot-orange" />;
      default:         return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const typeLabel: Record<string, string> = {
    task: "Task", goal: "Goal", resource: "Resource", space: "Space", project: "Showcase"
  };

  const grouped = results.reduce((acc, r) => {
    const key = typeLabel[r.type] ?? r.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {} as Record<string, Result[]>);

  return (
    <>
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search... (⌘K)"
          className="pl-10 w-56 bg-muted/50 border-border transition-all duration-200 focus:w-72 cursor-pointer"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tasks, goals, spaces..." value={query} onValueChange={setQuery} />
        <CommandList>
          {loading && <div className="py-4 text-center text-sm text-muted-foreground">Searching...</div>}
          {!loading && query.length > 0 && results.length === 0 && (
            <CommandEmpty>No results for "{query}"</CommandEmpty>
          )}
          {!loading && query.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">Start typing to search...</div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map(r => (
                <CommandItem key={r.id} onSelect={() => { setOpen(false); navigate(r.url); setQuery(""); }}
                  className="flex items-center gap-3 p-3">
                  {getIcon(r.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.subtitle}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
