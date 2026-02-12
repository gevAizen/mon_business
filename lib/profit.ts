/**
 * Profit calculation utilities
 * Pure functions for calculating business metrics
 * All calculations are deterministic and testable
 */

import type { DailyEntry } from "@/types";

/**
 * Calculate profit for a single entry
 * Returns negative value if expenses exceed sales (business loss)
 */
export function calculateProfit(sales: number, expenses: number): number {
  return sales - expenses;
}

/**
 * Get today's profit
 */
export function getTodayProfit(entries: DailyEntry[]): number {
  const today = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === today);
  if (!todayEntry) return 0;
  return calculateProfit(todayEntry.sales, todayEntry.expenses);
}

/**
 * Get month profit (current month)
 */
export function getMonthlyProfit(entries: DailyEntry[]): number {
  const now = new Date();
  const currentMonth = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

  return entries
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + calculateProfit(e.sales, e.expenses), 0);
}

/**
 * Get average daily profit for a given number of days (including today)
 */
export function getAverageDailyProfit(entries: DailyEntry[], days: number = 7): number {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (days - 1));

  const filteredEntries = entries.filter((e) => {
    const entryDate = new Date(e.date);
    return entryDate >= startDate && entryDate <= today;
  });

  if (filteredEntries.length === 0) return 0;

  const totalProfit = filteredEntries.reduce((sum, e) => sum + calculateProfit(e.sales, e.expenses), 0);
  return Math.round((totalProfit / filteredEntries.length) * 100) / 100;
}

/**
 * Get last 7 days trend: positive/negative/stable
 * Returns: 1 (increasing), -1 (decreasing), 0 (stable)
 */
export function getLast7DaysTrend(entries: DailyEntry[]): number {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 6);

  const last7Days = entries.filter((e) => {
    const entryDate = new Date(e.date);
    return entryDate >= startDate && entryDate <= today;
  });

  if (last7Days.length < 2) return 0;

  // Split into first half and second half
  const midpoint = Math.floor(last7Days.length / 2);
  const firstHalf = last7Days.slice(0, midpoint);
  const secondHalf = last7Days.slice(midpoint);

  const firstHalfAvg =
    firstHalf.reduce((sum, e) => sum + calculateProfit(e.sales, e.expenses), 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, e) => sum + calculateProfit(e.sales, e.expenses), 0) / secondHalf.length;

  if (secondHalfAvg > firstHalfAvg * 1.05) return 1; // 5% increase threshold
  if (secondHalfAvg < firstHalfAvg * 0.95) return -1; // 5% decrease threshold
  return 0;
}

/**
 * Get expense ratio (expenses as % of sales)
 * Returns 0-1 (or higher if expenses exceed sales)
 */
export function getExpenseRatio(entries: DailyEntry[], days: number = 7): number {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (days - 1));

  const filteredEntries = entries.filter((e) => {
    const entryDate = new Date(e.date);
    return entryDate >= startDate && entryDate <= today;
  });

  if (filteredEntries.length === 0) return 0;

  const totalSales = filteredEntries.reduce((sum, e) => sum + e.sales, 0);
  const totalExpenses = filteredEntries.reduce((sum, e) => sum + e.expenses, 0);

  return totalSales === 0 ? 0 : totalExpenses / totalSales;
}

/**
 * Get missing entry count for last N days
 */
export function getMissingEntryCount(entries: DailyEntry[], days: number = 7): number {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (days - 1));

  let count = 0;
  const current = new Date(startDate);

  while (current <= today) {
    const dateString = current.toISOString().split("T")[0];
    if (!entries.find((e) => e.date === dateString)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Get week-over-week growth percentage
 */
export function getWeeklyGrowth(entries: DailyEntry[]): number {
  const today = new Date();

  // Current week (last 7 days)
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(currentWeekStart.getDate() - 6);

  // Previous week
  const prevWeekStart = new Date(currentWeekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(currentWeekStart);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);

  const currentWeekProfit = entries
    .filter((e) => {
      const d = new Date(e.date);
      return d >= currentWeekStart && d <= today;
    })
    .reduce((sum, e) => sum + calculateProfit(e.sales, e.expenses), 0);

  const prevWeekProfit = entries
    .filter((e) => {
      const d = new Date(e.date);
      return d >= prevWeekStart && d <= prevWeekEnd;
    })
    .reduce((sum, e) => sum + calculateProfit(e.sales, e.expenses), 0);

  if (prevWeekProfit === 0) return 0;
  return ((currentWeekProfit - prevWeekProfit) / prevWeekProfit) * 100;
}
