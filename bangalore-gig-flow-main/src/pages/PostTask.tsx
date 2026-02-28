import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MapPin, Zap, Mic } from "lucide-react";
import { z } from "zod";
import { getCurrentUser, createTask } from "@/lib/store";

/* ---------------- VALIDATION ---------------- */

const taskSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  location_address: z.string().min(5, "Address is required"),
  budget_min: z.number().min(50, "Minimum budget must be at least ₹50"),
  budget_max: z.number().min(50, "Maximum budget must be at least ₹50"),
});

const categories = [
  "Cleaning",
  "Delivery",
  "Moving & Packing",
  "Home Repairs",
  "Plumbing",
  "Electrical",
  "Painting",
  "Gardening",
  "Design & Creative",
  "Assembly",
  "Other",
];

/* ---------------- COMPONENT ---------------- */

const PostTask = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location_address: "",
    budget_min: "",
    budget_max: "",
  });

  /* ---------------- SPEECH RECOGNITION ---------------- */

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      setFormData((prev) => ({
        ...prev,
        description: prev.description
          ? prev.description + " " + transcript
          : transcript,
      }));
    };

    recognition.onerror = () => {
      toast.error("Voice recognition error");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = getCurrentUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const validated = taskSchema.parse({
        ...formData,
        budget_min: Number(formData.budget_min),
        budget_max: Number(formData.budget_max),
      });

      if (validated.budget_max < validated.budget_min) {
        toast.error("Maximum budget must be greater than minimum budget");
        setLoading(false);
        return;
      }

      createTask({
        tasker_id: user.id,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        location_address: validated.location_address,
        budget_min: validated.budget_min,
        budget_max: validated.budget_max,
        status: "open",
      });

      toast.success("Task posted successfully!");
      navigate("/tasker/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to post task");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/tasker/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Taskable
            </h1>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TITLE */}
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input
                placeholder="Need help cleaning my apartment"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DESCRIPTION + MIC */}
            <div className="space-y-2">
              <Label>Description *</Label>

              <div className="relative">
                <Textarea
                  rows={5}
                  placeholder="Describe your task..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  onClick={startListening}
                  className={`absolute right-3 top-3 transition ${
                    isListening
                      ? "text-red-500 animate-pulse"
                      : "text-muted-foreground"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LOCATION */}
            <div className="space-y-2">
              <Label>Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Enter address in Bengaluru"
                  value={formData.location_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location_address: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* BUDGET */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Min ₹"
                value={formData.budget_min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget_min: e.target.value,
                  })
                }
              />

              <Input
                type="number"
                placeholder="Max ₹"
                value={formData.budget_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget_max: e.target.value,
                  })
                }
              />
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/tasker/dashboard")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1 bg-gradient-hero"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Task"
                )}
              </Button>
            </div>

          </form>
        </Card>
      </div>
    </div>
  );
};

export default PostTask;