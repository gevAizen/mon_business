/**
 * Helper functions for calculating totals from new DailyEntry structure
 * Used throughout the app to get sales and expenses totals
 */

import type { DailyEntry, SaleLineItem, ExpenseLineItem } from '@/types';

/**
 * Calculate total sales from sale items
 */
export function getTotalSales(saleItems: SaleLineItem[]): number {
  return saleItems.reduce((sum, item) => sum + item.total, 0);
}

/**
 * Calculate total expenses from expense items
 */
export function getTotalExpenses(expenseItems: ExpenseLineItem[]): number {
  return expenseItems.reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Calculate profit from an entry
 */
export function getEntryProfit(entry: DailyEntry): number {
  const sales = getTotalSales(entry.saleItems);
  const expenses = getTotalExpenses(entry.expenseItems);
  return sales - expenses;
}

/**
 * Get backward-compatible total sales (handles old format entries)
 */
export function getSalesCompat(entry: DailyEntry): number {
  if (entry.saleItems && entry.saleItems.length > 0) {
    return getTotalSales(entry.saleItems);
  }
  return entry.sales || 0;
}

/**
 * Get backward-compatible total expenses (handles old format entries)
 */
export function getExpensesCompat(entry: DailyEntry): number {
  if (entry.expenseItems && entry.expenseItems.length > 0) {
    return getTotalExpenses(entry.expenseItems);
  }
  return entry.expenses || 0;
}

/**
 * Break down expenses by category
 * Returns object: { category: totalAmount, ... }
 */
export function getExpensesByCategory(entries: DailyEntry[]): Record<string, number> {
  const breakdown: Record<string, number> = {
    Stock: 0,
    Transport: 0,
    Loyer: 0,
    Salaire: 0,
    Internet: 0,
    Autre: 0,
  };

  entries.forEach((entry) => {
    entry.expenseItems.forEach((item) => {
      breakdown[item.category] = (breakdown[item.category] || 0) + item.amount;
    });
  });

  return breakdown;
}

/**
 * Get total sales from all entries in a date range
 */
export function getTotalSalesInRange(entries: DailyEntry[]): number {
  return entries.reduce((sum, entry) => sum + getSalesCompat(entry), 0);
}

/**
 * Get total expenses from all entries in a date range
 */
export function getTotalExpensesInRange(entries: DailyEntry[]): number {
  return entries.reduce((sum, entry) => sum + getExpensesCompat(entry), 0);
}
