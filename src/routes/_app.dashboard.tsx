import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, Bot, DollarSign, LeafyGreen, Package, Percent, ShoppingCart, Sparkles, TrendingDown, TrendingUp, Users, Zap } from "lucide-react";
import {
  type Device, aiRecommendations, deviceBreakdown, generateDaily, generateHourly,
  generateMonthly, getEffectiveDevices, monthlyCO2, monthlyCost, monthlyKwh,
} from "@/lib/energy";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

const COLORS = ["oklch(0.55 0.21 255)", "oklch(0.72 0.2 145)", "oklch(0.7 0.16 200)", "oklch(0.78 0.16 75)", "oklch(0.62 0.2 305)"];

function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState("");
  const [live, setLive] = useState({ voltage: 220, current: 0, watts: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.display_name ?? ""));
    supabase.from("devices").select("*").eq("user_id", user.id)
      .then(({ data }) => setDevices((data ?? []) as Device[]));
  }, [user]);

  const hourly = useMemo(() => generateHourly(devices), [devices]);
  const daily = useMemo(() => generateDaily(devices), [devices]);
  const monthly = useMemo(() => generateMonthly(devices), [devices]);
  const effectiveDevices = useMemo(() => getEffectiveDevices(devices), [devices]);
  const breakdown = useMemo(() => deviceBreakdown(devices), [devices]);
  const recs = useMemo(() => aiRecommendations(devices), [devices]);
  const activeDeviceCount = breakdown.length;

  const totalKwh = monthlyKwh(devices);
  const cost = monthlyCost(devices);
  const co2 = monthlyCO2(devices);
  const saved = Math.max(12, Math.min(35, 18 + effectiveDevices.filter((d) => !d.status).length * 4));

  useEffect(() => {
    const watts = effectiveDevices.filter((d) => d.status).reduce((s, d) => s + d.watts, 0);
    const id = setInterval(() => {
      setLive({
        voltage: 218 + Math.round(Math.random() * 8),
        current: Number((watts / 220 * (0.9 + Math.random() * 0.2)).toFixed(2)),
        watts: Math.round(watts * (0.9 + Math.random() * 0.2)),
      });
    }, 1500);
    return () => clearInterval(id);
  }, [effectiveDevices]);

  const stats = [
    { label: "Aylıq enerji", value: `${totalKwh.toFixed(0)} kWh`, icon: Zap, grad: "var(--gradient-blue)" },
    { label: "Aylıq xərc", value: `${cost.toFixed(2)} AZN`, icon: DollarSign, grad: "var(--gradient-amber)" },
    { label: "Qənaət göstəricisi", value: `${saved}%`, icon: TrendingDown, grad: "var(--gradient-green)" },
    { label: "CO₂ azalması", value: `${(co2 * (saved / 100)).toFixed(1)} kg`, icon: LeafyGreen, grad: "var(--gradient-aqua)" },
    { label: "Aktiv cihazlar", value: `${activeDeviceCount}`, icon: Activity, grad: "var(--gradient-blue)" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Xoş gəlmisiniz{name ? `, ${name}` : ""}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/">Ana səhifəyə qayıt</Link>
          </Button>
          <Badge variant="secondary" className="gap-1.5">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-accent live-dot" />
              <span className="relative inline-block h-2 w-2 rounded-full bg-accent" />
            </span>
            Canlı
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="overflow-hidden hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground" style={{ background: s.grad }}>
                  <s.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">{s.value}</div></CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Ümumi istifadəçilər", value: "1,284", trend: "+12%", up: true, icon: Users, grad: "var(--gradient-blue)" },
          { label: "Aktiv sessiyalar", value: "347", trend: "+8%", up: true, icon: Activity, grad: "var(--gradient-green)" },
          { label: "Aylıq gəlir", value: "₼ 18,450", trend: "+15%", up: true, icon: DollarSign, grad: "var(--gradient-amber)" },
          { label: "Bugünkü sifarişlər", value: "56", trend: "-3%", up: false, icon: ShoppingCart, grad: "var(--gradient-aqua)" },
          { label: "Konversiya dərəcəsi", value: "4.7%", trend: "+0.5%", up: true, icon: Percent, grad: "var(--gradient-blue)" },
          { label: "Ümumi məhsullar", value: "92", trend: "+6%", up: true, icon: Package, grad: "var(--gradient-green)" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="overflow-hidden hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground" style={{ background: s.grad }}>
                  <s.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{s.value}</div>
                <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${s.up ? "text-green-600" : "text-red-500"}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.trend} keçən aydan
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Bugünkü saatlıq enerji istifadəsi</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer>
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.21 255)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.72 0.2 145)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={3} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="usage" stroke="oklch(0.55 0.21 255)" strokeWidth={2.5} fill="url(#dGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Canlı monitorinq</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Gərginlik", value: `${live.voltage} V` },
              { label: "Cərəyan", value: `${live.current} A` },
              { label: "Güc", value: `${live.watts} W` },
              { label: "Aktiv cihazlar", value: `${effectiveDevices.filter((d) => d.status).length}` },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <span className="font-mono text-lg font-semibold">{m.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cihazlar üzrə enerji bölgüsü</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            {breakdown.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Bölgünü görmək üçün cihaz əlavə edin</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={95} paddingAngle={2}>
                    {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Aylıq müqayisə</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="kwh" radius={[6, 6, 0, 0]}>
                  {monthly.map((m, i) => (
                    <Cell key={i} fill={m.isCurrent ? "oklch(0.72 0.2 145)" : "oklch(0.55 0.21 255)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4 text-accent" /> Ağıllı tövsiyələr</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {recs.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border p-4 hover-lift" style={{ backgroundImage: "var(--gradient-card)" }}>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-accent" />
                <div className="flex-1">
                  <p className="font-medium">{r.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                  <Badge variant="secondary" className="mt-2">{r.impact}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>30 günlük trend</CardTitle></CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="kwh" stroke="oklch(0.55 0.21 255)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cost" stroke="oklch(0.72 0.2 145)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
