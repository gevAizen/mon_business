/**
 * Stock management utilities
 * Functions for tracking inventory, detecting low stock, and calculating top sellers
 */

import type { StockItem, DailyEntry, SaleLineItem } from "@/types";

/**
 * Update stock item quantity after a sale
 * Decrements stock by quantity sold
 * Returns new stock level (or null if product not found)
 */
export function deductStockFromSale(
  stockItems: StockItem[],
  productId: string,
  quantity: number,
): number | null {
  const item = stockItems.find((s) => s.id === productId);
  if (!item) return null;

  const newQuantity = Math.max(0, item.quantity - quantity);
  return newQuantity;
}

/**
 * Apply all sales from an entry to stock items
 * Updates both quantity (decrements) and totalSold (increments)
 */
export function applyEntryToStock(
  stockItems: StockItem[],
  saleItems: SaleLineItem[],
): StockItem[] {
  const updatedItems = [...stockItems];

  saleItems.forEach((sale) => {
    const itemIndex = updatedItems.findIndex((s) => s.id === sale.productId);
    if (itemIndex >= 0) {
      const currentRevenue =
        updatedItems[itemIndex].totalSold *
        (updatedItems[itemIndex].unitPrice || 0);
      const newRevenue = currentRevenue + sale.total;
      const newTotalSold = updatedItems[itemIndex].totalSold + sale.quantity;
      const newAveragePrice = newTotalSold > 0 ? newRevenue / newTotalSold : 0;

      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: Math.max(0, updatedItems[itemIndex].quantity - sale.quantity),
        totalSold: newTotalSold,
        unitPrice: Math.round(newAveragePrice),
      };
    }
  });

  return updatedItems;
}

/**
 * Get all items with low stock (quantity <= threshold)
 * Returns sorted by severity (lowest stock first)
 */
export interface LowStockItem {
  item: StockItem;
  remainingPercentage: number; // quantity / threshold * 100
}

export function getLowStockItems(stockItems: StockItem[]): LowStockItem[] {
  return stockItems
    .filter((item) => item.quantity <= item.threshold)
    .map((item) => ({
      item,
      remainingPercentage:
        item.threshold > 0 ? (item.quantity / item.threshold) * 100 : 0,
    }))
    .sort((a, b) => a.remainingPercentage - b.remainingPercentage);
}

/**
 * Check if a specific item is low on stock
 */
export function isLowStock(item: StockItem): boolean {
  return item.quantity <= item.threshold;
}

/**
 * Get top N best-selling products
 * Sorted by totalSold (descending)
 */
export interface TopSellingProduct {
  item: StockItem;
  totalSold: number;
  currentStock: number;
}

export function getTopSellingProducts(
  stockItems: StockItem[],
  limit: number = 5,
): TopSellingProduct[] {
  return stockItems
    .filter((item) => item.totalSold > 0)
    .map((item) => ({
      item,
      totalSold: item.totalSold,
      currentStock: item.quantity,
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
}

/**
 * Get top N best-performing products by revenue
 * Uses entries to calculate total revenue per product
 */
export interface TopRevenueProduct {
  item: StockItem;
  totalRevenue: number;
  unitsSold: number;
  averagePrice: number;
}

export function getTopRevenueProducts(
  stockItems: StockItem[],
  entries: DailyEntry[],
  limit: number = 5,
): TopRevenueProduct[] {
  const productRevenue: Record<string, { revenue: number; units: number }> = {};

  entries.forEach((entry) => {
    entry.saleItems.forEach((sale) => {
      if (!productRevenue[sale.productId]) {
        productRevenue[sale.productId] = { revenue: 0, units: 0 };
      }
      productRevenue[sale.productId].revenue += sale.total;
      productRevenue[sale.productId].units += sale.quantity;
    });
  });

  return stockItems
    .filter(
      (item) => productRevenue[item.id] && productRevenue[item.id].revenue > 0,
    )
    .map((item) => {
      const data = productRevenue[item.id];
      return {
        item,
        totalRevenue: data.revenue,
        unitsSold: data.units,
        averagePrice: data.units > 0 ? data.revenue / data.units : 0,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

/**
 * Get inventory value (quantity * estimated unit price or cost)
 * Returns total value across all stock
 */
export function getInventoryValue(stockItems: StockItem[]): number {
  return stockItems.reduce((total, item) => {
    const unitPrice = item.unitPrice || 0;
    return total + item.quantity * unitPrice;
  }, 0);
}

/**
 * Get inventory turnover ratio (units sold per day)
 * Useful for business analytics
 */
export function getInventoryTurnover(
  stockItems: StockItem[],
  daysTracked: number = 30,
): number {
  if (daysTracked <= 0) return 0;

  const totalUnitsSold = stockItems.reduce(
    (sum, item) => sum + item.totalSold,
    0,
  );
  return daysTracked > 0 ? totalUnitsSold / daysTracked : 0;
}

/**
 * Get stock health status
 * Returns a summary of stock situation
 */
export interface StockHealthStatus {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  wellStockedCount: number;
  averageStock: number;
}

export function getStockHealthStatus(
  stockItems: StockItem[],
): StockHealthStatus {
  const lowStockCount = stockItems.filter(
    (item) => item.quantity > 0 && item.quantity <= item.threshold,
  ).length;
  const outOfStockCount = stockItems.filter(
    (item) => item.quantity === 0,
  ).length;
  const wellStockedCount = stockItems.filter(
    (item) => item.quantity > item.threshold,
  ).length;
  const averageStock =
    stockItems.length > 0
      ? stockItems.reduce((sum, item) => sum + item.quantity, 0) /
        stockItems.length
      : 0;

  return {
    totalItems: stockItems.length,
    lowStockCount,
    outOfStockCount,
    wellStockedCount,
    averageStock: Math.round(averageStock * 100) / 100,
  };
}

/**
 * Find a product by ID
 */
export function findProductById(
  stockItems: StockItem[],
  productId: string,
): StockItem | undefined {
  return stockItems.find((item) => item.id === productId);
}

/**
 * Check if product exists in stock
 */
export function productExists(
  stockItems: StockItem[],
  productId: string,
): boolean {
  return stockItems.some((item) => item.id === productId);
}
