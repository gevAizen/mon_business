"use client";

import { useState, useEffect } from "react";
import type { BusinessSettings, DailyEntry } from "@/types";
import { loadData } from "@/lib/storage";
import { getTodayProfit, getMonthlyProfit, getLast7DaysTrend } from "@/lib/profit";
import { calculateHealthScore, getHealthScoreColor, getHealthScoreEmoji } from "@/lib/healthScore";
import { fr } from "@/lib/i18n";
import { AddEntry } from "./AddEntry";
import { addOrUpdateEntry } from "@/lib/entries";

interface DashboardProps {
  settings: BusinessSettings;
  onNavigate: (page: string) => void;
}

export function Dashboard({ settings, onNavigate }: DashboardProps) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [todayProfit, setTodayProfit] = useState(0);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [healthScore, setHealthScore] = useState({ score: 0, message: "" });
  const [trend, setTrend] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    loadData();
    refreshData();
  }, []);

  const refreshData = () => {
    const data = loadData();
    setEntries(data.entries);

    const today = getTodayProfit(data.entries);
    const month = getMonthlyProfit(data.entries);
    const score = calculateHealthScore(data.entries, settings.dailyTarget);
    const t = getLast7DaysTrend(data.entries);

    setTodayProfit(today);
    setMonthlyProfit(month);
    setHealthScore(score);
    setTrend(t);

    // Count low stock items
    const lowStockItems = data.stock.filter((item) => item.quantity <= item.threshold);
    setLowStockCount(lowStockItems.length);
  };

  const handleAddEntry = (entry: DailyEntry) => {
    if (addOrUpdateEntry(entry)) {
      setShowAddEntry(false);
      refreshData();
    }
  };

  const getTrendEmoji = () => {
    if (trend === 1) return "📈";
    if (trend === -1) return "📉";
    return "→";
  };

  const getTrendText = () => {
    if (trend === 1) return "En croissance";
    if (trend === -1) return "En baisse";
    return "Stable";
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header with greeting */}
      <div className="bg-gradient-to-b from-blue-50 to-white px-6 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {fr.dashboard.greeting}, {settings.name}
        </h1>
        <p className="text-gray-600 text-sm">Voici l'état de votre business</p>
      </div>

      {/* Main content */}
      <div className="px-6 space-y-6">
        {/* Health Score - Large visual card */}
        <div
          className={`rounded-2xl p-6 ${getHealthScoreColor(
            healthScore.score
          )} border border-current border-opacity-20`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold opacity-75">{fr.dashboard.healthScore}</p>
              <div className="text-5xl font-bold mt-2 flex items-center gap-2">
                {(healthScore.score * 10).toFixed(0)}
                <span className="text-3xl">{getHealthScoreEmoji(healthScore.score)}</span>
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{healthScore.message}</p>
        </div>

        {/* Today's profit and Monthly profit - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Today */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">{fr.dashboard.todayProfit}</p>
            <p className={`text-2xl font-bold ${todayProfit > 0 ? "text-green-600" : "text-gray-600"}`}>
              {todayProfit.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-gray-500 mt-1">CFA</p>
          </div>

          {/* This Month */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">{fr.dashboard.monthlyProfit}</p>
            <p className={`text-2xl font-bold ${monthlyProfit > 0 ? "text-green-600" : "text-gray-600"}`}>
              {monthlyProfit.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-gray-500 mt-1">CFA</p>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600">Tendance (7 jours)</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{getTrendText()}</p>
          </div>
          <span className="text-4xl">{getTrendEmoji()}</span>
        </div>

        {/* Low stock warning */}
        {lowStockCount > 0 && (
          <button
            onClick={() => onNavigate("stock")}
            className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-left hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600">⚠️ Stock faible</p>
                <p className="text-sm font-semibold text-amber-900 mt-1">
                  {lowStockCount} produit{lowStockCount > 1 ? "s" : ""} sous le seuil
                </p>
              </div>
              <span className="text-xl">→</span>
            </div>
          </button>
        )}

        {/* Quick Actions */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => setShowAddEntry(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
          >
            + Ajouter une entrée
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate("entries")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
            >
              📋 Entrées
            </button>
            <button
              onClick={() => onNavigate("stock")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
            >
              📦 Stock
            </button>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && <AddEntry onSave={handleAddEntry} onCancel={() => setShowAddEntry(false)} />}
    </div>
  );
}
