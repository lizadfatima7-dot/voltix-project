import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getSubscriberCode, setSubscriberCode, normalizeSubscriberCode } from "@/lib/subscriber-code";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [subscriberCode, setSubscriberCodeState] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, bio").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name ?? "");
        setBio(data?.bio ?? "");
        setSubscriberCodeState(getSubscriberCode(user.id, user.user_metadata?.electricity_subscriber_code));
        setLoading(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName, bio });
    setSaving(false);
    if (error) return toast.error(error.message);
    setSubscriberCode(user.id, subscriberCode);
    toast.success("Profil yadda saxlanıldı");
  };

  const initial = (displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-10">
      <div>
        <p className="text-sm text-muted-foreground">Hesab</p>
        <h1 className="text-3xl font-bold tracking-tight">Profiliniz</h1>
      </div>

      <Card style={{ boxShadow: "var(--shadow-card)" }}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{displayName || "Adsız istifadəçi"}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Görünən ad</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriber-code">Elektrik abonent kodu</Label>
              <Input
                id="subscriber-code"
                value={subscriberCode}
                onChange={(e) => setSubscriberCodeState(normalizeSubscriberCode(e.target.value))}
                disabled={loading}
                maxLength={32}
                placeholder="AZE-12345678"
              />
              <p className="text-xs text-muted-foreground">Bu kod fərdi enerji monitorinqi, borc məlumatı və istifadə analitikası üçün istifadə olunur.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bioqrafiya</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Özünüz haqqında qısa məlumat yazın"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={saving || loading}>
              {saving ? "Yadda saxlanılır…" : "Dəyişiklikləri yadda saxla"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
