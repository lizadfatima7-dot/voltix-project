import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, FileText, LeafyGreen, PlugZap, TrendingDown, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  type Device, deviceBreakdown, generateDaily, generateMonthly, getEffectiveDevices,
  monthlyCO2, monthlyCost, monthlyKwh,
} from "@/lib/energy";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_app/reports")({ component: Reports });

const COLORS = ["oklch(0.55 0.21 255)", "oklch(0.72 0.2 145)", "oklch(0.7 0.16 200)", "oklch(0.78 0.16 75)", "oklch(0.62 0.2 305)"];

function Reports() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("devices").select("*").eq("user_id", user.id)
      .then(({ data }) => setDevices((data ?? []) as Device[]));
  }, [user]);

  const daily = useMemo(() => generateDaily(devices), [devices]);
  const monthly = useMemo(() => generateMonthly(devices), [devices]);
  const effectiveDevices = useMemo(() => getEffectiveDevices(devices), [devices]);
  const breakdown = useMemo(() => deviceBreakdown(devices), [devices]);
  const totalKwh = monthlyKwh(devices);
  const cost = monthlyCost(devices);
  const co2 = monthlyCO2(devices);
  const savedPercent = Math.max(12, Math.min(34, 18 + effectiveDevices.filter((device) => !device.status).length * 3));
  const activeDevices = effectiveDevices.filter((device) => device.status).length;
  const userLabel = user?.email ?? "demo.user@voltix.app";
  const summaryCards = [
    { label: "Aylıq enerji", value: `${totalKwh.toFixed(0)} kWh`, icon: Zap },
    { label: "Təxmini xərc", value: `${cost.toFixed(2)} AZN`, icon: TrendingDown },
    { label: "Enerji qənaəti", value: `${savedPercent}%`, icon: LeafyGreen },
    { label: "Aktiv cihazlar", value: `${activeDevices}/${effectiveDevices.length}`, icon: PlugZap },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Voltix — Aylıq Enerji Hesabatı", 14, 20);
    doc.setFontSize(11); doc.setTextColor(100);
    doc.text(`Yaradılma tarixi: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`İstifadəçi: ${userLabel}`, 14, 35);
    doc.setTextColor(0);
    doc.text(`Ümumi: ${totalKwh.toFixed(0)} kWh | Xərc: ${cost.toFixed(2)} AZN | CO2 azalması: ${(co2 * savedPercent / 100).toFixed(1)} kg`, 14, 45);
    autoTable(doc, {
      startY: 54,
      head: [["Göstərici", "Dəyər"]],
      body: [
        ["Aylıq enerji sərfiyyatı", `${totalKwh.toFixed(2)} kWh`],
        ["Təxmini elektrik xərci", `${cost.toFixed(2)} AZN`],
        ["Qənaət edilən enerji", `${savedPercent}%`],
        ["Aktiv cihazlar", `${activeDevices}/${effectiveDevices.length}`],
        ["Karbon emissiyası azalması", `${(co2 * savedPercent / 100).toFixed(2)} kg`],
      ],
      headStyles: { fillColor: [70, 110, 230] },
    });
    autoTable(doc, {
      startY: 104,
      head: [["Cihaz", "Növ", "Güc", "Gündəlik saat", "Status"]],
      body: effectiveDevices.map((device) => [device.name, device.type, device.watts, device.daily_hours, device.status ? "Aktiv" : "Gözləmə"]),
      headStyles: { fillColor: [70, 110, 230] },
    });
    autoTable(doc, {
      startY: 168,
      head: [["Tarix", "Enerji (kWh)", "Xərc (AZN)"]],
      body: daily.slice(-14).map((d) => [d.date, d.kwh.toFixed(2), d.cost.toFixed(2)]),
      headStyles: { fillColor: [70, 110, 230] },
    });
    doc.save("voltix-report.pdf");
    toast.success("PDF hesabat yükləndi");
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(daily);
    XLSX.utils.book_append_sheet(wb, ws, "Gündəlik istifadə");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthly), "Aylıq trendlər");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(effectiveDevices), "Cihaz statistikası");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(breakdown), "Cihaz bölgüsü");
    const summary = XLSX.utils.json_to_sheet([
      { metric: "İstifadəçi", value: userLabel },
      { metric: "Ümumi kWh (aylıq)", value: totalKwh.toFixed(2) },
      { metric: "Təxmini xərc (AZN)", value: cost.toFixed(2) },
      { metric: "Enerji qənaəti (%)", value: savedPercent },
      { metric: "CO2 azalması (kg)", value: (co2 * savedPercent / 100).toFixed(2) },
      { metric: "Aktiv cihazlar", value: activeDevices },
      { metric: "Ümumi cihazlar", value: effectiveDevices.length },
    ]);
    XLSX.utils.book_append_sheet(wb, summary, "Xülasə");
    XLSX.writeFile(wb, "voltix-report.xlsx");
    toast.success("Excel hesabat yükləndi");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div>
        <p className="text-sm text-muted-foreground">Hesabatlar</p>
        <h1 className="text-3xl font-bold tracking-tight">Peşəkar enerji hesabatları</h1>
        <p className="mt-1 text-sm text-muted-foreground">{userLabel} üçün aylıq xülasələr, cihaz statistikası, qrafiklər və yüklənə bilən PDF/Excel faylları.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{card.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-destructive-foreground" style={{ background: "var(--gradient-amber)" }}>
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="mt-3">PDF Hesabat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Çap və paylaşım üçün hazırlanmış peşəkar aylıq enerji xülasəsi.</p>
            <Button onClick={exportPDF} className="mt-4 gap-2"><Download className="h-4 w-4" /> PDF yüklə</Button>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-green)" }}>
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <CardTitle className="mt-3">Excel İş Kitabı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Şəxsi analiz üçün gündəlik məlumatlar və xülasə göstəriciləri.</p>
            <Button onClick={exportExcel} className="mt-4 gap-2" variant="secondary"><Download className="h-4 w-4" /> Excel yüklə</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Aylıq enerji sərfiyyatı qrafiki</CardTitle></CardHeader>
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
        <Card>
          <CardHeader><CardTitle>Cihazların enerji payı</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Cihaz statistikası</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Cihaz</TableHead><TableHead>Növ</TableHead><TableHead className="text-right">Güc (W)</TableHead><TableHead className="text-right">Gündəlik saat</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {effectiveDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell className="text-right font-mono">{device.watts}</TableCell>
                  <TableCell className="text-right font-mono">{device.daily_hours}</TableCell>
                  <TableCell>{device.status ? "Aktiv" : "Gözləmə"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Son 30 gün</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Tarix</TableHead><TableHead className="text-right">Enerji (kWh)</TableHead><TableHead className="text-right">Xərc (AZN)</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {daily.map((d) => (
                <TableRow key={d.date}>
                  <TableCell>{d.date}</TableCell>
                  <TableCell className="text-right font-mono">{d.kwh.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">{d.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
