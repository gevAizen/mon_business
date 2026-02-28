"use client";

import { fr } from "@/lib/i18n";
import { loadData } from "@/lib/storage";
import type { DailyEntry, ExpenseCategory, StockItem } from "@/types";
import { EXPENSE_CATEGORIES } from "@/types";
import { ChangeEvent, useState } from "react";
import { ProductPicker } from "./entries/ProductPicker";

interface AddEntryProps {
  existingEntry?: DailyEntry;
  onSave: (entry: DailyEntry) => void;
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

  // Load stock for product dropdown
  const [stock, setStock] = useState<StockItem[]>(() => loadData().stock);
  const baseItems = [...loadData().stock]; // copy to avoid mutation
  const sortedStock = baseItems.sort((a, b) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" }),
  );

  // Constants
  const isStockExpense =
    entryType === "EXPENSE" && selectedCategory === "Stock";

  const getProductDefaultSellingPrice = () => {
    if (!selectedProductId) {
      return "";
    }

    const product = baseItems.find((p) => p.id === selectedProductId);
    if (!product) return "";

    const usp = product?.unitSellingPrice;
    const qty = parseInt(quantity) > 0 ? parseInt(quantity) : 1;

    return `${qty * usp}`;
  };
  const getProductUnitSellingPrice = () => {
    if (!selectedProductId) {
      setError(fr.entry.selectProduct);
      return 0;
    }

    const product = baseItems.find((p) => p.id === selectedProductId);
    if (!product) return 0;

    return product?.unitSellingPrice || 0;
  };

  const handleSelectProductForSell = (
    e: ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
  ) => {
    setSelectedProductId(e.target.value);
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!date) {
      setError(fr.entry.date);
      return;
    }

    const qty = parseFloat(quantity);
    const totalAmount = parseInt(amount || getProductDefaultSellingPrice(), 10);

    if (isNaN(totalAmount) || totalAmount < 0) {
      setError(
        `Veuillez entrer un montant valide, ${totalAmount}, ${getProductDefaultSellingPrice()}`,
      );
      return;
    }

    // Validation for Sales and Stock Expenses
    if (entryType === "SALE" || isStockExpense) {
      if (!selectedProductId) {
        setError(fr.entry.selectProduct);
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        setError("Veuillez entrer une quantité valide");
        return;
      }

      if (entryType === "SALE") {
        const product = baseItems.find((p) => p.id === selectedProductId);
        if (!product) {
          setError("Produit non trouvé");
          return;
        }
        // Check stock only for new sales or if quantity increased
        // Simplified check: just check current stock vs requested quantity
        // Note: For editing, this might block if stock is low but we are just editing the price.
        // ideally we should factor in the existing quantity if editing, but for now we enforce stock availability.
        // We added existing quantity back in lib/entries on update, so we can't easily check against that here directly without fetching fresh data including the reverted amount.
        // For simplicity in this "immediate submit" refactor, we check roughly.
        // Actually, let's skip strict stock check on edit to avoid locking users out, or rely on the backend/lib check if we had one.
        // Let's keep it simple: check against current available stock.
        if (!existingEntry && product.quantity < qty) {
          setError(`Stock insuffisant. Disponible: ${product.quantity}`);
          return;
        }
      }
    }

    const newEntry: DailyEntry = {
      id: existingEntry?.id || generateEntryId(),
      date,
      timestamp: existingEntry?.timestamp || Date.now(),
      type: entryType,
      amount: totalAmount,
    };

    if (entryType === "SALE") {
      newEntry.productId = selectedProductId;
      newEntry.quantity = qty;
    } else if (entryType === "EXPENSE") {
      newEntry.category = selectedCategory;
      if (isStockExpense) {
        newEntry.productId = selectedProductId;
        newEntry.quantity = qty;
      }
    }

    onSave(newEntry);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 mb-0">
      <div className="w-full bg-white rounded-t-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
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
          {/* Date */}
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

          {/* Type Selector */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setEntryType("SALE");
                setError("");
              }}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                entryType === "SALE"
                  ? "border-b-2 border-[#60b8c0] text-[#60b8c0]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {fr.entry.addSale}
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryType("EXPENSE");
                setError("");
              }}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                entryType === "EXPENSE"
                  ? "border-b-2 border-[#60b8c0] text-[#60b8c0]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {fr.entry.addExpense}
            </button>
          </div>

          {/* SALE FORM */}
          {entryType === "SALE" && (
            <div className="space-y-4">
              <ProductPicker
                onSelect={(id) => setSelectedProductId(id)}
                products={sortedStock}
              />

              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {fr.entry.quantity}
                  </label>
                  <input
                    id="quantity"
                    type="text"
                    inputMode="decimal"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.0"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="amount"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Prix Total
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount || getProductDefaultSellingPrice()}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Computed Unit Price Preview */}
              {selectedProductId && (
                <div className="text-sm text-gray-600 text-right">
                  {fr.entry.sellingUnitPrice}:{" "}
                  {getProductUnitSellingPrice().toLocaleString("fr-FR")} CFA
                </div>
              )}
            </div>
          )}

          {/* EXPENSE FORM */}
          {entryType === "EXPENSE" && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {fr.entry.expenseCategory}
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as ExpenseCategory)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {fr.expenseCategories[cat as ExpenseCategory]}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory === "Stock" && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm text-orange-800 font-medium mb-2">
                    Réapprovisionnement de Stock
                  </p>

                  <ProductPicker
                    onSelect={(id) => setSelectedProductId(id)}
                    products={sortedStock}
                  />

                  <div>
                    <label
                      htmlFor="stockQty"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Quantité Ajoutée
                    </label>
                    <input
                      id="stockQty"
                      type="text"
                      inputMode="decimal"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0.0"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="expenseAmount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Montant Total (Coût)
                </label>
                <div className="relative">
                  <input
                    id="expenseAmount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">
                    CFA
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
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
