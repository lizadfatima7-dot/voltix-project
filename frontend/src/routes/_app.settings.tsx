import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getSpendingLimit, setSpendingLimit } from "@/lib/spending-limit";
import { getSubscriberCode, normalizeSubscriberCode, setSubscriberCode } from "@/lib/subscriber-code";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Settings() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [subscriberCode, setSubscriberCodeState] = useState("");
  const [busy, setBusy] = useState(false);
  const [limit, setLimit] = useState(50);
  const [notifs, setNotifs] = useState({ usageAlerts: true, weeklyReport: true, tips: false });

  useEffect(() => {
    if (!user) return;
    setLimit(getSpendingLimit(user.id));
    setSubscriberCodeState(getSubscriberCode(user.id, user.user_metadata?.electricity_subscriber_code));
    supabase.from("profiles").select("display_name, bio").eq("id", user.id).maybeSingle()
      .then(({ data }) => { setDisplayName(data?.display_name ?? ""); setBio(data?.bio ?? ""); });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: displayName, bio });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSubscriberCode(user.id, subscriberCode);
    toast.success("Profil yeniləndi");
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password.length < 8) return toast.error("Parol ən azı 8 simvol olmalıdır");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return toast.error(error.message);
    toast.success("Parol yeniləndi");
    e.currentTarget.reset();
  };

  const saveLimit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextLimit = Math.max(1, Number(limit) || 50);
    setLimit(nextLimit);
    setSpendingLimit(user?.id, nextLimit);
    toast.success(`Aylıq xərc limiti ${nextLimit} AZN olaraq yadda saxlanıldı`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">Parametrlər</p>
        <h1 className="text-3xl font-bold tracking-tight">Tətbiq seçimləri</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Profil</CardTitle><CardDescription>Profil məlumatlarınızı və görünən adınızı yeniləyin.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-poçt</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dn">Görünən ad</Label>
              <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriber-code">Elektrik abonent kodu</Label>
              <Input
                id="subscriber-code"
                value={subscriberCode}
                onChange={(e) => setSubscriberCodeState(normalizeSubscriberCode(e.target.value))}
                maxLength={32}
                placeholder="AZE-12345678"
              />
              <p className="text-xs text-muted-foreground">Abonent kodu fərdi borc, sərfiyyat və elektrik analitikası ilə əlaqələndirmə üçün istifadə olunur.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bioqrafiya</Label>
              <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} />
            </div>
            <Button type="submit" disabled={busy}>{busy ? "Yadda saxlanılır…" : "Profili yadda saxla"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Parolu dəyiş</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="np">Yeni parol</Label>
              <Input id="np" name="password" type="password" required minLength={8} maxLength={72} />
            </div>
            <Button type="submit" variant="secondary">Parolu yenilə</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enerji xərc limiti</CardTitle>
          <CardDescription>Aylıq elektrik xərci bu məbləği keçdikdə sistem avtomatik xəbərdarlıq göstərəcək.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveLimit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="spending-limit">Aylıq limit (AZN)</Label>
              <Input
                id="spending-limit"
                type="number"
                min={1}
                step={1}
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
              />
            </div>
            <Button type="submit">Limiti yadda saxla</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bildirişlər</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "usageAlerts", label: "Enerji istifadəsi və xərc limiti xəbərdarlıqları", desc: "İstifadə qəfil artdıqda və ya aylıq xərc limiti keçildikdə bildiriş alın." },
            { key: "weeklyReport", label: "Həftəlik xülasə", desc: "Hər bazar ertəsi qısa enerji icmalı alın." },
            { key: "tips", label: "Ağıllı tövsiyələr və analizlər", desc: "Fərdiləşdirilmiş qənaət məsləhətləri." },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{n.label}</p>
                <p className="text-sm text-muted-foreground">{n.desc}</p>
              </div>
              <Switch
                checked={notifs[n.key as keyof typeof notifs]}
                onCheckedChange={(v) => setNotifs((s) => ({ ...s, [n.key]: v }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Görünüş</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Qaranlıq rejim</p>
              <p className="text-sm text-muted-foreground">İşıqlı və qaranlıq mövzular arasında keçid edin.</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggle} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
