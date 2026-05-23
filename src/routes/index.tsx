import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Activity, ArrowRight, BarChart3, Bot, CheckCircle2, CreditCard, Gauge, LeafyGreen, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  component: Home,
});

function useCounter(target: number, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

const chartData = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}h`,
  usage: Number((1 + 1.6 * Math.exp(-Math.pow(h - 8, 2) / 12) + 2.2 * Math.exp(-Math.pow(h - 20, 2) / 8) + Math.random() * 0.4).toFixed(2)),
}));

function isValidCardNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (shouldDouble) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiry(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const expiry = new Date(2000 + Number(match[2]), Number(match[1]), 0, 23, 59, 59);
  return expiry >= new Date();
}

function Home() {
  const users = useCounter(12450);
  const kwh = useCounter(842000);
  const co2 = useCounter(354);
  const { t } = useI18n();
  const features = t<string[]>("features").map((feature) => {
    const [title, text] = feature.split("|");
    return { title, text };
  });
  const featureIcons = [Gauge, BarChart3, Bot, LeafyGreen, ShieldCheck, Sparkles];
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const paymentValid = isValidCardNumber(card) && isValidExpiry(expiry) && /^\d{3,4}$/.test(cvc);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <MarketingNav />

      {/* HERO */}
      <main className="mx-auto max-w-6xl px-6 pt-12 md:pt-20">
        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[420px] w-[820px] max-w-full rounded-full opacity-50 blur-3xl"
               style={{ background: "var(--gradient-hero)" }} />
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> {t("heroBadge")}
            </span>
            <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
              {t("heroTitleStart")}{" "}
              <span className="text-gradient">{t("heroTitleHighlight")}</span>{" "}
              {t("heroTitleEnd")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              {t("heroDescription")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="gap-2 hover-lift">
                <Link to="/auth">{t<string>("getStarted")} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/dashboard">{t("liveDemo")}</Link>
              </Button>
            </div>
          </motion.div>

          {/* Animated chart card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-14 max-w-5xl rounded-3xl glass-strong p-4 md:p-6"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-accent live-dot" />
                  <span className="relative inline-block h-2 w-2 rounded-full bg-accent" />
                </span>
                <p className="text-sm font-medium">{t("liveUsage")}</p>
              </div>
              <p className="text-sm text-muted-foreground">kWh</p>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.55 0.21 255)" stopOpacity={0.7} />
                      <stop offset="60%" stopColor="oklch(0.7 0.18 180)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.72 0.2 145)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} axisLine={false} tickLine={false} interval={3} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                  />
                  <Area type="monotone" dataKey="usage" stroke="oklch(0.55 0.21 255)" strokeWidth={2.5} fill="url(#heroGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {/* STATS */}
        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { label: t("activeHomes"), value: users, suffix: "+", icon: Activity },
            { label: t("kwhMonitored"), value: kwh, suffix: "+", icon: Zap },
            { label: t("co2Saved"), value: co2, suffix: "", icon: LeafyGreen },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl glass p-6 hover-lift"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight">
                {Math.round(s.value).toLocaleString()}{s.suffix}
              </p>
            </motion.div>
          ))}
        </section>

        {/* FEATURES */}
        <section className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("featuresTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("featuresDescription")}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border bg-card p-6 hover-lift"
                style={{ backgroundImage: "var(--gradient-card)" }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-blue)" }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </motion.div>
            )})}
          </div>
        </section>

        <section className="mt-24 rounded-3xl border bg-card p-6 md:p-8" style={{ backgroundImage: "var(--gradient-card)" }}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Premium abunəlik</h2>
            <p className="mt-3 text-muted-foreground">Premium analitika, inkişaf etmiş hesabatlar və ağıllı qənaət planları üçün kart məlumatını təhlükəsiz formatda yoxlayın.</p>
          </div>
          <Card className="mx-auto mt-8 max-w-xl glass-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Təhlükəsiz ödəniş yoxlaması</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="premium-card">Kart nömrəsi</Label>
                <Input id="premium-card" value={card} onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, "").slice(0, 23))} inputMode="numeric" autoComplete="cc-number" placeholder="4111 1111 1111 1111" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="premium-expiry">Bitmə tarixi</Label>
                  <Input id="premium-expiry" value={expiry} onChange={(e) => setExpiry(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))} autoComplete="cc-exp" placeholder="AA/İİ" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premium-cvc">CVC</Label>
                  <Input id="premium-cvc" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" />
                </div>
              </div>
              <p className={`text-sm ${paymentValid ? "text-primary" : "text-muted-foreground"}`}>
                {paymentValid ? "Kart formatı təsdiqləndi. Məlumatlar saxlanılmadan yalnız brauzerdə yoxlanılır." : "Real kart formatı, gələcək bitmə tarixi və düzgün CVC daxil edin."}
              </p>
              <Button className="w-full gap-2" disabled={!paymentValid}>
                <CheckCircle2 className="h-4 w-4" /> Premiumu aktivləşdir
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mt-24 rounded-3xl glass p-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("faqTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("faqDescription")}</p>
          <div className="mt-6">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/faq">FAQ səhifəsinə keç <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 overflow-hidden rounded-3xl p-10 text-center" style={{ background: "var(--gradient-hero)", color: "white", boxShadow: "var(--shadow-elegant)" }}>
          <h3 className="text-3xl font-bold md:text-4xl">{t("ctaTitle")}</h3>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            {t("ctaDescription")}
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 gap-2">
            <Link to="/auth">{t<string>("createAccount")} <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
