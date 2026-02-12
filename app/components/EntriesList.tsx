"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyEntry, ExpenseCategory, StockItem } from "@/types";
import {
  deleteEntry,
  getEntriesForDate,
  addOrUpdateEntry,
} from "@/lib/entries";
import { loadData } from "@/lib/storage";
import { fr } from "@/lib/i18n";
import { AddEntry } from "./AddEntry";

interface EntriesListProps {
  onBack: () => void;
}

export function EntriesList({ onBack }: EntriesListProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Load initial data once via lazy initializers
  const [stock, setStock] = useState<StockItem[]>(() => {
    return loadData().stock;
  });

  // Get entries directly from the data source, not from state
  const entries = getEntriesForDate(selectedDate);

  const refreshStock = useCallback(() => {
    setStock(loadData().stock);
  }, []);

  const handleAddEntry = (entry: DailyEntry) => {
    if (addOrUpdateEntry(entry)) {
      setShowAddEntry(false);
      setEditingEntry(undefined);
      refreshStock(); // Stock might have changed if it's a sale
    }
  };

  const handleDelete = (entryId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      if (deleteEntry(entryId)) {
        refreshStock();
      }
    }
  };

  const handleEdit = (entry: DailyEntry) => {
    setEditingEntry(entry);
    setShowAddEntry(true);
  };

  // Calculate totals - derived data, no state needed
  const dayTotal = entries.reduce(
    (acc, entry) => {
      if (entry.type === "SALE") {
        return { ...acc, sales: acc.sales + entry.amount };
      } else {
        return { ...acc, expenses: acc.expenses + entry.amount };
      }
    },
    { sales: 0, expenses: 0 },
  );

  const dayProfit = dayTotal.sales - dayTotal.expenses;

  const getProductName = (id?: string) => {
    if (!id) return "Inconnu";
    return stock.find((s) => s.id === id)?.name || "Produit supprimé";
  };

  const getCategoryName = (cat?: string) => {
    if (!cat) return "Autre";
    return fr.expenseCategories[cat as ExpenseCategory] || cat;
  };

  return (
    <div className="h-dvh flex flex-col bg-white pb-18">
      {/* bg-gray-100 */}
      {/* Header */}
      <div className="bg-linear-to-b from-blue-50 to-white px-6 pt-6 pb-8 flex items-center gap-4">
        {/* <button onClick={onBack} className="text-2xl text-gray-800">
          ←
        </button> */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrées</h1>
          <p className="text-gray-600 text-sm">Gérez vos transactions</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 overflow-auto px-6 space-y-6">
        {/* Date Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Day Summary */}
        <div className="bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Ventes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dayTotal.sales.toLocaleString("fr-FR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Dépenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dayTotal.expenses.toLocaleString("fr-FR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Profit</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  dayProfit > 0
                    ? "text-green-600"
                    : dayProfit < 0
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {dayProfit.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        {/* Add Entry Button */}
        <button
          onClick={() => {
            setEditingEntry(undefined);
            setShowAddEntry(true);
          }}
          className="w-full bg-[#60b8c0] hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
        >
          + {fr.entry.addEntry}
        </button>

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Aucune entrée pour cette date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const time = new Date(entry.timestamp).toLocaleTimeString(
                "fr-FR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              const isSale = entry.type === "SALE";
              const isStockExpense =
                entry.type === "EXPENSE" && entry.category === "Stock";

              return (
                <div
                  key={entry.id}
                  className={`border rounded-xl p-4 transition-colors ${
                    isSale
                      ? "border-green-200 bg-green-50/30 hover:border-green-300"
                      : "border-orange-200 bg-orange-50/30 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">
                          {time}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isSale
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {isSale ? "VENTE" : "DÉPENSE"}
                        </span>
                      </div>

                      {/* Main Description */}
                      <p className="font-semibold text-gray-900 text-lg">
                        {isSale
                          ? getProductName(entry.productId)
                          : isStockExpense
                            ? `Stock: ${getProductName(entry.productId)}`
                            : getCategoryName(entry.category)}
                      </p>

                      {/* Sub Details */}
                      {(isSale || isStockExpense) && (
                        <p className="text-sm text-gray-600">
                          {entry.quantity} unité(s)
                          {/* We could calculate unit price here if we want */}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          isSale ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {isSale ? "+" : "-"}{" "}
                        {entry.amount.toLocaleString("fr-FR")}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">CFA</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-black/5 mt-3">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="flex-1 py-1.5 text-xs font-semibold text-gray-600 hover:bg-black/5 rounded transition-colors"
                    >
                      {fr.common.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="flex-1 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      {fr.common.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <AddEntry
          existingEntry={editingEntry}
          onSave={handleAddEntry}
          onCancel={() => {
            setShowAddEntry(false);
            setEditingEntry(undefined);
          }}
        />
      )}
    </div>
  );
}
