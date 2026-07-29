"use client";

import { useMemo, useState } from "react";
import { Download, Eye, MoreVertical, Pencil, Plus, Search, Users, UsersRound, Wallet, Star } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { MOCK_CUSTOMERS } from "@/lib/mock/data";
import { Customer } from "@/lib/types";
import { exportToExcel } from "@/lib/xlsx-export";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const GROUP_TONE = { yeni: "blue", normal: "gray", sadik: "yellow" } as const;
const GROUP_LABEL = { yeni: "Yeni Müşteri", normal: "Normal Müşteri", sadik: "Sadık Müşteri" };

export default function MusterilerPage() {
  const { store } = useStore();
  const { data: customers, setData: setCustomers } = useRealtimeCollection<Customer>({
    table: "customers",
    storeId: store.id,
    orderBy: { column: "total_spent", ascending: false },
    mock: MOCK_CUSTOMERS,
  });
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("Tümü");
  const [selectedId, setSelectedId] = useState<string | null>(customers[0]?.id ?? null);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (group !== "Tümü" && c.group !== group) return false;
      if (q && !c.full_name.toLowerCase().includes(q.toLowerCase()) && !c.phone.includes(q)) return false;
      return true;
    });
  }, [customers, q, group]);

  const totalSpent = customers.reduce((s, c) => s + c.total_spent, 0);

  function handleExport() {
    exportToExcel("adisyonmatrix-musteriler", [
      { name: "Müşteriler", rows: customers.map((c) => ({ "Ad Soyad": c.full_name, Telefon: c.phone, "E-posta": c.email ?? "", Grup: c.group, "Toplam Harcama": c.total_spent, "Toplam İşlem": c.total_orders })) },
    ]);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await createClient()
          .from("customers")
          .insert({ store_id: store.id, full_name: name, phone, email: email || null, group: "yeni", status: "aktif" })
          .select()
          .single();
        if (!error) setCustomers((prev) => [data as Customer, ...prev]);
      } else {
        setCustomers((prev) => [
          { id: `cus-${Date.now()}`, store_id: store.id, full_name: name, email: email || null, phone, city: null, district: null, group: "yeni", status: "aktif", total_spent: 0, total_orders: 0, first_order_at: null, last_order_at: null, avatar_url: null },
          ...prev,
        ]);
      }
      setAddOpen(false);
      setName("");
      setPhone("");
      setEmail("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell
      title="Müşteriler"
      description="Müşterilerinizi görüntüleyin, düzenleyin ve müşteri ilişkilerinizi yönetin."
      permission="musteriler"
      actions={
        <>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4" /> Dışa Aktar</Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Yeni Müşteri Ekle</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Users className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{customers.length}</p>
          <p className="text-xs text-slate-400">Toplam Müşteri</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><UsersRound className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{customers.filter((c) => c.status === "aktif").length}</p>
          <p className="text-xs text-slate-400">Aktif Müşteri</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Star className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{customers.filter((c) => c.group === "sadik").length}</p>
          <p className="text-xs text-slate-400">Sadık Müşteri</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-600"><Wallet className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-slate-400">Toplam Harcama</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <Input icon={<Search className="h-4 w-4" />} placeholder="Müşteri ara..." value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
            <Select value={group} onChange={(e) => setGroup(e.target.value)} className="sm:w-52">
              <option value="Tümü">Tüm Gruplar</option>
              <option value="yeni">Yeni Müşteri</option>
              <option value="normal">Normal Müşteri</option>
              <option value="sadik">Sadık Müşteri</option>
            </Select>
          </Card>

          {filtered.length === 0 ? (
            <Card className="py-14 text-center text-sm text-slate-400">Müşteri bulunamadı.</Card>
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="px-5 py-3 font-medium">Müşteri</th>
                    <th className="px-5 py-3 font-medium">İletişim</th>
                    <th className="px-5 py-3 font-medium">Grup</th>
                    <th className="px-5 py-3 font-medium">Toplam Harcama</th>
                    <th className="px-5 py-3 font-medium">Durum</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} onClick={() => setSelectedId(c.id)} className={`cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/60 ${selectedId === c.id ? "bg-blue-50/50" : ""}`}>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-2.5">
                          <Avatar name={c.full_name} size={32} />
                          <span>
                            <p className="font-medium text-slate-900">{c.full_name}</p>
                            <p className="text-xs text-slate-400">{c.total_orders} işlem</p>
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{c.phone}</td>
                      <td className="px-5 py-3.5"><Badge tone={GROUP_TONE[c.group]}>{GROUP_LABEL[c.group]}</Badge></td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{formatCurrency(c.total_spent)}</td>
                      <td className="px-5 py-3.5"><Badge tone={c.status === "aktif" ? "green" : "gray"} dot>{c.status === "aktif" ? "Aktif" : "Pasif"}</Badge></td>
                      <td className="px-5 py-3.5">
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><MoreVertical className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        <Card className="h-fit p-5">
          {!selected ? (
            <p className="py-10 text-center text-sm text-slate-400">Detayları görmek için bir müşteri seçin.</p>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <Avatar name={selected.full_name} size={52} />
                <div>
                  <p className="font-semibold text-slate-900">{selected.full_name}</p>
                  <Badge tone={GROUP_TONE[selected.group]}>{GROUP_LABEL[selected.group]}</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>{selected.phone}</p>
                <p>{selected.email}</p>
                <p>{selected.city}, {selected.district}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                <div><p className="text-xs text-slate-400">Toplam Harcama</p><p className="font-semibold text-slate-900">{formatCurrency(selected.total_spent)}</p></div>
                <div><p className="text-xs text-slate-400">Toplam İşlem</p><p className="font-semibold text-slate-900">{selected.total_orders}</p></div>
                <div><p className="text-xs text-slate-400">İlk İşlem</p><p className="font-medium text-slate-700">{selected.first_order_at ? formatDate(selected.first_order_at) : "—"}</p></div>
                <div><p className="text-xs text-slate-400">Son İşlem</p><p className="font-medium text-slate-700">{selected.last_order_at ? formatDate(selected.last_order_at) : "—"}</p></div>
              </div>
              <div className="mt-5 space-y-2">
                <Button className="w-full" variant="outline"><Eye className="h-4 w-4" /> Sipariş Geçmişi</Button>
                <Button className="w-full"><Pencil className="h-4 w-4" /> Düzenle</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yeni Müşteri Ekle" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label>Ad Soyad</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <Label>E-posta (opsiyonel)</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Vazgeç</Button>
            <Button type="submit" loading={saving}>Kaydet</Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
