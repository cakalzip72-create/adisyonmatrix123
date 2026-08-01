"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { CreateStoreModal } from "@/components/admin/CreateStoreModal";

export function AdminHeader() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mağazalar</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sistemdeki tüm işletmeleri yönetin ve üyelik planlarını güncelleyin.
        </p>
      </div>
      <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" /> Yeni Mağaza Ekle
      </Button>

      {showModal && <CreateStoreModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
