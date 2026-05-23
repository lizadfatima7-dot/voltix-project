import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password.length < 8) return toast.error("Parol ən azı 8 simvol olmalıdır");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Parol yeniləndi");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--gradient-soft)" }}>
      <Card className="w-full max-w-md glass-strong" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <CardHeader>
          <CardTitle>Yeni parol təyin edin</CardTitle>
          <CardDescription>Daha əvvəl istifadə etmədiyiniz güclü parol seçin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Yeni parol</Label>
              <Input id="password" name="password" type="password" required minLength={8} maxLength={72} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Yenilənir…" : "Parolu yenilə"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
