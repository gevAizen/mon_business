"use client";

import { fr } from "@/lib/i18n";
import { loadData } from "@/lib/storage";
import type {
  DailyEntry,
  ExpenseCategory,
  SaleLineItemInput,
  StockItem,
} from "@/types";
import { EXPENSE_CATEGORIES } from "@/types";
import { useState } from "react";
import { SaleForm } from "./SaleForm";
import { ExpenseForm } from "./ExpenseForm";

interface AddEntryProps {
  existingEntry?: DailyEntry;
  onSave: (entries: DailyEntry[]) => void;
  onCancel: () => void;
}

type EntryType = "SALE" | "EXPENSE";

function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function AddEntry({ existingEntry, onSave, onCancel }: AddEntryProps) {
  const [date, setDate] = useState(() => {
    if (existingEntry) return existingEntry.date;
    return new Date().toISOString().split("T")[0];
  });

  const [entryType, setEntryType] = useState<EntryType>(
    existingEntry?.type || "SALE",
  );
  const [error, setError] = useState("");

  // Sale / Stock Expense fields
  const [selectedProductId, setSelectedProductId] = useState(
    existingEntry?.productId || "",
  );
  const [quantity, setQuantity] = useState(
    existingEntry?.quantity?.toString() || "1",
  );
  const [amount, setAmount] = useState(existingEntry?.amount?.toString() || "");

  // Expense fields
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(
    existingEntry?.category || "Autre",
  );

  // Stock list
  const baseItems: StockItem[] = loadData().stock || [];
  const sortedStock = [...baseItems].sort((a, b) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" }),
  );

  // Multi-item sale support (only for NEW sale entries, not when editing)
  const [lineItems, setLineItems] = useState<SaleLineItemInput[]>(() => {
    if (existingEntry && existingEntry.type === "SALE") return [];
    return [
      {
        id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        productId: "",
        quantity: "1",
        unitPrice: "",
      },
    ];
  });

  const generateLineItemId = () =>
    `line_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const addLineItem = () =>
    setLineItems((s) => [
      ...s,
      { id: generateLineItemId(), productId: "", quantity: "1", unitPrice: "" },
    ]);

  const removeLineItem = (id: string) =>
    setLineItems((s) => s.filter((li) => li.id !== id));

  const updateLineItem = (
    id: string,
    changes: Partial<Omit<SaleLineItemInput, "id">>,
  ) =>
    setLineItems((s) =>
      s.map((li) => (li.id === id ? { ...li, ...changes } : li)),
    );

  const getProductDefaultSellingPrice = () => {
    if (!selectedProductId) return "";
    const product = baseItems.find((p) => p.id === selectedProductId);
    if (!product) return "";
    const qty = parseFloat(quantity) > 0 ? parseFloat(quantity) : 1;
    return `${Math.round(qty * (product.unitSellingPrice || 0))}`;
  };

  const getProductUnitSellingPrice = () => {
    if (!selectedProductId) return 0;
    const product = baseItems.find((p) => p.id === selectedProductId);
    return product?.unitSellingPrice || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date) {
      setError(fr.entry.date);
      return;
    }

    // EXPENSE path (single entry)
    if (entryType === "EXPENSE") {
      const total = parseInt(amount || "0", 10);
      if (isNaN(total) || total < 0) {
        setError("Veuillez entrer un montant valide");
        return;
      }

      const entry: DailyEntry = {
        id: existingEntry?.id || generateEntryId(),
        date,
        timestamp: existingEntry?.timestamp || Date.now(),
        type: "EXPENSE",
        amount: total,
        category: selectedCategory,
      };

      if (selectedCategory === "Stock") {
        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) {
          setError("Veuillez entrer une quantité valide");
          return;
        }
        if (!selectedProductId) {
          setError(fr.entry.selectProduct);
          return;
        }
        entry.productId = selectedProductId;
        entry.quantity = qty;
      }

      onSave([entry]);
      return;
    }

    // SALE path
    if (existingEntry) {
      // editing single existing sale
      const totalAmount = parseInt(
        amount || getProductDefaultSellingPrice() || "0",
        10,
      );
      const qty = parseFloat(quantity);
      if (!selectedProductId) {
        setError(fr.entry.selectProduct);
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        setError("Veuillez entrer une quantité valide");
        return;
      }
      if (isNaN(totalAmount) || totalAmount < 0) {
        setError("Veuillez entrer un montant valide");
        return;
      }

      const entry: DailyEntry = {
        id: existingEntry.id,
        date,
        timestamp: existingEntry.timestamp || Date.now(),
        type: "SALE",
        productId: selectedProductId,
        quantity: qty,
        amount: totalAmount,
      };

      onSave([entry]);
      return;
    }

    // New multi-line sale
    const entries: DailyEntry[] = [];
    for (const li of lineItems) {
      const pid = li.productId;
      const qty = parseFloat(li.quantity);
      const unit = parseFloat(li.unitPrice);
      if (!pid) {
        setError(fr.entry.selectProduct);
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        setError("Veuillez entrer une quantité valide");
        return;
      }
      if (isNaN(unit) || unit < 0) {
        setError("Veuillez entrer un prix unitaire valide");
        return;
      }

      const amt = Math.round(qty * unit);
      entries.push({
        id: generateEntryId(),
        date,
        timestamp: Date.now(),
        type: "SALE",
        productId: pid,
        quantity: qty,
        amount: amt,
      });
    }

    if (entries.length === 0) {
      setError("Aucun article à enregistrer");
      return;
    }

    onSave(entries);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 mb-0">
      <div className="w-full bg-white rounded-t-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {existingEntry ? "Modifier l'entrée" : fr.entry.addEntry}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl font-light"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {fr.entry.date}
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setEntryType("SALE");
                setError("");
              }}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${entryType === "SALE" ? "border-b-2 border-[#60b8c0] text-[#60b8c0]" : "text-gray-600 hover:text-gray-900"}`}
            >
              {fr.entry.addSale}
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryType("EXPENSE");
                setError("");
              }}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${entryType === "EXPENSE" ? "border-b-2 border-[#60b8c0] text-[#60b8c0]" : "text-gray-600 hover:text-gray-900"}`}
            >
              {fr.entry.addExpense}
            </button>
          </div>

          {entryType === "SALE" && (
            <SaleForm
              existingEntry={existingEntry}
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              quantity={quantity}
              setQuantity={setQuantity}
              amount={amount}
              setAmount={setAmount}
              lineItems={lineItems}
              addLineItem={addLineItem}
              removeLineItem={removeLineItem}
              updateLineItem={updateLineItem}
              sortedStock={sortedStock}
              getProductDefaultSellingPrice={getProductDefaultSellingPrice}
              getProductUnitSellingPrice={getProductUnitSellingPrice}
            />
          )}

          {entryType === "EXPENSE" && (
            <ExpenseForm
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setSelectedProductId={setSelectedProductId}
              quantity={quantity}
              setQuantity={setQuantity}
              amount={amount}
              setAmount={setAmount}
              sortedStock={sortedStock}
            />
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              {fr.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#60b8c0] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {existingEntry ? "Mettre à jour" : fr.entry.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
