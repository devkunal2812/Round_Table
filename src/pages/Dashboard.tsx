import { useState } from "react";
import { Calendar, Plus, Target, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Dashboard() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const today = now.getDate();

  const [currentGoals, setCurrentGoals] = useState([
    { id: 1, title: "Complete Project Alpha", progress: 75, dueDate: "2024-01-15", priority: "High" },
    { id: 2, title: "Learn React Native", progress: 45, dueDate: "2024-01-25", priority: "Medium" },
    { id: 3, title: "Workout 5x per week", progress: 60, dueDate: "2024-01-31", priority: "Low" },
  ]);

  const [todayTasks, setTodayTasks] = useState([
    { id: 1, title: "Review project proposals", completed: false, time: "9:00 AM" },
    { id: 2, title: "Team standup meeting", completed: true, time: "10:30 AM" },
    { id: 3, title: "Client presentation prep", completed: false, time: "2:00 PM" },
    { id: 4, title: "Code review session", completed: false, time: "4:00 PM" },
  ]);

  const toggleTaskCompletion = (taskId: number) => {
    setTodayTasks(tasks => 
      tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addNewGoal = (goalData: any) => {
    const newGoal = {
      id: currentGoals.length + 1,
      title: goalData.title,
      progress: 0,
      dueDate: goalData.deadline,
      priority: goalData.priority
    };
    setCurrentGoals([...currentGoals, newGoal]);
  };

  const addNewTask = (taskData: any) => {
    const newTask = {
      id: todayTasks.length + 1,
      title: taskData.title,
      completed: false,
      time: "To be scheduled"
    };
    setTodayTasks([...todayTasks, newTask]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold italic text-foreground mb-2">
              {getGreeting()}, Captain! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back to Roundtable. Let's make today productive!
            </p>
          </div>
          <div className="flex gap-3">
            <AddGoalDialog onAddGoal={addNewGoal}>
              <Button variant="blue" className="gap-2">
                <Target className="h-4 w-4" />
                Add Goal
              </Button>
            </AddGoalDialog>
            <CreateTaskDialog onAddTask={addNewTask}>
              <Button variant="green" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </CreateTaskDialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                  <p className="text-3xl font-bold text-foreground">{currentGoals.length}</p>
                </div>
                <Target className="h-8 w-8 text-dot-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                  <p className="text-3xl font-bold text-foreground">
                    {todayTasks.filter(task => task.completed).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-dot-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-3xl font-bold text-foreground">12</p>
                </div>
                <Users className="h-8 w-8 text-dot-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
                  <p className="text-3xl font-bold text-foreground">94%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-dot-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Goals */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5 text-dot-purple" />
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentGoals.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-lg bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-foreground">{goal.title}</h3>
                      <Badge variant={goal.priority === 'High' ? 'destructive' : goal.priority === 'Medium' ? 'default' : 'secondary'}>
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
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">Due: {goal.dueDate}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule & Calendar */}
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
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="p-2 font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {/* Empty cells for first day offset */}
                  {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => i + 1).map((date) => (
                    <div 
                      key={date} 
                      className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        date === today ? 'bg-dot-blue text-white font-semibold' : 'text-foreground'
                      }`}
                    >
                      {date}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card className="bg-gradient-card border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-dot-green" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      task.completed 
                        ? 'bg-dot-green/10 border-dot-green/30 text-muted-foreground' 
                        : 'bg-background/50 border-border hover:bg-muted/30'
                    }`}
                    onClick={() => toggleTaskCompletion(task.id)}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      task.completed 
                        ? 'bg-dot-green border-dot-green' 
                        : 'border-muted-foreground hover:border-foreground'
                    }`}>
                      {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'line-through' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{task.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
