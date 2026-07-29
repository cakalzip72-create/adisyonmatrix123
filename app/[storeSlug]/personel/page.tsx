"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Mail, MapPin, Phone, Plus, Search, Shield, ShieldCheck, UserCheck, UserCog, Users, UserX } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Badge, STATUS_TONE } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { RolesModal } from "@/components/personnel/RolesModal";
import { MOCK_ROLES, MOCK_STAFF } from "@/lib/mock/data";
import { PermissionMatrix, Role, Staff } from "@/lib/types";
import { PERMISSION_LABELS } from "@/lib/permissions";
import { useStore } from "@/lib/store-context";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const STATUS_LABEL: Record<Staff["status"], string> = { pending: "Onay Bekliyor", approved: "Aktif", passive: "Pasif", izinli: "İzinli" };

export default function PersonelPage() {
  const { store } = useStore();
  const { data: staff, setData: setStaff } = useRealtimeCollection<Staff>({ table: "staff", storeId: store.id, mock: MOCK_STAFF });
  const { data: roles, setData: setRoles } = useRealtimeCollection<Role>({ table: "roles", storeId: store.id, mock: MOCK_ROLES });
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("Tümü");
  const [selectedId, setSelectedId] = useState<string | null>(staff[0]?.id ?? null);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", department: "Servis", role_id: "" });
  const [saving, setSaving] = useState(false);

  const selected = staff.find((s) => s.id === selectedId) ?? null;
  const departments = ["Tümü", ...Array.from(new Set(staff.map((s) => s.department)))];

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (dept !== "Tümü" && s.department !== dept) return false;
      if (q && !s.full_name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [staff, q, dept]);

  function roleNameFor(s: Staff) {
    return s.role_name ?? roles.find((r) => r.id === s.role_id)?.role_name ?? "—";
  }

  const selectedRole = selected ? roles.find((r) => r.id === selected.role_id) : null;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { store_id: store.id, ...form, status: "pending" as const, work_schedule: "tam_zamanli" as const, hired_at: new Date().toISOString().slice(0, 10) };
      if (isSupabaseConfigured) {
        const { data, error } = await createClient().from("staff").insert(payload).select().single();
        if (!error) setStaff((prev) => [...prev, data as Staff]);
      } else {
        setStaff((prev) => [...prev, { id: `stf-${Date.now()}`, user_id: null, avatar_url: null, shift_start: null, shift_end: null, work_days_per_week: null, day_off: null, city: null, district: null, ...payload } as Staff]);
      }
      setAddOpen(false);
      setForm({ full_name: "", email: "", phone: "", department: "Servis", role_id: "" });
    } finally {
      setSaving(false);
    }
  }

  async function makePassive(s: Staff) {
    setStaff((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: "passive" } : x)));
    if (isSupabaseConfigured) {
      await createClient().from("staff").update({ status: "passive" }).eq("id", s.id);
    }
  }

  return (
    <DashboardShell
      title="Personel"
      description="Personel listenizi görüntüleyin, rollerini ve yetkilerini yönetin."
      permission="personel"
      actions={
        <>
          <Button variant="outline" onClick={() => setRolesOpen(true)}><Shield className="h-4 w-4" /> Roller</Button>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Yeni Personel Ekle</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5 mb-6">
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Users className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{staff.length}</p>
          <p className="text-xs text-slate-400">Toplam Personel</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><UserCheck className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{staff.filter((s) => s.status === "approved").length}</p>
          <p className="text-xs text-slate-400">Aktif Personel</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"><UserX className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{staff.filter((s) => s.status === "passive").length}</p>
          <p className="text-xs text-slate-400">Pasif Personel</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600"><CalendarDays className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{staff.filter((s) => s.status === "izinli").length}</p>
          <p className="text-xs text-slate-400">İzinli Personel</p>
        </Card>
        <Card className="p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-600"><ShieldCheck className="h-4 w-4" /></span>
          <p className="mt-2 text-xl font-semibold text-slate-900">{departments.length - 1}</p>
          <p className="text-xs text-slate-400">Departman Sayısı</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <Input icon={<Search className="h-4 w-4" />} placeholder="Personel ara..." value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
            <Select value={dept} onChange={(e) => setDept(e.target.value)} className="sm:w-52">
              {departments.map((d) => (
                <option key={d} value={d}>{d === "Tümü" ? "Tüm Departmanlar" : d}</option>
              ))}
            </Select>
          </Card>

          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="px-5 py-3 font-medium">Personel</th>
                  <th className="px-5 py-3 font-medium">Departman</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Çalışma Şekli</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} onClick={() => setSelectedId(s.id)} className={`cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/60 ${selectedId === s.id ? "bg-blue-50/50" : ""}`}>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={s.full_name} size={32} />
                        <span>
                          <p className="font-medium text-slate-900">{s.full_name}</p>
                          <p className="text-xs text-slate-400">{s.phone}</p>
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{s.department}</td>
                    <td className="px-5 py-3.5"><Badge tone="blue">{roleNameFor(s)}</Badge></td>
                    <td className="px-5 py-3.5 text-slate-500">{s.work_schedule === "tam_zamanli" ? "Tam Zamanlı" : "Yarı Zamanlı"}</td>
                    <td className="px-5 py-3.5"><Badge tone={STATUS_TONE[s.status]} dot>{STATUS_LABEL[s.status]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <Card className="h-fit p-5">
          {!selected ? (
            <p className="py-10 text-center text-sm text-slate-400">Detayları görmek için bir personel seçin.</p>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <Avatar name={selected.full_name} size={52} />
                <div>
                  <p className="font-semibold text-slate-900">{selected.full_name}</p>
                  <Badge tone="blue">{roleNameFor(selected)}</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {selected.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {selected.email}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {selected.city}, {selected.district}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                <div><p className="text-xs text-slate-400">Çalışma Saati</p><p className="font-medium text-slate-700">{selected.shift_start ?? "—"}–{selected.shift_end ?? "—"}</p></div>
                <div><p className="text-xs text-slate-400">İzin Günü</p><p className="font-medium text-slate-700">{selected.day_off ?? "—"}</p></div>
              </div>
              {selectedRole && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-medium text-slate-400">Yetkiler</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(selectedRole.permissions) as (keyof PermissionMatrix)[])
                      .filter((k) => selectedRole.permissions[k])
                      .map((k) => (
                        <span key={k} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] text-blue-600">{PERMISSION_LABELS[k]}</span>
                      ))}
                  </div>
                </div>
              )}
              <div className="mt-5 space-y-2">
                <Button className="w-full"><UserCog className="h-4 w-4" /> Düzenle</Button>
                <Button className="w-full" variant="danger" onClick={() => makePassive(selected)} disabled={selected.status === "passive"}>Pasif Yap</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yeni Personel Ekle" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label>Ad Soyad</Label>
            <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required />
          </div>
          <div>
            <Label>E-posta</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <Label>Departman</Label>
            <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
          </div>
          <div>
            <Label>Rol</Label>
            <Select value={form.role_id} onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))} required>
              <option value="">Rol seçin</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.role_name}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Vazgeç</Button>
            <Button type="submit" loading={saving}>Kaydet</Button>
          </div>
        </form>
      </Modal>

      <RolesModal open={rolesOpen} onClose={() => setRolesOpen(false)} roles={roles} onCreate={(r) => setRoles((prev) => [...prev, r])} />
    </DashboardShell>
  );
}
