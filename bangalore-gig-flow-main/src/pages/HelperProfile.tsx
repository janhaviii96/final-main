import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Zap, Upload, Shield, User, ChevronRight, FileText, BadgeCheck, Gift } from "lucide-react";
import VerificationBadge from "@/components/VerificationBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import WalletPreview from "@/components/WalletPreview";
import SkillSelector from "@/components/SkillSelector";
import {
  getCurrentUser,
  updateUser,
  getVerificationsForUser,
  upsertVerification,
  type Verification,
} from "@/lib/store";

const HelperProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userId, setUserId] = useState<string | null>(null);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    full_name: "", phone: "", gender: "", bio: "", hourly_rate: "",
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate("/auth"); return; }
    setUserId(user.id);
    setProfile({
      full_name: user.full_name || "",
      phone: user.phone || "",
      gender: user.gender || "",
      bio: user.bio || "",
      hourly_rate: user.hourly_rate?.toString() || "",
    });
    setIsIdentityVerified(user.is_identity_verified || false);
    setVerifications(getVerificationsForUser(user.id));
    setLoading(false);
  }, []);

  const getVerificationStatus = (type: string) => {
    const v = verifications.find((v) => v.type === type);
    return (v?.status as "pending" | "approved" | "rejected") || "none";
  };

  const handleSaveProfile = () => {
    setSaving(true);
    const user = getCurrentUser();
    if (!user) { setSaving(false); return; }
    updateUser(user.id, {
      full_name: profile.full_name,
      phone: profile.phone,
      gender: profile.gender,
      bio: profile.bio,
      hourly_rate: profile.hourly_rate ? Number(profile.hourly_rate) : undefined,
    });
    toast.success("Profile updated successfully!");
    setSaving(false);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const user = getCurrentUser();
    if (!user) return;
    setUploadingDoc(docType);
    // Simulate upload delay
    setTimeout(() => {
      upsertVerification({
        user_id: user.id,
        type: docType as Verification["type"],
        status: "pending",
        document_url: file.name,
      });
      setVerifications(getVerificationsForUser(user.id));
      toast.success(`${docType.toUpperCase()} document uploaded! Pending verification.`);
      setUploadingDoc(null);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/helper/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">Taskable</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Profile</h2>
          <p className="text-muted-foreground">Complete your profile and verification to start accepting tasks</p>
        </div>

        {/* Verification Status Overview */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />Verification Status
              {isIdentityVerified && <VerifiedBadge isVerified={true} size="md" />}
            </h3>
            {isIdentityVerified && (
              <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                <BadgeCheck className="w-4 h-4" />Identity Verified
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <VerificationBadge type="aadhaar" status={getVerificationStatus("aadhaar")} />
            <VerificationBadge type="pan" status={getVerificationStatus("pan")} />
            <VerificationBadge type="police" status={getVerificationStatus("police")} />
          </div>
          {userId && (
            <WalletPreview userId={userId} showBonusPreview={!isIdentityVerified} isVerified={isIdentityVerified} />
          )}
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="verification"><Shield className="w-4 h-4 mr-2" />Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                  <Input id="hourly_rate" type="number" value={profile.hourly_rate} onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })} placeholder="500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell customers about your experience and expertise..." rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <SkillSelector selectedSkills={selectedSkills} onSkillsChange={setSelectedSkills} />
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-hero hover:opacity-90">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Profile"}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <div className="space-y-6">
              {/* Aadhaar + Selfie */}
              <Card className="p-6 overflow-hidden relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Aadhaar + Selfie Verification</h4>
                        <p className="text-sm text-muted-foreground">Complete identity verification with biometric</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <VerificationBadge type="aadhaar" status={getVerificationStatus("aadhaar")} />
                      <VerificationBadge type="face_scan" status={getVerificationStatus("face_scan")} />
                    </div>
                  </div>
                  <Button onClick={() => navigate("/verification/aadhaar")} className="bg-gradient-hero hover:opacity-90">
                    {getVerificationStatus("aadhaar") === "none" ? "Start Verification" : "View Status"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>

              {/* PAN */}
              <Card className="p-6 overflow-hidden relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                <div className="relative flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">PAN Card</h4>
                      <p className="text-sm text-muted-foreground mb-3">Required for tax verification and payments</p>
                      <VerificationBadge type="pan" status={getVerificationStatus("pan")} />
                    </div>
                  </div>
                  <div>
                    <input type="file" accept="image/*,.pdf" className="hidden" id="pan-upload" onChange={(e) => handleDocumentUpload(e, "pan")} />
                    <Button variant="outline" onClick={() => document.getElementById("pan-upload")?.click()} disabled={uploadingDoc === "pan"}>
                      {uploadingDoc === "pan" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {getVerificationStatus("pan") === "none" ? "Upload" : "Re-upload"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Police */}
              <Card className="p-6 overflow-hidden relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                <div className="relative flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Police Verification</h4>
                      <p className="text-sm text-muted-foreground mb-3">Upload your police verification certificate</p>
                      <VerificationBadge type="police" status={getVerificationStatus("police")} />
                    </div>
                  </div>
                  <div>
                    <input type="file" accept="image/*,.pdf" className="hidden" id="police-upload" onChange={(e) => handleDocumentUpload(e, "police")} />
                    <Button variant="outline" onClick={() => document.getElementById("police-upload")?.click()} disabled={uploadingDoc === "police"}>
                      {uploadingDoc === "police" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {getVerificationStatus("police") === "none" ? "Upload" : "Re-upload"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Bonus info */}
              <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8 text-primary" />
                  <div>
                    <h4 className="font-semibold">Earn ₹30 Verification Bonus</h4>
                    <p className="text-sm text-muted-foreground">Complete Aadhaar + Selfie verification to unlock your wallet bonus</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelperProfile;
