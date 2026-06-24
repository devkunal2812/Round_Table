import { useState, useEffect } from "react";
import { Calendar, Plus, Target, Users, TrendingUp, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function Dashboard() {
  const { user } = useAuthContext();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const today = now.getDate();

  const [profile, setProfile] = useState<{ full_name: string | null; username: string | null } | null>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [spaceCount, setSpaceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAll();

    // Real-time: listen for task updates
    const taskSub = supabase
      .channel("tasks-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` },
        () => fetchTasks())
      .subscribe();

    // Real-time: listen for goal updates
    const goalSub = supabase
      .channel("goals-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${user.id}` },
        () => fetchGoals())
      .subscribe();

    return () => {
      supabase.removeChannel(taskSub);
      supabase.removeChannel(goalSub);
    };
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchGoals(), fetchTasks(), fetchSpaceCount()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, username")
      .eq("id", user!.id)
      .single();
    setProfile(data);
  };

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user!.id)
      .eq("completed", false)
      .order("created_at", { ascending: false })
      .limit(5);
    setGoals(data ?? []);
  };

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(6);
    setTasks(data ?? []);
  };

  const fetchSpaceCount = async () => {
    const { count } = await supabase
      .from("space_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id);
    setSpaceCount(count ?? 0);
  };

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === "Completed" ? "To Do" : "Completed";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  const handleAddGoal = async (goalData: any) => {
    const { data } = await supabase
      .from("goals")
      .insert({
        user_id: user!.id,
        title: goalData.title,
        due_date: goalData.deadline || null,
        priority: goalData.priority || "Medium",
        progress: 0,
      })
      .select()
      .single();
    if (data) setGoals(prev => [data, ...prev]);
  };

  const handleAddTask = async (taskData: any) => {
    const { data } = await supabase
      .from("tasks")
      .insert({
        user_id: user!.id,
        title: taskData.title,
        description: taskData.description || "",
        priority: taskData.priority || "Medium",
        status: "To Do",
        due_date: taskData.dueDate || null,
        assignee: taskData.assignee || null,
        department: taskData.department || null,
      })
      .select()
      .single();
    if (data) setTasks(prev => [data, ...prev]);
  };

  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "there";
  const productivity = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold italic text-foreground mb-2">
              {getGreeting()}, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back to Roundtable. Let's make today productive!
            </p>
          </div>
          <div className="flex gap-3">
            <AddGoalDialog onAddGoal={handleAddGoal}>
              <Button variant="blue" className="gap-2">
                <Target className="h-4 w-4" />
                Add Goal
              </Button>
            </AddGoalDialog>
            <CreateTaskDialog onAddTask={handleAddTask}>
              <Button variant="green" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </CreateTaskDialog>
          </div>
        </div>

        {/* Stats Cards — all from DB */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                  <p className="text-3xl font-bold text-foreground">{goals.length}</p>
                </div>
                <Target className="h-8 w-8 text-dot-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Done</p>
                  <p className="text-3xl font-bold text-foreground">{completedTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-dot-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Spaces Joined</p>
                  <p className="text-3xl font-bold text-foreground">{spaceCount}</p>
                </div>
                <Users className="h-8 w-8 text-dot-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Productivity</p>
                  <p className="text-3xl font-bold text-foreground">{productivity}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-dot-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Goals from DB */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5 text-dot-purple" />
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>No goals yet. Add your first goal!</p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div key={goal.id} className="p-4 rounded-lg bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-foreground">{goal.title}</h3>
                        <Badge variant={goal.priority === "High" ? "destructive" : goal.priority === "Medium" ? "default" : "secondary"}>
                          {goal.priority}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground font-medium">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div
                            className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        {goal.due_date && (
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(goal.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <Card className="bg-gradient-card border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5 text-dot-blue" />
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["S","M","T","W","T","F","S"].map((d, i) => (
                    <div key={i} className="p-2 font-medium text-muted-foreground">{d}</div>
                  ))}
                  {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => i + 1).map(date => (
                    <div
                      key={date}
                      className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 text-sm ${
                        date === today ? "bg-primary text-primary-foreground font-semibold" : "text-foreground"
                      }`}
                    >
                      {date}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tasks from DB */}
            <Card className="bg-gradient-card border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-dot-green" />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskStatus(task)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        task.status === "Completed"
                          ? "bg-dot-green/10 border-dot-green/30 text-muted-foreground"
                          : "bg-background/50 border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        task.status === "Completed"
                          ? "bg-dot-green border-dot-green"
                          : "border-muted-foreground"
                      }`}>
                        {task.status === "Completed" && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${task.status === "Completed" ? "line-through" : "text-foreground"}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{task.priority} priority</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
