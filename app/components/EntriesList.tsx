"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyEntry } from "@/types";
import {
  deleteEntry,
  getEntriesForDate,
  addOrUpdateEntry,
} from "@/lib/entries";
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
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  const refreshEntries = useCallback(() => {
    setEntries(getEntriesForDate(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const handleAddEntry = (entry: DailyEntry) => {
    if (addOrUpdateEntry(entry)) {
      setShowAddEntry(false);
      setEditingEntry(undefined);
      refreshEntries();
    }
  };

  const handleDelete = (entryId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      if (deleteEntry(entryId)) {
        refreshEntries();
      }
    }
  };

  const handleEdit = (entry: DailyEntry) => {
    setEditingEntry(entry);
    setShowAddEntry(true);
  };

  const dayTotal = entries.reduce(
    (acc, entry) => ({
      sales: acc.sales + entry.sales,
      expenses: acc.expenses + entry.expenses,
    }),
    { sales: 0, expenses: 0 },
  );

  const dayProfit = dayTotal.sales - dayTotal.expenses;

  return (
    <div className="min-h-screen bg-white pb-24">
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
      <div className="px-6 space-y-6">
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
              const entryProfit = entry.sales - entry.expenses;
              const time = entry.timestamp
                ? new Date(entry.timestamp).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              return (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">
                        {time}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-xs text-gray-600">Ventes</p>
                          <p className="font-semibold text-gray-900">
                            {entry.sales.toLocaleString("fr-FR")} CFA
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Dépenses</p>
                          <p className="font-semibold text-gray-900">
                            {entry.expenses.toLocaleString("fr-FR")} CFA
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-right ${
                        entryProfit > 0
                          ? "text-green-600"
                          : entryProfit < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      <p className="text-xs font-semibold">Profit</p>
                      <p className="text-lg font-bold">
                        {entryProfit.toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="flex-1 py-2 text-sm font-semibold text-[#60b8c0] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {fr.common.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="flex-1 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
