import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Clock, Users, LogOut, Zap } from "lucide-react";
import { getCurrentUser, getTasks, getBidsForTask, logout, type Task } from "@/lib/store";

const TaskerDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate("/auth"); return; }
    const allTasks = getTasks().filter((t) => t.tasker_id === user.id);
    if (activeTab === "active") {
      setTasks(allTasks.filter((t) => ["open", "bidding", "assigned", "in_progress"].includes(t.status)));
    } else {
      setTasks(allTasks.filter((t) => ["completed", "cancelled"].includes(t.status)));
    }
    setLoading(false);
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate("/"); };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-accent", bidding: "bg-secondary", assigned: "bg-primary",
      in_progress: "bg-primary", completed: "bg-success", cancelled: "bg-destructive",
    };
    return colors[status] || "bg-muted";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">Taskable</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="default" className="bg-gradient-hero hover:opacity-90" onClick={() => navigate("/tasker/post-task")}>
              <Plus className="w-4 h-4 mr-2" />Post Task
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Tasks</h2>
          <p className="text-muted-foreground">Manage your posted tasks and track their progress</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Tasks</TabsTrigger>
            <TabsTrigger value="completed">History</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : tasks.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-6">Post your first task to get started</p>
                <Button className="bg-gradient-hero hover:opacity-90" onClick={() => navigate("/tasker/post-task")}>
                  <Plus className="w-4 h-4 mr-2" />Post a Task
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => {
                  const bidCount = getBidsForTask(task.id).length;
                  return (
                    <Card key={task.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{task.title}</h3>
                            <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{task.location_address}</div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(task.created_at).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1"><Users className="w-4 h-4" />{bidCount} bids</div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Budget</div>
                          <div className="text-lg font-bold">₹{task.budget_min} - ₹{task.budget_max}</div>
                        </div>
                        <Button variant="outline">View Details</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaskerDashboard;
