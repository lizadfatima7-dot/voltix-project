import { createFileRoute } from "@tanstack/react-router";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Əlaqə — Voltix" },
      { name: "description", content: "Voltix komandası ilə əlaqə saxlayın." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(1000),
});

function Contact() {
  const { t } = useI18n();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    toast.success(t("contactSuccess"));
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-6 pt-16">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("contactTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("contactDescription")}</p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Mail, label: t("email"), value: "energysafevoltix@gmail.com" },
            { icon: Phone, label: t("phone"), value: "0997118595" },
            { icon: MapPin, label: t("location"), value: "Mingəçevir" },
          ].map((c) => (
            <Card key={c.label} className="glass hover-lift">
              <CardHeader className="flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-blue)" }}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                  <p className="text-sm font-medium">{c.value}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-10 mx-auto max-w-2xl" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader><CardTitle>{t("sendMessageTitle")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input id="name" name="name" required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input id="email" name="email" type="email" required maxLength={255} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t("message")}</Label>
                <Textarea id="message" name="message" rows={5} required maxLength={1000} />
              </div>
              <Button type="submit" className="w-full">{t("sendMessage")}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  );
}
