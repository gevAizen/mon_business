'use client';

import { fr } from '@/lib/i18n';
import type { DailyEntry } from '@/types';
import { useState } from 'react';

interface AddEntryProps {
  existingEntry?: DailyEntry;
  onSave: (entry: DailyEntry) => void;
  onCancel: () => void;
}

/**
 * Generate a unique ID for an entry
 * Users can add multiple entries per day, each needs a unique ID
 */
function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function AddEntry({ existingEntry, onSave, onCancel }: AddEntryProps) {
  const [date, setDate] = useState(() => {
    if (existingEntry) return existingEntry.date;
    return new Date().toISOString().split('T')[0];
  });

  const [sales, setSales] = useState(() =>
    existingEntry ? existingEntry.sales.toString() : '',
  );

  const [expenses, setExpenses] = useState(() =>
    existingEntry ? existingEntry.expenses.toString() : '',
  );

  const [error, setError] = useState('');

  //  Derived values (no state, no effect)
  const salesNum = parseFloat(sales) || 0;
  const expensesNum = parseFloat(expenses) || 0;
  const profit = Math.max(salesNum - expensesNum, 0);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Veuillez sélectionner une date');
      return;
    }

    if (salesNum < 0 || expensesNum < 0) {
      setError('Les montants ne peuvent pas être négatifs');
      return;
    }

    if (salesNum === 0 && expensesNum === 0) {
      setError('Veuillez entrer au moins des ventes ou des dépenses');
      return;
    }

    // Create new format entry with backward compat fields
    onSave({
      id: existingEntry?.id || generateEntryId(),
      date,
      saleItems: salesNum > 0 ? [{
        productId: "_manual_",
        quantity: 1,
        total: salesNum,
      }] : [],
      expenseItems: expensesNum > 0 ? [{
        category: "Autre",
        amount: expensesNum,
      }] : [],
      sales: salesNum,
      expenses: expensesNum,
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800  focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          {/* Sales */}
          <div>
            <label
              htmlFor="sales"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {fr.entry.sales}
            </label>
            <div className="relative">
              <input
                id="sales"
                type="number"
                value={sales}
                onChange={(e) => setSales(e.target.value)}
                placeholder={fr.entry.salesPlaceholder}
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800  focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
              <span className="absolute right-4 top-3 text-gray-500 text-base">
                CFA
              </span>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <label
              htmlFor="expenses"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {fr.entry.expenses}
            </label>
            <div className="relative">
              <input
                id="expenses"
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                placeholder={fr.entry.expensesPlaceholder}
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800  focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
              <span className="absolute right-4 top-3 text-gray-500 text-base">
                CFA
              </span>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">{fr.entry.profit}</div>
            <div
              className={`text-3xl font-bold ${
                profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {profit.toLocaleString('fr-FR')} CFA
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
