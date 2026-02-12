import { formatExpenseBreakdown } from "@/lib/expenses";
import { fr } from "@/lib/i18n";
import { getTopRevenueProducts } from "@/lib/stock";
import { loadData } from "@/lib/storage";
import type { DailyEntry, StockItem } from "@/types";
import { useState } from "react";

interface AnalyticsProps {
  onBack: () => void;
}

type TimeFilter = "today" | "week" | "month" | "all";

export function Analytics({ onBack }: AnalyticsProps) {
  const [entries, setEntries] = useState<DailyEntry[]>(() => {
    return loadData().entries;
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    return loadData().stock;
  });

  const [filter, setFilter] = useState<TimeFilter>("month");

  // Remove expenseData and topProducts from state entirely

  // Filter entries based on selected time range
  const now = new Date();
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);

    if (filter === "today") {
      return entryDate.toDateString() === now.toDateString();
    }
    if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return entryDate >= weekAgo;
    }
    if (filter === "month") {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }
    return true; // 'all'
  });

  // Calculate these directly, not in useEffect
  const expenseData = formatExpenseBreakdown(filteredEntries);
  const topProducts = getTopRevenueProducts(stock, filteredEntries, 5);

  // Colors for expense categories
  const categoryColors: Record<string, string> = {
    Stock: "bg-blue-500",
    Transport: "bg-amber-500",
    Loyer: "bg-red-500",
    Salaire: "bg-green-500",
    Internet: "bg-cyan-500",
    Autre: "bg-gray-400",
  };

  const getTimeLabel = () => {
    switch (filter) {
      case "today":
        return fr.analytics.today;
      case "week":
        return "7 Jours";
      case "month":
        return fr.analytics.thisMonth;
      case "all":
        return fr.analytics.allTime;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {fr.analytics.title}
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(["today", "week", "month", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filter === f
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "today" && fr.analytics.today}
              {f === "week" && "7J"}
              {f === "month" && fr.analytics.thisMonth}
              {f === "all" && fr.analytics.allTime}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Expense Breakdown Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <h2 className="font-bold text-gray-800">
              {fr.analytics.expenseBreakdown}
            </h2>
          </div>

          {expenseData.length > 0 ? (
            <div className="space-y-4">
              {/* Visual Bar Representation (Pseudo-Pie) */}
              <div className="h-4 w-full flex rounded-full overflow-hidden bg-gray-100">
                {expenseData.map((item) => (
                  <div
                    key={item.category}
                    style={{ width: `${item.percentage}%` }}
                    className={`${categoryColors[item.category] || "bg-gray-300"}`}
                  />
                ))}
              </div>

              {/* Legend List */}
              <div className="space-y-3">
                {expenseData.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${categoryColors[item.category] || "bg-gray-300"}`}
                      />
                      <span className="text-gray-700 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 font-semibold">
                        {item.amount.toLocaleString("fr-FR")} CFA
                      </span>
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>{fr.analytics.noExpenses}</p>
            </div>
          )}
        </div>

        {/* Top Products Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📈</span>
            <h2 className="font-bold text-gray-800">
              {fr.analytics.topProducts}
            </h2>
          </div>

          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-medium uppercase text-xs">
                    <th className="pb-2 font-semibold">Produit</th>
                    <th className="pb-2 text-right font-semibold">Ventes</th>
                    <th className="pb-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.map((p, idx) => (
                    <tr key={p.item.id}>
                      <td className="py-3 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-normal w-4">
                            #{idx + 1}
                          </span>
                          {p.item.name}
                        </div>
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {p.unitsSold}
                      </td>
                      <td className="py-3 text-right font-bold text-gray-900">
                        {p.totalRevenue.toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>{fr.analytics.noProducts}</p>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
          <p className="text-xs text-blue-600 font-medium uppercase mb-1">
            Total Dépenses ({getTimeLabel()})
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {expenseData
              .reduce((sum, item) => sum + item.amount, 0)
              .toLocaleString("fr-FR")}{" "}
            CFA
          </p>
        </div>
      </div>
    </div>
  );
}
