"use client";

import { useState } from "react";
import { Check, Plus, Shield } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { DEFAULT_PERMISSIONS, PermissionMatrix, Role } from "@/lib/types";
import { PERMISSION_LABELS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export function RolesModal({ open, onClose, roles, onCreate }: { open: boolean; onClose: () => void; roles: Role[]; onCreate: (role: Role) => void }) {
  const { store } = useStore();
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<PermissionMatrix>(DEFAULT_PERMISSIONS);

  function toggle(key: keyof PermissionMatrix) {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleCreate() {
    if (!name) return;
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await createClient()
          .from("roles")
          .insert({ store_id: store.id, role_name: name, category: "custom", permissions: perms })
          .select()
          .single();
        if (!error) onCreate(data as Role);
      } else {
        onCreate({
          id: `role-${Date.now()}`,
          store_id: store.id,
          role_name: name,
          category: "custom",
          permissions: perms,
          created_at: new Date().toISOString(),
        });
      }
      setName("");
      setPerms(DEFAULT_PERMISSIONS);
      setCreating(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Roller ve Yetkiler" description="Hazır rolleri görüntüleyin veya özel bir rol oluşturun." size="lg">
      {!creating ? (
        <div>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Shield className="h-4 w-4 text-blue-500" /> {role.role_name}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 capitalize">{role.category}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(role.permissions) as (keyof PermissionMatrix)[])
                    .filter((k) => role.permissions[k])
                    .map((k) => (
                      <span key={k} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] text-blue-600">{PERMISSION_LABELS[k]}</span>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full" variant="outline" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Bilinmeyen Kategori / Diğer — Özel Rol Oluştur
          </Button>
        </div>
      ) : (
        <div>
          <Label>Özel Rol Adı</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Vale, Depo Sorumlusu..." className="mb-4" />
          <Label>Yetki Matrisi</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.keys(perms) as (keyof PermissionMatrix)[]).map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => toggle(key)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                  perms[key] ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                <span className={cn("flex h-4 w-4 items-center justify-center rounded border", perms[key] ? "border-blue-600 bg-blue-600" : "border-slate-300")}>
                  {perms[key] && <Check className="h-3 w-3 text-white" />}
                </span>
                {PERMISSION_LABELS[key]}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreating(false)}>Vazgeç</Button>
            <Button onClick={handleCreate} loading={saving} disabled={!name}>Rolü Oluştur</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
