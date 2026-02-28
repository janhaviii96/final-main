import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Clock, DollarSign, User, Zap, Loader2, CheckCircle2, Shield, Camera } from "lucide-react";
import { z } from "zod";
import VerifiedBadge from "@/components/VerifiedBadge";
import PoliceVerificationTag from "@/components/PoliceVerificationTag";
import FaceScanModal from "@/components/FaceScanModal";
import {
  getCurrentUser,
  getTaskById,
  getBidsForTask,
  getUserById,
  getVerificationsForUser,
  createBid,
  updateTask,
  updateBid,
  getBids,
  type Task,
  type Bid,
  type Verification,
} from "@/lib/store";

const bidSchema = z.object({
  amount: z.number().min(50, "Bid amount must be at least ₹50"),
  estimated_hours: z.number().min(0.5, "Estimated hours must be at least 0.5"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

interface BidEnriched extends Bid {
  helper_name: string;
  is_identity_verified: boolean;
  verifications: Verification[];
}

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<BidEnriched[]>([]);
  const [taskerName, setTaskerName] = useState("Unknown");
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [selectingHelper, setSelectingHelper] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [pendingAcceptBidId, setPendingAcceptBidId] = useState<string | null>(null);
  const [bidData, setBidData] = useState({ amount: "", estimated_hours: "", message: "" });

  const loadData = () => {
    if (!id) return;
    const t = getTaskById(id);
    if (!t) { setLoading(false); return; }
    setTask(t);
    const tasker = getUserById(t.tasker_id);
    setTaskerName(tasker?.full_name || "Unknown");

    const rawBids = getBidsForTask(id).sort((a, b) => a.amount - b.amount);
    const enriched: BidEnriched[] = rawBids.map((b) => {
      const helper = getUserById(b.helper_id);
      const verifications = getVerificationsForUser(b.helper_id);
      return {
        ...b,
        helper_name: helper?.full_name || "Unknown",
        is_identity_verified: helper?.is_identity_verified || false,
        verifications,
      };
    });
    setBids(enriched);
    setLoading(false);
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUserId(user?.id || null);
    setUserRole(user?.role || null);
    loadData();
  }, [id]);

  const getVerificationStatus = (verifications: Verification[], type: string) => {
    const v = verifications.find((v) => v.type === type);
    return (v?.status as "pending" | "approved" | "rejected") || "none";
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    setBidding(true);
    try {
      const user = getCurrentUser();
      if (!user) { navigate("/auth"); return; }
      const validated = bidSchema.parse({
        amount: Number(bidData.amount),
        estimated_hours: Number(bidData.estimated_hours),
        message: bidData.message,
      });
      createBid({ task_id: id!, helper_id: user.id, amount: validated.amount, estimated_hours: validated.estimated_hours, message: validated.message, status: "pending" });
      toast.success("Bid placed successfully!");
      setBidData({ amount: "", estimated_hours: "", message: "" });
      loadData();
    } catch (error: any) {
      if (error instanceof z.ZodError) toast.error(error.errors[0].message);
      else toast.error(error.message || "Failed to place bid");
    } finally {
      setBidding(false);
    }
  };

  const handleSelectHelper = (bid: BidEnriched) => {
    setSelectingHelper(bid.id);
    updateTask(id!, { assigned_helper_id: bid.helper_id, winning_bid_id: bid.id, status: "assigned" });
    updateBid(bid.id, { status: "accepted" });
    getBidsForTask(id!).filter(b => b.id !== bid.id).forEach(b => updateBid(b.id, { status: "rejected" }));
    toast.success("Helper selected successfully!");
    loadData();
    setSelectingHelper(null);
  };

  const handleAcceptTask = (bidId: string) => {
    setPendingAcceptBidId(bidId);
    setShowFaceScan(true);
  };

  const onFaceVerified = () => {
    updateTask(id!, { status: "in_progress" });
    toast.success("Task accepted! You can now start working.");
    loadData();
    setPendingAcceptBidId(null);
  };

  const handleCompleteTask = () => {
    updateTask(id!, { status: "completed" });
    toast.success("Task marked as completed!");
    loadData();
  };

  const isTaskOwner = currentUserId === task?.tasker_id;
  const isAssignedHelper = currentUserId === task?.assigned_helper_id;
  const userHasBid = bids.some((b) => b.helper_id === currentUserId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-4">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Task not found</h2>
          <p className="text-muted-foreground mb-4">This task may have been removed</p>
          <Button onClick={() => navigate("/tasks")}>Browse Tasks</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">Taskable</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold">{task.title}</h1>
                    <Badge variant="secondary">{task.category}</Badge>
                    <Badge className={
                      task.status === "completed" ? "bg-success" :
                      task.status === "in_progress" ? "bg-primary" :
                      task.status === "assigned" ? "bg-secondary" : "bg-accent"
                    }>{task.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><User className="w-4 h-4" />Posted by {taskerName}</div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(task.created_at).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{task.location_address}</div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
              <div>
                <h3 className="text-lg font-bold mb-3">Task Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
              </div>

              <Separator className="my-6" />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Budget Range</div>
                  <div className="text-2xl font-bold">₹{task.budget_min} - ₹{task.budget_max}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Bids</div>
                  <div className="text-2xl font-bold">{bids.length}</div>
                </div>
              </div>
            </Card>

            {/* Tasker: Dummy map – helper's current location (after accept bid) */}
            {isTaskOwner && (task.status === "assigned" || task.status === "in_progress") && task.assigned_helper_id && (
              <Card className="p-6 overflow-hidden">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />Helper&apos;s current location
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Live location of your selected helper (dummy map for now).
                </p>
                <div className="rounded-lg border bg-muted overflow-hidden aspect-video w-full">
                  <iframe
                    title="Helper location map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=77.584%2C12.965%2C77.606%2C12.982&layer=mapnik&marker=12.9716%2C77.5946"
                    className="w-full h-full min-h-[280px] border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Marker: dummy helper location (Koramangala, Bangalore). Real tracking will be added later.
                </p>
              </Card>
            )}

            {/* Helper: Task location (dummy) - shown after tasker accepted bid */}
            {isAssignedHelper && (task.status === "assigned" || task.status === "in_progress") && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />Task location
                </h3>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">123 Demo Lane, Koramangala, Bangalore – 560034</p>
                      <p className="text-sm text-muted-foreground mt-1">Dummy location for now. Actual address will be shared by the tasker.</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Helper: Complete task */}
            {isAssignedHelper && task.status === "in_progress" && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />Mark Task Complete
                </h3>
                <p className="text-muted-foreground mb-4">Once you're done with the task, mark it as completed.</p>
                <Button onClick={handleCompleteTask} className="bg-gradient-hero hover:opacity-90">
                  <CheckCircle2 className="w-4 h-4 mr-2" />Mark as Completed
                </Button>
              </Card>
            )}

            {/* Bids */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">All Bids ({bids.length})</h3>
              </div>
              {bids.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No bids yet. Be the first to bid!</div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => {
                    const isWinningBid = bid.id === task.winning_bid_id;
                    return (
                      <div key={bid.id} className={`p-4 border rounded-lg ${isWinningBid ? "border-success bg-success/5" : ""}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                              {bid.helper_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {bid.helper_name}
                                <VerifiedBadge isVerified={bid.is_identity_verified} size="sm" />
                                {isWinningBid && <Badge className="bg-success">Selected</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground">{bid.estimated_hours} hours estimated</div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                <PoliceVerificationTag status={getVerificationStatus(bid.verifications, "police")} />
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">₹{bid.amount}</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{bid.message}</p>

                        {isTaskOwner && task.status === "open" && (
                          <Button onClick={() => handleSelectHelper(bid)} disabled={selectingHelper === bid.id} className="mt-3 bg-gradient-hero hover:opacity-90">
                            {selectingHelper === bid.id ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Selecting...</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Select This Helper</>}
                          </Button>
                        )}

                        {bid.helper_id === currentUserId && bid.status === "accepted" && task.status === "assigned" && (
                          <Button onClick={() => handleAcceptTask(bid.id)} className="mt-3 bg-gradient-hero hover:opacity-90">
                            <Shield className="w-4 h-4 mr-2" />Accept & Verify Face
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Bid Form */}
          {userRole === "helper" && task.status === "open" && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">{userHasBid ? "Bid Submitted" : "Place Your Bid"}</h3>
                {userHasBid ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-success" />
                    </div>
                    <p className="text-muted-foreground">Your bid has been submitted. The tasker will review and select a helper.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Your Bid Amount (₹) *</Label>
                      <Input id="amount" type="number" placeholder="Enter your bid" value={bidData.amount} onChange={(e) => setBidData({ ...bidData, amount: e.target.value })} required />
                      <p className="text-xs text-muted-foreground">Budget range: ₹{task.budget_min} - ₹{task.budget_max}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours">Estimated Hours *</Label>
                      <Input id="hours" type="number" step="0.5" placeholder="e.g., 2.5" value={bidData.estimated_hours} onChange={(e) => setBidData({ ...bidData, estimated_hours: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message to Tasker *</Label>
                      <Textarea id="message" placeholder="Explain why you're the best fit for this task..." rows={4} value={bidData.message} onChange={(e) => setBidData({ ...bidData, message: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90" disabled={bidding}>
                      {bidding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Placing Bid...</> : "Place Bid"}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      <FaceScanModal open={showFaceScan} onOpenChange={setShowFaceScan} taskId={task.id} onVerified={onFaceVerified} />
    </div>
  );
};

export default TaskDetail;
