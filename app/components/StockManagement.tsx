"use client";

import { fr } from "@/lib/i18n";
import { loadData, saveData } from "@/lib/storage";
import type { StockItem } from "@/types";
import { useState } from "react";
import PageWrapper from "./PageWrapper";

interface StockManagementProps {
  onBack: () => void;
}

/**
 * Generate a unique ID for a stock item
 */
function generateItemId(): string {
  return `stock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function StockManagement({ onBack }: StockManagementProps) {
  const [items, setItems] = useState<StockItem[]>(() => {
    const data = loadData();
    return data.stock;
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [threshold, setThreshold] = useState("");
  const [error, setError] = useState("");

  const refreshStock = () => {
    const data = loadData();
    setItems(data.stock);
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Veuillez entrer un nom de produit");
      return;
    }

    const qty = quantity === "" ? 0 : parseInt(quantity, 10);
    const thresh = threshold === "" ? 0 : parseInt(threshold, 10);

    if (isNaN(qty) || isNaN(thresh) || qty < 0 || thresh < 0) {
      setError("Veuillez entrer des nombres valides");
      return;
    }

    const data = loadData();

    const currentItem = editingId
      ? data.stock.find((item: StockItem) => item.id === editingId)
      : undefined;

    const newItem: StockItem = {
      id: editingId || generateItemId(),
      name: name.trim(),
      quantity: qty,
      threshold: thresh,
      unitPrice: currentItem?.unitPrice || 0,
      totalSold: currentItem?.totalSold || 0,
    };

    if (editingId) {
      const index = data.stock.findIndex((item) => item.id === editingId);
      if (index >= 0) {
        data.stock[index] = newItem;
      }
    } else {
      data.stock.push(newItem);
    }

    if (saveData(data)) {
      setName("");
      setQuantity("");
      setThreshold("");
      setEditingId(null);
      setShowAddForm(false);
      refreshStock();
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(item.quantity.toString());
    setThreshold(item.threshold.toString());
    setShowAddForm(true);
  };

  const handleDelete = (itemId: string) => {
    const data = loadData();
    data.stock = data.stock.filter((item) => item.id !== itemId);
    if (saveData(data)) {
      refreshStock();
    }
  };

  const handleCancel = () => {
    setName("");
    setQuantity("");
    setThreshold("");
    setEditingId(null);
    setShowAddForm(false);
    setError("");
  };

  const isLowStock = (item: StockItem) => item.quantity <= item.threshold;

  return (
    <PageWrapper header={<HeaderComponent />}>
      <div className="flex-1 pb-4 overflow-auto space-y-6">
        {/* Add button */}
        <button
          onClick={() => {
            handleCancel();
            setShowAddForm(true);
          }}
          className="w-full bg-[#60b8c0] hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
        >
          + {fr.stock.addProduct}
        </button>
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">
              {editingId ? "Modifier le produit" : "Ajouter un produit"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {fr.stock.productName}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tissu, Fil, Savon..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {fr.stock.quantity}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                {/* Threshold */}
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {fr.stock.threshold}
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="Min"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {fr.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#60b8c0] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Stock Items List */}
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">{fr.stock.noProducts}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`border-2 rounded-xl p-4 ${
                  isLowStock(item)
                    ? "border-amber-200 bg-amber-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      {isLowStock(item) && (
                        <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full">
                          ⚠️ Bas
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantité:{" "}
                      <span className="font-semibold">{item.quantity}</span>{" "}
                      (Seuil: {item.threshold})
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        💰{" "}
                        {item.unitPrice
                          ? item.unitPrice.toLocaleString("fr-FR")
                          : 0}{" "}
                        CFA
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        📈 Vendus: {item.totalSold || 0}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 py-2 text-sm font-semibold text-[#60b8c0] hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                  >
                    {fr.stock.edit}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Êtes-vous sûr ?")) {
                        handleDelete(item.id);
                      }
                    }}
                    className="flex-1 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                  >
                    {fr.stock.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// Define HeaderComponent outside with props
const HeaderComponent: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-gray-900">{fr.stock.inventory}</h1>
      <p className="text-gray-600 text-sm">{fr.stock.subtitle}</p>
    </div>
  );
};
