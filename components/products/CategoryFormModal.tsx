"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Category } from "@/lib/types";
import { useStore } from "@/lib/store-context";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  editing: Category | null;
  onSave: (category: Category, isNew: boolean) => void;
}

export function CategoryFormModal({ open, onClose, categories, editing, onSave }: Props) {
  const { store } = useStore();
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [parentId, setParentId] = useState(editing?.parent_id ?? "");
  const [status, setStatus] = useState<"aktif" | "pasif">(editing?.status ?? "aktif");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentOptions = categories.filter((c) => !c.parent_id && c.id !== editing?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        store_id: store.id,
        name,
        description: description || null,
        parent_id: parentId || null,
        status,
        icon: editing?.icon ?? "utensils",
        sort_order: editing?.sort_order ?? categories.length + 1,
      };
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (editing) {
          const { data, error: err } = await supabase.from("categories").update(payload).eq("id", editing.id).select().single();
          if (err) throw err;
          onSave(data as Category, false);
        } else {
          const { data, error: err } = await supabase.from("categories").insert(payload).select().single();
          if (err) throw err;
          onSave(data as Category, true);
        }
      } else {
        onSave({ id: editing?.id ?? `cat-${Date.now()}`, ...payload } as Category, !editing);
      }
      onClose();
      setName("");
      setDescription("");
      setParentId("");
      setStatus("aktif");
    } catch (err) {
      setError(getErrorMessage(err, "Kategori kaydedilirken bir hata oluştu."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Kategori Adı</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Izgaralar" required />
        </div>
        <div>
          <Label>Açıklama</Label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kısa açıklama" />
        </div>
        <div>
          <Label>Üst Kategori (opsiyonel)</Label>
          <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">— Ana kategori (üst kategori yok) —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-slate-400">Bir üst kategori seçerseniz bu, onun alt kategorisi olur.</p>
        </div>
        <div>
          <Label>Durum</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as "aktif" | "pasif")}>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </Select>
        </div>
        {error && <Alert tone="warning">{error}</Alert>}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Vazgeç</Button>
          <Button type="submit" loading={saving} disabled={!name}>Kaydet</Button>
        </div>
      </form>
    </Modal>
  );
}
