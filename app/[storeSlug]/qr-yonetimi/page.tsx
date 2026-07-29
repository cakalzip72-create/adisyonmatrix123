"use client";

import { useState } from "react";
import { Download, Palette, Printer, QrCode as QrCodeIcon } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pills } from "@/components/ui/Tabs";
import { QRImage } from "@/components/qr/QRImage";
import { MOCK_TABLES } from "@/lib/mock/data";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { RestaurantTable } from "@/lib/types";
import QRCode from "qrcode";

const COLORS = ["#1d4ed8", "#0f172a", "#16a34a", "#a855f7", "#ea580c"];

export default function QrYonetimiPage() {
  const { store } = useStore();
  const { data: tables } = useRealtimeCollection<RestaurantTable>({ table: "tables", storeId: store.id, orderBy: { column: "table_number" }, mock: MOCK_TABLES });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [color, setColor] = useState("#1d4ed8");
  const selected = tables.find((t) => t.id === selectedId) ?? tables[0];
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const menuUrl = selected ? `${siteUrl}/menu/${store.slug}/${selected.id}` : "";

  async function downloadPng() {
    if (!menuUrl) return;
    const dataUrl = await QRCode.toDataURL(menuUrl, { width: 600, margin: 2, color: { dark: color, light: "#ffffff" } });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `masa-${selected.table_number}-qr.png`;
    a.click();
  }

  function printQr() {
    window.print();
  }

  if (!selected) {
    return (
      <DashboardShell title="QR Yönetimi" description="Masalarınız için dijital menü QR kodlarını oluşturun ve özelleştirin." permission="qr_yonetimi">
        <Card className="py-14 text-center text-sm text-slate-400">Önce Masa Planı&apos;ndan masa ekleyin.</Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="QR Yönetimi" description="Masalarınız için dijital menü QR kodlarını oluşturun ve özelleştirin." permission="qr_yonetimi">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">Masa Seçin</p>
          <Pills
            tabs={tables.map((t) => ({ key: t.id, label: `Masa ${t.table_number}` }))}
            active={selected.id}
            onChange={setSelectedId}
          />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {tables.map((t) => (
              <button key={t.id} onClick={() => setSelectedId(t.id)} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-3 hover:border-blue-200 hover:bg-blue-50/50">
                <QrCodeIcon className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">Masa {t.table_number}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="h-fit">
          <p className="mb-4 text-sm font-semibold text-slate-900">Masa {selected.table_number} — QR Önizleme</p>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
            <QRImage value={menuUrl} size={180} color={color} />
            <p className="max-w-[220px] break-all text-center text-xs text-slate-400">{menuUrl}</p>
          </div>

          <p className="mb-2 mt-5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><Palette className="h-3.5 w-3.5" /> Renk</p>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full ring-2 ring-offset-2"
                style={{ backgroundColor: c, ["--tw-ring-color" as string]: color === c ? c : "transparent" }}
              />
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <Button className="w-full" onClick={downloadPng}><Download className="h-4 w-4" /> PNG İndir</Button>
            <Button variant="outline" className="w-full" onClick={printQr}><Printer className="h-4 w-4" /> Yazdır</Button>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
