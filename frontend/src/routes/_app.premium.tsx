import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Crown, HeadphonesIcon, LineChart, ShieldCheck, Sparkles, Upload, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/premium")({ component: PremiumPage });

function PremiumPage() {
  const { user } = useAuth();
  const [tier, setTier] = useState(user?.user_metadata?.tier ?? "free");

  const upgrade = async () => {
    setTier("premium");
    toast.success("Premium status aktivləşdirildi", { description: "İnkişaf etmiş limitlər və analitika açıldı." });
  };

  const premiumFeatures = [
    { icon: HeadphonesIcon, name: "Priority Support", desc: "Prioritet dəstək — 24/7 canlı yardım və sürətli cavab" },
    { icon: LineChart, name: "Advanced Analytics", desc: "Qabaqcıl analitika — dərin enerji təhlili və benchmark" },
    { icon: Upload, name: "Unlimited Exports", desc: "Limitsiz ixrac — PDF, CSV, Excel formatında sonsuz hesabat" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Premium</p>
          <h1 className="text-3xl font-bold tracking-tight">Premium Plan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Abunəlik səviyyənizi yüksəldərək daha geniş limitlər, benchmark və anomaliya analizlərini açın.</p>
        </div>
        <Badge variant="default" className="gap-1.5 text-sm px-3 py-1">
          <span className="relative inline-flex h-2 w-2"><span className="absolute inset-0 rounded-full bg-green-400 animate-ping" /><span className="relative inline-block h-2 w-2 rounded-full bg-green-500" /></span>
          Active
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover-lift">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Aktiv premium istifadəçilər</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span className="text-3xl font-bold">214</span></div></CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Premium gəlir</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">₼ 6,420<span className="text-base font-normal text-muted-foreground">/ay</span></div></CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hazırkı plan</CardTitle></CardHeader>
          <CardContent>
            <Badge variant={tier === "premium" ? "default" : "secondary"} className="text-base px-3 py-1">{tier === "premium" ? "Premium" : "Free"}</Badge>
            <p className="mt-2 text-xs text-muted-foreground">Free plan iki əsas istifadə limiti ilə işləyir.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-strong">
        <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" /> Premium xüsusiyyətlər</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {premiumFeatures.map((f) => (
              <div key={f.name} className="rounded-xl border p-4 space-y-2 hover-lift">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-blue)" }}>
                    <f.icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm">{f.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <Button className="w-full gap-2" disabled={tier === "premium"} onClick={upgrade}>
            <Sparkles className="h-4 w-4" /> {tier === "premium" ? "Premium aktivdir" : "Premiuma yüksəlt"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
