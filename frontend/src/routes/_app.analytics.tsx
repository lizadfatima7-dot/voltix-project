import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { type Device, deviceBreakdown, generateDaily, generateHourly, generateMonthly } from "@/lib/energy";

export const Route = createFileRoute("/_app/analytics")({ component: Analytics });

const COLORS = ["oklch(0.55 0.21 255)", "oklch(0.72 0.2 145)", "oklch(0.7 0.16 200)", "oklch(0.78 0.16 75)", "oklch(0.62 0.2 305)"];

function Analytics() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("devices").select("*").eq("user_id", user.id)
      .then(({ data }) => setDevices((data ?? []) as Device[]));
  }, [user]);

  const hourly = useMemo(() => generateHourly(devices), [devices]);
  const daily = useMemo(() => generateDaily(devices), [devices]);
  const monthly = useMemo(() => generateMonthly(devices), [devices]);
  const breakdown = useMemo(() => deviceBreakdown(devices), [devices]);
  const peakHour = hourly.reduce((max, h) => (h.usage > max.usage ? h : max), hourly[0]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">Analitika</p>
        <h1 className="text-3xl font-bold tracking-tight">Ətraflı enerji analizləri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bugünkü pik istifadə: <span className="font-medium text-foreground">{peakHour?.hour}</span> — {peakHour?.usage} kWh
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Gündəlik istifadə — son 30 gün</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={3} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="kwh" stroke="oklch(0.55 0.21 255)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
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
                <Bar dataKey="kwh" radius={[6, 6, 0, 0]} fill="oklch(0.55 0.21 255)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Cihazlar üzrə enerji sərfiyyatı</CardTitle></CardHeader>
        <CardContent className="h-[320px]">
          {breakdown.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Hələ cihaz əlavə edilməyib.</div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} paddingAngle={2}>
                  {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
