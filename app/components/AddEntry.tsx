"use client";

import { fr } from "@/lib/i18n";
import type {
  DailyEntry,
  SaleLineItem,
  ExpenseLineItem,
  ExpenseCategory,
  StockItem,
} from "@/types";
import { EXPENSE_CATEGORIES } from "@/types";
import { loadData } from "@/lib/storage";
import { useState } from "react";

interface AddEntryProps {
  existingEntry?: DailyEntry;
  onSave: (entry: DailyEntry) => void;
  onCancel: () => void;
}

type TabType = "sales" | "expenses";

function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function AddEntry({ existingEntry, onSave, onCancel }: AddEntryProps) {
  const [date, setDate] = useState(() => {
    if (existingEntry) return existingEntry.date;
    return new Date().toISOString().split("T")[0];
  });

  const [activeTab, setActiveTab] = useState<TabType>("sales");
  const [error, setError] = useState("");

  // Sales tab state
  const [saleItems, setSaleItems] = useState<SaleLineItem[]>(
    existingEntry?.saleItems || [],
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  // Expense tab state
  const [expenseItems, setExpenseItems] = useState<ExpenseLineItem[]>(
    existingEntry?.expenseItems || [],
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory>("Autre");
  const [expenseAmount, setExpenseAmount] = useState("");

  // Load stock for product dropdown
  const [stock, setStock] = useState<StockItem[]>(() => loadData().stock);

  // Calculated totals
  const totalSales = saleItems.reduce((sum, item) => sum + item.total, 0);
  const totalExpenses = expenseItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const profit = totalSales - totalExpenses;

  const handleAddSaleItem = () => {
    setError("");

    if (!selectedProductId) {
      setError(fr.entry.selectProduct);
      return;
    }

    const qty = parseInt(saleQuantity, 10);
    const total = parseInt(totalPrice, 10);

    if (isNaN(qty) || qty <= 0) {
      setError("Veuillez entrer une quantité valide");
      return;
    }

    if (isNaN(total) || total < 0) {
      setError("Veuillez entrer un prix total valide");
      return;
    }

    const product = stock.find((p) => p.id === selectedProductId);
    if (!product) {
      setError("Produit non trouvé");
      return;
    }

    if (product.quantity < qty) {
      setError(`Stock insuffisant. Disponible: ${product.quantity}`);
      return;
    }

    const newSaleItem: SaleLineItem = {
      productId: selectedProductId,
      quantity: qty,
      unitPrice: Math.round(total / qty),
      total: total,
    };

    setSaleItems([...saleItems, newSaleItem]);
    setSelectedProductId("");
    setSaleQuantity("");
    setTotalPrice("");
  };

  const handleRemoveSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleAddExpenseItem = () => {
    setError("");

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Veuillez entrer un montant valide");
      return;
    }

    const newExpenseItem: ExpenseLineItem = {
      category: selectedCategory,
      amount,
    };

    setExpenseItems([...expenseItems, newExpenseItem]);
    setExpenseAmount("");
  };

  const handleRemoveExpenseItem = (index: number) => {
    setExpenseItems(expenseItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date) {
      setError(fr.entry.date);
      return;
    }

    if (saleItems.length === 0 && expenseItems.length === 0) {
      setError("Veuillez ajouter au moins une vente ou une dépense");
      return;
    }

    onSave({
      id: existingEntry?.id || generateEntryId(),
      date,
      saleItems,
      expenseItems,
      sales: totalSales,
      expenses: totalExpenses,
      timestamp: existingEntry?.timestamp || Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
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

          {/* Tab Buttons */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab("sales");
                setError("");
              }}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "sales"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {fr.entry.addSale}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("expenses");
                setError("");
              }}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "expenses"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {fr.entry.addExpense}
            </button>
          </div>

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="product"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {fr.entry.selectProduct}
                </label>
                <select
                  id="product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- {fr.entry.selectProduct} --</option>
                  {stock.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.quantity} en stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {fr.entry.quantity}
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(e.target.value)}
                  placeholder="0"
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedProductId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {(() => {
                    const product = stock.find(
                      (p) => p.id === selectedProductId,
                    );
                    const qty = parseInt(saleQuantity, 10) || 0;
                    const unitPrice = product?.unitPrice || 0;
                    return (
                      <>
                        <div className="mb-2">
                          <label
                            htmlFor="totalPrice"
                            className="block text-sm font-semibold text-gray-700 mb-1"
                          >
                            Prix Total (CFA)
                          </label>
                          <input
                            id="totalPrice"
                            type="number"
                            value={totalPrice}
                            onChange={(e) => setTotalPrice(e.target.value)}
                            placeholder="Prix total négocié"
                            min="0"
                            className="w-full px-4 py-2 border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {parseInt(totalPrice) > 0 &&
                          parseInt(saleQuantity) > 0 && (
                            <div className="text-sm text-gray-600">
                              Prix unitaire calculé:{" "}
                              {(
                                parseInt(totalPrice) / parseInt(saleQuantity)
                              ).toLocaleString("fr-FR")}{" "}
                              CFA
                            </div>
                          )}
                      </>
                    );
                  })()}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddSaleItem}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                {fr.entry.addLineItem}
              </button>

              {/* Sale Items List */}
              {saleItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="font-semibold text-gray-900">
                    Items ajoutés:
                  </div>
                  {saleItems.map((item, index) => {
                    const product = stock.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-white p-3 rounded"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {product?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} ×{" "}
                            {item.unitPrice?.toLocaleString("fr-FR")} CFA
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {item.total.toLocaleString("fr-FR")} CFA
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSaleItem(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold"
                          >
                            {fr.entry.removeLineItem}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === "expenses" && (
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

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {fr.common.amount}
                </label>
                <div className="relative">
                  <input
                    id="amount"
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">
                    CFA
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddExpenseItem}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
              >
                {fr.entry.addLineItem}
              </button>

              {/* Expense Items List */}
              {expenseItems.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                  <div className="font-semibold text-gray-900">
                    Dépenses ajoutées:
                  </div>
                  {expenseItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-3 rounded"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {
                            fr.expenseCategories[
                              item.category as ExpenseCategory
                            ]
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-600">
                          {item.amount.toLocaleString("fr-FR")} CFA
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpenseItem(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold"
                        >
                          {fr.entry.removeLineItem}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profit Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-600 mb-1">Ventes</div>
                <div className="text-lg font-bold text-green-600">
                  {totalSales.toLocaleString("fr-FR")} CFA
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Dépenses</div>
                <div className="text-lg font-bold text-orange-600">
                  {totalExpenses.toLocaleString("fr-FR")} CFA
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Profit</div>
                <div
                  className={`text-lg font-bold ${profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : "text-gray-600"}`}
                >
                  {profit.toLocaleString("fr-FR")} CFA
                </div>
              </div>
            </div>
          </div>

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
              {fr.entry.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
