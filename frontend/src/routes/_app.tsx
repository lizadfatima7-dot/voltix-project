import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppNavbar } from "@/components/AppNavbar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  // TEMPORARILY DISABLED FOR TESTING - Remove comments to re-enable auth
  // useEffect(() => {
  //   if (!loading && !session) navigate({ to: "/auth" });
  // }, [session, loading, navigate]);

  // if (loading || !session) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center text-muted-foreground">
  //       <div className="flex items-center gap-3">
  //         <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  //         Yüklənir…
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppNavbar />
          <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
