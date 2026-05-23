import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, AirVent, Lightbulb, Refrigerator, WashingMachine, Tv, Cpu, Search,
  Utensils, Router, Flame, Monitor, Laptop, BatteryCharging, Microwave,
  Droplets, Fan, Video, Sparkles, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { type Device, dailyKwh, getEffectiveDevices } from "@/lib/energy";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_app/devices")({ component: Devices });

const TYPES = [
  { value: "ac", label: "Kondisioner", icon: AirVent, watts: 1500 },
  { value: "fridge", label: "Soyuducu", icon: Refrigerator, watts: 200 },
  { value: "washer", label: "Paltaryuyan maşın", icon: WashingMachine, watts: 800 },
  { value: "dishwasher", label: "Qabyuyan maşın", icon: Utensils, watts: 1100 },
  { value: "lights", label: "İşıqlar", icon: Lightbulb, watts: 60 },
  { value: "tv", label: "Televizor", icon: Tv, watts: 120 },
  { value: "router", label: "Wi-Fi Router", icon: Router, watts: 21 },
  { value: "oven", label: "Elektrik sobası", icon: Flame, watts: 2200 },
  { value: "computer", label: "Kompüter", icon: Monitor, watts: 420 },
  { value: "laptop", label: "Laptop", icon: Laptop, watts: 95 },
  { value: "charger", label: "Telefon şarj cihazı", icon: BatteryCharging, watts: 18 },
  { value: "microwave", label: "Mikrodalğalı soba", icon: Microwave, watts: 1200 },
  { value: "heater", label: "Su qızdırıcısı", icon: Droplets, watts: 1800 },
  { value: "fan", label: "Ventilyator", icon: Fan, watts: 70 },
  { value: "camera", label: "Təhlükəsizlik kameraları", icon: Video, watts: 55 },
  { value: "other", label: "Digər", icon: Cpu, watts: 100 },
];

function iconFor(type: string) {
  return TYPES.find((t) => t.value === type)?.icon ?? Cpu;
}

const COST_PER_KWH_AZN = 0.18;

function monthlyDeviceCost(device: Device) {
  return dailyKwh(device) * 30 * COST_PER_KWH_AZN;
}

function savingPercent(device: Device) {
  const base = device.status ? 8 : 15;
  const efficiency = Math.max(0, 12 - Math.round(device.daily_hours));
  return Math.min(35, base + efficiency);
}

function usagePercent(device: Device, maxKwh: number) {
  return Math.max(4, Math.round((dailyKwh(device) / Math.max(maxKwh, 1)) * 100));
}

function miniUsageData(device: Device) {
  return Array.from({ length: 8 }, (_, index) => ({
    time: `${index * 3}:00`,
    value: Number((dailyKwh(device) * (0.55 + ((index + device.watts) % 5) * 0.12)).toFixed(2)),
  }));
}

