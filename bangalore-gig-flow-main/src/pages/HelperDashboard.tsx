import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, DollarSign, LogOut, Zap, TrendingUp, User } from "lucide-react";
import { getCurrentUser, getBidsForHelper, getTaskById, logout, type Bid, type Task } from "@/lib/store";

interface BidWithTask extends Bid { task: Task }

const HelperDashboard = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState<BidWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBids: 0, activeBids: 0, wonBids: 0 });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate("/auth"); return; }
    const rawBids = getBidsForHelper(user.id);
    const enriched = rawBids
      .map((b) => { const task = getTaskById(b.task_id); return task ? { ...b, task } : null; })
      .filter(Boolean) as BidWithTask[];
    setBids(enriched);
    setStats({
      totalBids: enriched.length,
      activeBids: enriched.filter(b => b.status === "pending").length,
      wonBids: enriched.filter(b => b.status === "accepted").length,
    });
    setLoading(false);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { pending: "bg-secondary", accepted: "bg-success", rejected: "bg-destructive" };
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
            <Button variant="outline" onClick={() => navigate("/helper/profile")}>
              <User className="w-4 h-4 mr-2" />My Profile
            </Button>
            <Button variant="default" className="bg-gradient-hero hover:opacity-90" onClick={() => navigate("/tasks")}>
              Browse Tasks
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Helper Dashboard</h2>
          <p className="text-muted-foreground">Track your bids and earnings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Bids", value: stats.totalBids, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
            { label: "Active Bids", value: stats.activeBids, icon: Clock, color: "text-secondary", bg: "bg-secondary/10" },
            { label: "Won Tasks", value: stats.wonBids, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
          ].map((s) => (
            <Card key={s.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="mybids" className="space-y-6">
          <TabsList><TabsTrigger value="mybids">My Bids</TabsTrigger></TabsList>
          <TabsContent value="mybids" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : bids.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No bids yet</h3>
                <p className="text-muted-foreground mb-6">Browse available tasks and place your first bid</p>
                <Button className="bg-gradient-hero hover:opacity-90" onClick={() => navigate("/tasks")}>Browse Tasks</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bids.map((bid) => (
                  <Card key={bid.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/tasks/${bid.task.id}`)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{bid.task.title}</h3>
                          <Badge className={getStatusColor(bid.status)}>{bid.status}</Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{bid.task.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{bid.task.location_address}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" />Bid placed {new Date(bid.created_at).toLocaleDateString()}</div>
                    </div>
                    {bid.status === "accepted" && (
                      <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Task location (meet here)</div>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          123 Demo Lane, Koramangala, Bangalore – 560034
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Dummy location for now. Actual address will be shared by tasker.</p>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Your Bid</div>
                        <div className="text-lg font-bold text-primary">₹{bid.amount}</div>
                      </div>
                      <Button variant="outline">View Task</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelperDashboard;
