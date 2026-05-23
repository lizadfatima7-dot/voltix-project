import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Gauge, LeafyGreen, TrendingDown, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  deviceBreakdown,
  generateDaily,
  generateHourly,
  generateMonthly,
  monthlyCO2,
  monthlyCost,
  monthlyKwh,
  sampleDevices,
  totalDailyKwh,
} from "@/lib/energy";

export const Route = createFileRoute("/_app/stats")({
  component: Statistics,
});

const COLORS = [
  "oklch(0.55 0.21 255)",
  "oklch(0.72 0.2 145)",
  "oklch(0.7 0.16 200)",
  "oklch(0.78 0.16 75)",
  "oklch(0.62 0.2 305)",
];

const azMonths: Record<string, string> = {
  Jan: "Yan",
  Feb: "Fev",
  Mar: "Mar",
  Apr: "Apr",
  May: "May",
  Jun: "İyn",
  Jul: "İyl",
  Aug: "Avq",
  Sep: "Sen",
  Oct: "Okt",
  Nov: "Noy",
  Dec: "Dek",
};

function Statistics() {
  const hourly = useMemo(() => generateHourly(sampleDevices), []);
  const daily = useMemo(() => generateDaily(sampleDevices, 14), []);
  const monthly = useMemo(
    () => generateMonthly(sampleDevices).map((item) => ({ ...item, month: azMonths[item.month] ?? item.month })),
    [],
  );
  const breakdown = useMemo(() => deviceBreakdown(sampleDevices).slice(0, 5), []);
  const peakHour = hourly.reduce((max, item) => (item.usage > max.usage ? item : max), hourly[0]);
  const activeDevices = sampleDevices.filter((device) => device.status).length;
  const totalDevices = sampleDevices.length;
  const monthlyUsage = monthlyKwh(sampleDevices);
  const previousMonth = monthly[monthly.length - 2]?.kwh || monthlyUsage;
  const trend = Math.round(((monthlyUsage - previousMonth) / previousMonth) * 100);

  const stats = [
    {
      title: "Aylıq istifadə",
      value: `${monthlyUsage.toFixed(0)} kWh`,
      detail: `${Math.abs(trend)}% ${trend <= 0 ? "azalma" : "artım"}`,
      icon: Zap,
    },
    {
      title: "Aylıq xərc",
      value: `${monthlyCost(sampleDevices).toFixed(2)} AZN`,
      detail: "0.18 AZN / kWh əsasında",
      icon: Gauge,
    },
    {
      title: "Aktiv cihazlar",
      value: `${activeDevices}/${totalDevices}`,
      detail: "hazırda işlək vəziyyətdə",
      icon: Activity,
    },
    {
      title: "CO2 izi",
      value: `${monthlyCO2(sampleDevices).toFixed(1)} kg`,
      detail: "aylıq hesablanmış təsir",
      icon: LeafyGreen,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Statistika</p>
          <h1 className="text-3xl font-bold tracking-tight">Enerji göstəricilərinin icmalı</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gündəlik, aylıq və cihaz üzrə göstəricilər eyni idarə paneli dizaynında təqdim olunur.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-2 px-3 py-1.5">
          <TrendingDown className="h-4 w-4 text-primary" />
          Pik saat: {peakHour?.hour} · {peakHour?.usage} kWh
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.title} className="glass">
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Son 14 gün üzrə istifadə</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="statsKwh" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.21 255)" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="oklch(0.55 0.21 255)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area dataKey="kwh" name="kWh" type="monotone" stroke="oklch(0.55 0.21 255)" fill="url(#statsKwh)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cihaz paylanması</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={105} paddingAngle={2}>
                  {breakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Aylıq müqayisə</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="kwh" name="kWh" radius={[6, 6, 0, 0]} fill="oklch(0.72 0.2 145)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saatlıq yüklənmə</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area dataKey="usage" name="kWh" type="monotone" stroke="oklch(0.7 0.16 200)" fill="oklch(0.7 0.16 200 / 0.18)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Əsas cihazlar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {breakdown.map((device, index) => (
            <div key={device.name} className="rounded-lg border bg-card/60 p-4">
              <div className="mb-3 h-1.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
              <p className="font-medium">{device.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{device.value} kWh / ay</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
