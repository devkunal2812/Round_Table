import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Calendar, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  assignee: string | null;
  department: string | null;
};

const getPriorityColor = (p: string) => {
  if (p === "High") return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
  if (p === "Medium") return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
  return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400";
};

const getStatusColor = (s: string) => {
  if (s === "Completed") return "bg-dot-green text-white";
  if (s === "In Progress") return "bg-dot-blue text-white";
  return "bg-dot-orange text-white";
};

export default function Tasks() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    fetchTasks();

    const sub = supabase
      .channel("tasks-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` },
        () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setTasks(data ?? []);
    setLoading(false);
  };

  const handleAddTask = async (newTask: any) => {
    const { data, error } = await supabase.from("tasks").insert({
      user_id: user!.id,
      title: newTask.title,
      description: newTask.description || null,
      priority: newTask.priority || "Medium",
      status: "To Do",
      due_date: newTask.dueDate || null,
      assignee: newTask.assignee || null,
      department: newTask.department || null,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setTasks(prev => [data, ...prev]);
    toast({ title: "Task created!" });
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("tasks").update({ status }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    toast({ title: `Moved to ${status}` });
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast({ title: "Task deleted" });
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedTab === "todo") return matchSearch && t.status === "To Do";
    if (selectedTab === "progress") return matchSearch && t.status === "In Progress";
    if (selectedTab === "completed") return matchSearch && t.status === "Completed";
    return matchSearch;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">{tasks.length} total · {tasks.filter(t => t.status === "Completed").length} completed</p>
        </div>
        <CreateTaskDialog onAddTask={handleAddTask}>
          <Button className="bg-gradient-primary text-white shadow-soft hover:shadow-lg transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </CreateTaskDialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 bg-background border-border"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="todo">To Do ({tasks.filter(t => t.status === "To Do").length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({tasks.filter(t => t.status === "In Progress").length})</TabsTrigger>
          <TabsTrigger value="completed">Done ({tasks.filter(t => t.status === "Completed").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <div className="grid gap-4">
            {filtered.map(task => (
              <Card key={task.id} className="bg-gradient-card shadow-card border-border/50 hover:shadow-soft transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateStatus(task.id, "To Do")}>
                              Mark as To Do
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(task.id, "In Progress")}>
                              Mark as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(task.id, "Completed")}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-dot-green" /> Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        {task.department && <Badge variant="outline">{task.department}</Badge>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {task.assignee && <span>Assigned to: {task.assignee}</span>}
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">{searchTerm ? "No tasks match your search" : "No tasks yet"}</p>
              <CreateTaskDialog onAddTask={handleAddTask}>
                <Button className="bg-gradient-primary text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first task
                </Button>
              </CreateTaskDialog>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
