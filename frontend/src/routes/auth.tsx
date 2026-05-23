import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Zap } from "lucide-react";
import { z } from "zod";
import { normalizeSubscriberCode, setSubscriberCode } from "@/lib/subscriber-code";
import { validateEmailDomain } from "@/lib/email-validation";

function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return Math.min(s, 4);
}

const STRENGTH_LABEL = ["Çox zəif", "Zəif", "Normal", "Güclü", "Əla"];
const STRENGTH_COLOR = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-accent", "bg-accent"];

const emailSchema = z.string().trim().toLowerCase().email("Genuine və düzgün e-poçt ünvanı daxil edin").max(255);
const strongPasswordSchema = z.string()
  .min(12, "Parol ən azı 12 simvol olmalıdır")
  .max(72, "Parol 72 simvoldan uzun ola bilməz")
  .regex(/[A-Z]/, "Parolda ən azı bir böyük hərf olmalıdır")
  .regex(/[a-z]/, "Parolda ən azı bir kiçik hərf olmalıdır")
  .regex(/[0-9]/, "Parolda ən azı bir rəqəm olmalıdır")
  .regex(/[^A-Za-z0-9]/, "Parolda ən azı bir xüsusi simvol olmalıdır");

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [session, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = z.object({
      email: emailSchema,
      password: z.string().min(1, "Parol daxil edin"),
    }).safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Xoş gəlmisiniz!");
    navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const schema = z.object({
      name: z.string().trim().min(1).max(60),
      subscriberCode: z.string().trim().min(5, "Abonent kodu ən azı 5 simvol olmalıdır").max(32),
      email: emailSchema,
      password: strongPasswordSchema,
    });
    const parsed = schema.safeParse({
      name: fd.get("name"),
      subscriberCode: fd.get("subscriberCode"),
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setBusy(true);
    const emailValidation = await validateEmailDomain(parsed.data.email);
    if (!emailValidation.valid) {
      setBusy(false);
      return toast.error(emailValidation.error || "Please use a real email address");
    }

    const subscriberCode = normalizeSubscriberCode(parsed.data.subscriberCode);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: parsed.data.name, electricity_subscriber_code: subscriberCode },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSubscriberCode(data.user?.id, subscriberCode);
    toast.success("Hesab yaradıldı!");
    navigate({ to: "/profile" });
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Parol sıfırlama linki üçün e-poçtunuzu yoxlayın.");
    setForgotOpen(false);
  };

  const score = passwordScore(pw);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10" style={{ background: "var(--gradient-soft)" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-blue)" }}>
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Voltix</span>
        </Link>
        <Card className="glass-strong" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{forgotOpen ? "Parolu sıfırla" : "Xoş gəlmisiniz"}</CardTitle>
            <CardDescription>
              {forgotOpen ? "Sizə parol sıfırlama linki göndərəcəyik" : "Davam etmək üçün daxil olun və ya hesab yaradın"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forgotOpen ? (
              <form onSubmit={handleForgot} noValidate className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fp-email">E-poçt</Label>
                  <Input id="fp-email" name="email" type="email" required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Göndərilir…" : "Sıfırlama linki göndər"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotOpen(false)}>
                  Daxil olmağa qayıt
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Daxil ol</TabsTrigger>
                  <TabsTrigger value="signup">Qeydiyyat</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} noValidate className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="si-email">E-poçt</Label>
                      <Input id="si-email" name="email" type="email" required autoComplete="email" inputMode="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="si-password">Parol</Label>
                      <div className="relative">
                        <Input id="si-password" name="password" type={showPw ? "text" : "password"} required autoComplete="current-password" />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2">
                        <Checkbox name="remember" defaultChecked /> <span>Məni xatırla</span>
                      </label>
                      <button type="button" onClick={() => setForgotOpen(true)} className="text-primary hover:underline">
                        Parolu unutmusunuz?
                      </button>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy ? "Daxil olunur…" : "Daxil ol"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} noValidate className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="su-name">Görünən ad</Label>
                      <Input id="su-name" name="name" type="text" required maxLength={60} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-email">E-poçt</Label>
                      <Input id="su-email" name="email" type="email" required maxLength={255} autoComplete="email" inputMode="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-subscriber-code">Elektrik abonent kodu</Label>
                      <Input id="su-subscriber-code" name="subscriberCode" type="text" required minLength={5} maxLength={32} placeholder="Məsələn: AZE-12345678" />
                      <p className="text-xs text-muted-foreground">Bu kod fərdi enerji sərfiyyatı, borc və hesabat analitikası üçün istifadə olunacaq.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-password">Parol</Label>
                      <Input
                        id="su-password" name="password" type="password" required minLength={12} maxLength={72}
                        value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password"
                      />
                      {pw && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full ${i < score ? STRENGTH_COLOR[score] : "bg-muted"}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{STRENGTH_LABEL[score]} · Minimum 12 simvol, böyük/kiçik hərf, rəqəm və xüsusi simvol tələb olunur.</p>
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={busy || score < 4}>
                      {busy ? "Hesab yaradılır…" : "Hesab yarat"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});