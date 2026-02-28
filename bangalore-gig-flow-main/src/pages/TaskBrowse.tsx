import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Search, Filter, Zap, LogOut } from "lucide-react";
import { getCurrentUser, getTasks, getBidsForTask, logout, type Task } from "@/lib/store";

const categories = ["All","Cleaning","Delivery","Moving & Packing","Home Repairs","Plumbing","Electrical","Painting","Gardening","Design & Creative","Assembly","Other"];

const TaskBrowse = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate("/auth"); return; }
    let all = getTasks().filter((t) => t.status === "open");
    if (selectedCategory !== "All") all = all.filter((t) => t.category === selectedCategory);
    setTasks(all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoading(false);
  }, [selectedCategory]);

  const handleLogout = () => { logout(); navigate("/"); };

  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Button variant="outline" onClick={() => navigate("/helper/dashboard")}>My Bids</Button>
            <Button variant="ghost" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Available Tasks</h2>
          <p className="text-muted-foreground">Browse and bid on tasks in Bengaluru</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "All" ? "Try adjusting your filters" : "Check back later for new tasks"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const bidCount = getBidsForTask(task.id).length;
              return (
                <Card key={task.id} className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary" onClick={() => navigate(`/tasks/${task.id}`)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{task.title}</h3>
                        <Badge variant="secondary">{task.category}</Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{task.location_address}</div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" />Posted {new Date(task.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Budget Range</div>
                      <div className="text-xl font-bold text-primary">₹{task.budget_min} - ₹{task.budget_max}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Current Bids</div>
                      <div className="text-xl font-bold">{bidCount}</div>
                    </div>
                    <Button className="bg-gradient-hero hover:opacity-90">Place Bid</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBrowse;