function formatLastUsed(value: string) {
  return new Date(value).toLocaleString("az-AZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("usage-desc");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("devices").select("*").eq("user_id", user.id).order("created_at");
    setDevices((data ?? []) as Device[]);
  };
  useEffect(() => { load(); }, [user]);

  const addDevice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const type = String(fd.get("type"));
    const preset = TYPES.find((t) => t.value === type);
    setBusy(true);
    const { error } = await supabase.from("devices").insert({
      user_id: user.id,
      name: String(fd.get("name")).trim().slice(0, 60),
      type,
      watts: Number(fd.get("watts")) || preset?.watts || 100,
      daily_hours: Number(fd.get("hours")) || 4,
      status: true,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Cihaz əlavə edildi");
    setOpen(false);
    load();
  };

  const toggle = async (d: Device) => {
    if (d.user_id === "sample") {
      setDevices((arr) => {
        const exists = arr.some((item) => item.id === d.id);
        if (exists) return arr.map((x) => (x.id === d.id ? { ...x, status: !x.status, updated_at: new Date().toISOString() } : x));
        return getEffectiveDevices(arr).map((x) => (x.id === d.id ? { ...x, status: !x.status, updated_at: new Date().toISOString() } : x));
      });
      return;
    }
    const { error } = await supabase.from("devices").update({ status: !d.status }).eq("id", d.id);
    if (error) return toast.error(error.message);
    setDevices((arr) => arr.map((x) => (x.id === d.id ? { ...x, status: !x.status } : x)));
  };

  const remove = async (id: string) => {
    if (id.startsWith("sample-")) {
      setDevices((arr) => getEffectiveDevices(arr).filter((d) => d.id !== id));
      toast.success("Demo cihaz silindi");
      return;
    }
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setDevices((arr) => arr.filter((d) => d.id !== id));
    toast.success("Cihaz silindi");
  };

  const visibleDevices = useMemo(() => {
    const source = getEffectiveDevices(devices);
    return source
      .filter((device) => device.name.toLowerCase().includes(query.toLowerCase()))
      .filter((device) => {
        if (statusFilter === "active") return device.status;
        if (statusFilter === "passive") return !device.status;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "usage-asc") return dailyKwh(a) - dailyKwh(b);
        if (sortBy === "cost-desc") return monthlyDeviceCost(b) - monthlyDeviceCost(a);
        if (sortBy === "name") return a.name.localeCompare(b.name, "az");
        return dailyKwh(b) - dailyKwh(a);
      });
  }, [devices, query, sortBy, statusFilter]);

  const sourceDevices = getEffectiveDevices(devices);
  const activeCount = sourceDevices.filter((device) => device.status).length;
  const totalDaily = sourceDevices.reduce((sum, device) => sum + dailyKwh(device), 0);
  const totalMonthlyCost = sourceDevices.reduce((sum, device) => sum + monthlyDeviceCost(device), 0);
  const maxKwh = Math.max(...sourceDevices.map(dailyKwh), 1);
  const recommendations = [
    "Kondisioner gecə saatlarında yüksək enerji sərf edir.",
    "İstifadə edilməyən cihazları söndürərək 15% enerji qənaəti edə bilərsiniz.",
    "Wi-Fi Router və təhlükəsizlik kameraları 24 saat aktiv olduğu üçün stabil baza sərfiyyatı yaradır.",
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Cihazlar</p>
          <h1 className="text-3xl font-bold tracking-tight">Ağıllı IoT cihaz idarə paneli</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ev cihazlarının aktivliyini, enerji sərfiyyatını, xərclərini və qənaət imkanlarını real vaxtda izləyin.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Cihaz əlavə et</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yeni cihaz əlavə et</DialogTitle></DialogHeader>
            <form onSubmit={addDevice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad</Label>
                <Input id="name" name="name" required maxLength={60} placeholder="Qonaq otağı kondisioneri" />
              </div>
              <div className="space-y-2">
                <Label>Növ</Label>
                <Select name="type" defaultValue="ac">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="watts">Güc (W)</Label>
                  <Input id="watts" name="watts" type="number" min={1} max={10000} defaultValue={1500} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Saat / gün</Label>
                  <Input id="hours" name="hours" type="number" step="0.5" min={0} max={24} defaultValue={4} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Əlavə edilir…" : "Cihaz əlavə et"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Ümumi cihaz", value: sourceDevices.length },
          { label: "Aktiv cihaz", value: activeCount },
          { label: "Gündəlik sərfiyyat", value: `${totalDaily.toFixed(1)} kWh` },
          { label: "Aylıq xərc", value: `${totalMonthlyCost.toFixed(2)} AZN` },
          { label: "Orta qənaət", value: `${Math.round(sourceDevices.reduce((s, d) => s + savingPercent(d), 0) / sourceDevices.length)}%` },
          { label: "Passiv cihaz", value: sourceDevices.length - activeCount },
        ].map((item) => (
          <Card key={item.label} className="hover-lift">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_180px_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cihaz axtarın..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün statuslar</SelectItem>
              <SelectItem value="active">Yalnız aktiv</SelectItem>
              <SelectItem value="passive">Yalnız passiv</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SlidersHorizontal className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="usage-desc">Sərfiyyata görə çoxdan aza</SelectItem>
              <SelectItem value="usage-asc">Sərfiyyata görə azdan çoxa</SelectItem>
              <SelectItem value="cost-desc">Xərcə görə sıralama</SelectItem>
              <SelectItem value="name">Ada görə sıralama</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Smart tövsiyələr</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {recommendations.map((item) => (
            <div key={item} className="rounded-xl border p-4 text-sm text-muted-foreground" style={{ backgroundImage: "var(--gradient-card)" }}>{item}</div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleDevices.map((d) => {
            const Icon = iconFor(d.type);
            const kwh = dailyKwh(d);
            const monthlyCost = monthlyDeviceCost(d);
            const percent = usagePercent(d, maxKwh);
            const saving = savingPercent(d);
            return (
              <Card key={d.id} className="overflow-hidden hover-lift">
                <CardHeader className="flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground" style={{ background: d.status ? "var(--gradient-blue)" : "color-mix(in oklab, var(--muted-foreground) 30%, transparent)" }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{d.name}</CardTitle>
                      <Badge variant={d.status ? "default" : "secondary"} className="mt-1">
                        {d.status ? "Aktiv" : "Passiv"}
                      </Badge>
                    </div>
                  </div>
                  <Switch checked={d.status} onCheckedChange={() => toggle(d)} />
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3"><p className="text-muted-foreground">Enerji sərfiyyatı</p><p className="font-mono text-lg font-semibold">{kwh.toFixed(2)} kWh</p></div>
                    <div className="rounded-lg border p-3"><p className="text-muted-foreground">Aylıq xərc</p><p className="font-mono text-lg font-semibold">{monthlyCost.toFixed(2)} AZN</p></div>
                    <div className="rounded-lg border p-3"><p className="text-muted-foreground">Gündəlik müddət</p><p className="font-mono text-lg font-semibold">{d.daily_hours} saat</p></div>
                    <div className="rounded-lg border p-3"><p className="text-muted-foreground">Qənaət</p><p className="font-mono text-lg font-semibold">{saving}%</p></div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-xs"><span>Enerji istifadəsi faizi</span><span>{percent}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div>
                  </div>
                  <div className="h-24 rounded-xl border p-2">
                    <ResponsiveContainer>
                      <AreaChart data={miniUsageData(d)}>
                        <Area type="monotone" dataKey="value" stroke="oklch(0.55 0.21 255)" fill="oklch(0.55 0.21 255 / 0.18)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${d.status ? "bg-accent live-dot" : "bg-muted-foreground"}`} />{d.status ? "Hazırda enerji sərf edir" : "Hazırda passivdir"}</span>
                    <span>Son istifadə: {formatLastUsed(d.updated_at)}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(d.id)} className="w-full gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Sil
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
