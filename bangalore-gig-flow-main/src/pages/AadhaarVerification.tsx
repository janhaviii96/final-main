import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Zap, Camera, CheckCircle2, Upload,
  Shield, Clock, XCircle, BadgeCheck, Gift, Lock, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import WalletPreview from "@/components/WalletPreview";
import {
  getCurrentUser,
  getVerificationsForUser,
  upsertVerification,
  updateUser,
  updateWallet,
  getWallet,
} from "@/lib/store";

type VerificationStatus = "idle" | "pending" | "rejected" | "approved";

const AadhaarVerification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate("/auth"); return; }
    setUserId(user.id);

    const verifications = getVerificationsForUser(user.id);
    const aadhaar = verifications.find((v) => v.type === "aadhaar");
    const faceScan = verifications.find((v) => v.type === "face_scan");

    if (aadhaar?.status === "approved" && faceScan?.status === "approved") {
      setVerificationStatus("approved");
    } else if (aadhaar?.status === "rejected" || faceScan?.status === "rejected") {
      setVerificationStatus("rejected");
      setRejectionReason(aadhaar?.notes || faceScan?.notes || "Verification failed");
    } else if (aadhaar?.status === "pending" || faceScan?.status === "pending") {
      setVerificationStatus("pending");
    }
    setLoading(false);

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAadhaarFile(file); setAadhaarPreview(URL.createObjectURL(file)); }
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      toast.error("Unable to access camera. Please check permissions.");
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setSelfieFile(new File([blob], "selfie.jpg", { type: "image/jpeg" }));
            setSelfiePreview(URL.createObjectURL(blob));
          }
        }, "image/jpeg", 0.8);
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setIsCapturing(false);
    }
  };

  const retakeSelfie = () => { setSelfieFile(null); setSelfiePreview(null); startCamera(); };

  const handleSubmit = () => {
    if (!aadhaarFile || !selfieFile || !consent) {
      toast.error("Please complete all fields and provide consent");
      return;
    }
    setSubmitting(true);
    const user = getCurrentUser();
    if (!user) { setSubmitting(false); return; }

    // Simulate async submission (mock: auto-approve for demo)
    setTimeout(() => {
      upsertVerification({ user_id: user.id, type: "aadhaar", status: "approved", document_url: aadhaarFile.name });
      upsertVerification({ user_id: user.id, type: "face_scan", status: "approved", document_url: "selfie.jpg" });

      // Award ₹30 bonus
      const wallet = getWallet(user.id);
      if (!wallet.verification_bonus_claimed) {
        updateWallet(user.id, { balance: wallet.balance + 30, verification_bonus_claimed: true });
      }

      // Mark user as verified
      updateUser(user.id, { is_identity_verified: true });

      setVerificationStatus("approved");
      toast.success("Identity verified successfully! ₹30 bonus credited.");
      setSubmitting(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">Taskable</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        {verificationStatus === "pending" && (
          <Card className="p-6 mb-6 bg-amber-500/10 border-amber-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-700">Verification Pending</h3>
                <p className="text-sm text-amber-600">Your documents are being reviewed. This usually takes 24-48 hours.</p>
              </div>
            </div>
            <div className="mt-4">
              <WalletPreview userId={userId || undefined} showBonusPreview={true} />
            </div>
          </Card>
        )}

        {verificationStatus === "rejected" && (
          <Card className="p-6 mb-6 bg-destructive/10 border-destructive/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive">Verification Rejected</h3>
                <p className="text-sm text-destructive/80">{rejectionReason || "Please resubmit with clearer documents."}</p>
              </div>
            </div>
            <Button className="mt-4 w-full" variant="outline" onClick={() => setVerificationStatus("idle")}>Try Again</Button>
          </Card>
        )}

        {verificationStatus === "approved" && (
          <Card className="p-6 mb-6 bg-success/10 border-success/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-success flex items-center gap-2">
                  Identity Verified <BadgeCheck className="w-5 h-5 text-blue-500" />
                </h3>
                <p className="text-sm text-success/80">Your identity has been verified. You now have a blue tick badge!</p>
              </div>
            </div>
            <div className="mt-4">
              <WalletPreview userId={userId || undefined} />
            </div>
            <Button className="mt-4 w-full bg-gradient-hero" onClick={() => navigate("/helper/dashboard")}>
              Go to Dashboard
            </Button>
          </Card>
        )}

        {(verificationStatus === "idle" || verificationStatus === "rejected") && (
          <Card className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Get Verified & Earn ₹30</h2>
              <p className="text-muted-foreground mt-1">Build trust. Unlock tasks. Get paid faster.</p>
            </div>

            <div className="flex items-center justify-center gap-3 py-4 px-4 bg-muted/50 rounded-lg">
              <Gift className="w-5 h-5 text-primary" />
              <span className="font-medium">₹30 Bonus</span>
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Unlocked after verification</span>
            </div>

            {/* Aadhaar Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Upload className="w-4 h-4" />Aadhaar Front Image</Label>
              <div
                className={cn("border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:border-primary/50", aadhaarPreview ? "border-success bg-success/5" : "border-muted-foreground/25")}
                onClick={() => document.getElementById("aadhaar-file")?.click()}
              >
                <input type="file" id="aadhaar-file" accept="image/*" className="hidden" onChange={handleAadhaarFileChange} />
                {aadhaarPreview ? (
                  <div className="space-y-2">
                    <img src={aadhaarPreview} alt="Aadhaar preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                    <p className="text-sm text-success flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />{aadhaarFile?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to upload Aadhaar front</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG</p>
                  </>
                )}
              </div>
            </div>

            {/* Selfie */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Camera className="w-4 h-4" />Live Selfie (Camera Required)</Label>
              <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                {!isCapturing && !selfiePreview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <User className="w-16 h-16 text-muted-foreground mb-4" />
                    <Button onClick={startCamera} className="bg-gradient-hero">
                      <Camera className="w-4 h-4 mr-2" />Open Camera
                    </Button>
                  </div>
                )}
                {isCapturing && (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-52 border-4 border-white/50 rounded-[50%]" />
                    </div>
                  </>
                )}
                {selfiePreview && <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-2">
                {isCapturing && (
                  <Button onClick={capturePhoto} className="flex-1 bg-gradient-hero">
                    <Camera className="w-4 h-4 mr-2" />Capture
                  </Button>
                )}
                {selfiePreview && (
                  <>
                    <Button variant="outline" onClick={retakeSelfie} className="flex-1">Retake</Button>
                    <div className="flex-1 flex items-center justify-center text-sm text-success gap-1">
                      <CheckCircle2 className="w-4 h-4" />Captured
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} />
              <Label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer">
                I consent to identity verification. My Aadhaar will not be stored and is used only for verification purposes.
              </Label>
            </div>

            <Button onClick={handleSubmit} disabled={!aadhaarFile || !selfieFile || !consent || submitting} className="w-full bg-gradient-hero hover:opacity-90 h-12 text-lg">
              {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</> : "Verify Now"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AadhaarVerification;
