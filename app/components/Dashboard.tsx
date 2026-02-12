import { useState, useEffect } from "react";
import type { BusinessSettings, DailyEntry } from "@/types";
import { loadData } from "@/lib/storage";
import {
  getTodayProfit,
  getMonthlyProfit,
  getLast7DaysTrend,
} from "@/lib/profit";
import {
  calculateHealthScore,
  getHealthScoreColor,
  getHealthScoreEmoji,
} from "@/lib/healthScore";
import {
  getLowStockItems,
  getTopSellingProducts,
  type LowStockItem,
} from "@/lib/stock";
import { fr } from "@/lib/i18n";
import { AddEntry } from "./AddEntry";
import { addOrUpdateEntry } from "@/lib/entries";
import { Page } from "../page";

interface DashboardProps {
  settings: BusinessSettings;
  onNavigate: (page: Page) => void;
}

export function Dashboard({ settings, onNavigate }: DashboardProps) {
  // Initialize with empty array, load in useEffect
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [stockData, setStockData] = useState<{
    lowStock: LowStockItem[];
    topProducts: ReturnType<typeof getTopSellingProducts>;
  }>({ lowStock: [], topProducts: [] });

  // Load entries on mount and whenever page becomes visible
  useEffect(() => {
    const loadEntries = () => {
      const data = loadData();
      setEntries(data.entries);

      // Calculate dashboard stock data
      setStockData({
        lowStock: getLowStockItems(data.stock).slice(0, 3), // Top 3 low stock
        topProducts: getTopSellingProducts(data.stock, 3), // Top 3 sellers
      });
    };

    loadEntries();

    // Also refresh when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadEntries();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ✅ Derived values (no state, no effects)
  const todayProfit = getTodayProfit(entries);
  const monthlyProfit = getMonthlyProfit(entries);
  const healthScore = calculateHealthScore(entries, settings.dailyTarget);
  const trend = getLast7DaysTrend(entries);

  const handleAddEntry = (entry: DailyEntry) => {
    if (addOrUpdateEntry(entry)) {
      setShowAddEntry(false);

      // Refresh entries from storage
      const updatedData = loadData();
      setEntries(updatedData.entries);

      // Update stock data as well since sales change stock and top sellers
      setStockData({
        lowStock: getLowStockItems(updatedData.stock).slice(0, 3),
        topProducts: getTopSellingProducts(updatedData.stock, 3),
      });
    }
  };

  const getTrendEmoji = () => {
    if (trend === 1) return "📈";
    if (trend === -1) return "📉";
    return "→";
  };

  const getTrendText = () => {
    if (trend === 1) return fr.dashboard.trendUp;
    if (trend === -1) return fr.dashboard.trendDown;
    return fr.dashboard.trendStable;
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header with greeting */}
      <div className="bg-linear-to-b from-blue-50 to-white px-6 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {fr.dashboard.greeting}, {settings.name}
        </h1>
        <p className="text-gray-600 text-sm">{fr.dashboard.subtitle}</p>
      </div>

      {/* Main content */}
      <div className="px-6 space-y-6">
        {/* Health Score - Large visual card */}
        <div
          className={`rounded-2xl p-6 ${getHealthScoreColor(
            healthScore.score,
          )} border border-current border-opacity-20`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold opacity-75">
                {fr.dashboard.healthScore}
              </p>
              <div className="text-5xl font-bold mt-2 flex items-center gap-2">
                <div className="flex items-end">
                  {(healthScore.score * 10).toFixed(0)}
                  <span className="text-base">/100</span>
                </div>
                <span className="text-3xl">
                  {getHealthScoreEmoji(healthScore.score)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{healthScore.message}</p>
        </div>

        {/* Today's profit and Monthly profit - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Today */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              {fr.dashboard.todayProfit}
            </p>
            <p
              className={`text-2xl font-bold ${
                todayProfit > 0
                  ? "text-green-600"
                  : todayProfit < 0
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {todayProfit.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-gray-500 mt-1">CFA</p>
          </div>

          {/* This Month */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              {fr.dashboard.monthlyProfit}
            </p>
            <p
              className={`text-2xl font-bold ${
                monthlyProfit > 0
                  ? "text-green-600"
                  : monthlyProfit < 0
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {monthlyProfit.toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-gray-500 mt-1">CFA</p>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600">
              {fr.dashboard.trendLabel}
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {getTrendText()}
            </p>
          </div>
          <span className="text-4xl">{getTrendEmoji()}</span>
        </div>

        {/* Low Stock Alert Section */}
        {stockData.lowStock.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <span>⚠️</span> {fr.dashboard.lowStockAlert}
              </h3>
              <button
                onClick={() => onNavigate("stock")}
                className="text-xs font-semibold text-amber-700 hover:underline"
              >
                {fr.dashboard.viewAll}
              </button>
            </div>
            <div className="space-y-2">
              {stockData.lowStock.map(({ item }) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm bg-white/50 p-2 rounded"
                >
                  <span className="font-medium text-amber-900 truncate flex-1">
                    {item.name}
                  </span>
                  <span className="text-amber-700 font-bold ml-2">
                    {item.quantity} / {item.threshold}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performers Section */}
        {stockData.topProducts.length > 0 && (
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2">
                <span>⭐</span> {fr.dashboard.topPerformers}
              </h3>
              <button
                onClick={() => onNavigate("analytics")}
                className="text-xs font-semibold text-indigo-700 hover:underline"
              >
                {fr.dashboard.analyticsButton}
              </button>
            </div>
            <div className="space-y-2">
              {stockData.topProducts.map(({ item, totalSold }) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm bg-white/50 p-2 rounded"
                >
                  <span className="font-medium text-indigo-900 truncate flex-1">
                    {item.name}
                  </span>
                  <span className="text-indigo-700 font-bold ml-2">
                    {totalSold} {fr.analytics.unitsSold.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
            {/* View Analytics Button */}
            <button
              onClick={() => onNavigate("analytics")}
              className="w-full mt-3 py-2 text-xs font-semibold text-indigo-700 bg-white/60 hover:bg-white/80 rounded transition-colors text-center"
            >
              {fr.dashboard.viewAll} {fr.dashboard.analyticsButton}
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => setShowAddEntry(true)}
            className="w-full bg-[#60b8c0] hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
          >
            {fr.dashboard.addEntryButton}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate("entries")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
            >
              {fr.dashboard.entriesButton}
            </button>
            <button
              onClick={() => onNavigate("stock")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
            >
              {fr.dashboard.stockButton}
            </button>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <AddEntry
          onSave={handleAddEntry}
          onCancel={() => setShowAddEntry(false)}
        />
      )}
    </div>
  );
}
