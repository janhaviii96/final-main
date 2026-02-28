import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Wallet, Lock, Unlock, Gift } from "lucide-react";
import { getWallet } from "@/lib/store";

interface WalletPreviewProps {
  userId?: string;
  isVerified?: boolean;
  showBonusPreview?: boolean;
}

const WalletPreview = ({ userId, isVerified = false, showBonusPreview = false }: WalletPreviewProps) => {
  const [balance, setBalance] = useState<number>(0);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const wallet = getWallet(userId);
      setBalance(wallet.balance);
      setBonusClaimed(wallet.verification_bonus_claimed);
    }
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Wallet Balance</p>
            <p className="text-2xl font-bold">₹{balance.toFixed(0)}</p>
          </div>
        </div>

        {showBonusPreview && !bonusClaimed && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isVerified ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
            {isVerified ? (
              <><Unlock className="w-4 h-4" /><span className="text-sm font-medium">+₹30</span></>
            ) : (
              <><Lock className="w-4 h-4" /><span className="text-sm font-medium">₹30</span></>
            )}
          </div>
        )}

        {bonusClaimed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">Bonus Claimed!</span>
          </div>
        )}
      </div>

      {showBonusPreview && !bonusClaimed && !isVerified && (
        <p className="text-xs text-muted-foreground mt-3">Complete verification to unlock your ₹30 bonus</p>
      )}
    </Card>
  );
};

export default WalletPreview;
