/**
 * Expense analysis utilities
 * Functions for breaking down expenses by category and generating analytics
 */

import type { DailyEntry, ExpenseCategory, ExpenseLineItem } from "@/types";
import { EXPENSE_CATEGORIES } from "@/types";

/**
 * Sum expenses by category across all entries
 * Returns object with category as key and total amount as value
 */
export function getExpensesByCategory(entries: DailyEntry[]): Record<ExpenseCategory, number> {
  const breakdown: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
  
  // Initialize all categories to 0
  EXPENSE_CATEGORIES.forEach((category) => {
    breakdown[category] = 0;
  });

  // Sum expenses for each category
  entries.forEach((entry) => {
    entry.expenseItems.forEach((item: ExpenseLineItem) => {
      breakdown[item.category] = (breakdown[item.category] || 0) + item.amount;
    });
  });

  return breakdown;
}

/**
 * Get total expenses across all entries
 */
export function getTotalExpenses(entries: DailyEntry[]): number {
  return entries.reduce((sum, entry) => {
    const categoryTotals = getExpensesByCategory([entry]);
    return sum + Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  }, 0);
}

/**
 * Get expenses for a specific category
 */
export function getExpensesForCategory(entries: DailyEntry[], category: ExpenseCategory): number {
  return entries.reduce((sum, entry) => {
    const categoryExpenses = entry.expenseItems
      .filter((item) => item.category === category)
      .reduce((catSum, item) => catSum + item.amount, 0);
    return sum + categoryExpenses;
  }, 0);
}

/**
 * Format expense breakdown as array for pie chart/display
 * Returns sorted by amount (descending)
 */
export interface ExpenseBreakdownItem {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export function formatExpenseBreakdown(entries: DailyEntry[]): ExpenseBreakdownItem[] {
  const breakdown = getExpensesByCategory(entries);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return [];
  }

  return EXPENSE_CATEGORIES
    .map((category) => ({
      category,
      amount: breakdown[category],
      percentage: total > 0 ? Math.round((breakdown[category] / total) * 100) : 0,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Get expense ratio (expenses as % of sales)
 * Useful for business health scoring
 */
export function getExpenseRatio(entries: DailyEntry[]): number {
  const totalSales = entries.reduce((sum, entry) => {
    return sum + entry.saleItems.reduce((itemSum, item) => itemSum + item.total, 0);
  }, 0);

  const totalExpenses = getTotalExpenses(entries);

  return totalSales === 0 ? 0 : totalExpenses / totalSales;
}

/**
 * Get entries for a date range
 * Used to filter expenses by time period
 */
export function getEntriesInDateRange(
  entries: DailyEntry[],
  startDate: Date,
  endDate: Date
): DailyEntry[] {
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Get expense breakdown for current month
 */
export function getMonthlyExpenseBreakdown(): ExpenseBreakdownItem[] {
  // This will be called with entries from storage
  // Placeholder for integration
  return [];
}

/**
 * Get expense breakdown for today
 */
export function getTodayExpenseBreakdown(entries: DailyEntry[]): ExpenseBreakdownItem[] {
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = entries.filter((e) => e.date === today);
  return formatExpenseBreakdown(todayEntries);
}

/**
 * Get expense breakdown for last 7 days
 */
export function getWeeklyExpenseBreakdown(entries: DailyEntry[]): ExpenseBreakdownItem[] {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 6);

  const weekEntries = getEntriesInDateRange(entries, startDate, today);
  return formatExpenseBreakdown(weekEntries);
}

/**
 * Get expense breakdown for current month
 */
export function getCurrentMonthExpenseBreakdown(entries: DailyEntry[]): ExpenseBreakdownItem[] {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthEntries = getEntriesInDateRange(entries, startDate, endDate);
  return formatExpenseBreakdown(monthEntries);
}
