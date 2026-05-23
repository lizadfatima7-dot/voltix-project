import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Moon, Sun, User as UserIcon, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { type Device, monthlyCost } from "@/lib/energy";
import { getSpendingLimit } from "@/lib/spending-limit";

const NOTIFS = [
  { title: "Enerji istifadəsi 20% artıb", time: "2 dəq əvvəl" },
  { title: "Aylıq limitin 80%-nə çatmısınız", time: "1 saat əvvəl" },
  { title: "Ağıllı tövsiyə: paltaryumanı pik saatdan kənara salın", time: "dünən" },
];

export function AppNavbar() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [spendingLimit, setSpendingLimitState] = useState(50);

  const initial = (user?.email ?? "?").charAt(0).toUpperCase();
  const currentCost = monthlyCost(devices);
  const hasLimitWarning = currentCost > spendingLimit;
  const notifications = useMemo(() => [
    ...(hasLimitWarning
      ? [{ title: `Xəbərdarlıq: aylıq xərc ${currentCost.toFixed(2)} AZN oldu və ${spendingLimit} AZN limitini keçdi`, time: "indi" }]
      : []),
    ...NOTIFS,
  ], [currentCost, hasLimitWarning, spendingLimit]);

  useEffect(() => {
    if (!user) return;
    setSpendingLimitState(getSpendingLimit(user.id));
    supabase.from("devices").select("*").eq("user_id", user.id)
      .then(({ data }) => setDevices((data ?? []) as Device[]));

    const syncLimit = () => setSpendingLimitState(getSpendingLimit(user.id));
    window.addEventListener("voltx-spending-limit-updated", syncLimit);
    window.addEventListener("storage", syncLimit);
    return () => {
      window.removeEventListener("voltx-spending-limit-updated", syncLimit);
      window.removeEventListener("storage", syncLimit);
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b glass px-3 md:px-4">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Mövzunu dəyiş">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Bildirişlər">
              <Bell className="h-4 w-4" />
              <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${hasLimitWarning ? "bg-destructive" : "bg-accent"}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Bildirişlər</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.title} className="flex flex-col items-start gap-0.5">
                <span className="text-sm">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback style={{ background: "var(--gradient-blue)", color: "white" }}>{initial}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile"><UserIcon className="mr-2 h-4 w-4" /> Profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings"><SettingsIcon className="mr-2 h-4 w-4" /> Parametrlər</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
              <LogOut className="mr-2 h-4 w-4" /> Çıxış
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
