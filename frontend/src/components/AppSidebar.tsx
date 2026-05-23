import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, Cpu, FileText, Settings, LogOut, Info, Mail, Crown, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/LogoMark";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Analitika", url: "/analytics", icon: BarChart3 },
  { title: "Statistika", url: "/stats", icon: BarChart3 },
  { title: "Cihazlar", url: "/devices", icon: Cpu },
  { title: "Premium", url: "/premium", icon: Crown },
  { title: "Hesabatlar", url: "/reports", icon: FileText },
  { title: "Parametrlər", url: "/settings", icon: Settings },
];

const more = [
  { title: "Bildirişlər", url: "/dashboard?view=notifications", icon: Bell },
  { title: "Haqqımızda", url: "/about", icon: Info },
  { title: "Əlaqə", url: "/contact", icon: Mail },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <LogoMark className="h-8 w-8" />
          <span className="font-semibold tracking-tight">VoltX</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>İş sahəsi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Əlavə</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {more.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex flex-col gap-1 p-2">
          <p className="truncate px-2 text-xs text-muted-foreground">{user?.email}</p>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start gap-2">
            <LogOut className="h-4 w-4" /> Çıxış
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
