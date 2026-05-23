import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Cpu,
  Crown,
  Gauge,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LogoMark } from "@/components/LogoMark";

export const Route = createFileRoute("/admin")({
  component: AdminPortal,
});

type AdminUser = { id: string; name: string; email: string; role: string; status: string };
type Customer = { id: string; email: string; plan: string; status: string; usage: number };
type AdminDevice = { id: string; name: string; owner: string; watts: number; status: boolean };
type Plan = { id: string; name: string; price: number; users: number; status: string };
type Limit = { id: string; target: string; scope: string; kwh: number; azn: number };
type AdminState = {
  admins: AdminUser[];
  customers: Customer[];
  devices: AdminDevice[];
  plans: Plan[];
  limits: Limit[];
};

const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "admin";

const initialState: AdminState = {
  admins: [
    { id: "adm-001", name: "Baş administrator", email: ADMIN_LOGIN, role: "Sistem sahibi", status: "Aktiv" },
    { id: "adm-002", name: "Dəstək operatoru", email: "operator@voltx.az", role: "Dəstək", status: "Aktiv" },
  ],
  customers: [
    { id: "usr-001", email: "family@voltx.az", plan: "Pulsuz", status: "Aktiv", usage: 542 },
    { id: "usr-002", email: "business@voltx.az", plan: "Premium", status: "Aktiv", usage: 1280 },
    { id: "usr-003", email: "trial@voltx.az", plan: "Sınaq", status: "Gözləmədə", usage: 214 },
  ],
  devices: [
    { id: "dev-001", name: "Kondisioner", owner: "family@voltx.az", watts: 1200, status: true },
    { id: "dev-002", name: "Soyuducu", owner: "family@voltx.az", watts: 175, status: true },
    { id: "dev-003", name: "Server otağı", owner: "business@voltx.az", watts: 2400, status: true },
  ],
  plans: [
    { id: "plan-free", name: "Pulsuz", price: 0, users: 1240, status: "Aktiv" },
    { id: "plan-premium", name: "Premium", price: 10, users: 384, status: "Aktiv" },
    { id: "plan-business", name: "Biznes", price: 50, users: 72, status: "Aktiv" },
  ],
  limits: [
    { id: "lim-001", target: "family@voltx.az", scope: "İstifadəçi", kwh: 650, azn: 120 },
    { id: "lim-002", target: "business@voltx.az", scope: "İstifadəçi", kwh: 1800, azn: 340 },
  ],
};

const adminNav = [
  { id: "icmal", label: "İcmal", icon: LayoutDashboard },
  { id: "istifadeciler", label: "İstifadəçilər", icon: Users },
  { id: "adminler", label: "Admin istifadəçilər", icon: ShieldCheck },
  { id: "cihazlar", label: "Cihazlar", icon: Cpu },
  { id: "planlar", label: "Planlar", icon: Crown },
  { id: "limitler", label: "Limitlər", icon: Gauge },
];

function getSavedAdminSession() {
  return typeof window !== "undefined" && localStorage.getItem("voltx-admin-session") === "active";
}

function getSavedAdminState() {
  if (typeof window === "undefined") return initialState;
  const saved = localStorage.getItem("voltx-admin-state");
  if (!saved) return initialState;
  try {
    return JSON.parse(saved) as AdminState;
  } catch {
    return initialState;
  }
}

