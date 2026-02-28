import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";
import { z } from "zod";
import { login, signup } from "@/lib/store";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["tasker", "helper"], { required_error: "Please select a role" }),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select your gender" }),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signup");

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "" as "tasker" | "helper" | "",
    gender: "" as "male" | "female" | "other" | "",
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = signupSchema.parse(signupData);
      const user = signup(
        validated.email,
        validated.password,
        validated.fullName,
        validated.role,
        validated.gender
      );
      toast.success("Account created successfully!");
      navigate(user.role === "tasker" ? "/tasker/dashboard" : "/helper/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = loginSchema.parse(loginData);
      const user = login(validated.email, validated.password);
      toast.success("Welcome back!");
      navigate(user.role === "tasker" ? "/tasker/dashboard" : "/helper/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to log in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 to-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Taskable
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Log In</TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Gender *</Label>
                <RadioGroup
                  value={signupData.gender}
                  onValueChange={(value: "male" | "female" | "other") =>
                    setSignupData({ ...signupData, gender: value })
                  }
                  className="flex gap-4"
                >
                  {["male", "female", "other"].map((g) => (
                    <div key={g} className="flex items-center space-x-2">
                      <RadioGroupItem value={g} id={g} />
                      <Label htmlFor={g} className="capitalize">{g}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>I want to:</Label>
                <RadioGroup
                  value={signupData.role}
                  onValueChange={(value: "tasker" | "helper") =>
                    setSignupData({ ...signupData, role: value })
                  }
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="tasker" id="tasker" />
                    <Label htmlFor="tasker" className="flex-1 cursor-pointer">
                      <div className="font-medium">Post Tasks</div>
                      <div className="text-sm text-muted-foreground">I need help with tasks</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="helper" id="helper" />
                    <Label htmlFor="helper" className="flex-1 cursor-pointer">
                      <div className="font-medium">Complete Tasks</div>
                      <div className="text-sm text-muted-foreground">I want to earn by helping others</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create Account"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Demo accounts:</p>
              <p>Tasker: <span className="font-mono">tasker@demo.com</span> / any password</p>
              <p>Helper: <span className="font-mono">helper@demo.com</span> / any password</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-hero hover:opacity-90" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : "Log In"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          By continuing, you agree to Taskable's Terms of Service and Privacy Policy
        </div>
      </Card>
    </div>
  );
};

export default Auth;
