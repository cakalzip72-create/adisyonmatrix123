"use client";

import { useState } from "react";
import { Banknote, Bike, Calculator, MessageCircleMore, Plug, BarChart3, Mail } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const INTEGRATIONS = [
  { key: "yazarkasa", name: "Yazarkasa Entegrasyonu", desc: "Fişleri otomatik olarak yazarkasanıza gönderin.", icon: Calculator, connected: true },
  { key: "muhasebe", name: "Muhasebe Yazılımı", desc: "Logo, Mikro ve Netsis ile senkron çalışın.", icon: Banknote, connected: false },
  { key: "yemeksepeti", name: "Yemeksepeti / Getir", desc: "Paket servis siparişlerini tek panelden yönetin.", icon: Bike, connected: false },
  { key: "whatsapp", name: "WhatsApp Bildirimleri", desc: "Sipariş ve rezervasyon bildirimlerini WhatsApp ile gönderin.", icon: MessageCircleMore, connected: true },
  { key: "analytics", name: "Google Analytics", desc: "Dijital menü trafiğinizi analiz edin.", icon: BarChart3, connected: false },
  { key: "email", name: "E-posta Pazarlama", desc: "Müşterilerinize kampanya e-postaları gönderin.", icon: Mail, connected: false },
];

export default function EntegrasyonlarPage() {
  const [connections, setConnections] = useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.key, i.connected]))
  );

  return (
    <DashboardShell title="Entegrasyonlar" description="Ödeme, muhasebe, kargo ve daha fazlası ile sorunsuz entegre olun." permission="entegrasyonlar">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((i) => (
          <Card key={i.key} className="p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <i.icon className="h-5 w-5" />
              </span>
              {connections[i.key] && <Badge tone="green" dot>Bağlı</Badge>}
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{i.name}</p>
            <p className="mt-1 text-xs text-slate-500">{i.desc}</p>
            <Button
              variant={connections[i.key] ? "outline" : "primary"}
              size="sm"
              className="mt-4 w-full"
              onClick={() => setConnections((prev) => ({ ...prev, [i.key]: !prev[i.key] }))}
            >
              <Plug className="h-3.5 w-3.5" /> {connections[i.key] ? "Bağlantıyı Kes" : "Bağlan"}
            </Button>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
