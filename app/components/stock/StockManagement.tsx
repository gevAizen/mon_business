// app/components/StockManagement.tsx
"use client";

import { fr } from "@/lib/i18n";
import { loadData, saveData } from "@/lib/storage";
import { addOrUpdateEntry } from "@/lib/entries";
import type { StockItem, DailyEntry } from "@/types";
import { useState, useMemo, useCallback } from "react";
import PageWrapper from "../PageWrapper";
import {
  EmptyStock,
  InitialStockModal,
  StockCard,
  StockForm,
  StockSearchBar,
} from "./StockSubcomponents";
import { Plus } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface StockManagementProps {
  onBack: () => void;
}

export interface StockFormData {
  name: string;
  quantity: string;
  threshold: string;
}

export interface InitialStockFormData {
  qty: string;
  amount: string;
  date: string;
}

// ─────────────────────────────────────────────
// Helpers (pure functions, defined once, never re-created)
// ─────────────────────────────────────────────

function generateItemId(): string {
  return `stock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const EMPTY_FORM: StockFormData = { name: "", quantity: "0", threshold: "" };

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export function StockManagement({ onBack }: StockManagementProps) {
  // --- Data state ---
  const [items, setItems] = useState<StockItem[]>(() => loadData().stock);

  // --- Search state ---
  const [searchQuery, setSearchQuery] = useState("");

  // --- Add/Edit form state ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StockFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // --- Initial stock modal state ---
  const [initialStockItem, setInitialStockItem] = useState<StockItem | null>(
    null,
  );
  const [initialForm, setInitialForm] = useState<InitialStockFormData>({
    qty: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [initialError, setInitialError] = useState("");

  // ── Derived data ──────────────────────────────
  // useMemo means this only re-computes when items or searchQuery changes.
  // Without it, every keystroke anywhere on the page would re-filter the list.
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const baseItems = [...items]; // copy to avoid mutation

    if (!query) {
      return baseItems.sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" }),
      );
    }

    return baseItems
      .filter((item) => item.name.toLowerCase().includes(query))
      .sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" }),
      );
  }, [items, searchQuery]);

  // ── Helpers ───────────────────────────────────

  const refreshStock = useCallback(() => {
    setItems(loadData().stock);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowAddForm(false);
    setFormError("");
  }, []);

  // ── Handlers ──────────────────────────────────

  // useCallback here prevents StockForm from re-rendering when unrelated
  // state (like searchQuery) changes, since the function reference stays stable.
  const handleFormChange = useCallback(
    (field: keyof StockFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.SubmitEvent) => {
      e.preventDefault();
      setFormError("");

      if (!formData.name.trim()) {
        setFormError("Veuillez entrer un nom de produit");
        return;
      }

      const qty =
        formData.quantity === "" ? 0 : parseInt(formData.quantity, 10);
      const thresh =
        formData.threshold === "" ? 0 : parseInt(formData.threshold, 10);

      if (isNaN(qty) || isNaN(thresh) || qty < 0 || thresh < 0) {
        setFormError("Veuillez entrer des nombres valides");
        return;
      }

      const data = loadData();
      const currentItem = editingId
        ? data.stock.find((item: StockItem) => item.id === editingId)
        : undefined;

      const newItem: StockItem = {
        id: editingId || generateItemId(),
        name: formData.name.trim(),
        quantity: qty,
        threshold: thresh,
        unitPrice: currentItem?.unitPrice ?? 0,
        totalSold: currentItem?.totalSold ?? 0,
        hasInitialStockTransaction:
          currentItem?.hasInitialStockTransaction ?? false,
      };

      if (editingId) {
        const index = data.stock.findIndex((item) => item.id === editingId);
        if (index >= 0) data.stock[index] = newItem;
      } else {
        data.stock.push(newItem);
      }

      if (saveData(data)) {
        resetForm();
        refreshStock();
      }
    },
    [formData, editingId, resetForm, refreshStock],
  );

  const handleEdit = useCallback((item: StockItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      threshold: item.threshold.toString(),
    });
    setShowAddForm(true);
  }, []);

  const handleDelete = useCallback(
    (itemId: string) => {
      const data = loadData();
      data.stock = data.stock.filter((item) => item.id !== itemId);
      if (saveData(data)) refreshStock();
    },
    [refreshStock],
  );

  const handleInitialStockSubmit = useCallback(() => {
    if (!initialStockItem) return;
    setInitialError("");

    const qty = parseInt(initialForm.qty, 10);
    const amount = parseFloat(initialForm.amount);

    if (isNaN(qty) || qty <= 0 || isNaN(amount) || amount <= 0) {
      setInitialError("Veuillez entrer des valeurs valides");
      return;
    }

    const entry: DailyEntry = {
      id: `entry_${Date.now()}`,
      date: initialForm.date,
      timestamp: Date.now(),
      type: "EXPENSE",
      productId: initialStockItem.id,
      category: "Stock",
      quantity: qty,
      amount,
    };

    if (!addOrUpdateEntry(entry)) {
      setInitialError("Erreur lors de l'enregistrement");
      return;
    }

    const data = loadData();
    const index = data.stock.findIndex(
      (item) => item.id === initialStockItem.id,
    );
    if (index >= 0) {
      data.stock[index].hasInitialStockTransaction = true;
      saveData(data);
    }

    setInitialStockItem(null);
    setInitialForm({
      qty: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    refreshStock();
  }, [initialStockItem, initialForm, refreshStock]);

  // ── Render ────────────────────────────────────

  return (
    <PageWrapper header={<PageHeader />}>
      <div className="flex-1 pb-4 overflow-auto space-y-6">
        {/* Search input — only useful when there are items */}
        {items.length > 0 && (
          <StockSearchBar value={searchQuery} onChange={setSearchQuery} />
        )}

        {/* Add Entry Button */}
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="fixed right-4 bottom-20 w-12 h-12 flex items-center justify-center bg-[#60b8c0] text-white font-semibold py-4 rounded-full transition-colors text-lg"
        >
          <Plus />
        </button>

        {/* Add/Edit Form */}
        {showAddForm && (
          <StockForm
            editingId={editingId}
            formData={formData}
            error={formError}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        {/* Items list */}
        {filteredItems.length === 0 ? (
          <EmptyStock hasItems={items.length > 0} />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <StockCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onInitialStock={setInitialStockItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal lives OUTSIDE the list — rendered once, not per-item */}
      {initialStockItem && (
        <InitialStockModal
          item={initialStockItem}
          formData={initialForm}
          error={initialError}
          onChange={(field, value) =>
            setInitialForm((prev) => ({ ...prev, [field]: value }))
          }
          onSubmit={handleInitialStockSubmit}
          onClose={() => setInitialStockItem(null)}
        />
      )}
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

// -- Page header --

const PageHeader: React.FC = () => (
  <div className="flex flex-col gap-2">
    <h1 className="text-2xl font-bold text-gray-900">{fr.stock.inventory}</h1>
    <p className="text-gray-600 text-sm">{fr.stock.subtitle}</p>
  </div>
);
