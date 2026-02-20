import { formatExpenseBreakdown } from "@/lib/expenses";
import { fr } from "@/lib/i18n";
import {
  calculateProductPerformance,
  getPerformanceCategoryDisplay,
} from "@/lib/productPerformance";
import { getTopRevenueProducts } from "@/lib/stock";
import { loadData } from "@/lib/storage";
import type { DailyEntry, StockItem } from "@/types";
import { ProductPerformance } from "@/types/performance";
import Image from "next/image";
import { useMemo, useState } from "react";
import PageWrapper from "./PageWrapper";

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

  const [performanceSortField, setPerformanceSortField] =
    useState<keyof ProductPerformance>("performanceScore");
  const [performanceSortDirection, setPerformanceSortDirection] = useState<
    "asc" | "desc"
  >("desc");

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

  // Calculate product performance
  const productPerformance = useMemo(() => {
    return calculateProductPerformance({
      entries: filteredEntries,
      stockItems: stock,
      daysToAnalyze:
        filter === "today"
          ? 1
          : filter === "week"
            ? 7
            : filter === "month"
              ? 30
              : 365,
    });
  }, [filteredEntries, stock, filter]);

  // Sort performance data
  const sortedPerformance = useMemo(() => {
    return [...productPerformance.products].sort((a, b) => {
      const aVal = a[performanceSortField];
      const bVal = b[performanceSortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return performanceSortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [productPerformance, performanceSortField, performanceSortDirection]);

  const handlePerformanceSort = (field: keyof ProductPerformance) => {
    if (field === performanceSortField) {
      setPerformanceSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setPerformanceSortField(field);
      setPerformanceSortDirection("desc");
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-700 bg-green-50";
    if (score >= 60) return "text-blue-700 bg-blue-50";
    if (score >= 40) return "text-yellow-700 bg-yellow-50";
    return "text-red-700 bg-red-50";
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("fr-FR") + " FCFA";
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1) + "%";
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString("fr-FR");
  };

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
    <PageWrapper header={<HeaderComponent onBack={onBack} />}>
      {/* Header */}
      <div className="bg-white px-6 py-4 -mt-4 rounded-xl border border-gray-300 sticky -top-6 z-10">
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
              {f === "week" && "7 jours"}
              {f === "month" && fr.analytics.thisMonth}
              {f === "all" && fr.analytics.allTime}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 pb-4 overflow-auto space-y-6">
        {/* Performance Summary Cards */}
        {productPerformance.products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">
                Chiffre d&apos;affaires
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(productPerformance.summary.totalRevenue)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Profit effectué</div>
              <div
                className={`text-lg font-bold ${productPerformance.summary.totalProfit > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {formatCurrency(productPerformance.summary.totalProfit)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Marge moyenne</div>
              <div className="text-lg font-bold text-blue-600">
                {formatPercent(productPerformance.summary.averageMargin)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Meilleur score</div>
              <div className="text-lg font-bold text-purple-600">
                {productPerformance.summary.bestByScore?.performanceScore || 0}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {productPerformance.summary.bestByScore?.productName}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <h2 className="font-bold text-gray-800">
              Performance détaillée des produits
            </h2>
          </div>

          <div className="md:hidden space-y-3">
            {productPerformance.products.map((product) => (
              <div
                key={product.productId}
                className="py-4 border-t border-gray-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {product.productName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        #{product.rankByRevenue}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          getPerformanceCategoryDisplay(
                            product.performanceCategory,
                          ).color
                        }`}
                      >
                        {
                          getPerformanceCategoryDisplay(
                            product.performanceCategory,
                          ).icon
                        }{" "}
                        {
                          getPerformanceCategoryDisplay(
                            product.performanceCategory,
                          ).label
                        }
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(product.performanceScore)}`}
                  >
                    {product.performanceScore}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Chiffre d&apos;affaires
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                    {/* Show projected if there's unrealized value */}
                    {product.unrealizedValue > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Prévision: {formatCurrency(product.projectedRevenue)}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-1">Profit</p>
                    <div>
                      <p
                        className={`font-medium ${product.realizedProfit > 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {formatCurrency(product.realizedProfit)}
                      </p>
                      {/* Show potential recovery */}
                      {product.currentStock > 0 &&
                        product.unrealizedValue > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            +{formatCurrency(product.unrealizedValue)} en stock
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-1">Marge</p>
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          product.profitMargin > 30
                            ? "bg-green-100 text-green-700"
                            : product.profitMargin > 15
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {formatPercent(product.profitMargin)}
                      </span>
                      {/* Show projected margin if different */}
                      {product.currentStock > 0 &&
                        Math.abs(
                          product.projectedMargin - product.profitMargin,
                        ) > 1 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatPercent(product.projectedMargin)} si tout
                            vendu
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-1">Ventes</p>
                    <p className="text-gray-900">
                      {formatNumber(product.unitsSold)} /{" "}
                      {formatNumber(product.initialStock)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatPercent(product.realizationRate)} vendu
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-1">Stock</p>
                    <p
                      className={
                        product.currentStock < 10
                          ? "text-red-600 font-medium"
                          : "text-gray-900"
                      }
                    >
                      {formatNumber(product.currentStock)}
                    </p>
                    {product.daysOfStockLeft !== Infinity && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        ~{Math.round(product.daysOfStockLeft)} jours restants
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-1">Efficacité</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 text-xs">
                        {formatPercent(product.stockEfficiency)}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 rounded-full h-1.5"
                          style={{
                            width: `${Math.min(product.stockEfficiency, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-medium uppercase text-xs">
                <th className="pb-2 font-semibold">Produit</th>
                <th
                  className="pb-2 text-right font-semibold cursor-pointer hover:text-gray-600"
                  onClick={() => handlePerformanceSort("totalRevenue")}
                >
                  Chiffre d&apos;affaires{" "}
                  {performanceSortField === "totalRevenue" &&
                    (performanceSortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="pb-2 text-right font-semibold cursor-pointer hover:text-gray-600"
                  onClick={() => handlePerformanceSort("realizedProfit")}
                >
                  Profit{" "}
                  {performanceSortField === "realizedProfit" &&
                    (performanceSortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="pb-2 text-right font-semibold cursor-pointer hover:text-gray-600"
                  onClick={() => handlePerformanceSort("profitMargin")}
                >
                  Marge{" "}
                  {performanceSortField === "profitMargin" &&
                    (performanceSortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="pb-2 text-right font-semibold cursor-pointer hover:text-gray-600"
                  onClick={() => handlePerformanceSort("unitsSold")}
                >
                  Ventes{" "}
                  {performanceSortField === "unitsSold" &&
                    (performanceSortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="pb-2 text-right font-semibold cursor-pointer hover:text-gray-600"
                  onClick={() => handlePerformanceSort("currentStock")}
                >
                  Stock{" "}
                  {performanceSortField === "currentStock" &&
                    (performanceSortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="pb-2 text-right font-semibold cursor-pointer hover:text-gray-600"
                  onClick={() => handlePerformanceSort("stockEfficiency")}
                >
                  Efficacité{" "}
                  {performanceSortField === "stockEfficiency" &&
                    (performanceSortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="pb-2 text-right font-semibold cursor-pointer hover:text-gray-600"
                  onClick={() => handlePerformanceSort("performanceScore")}
                >
                  Score{" "}
                  {performanceSortField === "performanceScore" &&
                    (performanceSortDirection === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedPerformance.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  {/* Product Name + Category */}
                  <td className="py-3 font-medium text-gray-800">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {product.productName}
                        <span className="text-xs text-gray-400">
                          #{product.rankByRevenue}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                          getPerformanceCategoryDisplay(
                            product.performanceCategory,
                          ).color
                        }`}
                      >
                        {
                          getPerformanceCategoryDisplay(
                            product.performanceCategory,
                          ).icon
                        }{" "}
                        {
                          getPerformanceCategoryDisplay(
                            product.performanceCategory,
                          ).label
                        }
                      </span>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="py-3 text-right font-medium text-gray-900">
                    <div className="flex flex-col items-end gap-0.5">
                      <span>{formatCurrency(product.totalRevenue)}</span>
                      {product.unrealizedValue > 0 && (
                        <span className="text-xs text-gray-400">
                          +{formatCurrency(product.unrealizedValue)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Profit */}
                  <td className="py-3 text-right font-medium">
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className={
                          product.realizedProfit > 0
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {formatCurrency(product.realizedProfit)}
                      </span>
                      {product.currentStock > 0 &&
                        product.projectedProfit !== product.realizedProfit && (
                          <span className="text-xs text-gray-400">
                            {formatCurrency(product.projectedProfit)}
                          </span>
                        )}
                    </div>
                  </td>

                  {/* Margin */}
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.profitMargin > 30
                            ? "bg-green-100 text-green-700"
                            : product.profitMargin > 15
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {formatPercent(product.profitMargin)}
                      </span>
                      {product.currentStock > 0 &&
                        Math.abs(
                          product.projectedMargin - product.profitMargin,
                        ) > 1 && (
                          <span className="text-xs text-gray-400">
                            {formatPercent(product.projectedMargin)}
                          </span>
                        )}
                    </div>
                  </td>

                  {/* Sales */}
                  <td className="py-3 text-right text-gray-600">
                    <div className="flex flex-col items-end gap-0.5">
                      <span>{formatNumber(product.unitsSold)}</span>
                      <span className="text-xs text-gray-400">
                        sur {formatNumber(product.initialStock)} (
                        {formatPercent(product.realizationRate)})
                      </span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className={
                          product.currentStock < 10
                            ? "text-red-600 font-medium"
                            : "text-gray-600"
                        }
                      >
                        {formatNumber(product.currentStock)}
                      </span>
                      {product.daysOfStockLeft !== Infinity && (
                        <span className="text-xs text-gray-400">
                          ~{Math.round(product.daysOfStockLeft)}j
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Efficiency */}
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-gray-600">
                        {formatPercent(product.stockEfficiency)}
                      </span>
                      <div className="w-12 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 rounded-full h-1.5"
                          style={{
                            width: `${Math.min(product.stockEfficiency, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(product.performanceScore)}`}
                    >
                      {product.performanceScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expense Breakdown Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
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
    </PageWrapper>
  );
}

// Define HeaderComponent outside with props
interface HeaderProps {
  onBack: () => void;
}
const HeaderComponent: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-start">
      <button
        onClick={onBack}
        className="p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Image src="/img/back_arrow.png" width={30} height={30} alt="Go back" />
      </button>
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {fr.analytics.title}
        </h1>

        <p className="text-gray-600 text-sm">{fr.analytics.subtitle}</p>
      </div>
    </div>
  );
};
