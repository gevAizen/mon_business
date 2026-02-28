import { fr } from "@/lib/i18n";
import type { ExpenseCategory, StockItem } from "@/types";
import { EXPENSE_CATEGORIES } from "@/types";
import { ProductPicker } from "../entries/ProductPicker";
import React from "react";

interface ExpenseFormProps {
  selectedCategory: ExpenseCategory;
  setSelectedCategory: (cat: ExpenseCategory) => void;
  setSelectedProductId: (id: string) => void;
  quantity: string;
  setQuantity: (q: string) => void;
  amount: string;
  setAmount: (a: string) => void;
  sortedStock: StockItem[];
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  selectedCategory,
  setSelectedCategory,
  setSelectedProductId,
  quantity,
  setQuantity,
  amount,
  setAmount,
  sortedStock,
}) => {
  const isStockExpense = selectedCategory === "Stock";

  return (
    <>
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

      {isStockExpense && (
        <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
          <p className="text-sm text-orange-800 font-medium mb-2">
            Réapprovisionnement de Stock
          </p>

          <ProductPicker
            onSelect={setSelectedProductId}
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
          <span className="absolute right-4 top-3 text-gray-500">CFA</span>
        </div>
      </div>
    </>
  );
};
