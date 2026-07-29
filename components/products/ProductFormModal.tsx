"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ImagePlus, Loader2, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Category, Product } from "@/lib/types";
import { useStore } from "@/lib/store-context";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (product: Product) => void;
}

type ScanState = "idle" | "scanning" | "ok" | "rejected" | "error";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductFormModal({ open, onClose, categories, onSave }: Props) {
  const { store } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scan, setScan] = useState<ScanState>("idle");
  const [scanReason, setScanReason] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setScan("scanning");
    setScanReason(null);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/photo-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const json = await res.json();
      if (json.approved) {
        setScan("ok");
        setScanReason(json.skipped ? null : json.reason);
      } else {
        setScan("rejected");
        setScanReason(json.reason || "Bu fotoğraf ürün fotoğrafı olarak uygun görünmüyor.");
      }
    } catch {
      setScan("error");
      setScanReason("Güvenlik taraması sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }

  function generateAiImage() {
    setAiGenerating(true);
    setTimeout(() => {
      setAiImage(`https://picsum.photos/seed/ai-${Date.now()}/400/400`);
      setAiGenerating(false);
    }, 1800);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || scan !== "ok") return;
    setSaveError(null);
    setSaving(true);
    try {
      let imageUrl = preview;

      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (file) {
          const path = `${store.id}/${crypto.randomUUID()}-${file.name}`;
          const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file);
          if (uploadErr) throw uploadErr;
          imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
        }
        const { data: inserted, error } = await supabase
          .from("products")
          .insert({
            store_id: store.id,
            category_id: categoryId,
            name,
            description,
            price: Number(price),
            real_image_url: imageUrl,
            ai_image_url: aiImage,
            is_available: true,
            stock: 0,
            track_stock: false,
          })
          .select()
          .single();
        if (error) throw error;
        onSave(inserted as Product);
      } else {
        onSave({
          id: `prod-${Date.now()}`,
          store_id: store.id,
          category_id: categoryId,
          name,
          description,
          price: Number(price),
          real_image_url: imageUrl,
          ai_image_url: aiImage,
          variants: [],
          is_available: true,
          stock: 0,
          track_stock: true,
          sold_count: 0,
        });
      }
      onClose();
      setName("");
      setDescription("");
      setPrice("");
      setPreview(null);
      setFile(null);
      setScan("idle");
      setAiImage(null);
    } catch (err) {
      setSaveError(getErrorMessage(err, "Ürün kaydedilirken bir hata oluştu."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Yeni Ürün Ekle" description="Ürün bilgilerini girin. Gerçek ürün fotoğrafı yüklemesi zorunludur." size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label>Ürün Adı</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Adisyon Burger" required />
          </div>
          <div>
            <Label>Fiyat (₺)</Label>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" required />
          </div>
        </div>
        <div>
          <Label>Açıklama</Label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ürün açıklaması" />
        </div>
        <div>
          <Label>Kategori</Label>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories
              .filter((c) => !c.parent_id)
              .flatMap((c) => [c, ...categories.filter((s) => s.parent_id === c.id)])
              .map((c) => (
                <option key={c.id} value={c.id}>{c.parent_id ? `— ${c.name}` : c.name}</option>
              ))}
          </Select>
        </div>

        <div>
          <Label>Gerçek Ürün Fotoğrafı (zorunlu)</Label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {!preview ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500"
            >
              <Upload className="h-6 w-6" /> Fotoğraf yüklemek için tıklayın
            </button>
          ) : (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Ürün" className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex-1">
                {scan === "scanning" && (
                  <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Yapay zeka (Gemini) güvenlik taraması yapılıyor...</p>
                )}
                {scan === "ok" && (
                  <p className="flex items-center gap-2 text-sm text-emerald-600"><ShieldCheck className="h-4 w-4" /> {scanReason || "Fotoğraf onaylandı."}</p>
                )}
                {scan === "rejected" && (
                  <p className="flex items-center gap-2 text-sm text-red-600"><AlertTriangle className="h-4 w-4" /> {scanReason}</p>
                )}
                {scan === "error" && (
                  <p className="flex items-center gap-2 text-sm text-amber-600"><AlertTriangle className="h-4 w-4" /> {scanReason}</p>
                )}
                <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-xs font-medium text-blue-600">
                  Fotoğrafı değiştir
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-purple-800"><Sparkles className="h-4 w-4" /> AI Görsel Oluştur</p>
            <span className="text-xs text-purple-500">{store.ai_credits.toLocaleString("tr-TR")} kredi kaldı</span>
          </div>
          <p className="mb-3 text-xs text-purple-600">
            Gerçek fotoğrafınızdan esinlenerek yapay zeka ile estetik bir menü görseli üretin (50 kredi).
          </p>
          {aiImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={aiImage} alt="AI görsel" className="h-24 w-24 rounded-xl object-cover" />
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={generateAiImage} loading={aiGenerating} disabled={!preview}>
              <ImagePlus className="h-4 w-4" /> AI Görsel Oluştur
            </Button>
          )}
          <Alert tone="ai" className="mt-3">
            Not: Fotoğraf güvenlik taraması artık gerçek Gemini modeliyle çalışıyor. AI görsel üretimi için gereken
            görsel-üretim modeli bu Google hesabında henüz faturalandırma açık olmadığından kullanılamıyor — bu buton
            şimdilik örnek bir görsel gösterir.
          </Alert>
        </div>

        {saveError && (
          <Alert tone="warning">{saveError}</Alert>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Vazgeç</Button>
          <Button type="submit" loading={saving} disabled={scan !== "ok" || !name || !price}>Ürünü Kaydet</Button>
        </div>
      </form>
    </Modal>
  );
}