function AdminPortal() {
  const [isSignedIn, setIsSignedIn] = useState(getSavedAdminSession);
  const [activeView, setActiveView] = useState("icmal");
  const [state, setState] = useState<AdminState>(getSavedAdminState);

  const saveState = (next: AdminState) => {
    setState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("voltx-admin-state", JSON.stringify(next));
    }
  };

  if (!isSignedIn) {
    return <AdminLogin onSuccess={() => setIsSignedIn(true)} />;
  }

  const signOut = () => {
    localStorage.removeItem("voltx-admin-session");
    setIsSignedIn(false);
    toast.success("Admin sessiyası bağlandı");
  };

  const summary = {
    activeCustomers: state.customers.filter((user) => user.status === "Aktiv").length,
    activeDevices: state.devices.filter((device) => device.status).length,
    monthlyUsage: state.customers.reduce((sum, user) => sum + user.usage, 0),
    revenue: state.plans.reduce((sum, plan) => sum + plan.price * plan.users, 0),
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <header className="sticky top-0 z-40 border-b glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="h-9 w-9" />
            <div>
              <p className="font-semibold leading-none">VoltX Admin</p>
              <p className="text-xs text-muted-foreground">ayrı idarəetmə paneli</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">Mock rejim</Badge>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Çıxış
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[240px_1fr] md:p-8">
        <aside className="h-fit rounded-lg border bg-card/80 p-2 shadow-sm">
          {adminNav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeView === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admin panel</p>
              <h1 className="text-3xl font-bold tracking-tight">Sistem idarəetməsi</h1>
              <p className="text-sm text-muted-foreground">İstifadəçi, cihaz, plan və limit idarəetməsi üçün funksional mockup.</p>
            </div>
            <Badge className="w-fit gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ayrı panel aktivdir
            </Badge>
          </div>

          {activeView === "icmal" && <Overview summary={summary} />}
          {activeView === "istifadeciler" && <Customers state={state} saveState={saveState} />}
          {activeView === "adminler" && <AdminUsers state={state} saveState={saveState} />}
          {activeView === "cihazlar" && <Devices state={state} saveState={saveState} />}
          {activeView === "planlar" && <Plans state={state} saveState={saveState} />}
          {activeView === "limitler" && <Limits state={state} saveState={saveState} />}
        </section>
      </main>
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState(ADMIN_LOGIN);
  const [password, setPassword] = useState(ADMIN_PASSWORD);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim().toLowerCase() !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
      toast.error("Admin məlumatları yanlışdır");
      return;
    }
    localStorage.setItem("voltx-admin-session", "active");
    toast.success("Admin panelə daxil oldunuz");
    onSuccess();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "var(--gradient-soft)" }}>
      <Card className="w-full max-w-md glass-strong">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle>Admin girişi</CardTitle>
          <p className="text-sm text-muted-foreground">Ayrı admin panelinə daxil olmaq üçün mock admin hesabından istifadə edin.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Login</Label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Şifrə</Label>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
            </div>
            <div className="rounded-lg border bg-secondary/50 p-3 text-sm text-muted-foreground">
              Login: <span className="font-medium text-foreground">{ADMIN_LOGIN}</span> · Şifrə:{" "}
              <span className="font-medium text-foreground">{ADMIN_PASSWORD}</span>
            </div>
            <Button className="w-full gap-2">
              <ShieldCheck className="h-4 w-4" />
              Panelə daxil ol
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Overview({ summary }: { summary: { activeCustomers: number; activeDevices: number; monthlyUsage: number; revenue: number } }) {
  const cards = [
    { title: "Aktiv istifadəçilər", value: summary.activeCustomers, detail: "sistemdə aktiv hesab", icon: Users },
    { title: "Aktiv cihazlar", value: summary.activeDevices, detail: "real vaxt monitorinqdə", icon: Cpu },
    { title: "Aylıq istifadə", value: `${summary.monthlyUsage} kWh`, detail: "bütün hesablar üzrə", icon: Zap },
    { title: "Gəlir", value: `${summary.revenue} AZN`, detail: "mock abunəlik gəliri", icon: BarChart3 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="glass">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="mt-2 text-2xl font-semibold">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <card.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Customers({ state, saveState }: AdminSectionProps) {
  const update = (id: string, patch: Partial<Customer>) => {
    saveState({ ...state, customers: state.customers.map((user) => (user.id === id ? { ...user, ...patch } : user)) });
  };

  return (
    <Card>
      <CardHeader><CardTitle>İstifadəçi profilləri</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {state.customers.map((user) => (
          <div key={user.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <Input value={user.email} onChange={(event) => update(user.id, { email: event.target.value })} />
            <Select value={user.plan} onValueChange={(plan) => update(user.id, { plan })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Pulsuz">Pulsuz</SelectItem><SelectItem value="Premium">Premium</SelectItem><SelectItem value="Biznes">Biznes</SelectItem><SelectItem value="Sınaq">Sınaq</SelectItem></SelectContent>
            </Select>
            <Select value={user.status} onValueChange={(status) => update(user.id, { status })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Aktiv">Aktiv</SelectItem><SelectItem value="Gözləmədə">Gözləmədə</SelectItem><SelectItem value="Bloklanıb">Bloklanıb</SelectItem></SelectContent>
            </Select>
            <Input type="number" value={user.usage} onChange={(event) => update(user.id, { usage: Number(event.target.value) })} />
            <Button variant="outline" onClick={() => toast.success("İstifadəçi yeniləndi")} className="gap-2"><Save className="h-4 w-4" /> Saxla</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

type AdminSectionProps = { state: AdminState; saveState: (next: AdminState) => void };

function AdminUsers({ state, saveState }: AdminSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const addAdmin = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Ad və e-poçt daxil edin");
      return;
    }
    saveState({
      ...state,
      admins: [...state.admins, { id: `adm-${Date.now()}`, name, email, role: "Dəstək", status: "Aktiv" }],
    });
    setName("");
    setEmail("");
    toast.success("Yeni admin istifadəçi yaradıldı");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader><CardTitle>Yeni admin istifadəçi</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2"><Label>Ad</Label><Input value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div className="space-y-2"><Label>E-poçt</Label><Input value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <Button onClick={addAdmin} className="w-full gap-2"><Plus className="h-4 w-4" /> Admin yarat</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Admin siyahısı</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {state.admins.map((admin) => (
            <div key={admin.id} className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
              <div><p className="font-medium">{admin.name}</p><p className="text-sm text-muted-foreground">{admin.email}</p></div>
              <Badge variant="secondary">{admin.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Devices({ state, saveState }: AdminSectionProps) {
  const toggle = (id: string, status: boolean) => {
    saveState({ ...state, devices: state.devices.map((device) => (device.id === id ? { ...device, status } : device)) });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Cihaz reyestri</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {state.devices.map((device) => (
          <div key={device.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_120px_120px_auto] md:items-center">
            <p className="font-medium">{device.name}</p>
            <p className="text-sm text-muted-foreground">{device.owner}</p>
            <p className="text-sm">{device.watts} W</p>
            <div className="flex items-center gap-2"><Switch checked={device.status} onCheckedChange={(checked) => toggle(device.id, checked)} /><span className="text-sm">Aktiv</span></div>
            <Button variant="outline" onClick={() => toast.success("Cihaz statusu saxlanıldı")}>Saxla</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Plans({ state, saveState }: AdminSectionProps) {
  const update = (id: string, patch: Partial<Plan>) => {
    saveState({ ...state, plans: state.plans.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)) });
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {state.plans.map((plan) => (
        <Card key={plan.id} className="glass">
          <CardHeader><CardTitle>{plan.name}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2"><Label>Qiymət, AZN</Label><Input type="number" value={plan.price} onChange={(event) => update(plan.id, { price: Number(event.target.value) })} /></div>
            <div className="space-y-2"><Label>İstifadəçi sayı</Label><Input type="number" value={plan.users} onChange={(event) => update(plan.id, { users: Number(event.target.value) })} /></div>
            <Button className="w-full gap-2" onClick={() => toast.success("Plan saxlanıldı")}><Save className="h-4 w-4" /> Saxla</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Limits({ state, saveState }: AdminSectionProps) {
  const [target, setTarget] = useState("");
  const [kwh, setKwh] = useState("500");
  const [azn, setAzn] = useState("100");

  const addLimit = () => {
    if (!target.trim()) {
      toast.error("Hədəf daxil edin");
      return;
    }
    saveState({
      ...state,
      limits: [...state.limits, { id: `lim-${Date.now()}`, target, scope: "İstifadəçi", kwh: Number(kwh), azn: Number(azn) }],
    });
    setTarget("");
    toast.success("Limit əlavə edildi");
  };

  const removeLimit = (id: string) => {
    saveState({ ...state, limits: state.limits.filter((limit) => limit.id !== id) });
    toast.success("Limit silindi");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader><CardTitle>Yeni limit</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2"><Label>Hədəf</Label><Input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="user@voltx.az" /></div>
          <div className="space-y-2"><Label>Aylıq kWh</Label><Input value={kwh} onChange={(event) => setKwh(event.target.value)} /></div>
          <div className="space-y-2"><Label>Aylıq AZN</Label><Input value={azn} onChange={(event) => setAzn(event.target.value)} /></div>
          <Button onClick={addLimit} className="w-full gap-2"><Plus className="h-4 w-4" /> Limit əlavə et</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Limitlər</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {state.limits.map((limit) => (
            <div key={limit.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_120px_120px_auto] md:items-center">
              <div><p className="font-medium">{limit.target}</p><p className="text-sm text-muted-foreground">{limit.scope}</p></div>
              <p>{limit.kwh} kWh</p>
              <p>{limit.azn} AZN</p>
              <Button variant="destructive" size="sm" onClick={() => removeLimit(limit.id)} className="gap-2"><Trash2 className="h-4 w-4" /> Sil</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
