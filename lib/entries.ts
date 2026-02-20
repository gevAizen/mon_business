/**
 * Entry management utilities
 * Handle CRUD operations for DailyEntry with proper data validation
 */

import type { DailyEntry } from "@/types";
import { saveData, loadData } from "./storage";
import type { StockItem } from "@/types";

/**
 * Add or update an entry in the database
 * If entry with same ID exists, it updates it. Otherwise, adds new entry.
 * Automatically updates stock based on product sales or stock expenses.
 */
export function addOrUpdateEntry(entry: DailyEntry): boolean {
  try {
    const data = loadData();

    // Find existing entry by ID
    const existingIndex = data.entries.findIndex((e) => e.id === entry.id);

    if (existingIndex >= 0) {
      // Revert old stock changes
      const oldEntry = data.entries[existingIndex];
      revertStockChange(data.stock, oldEntry);

      // Apply new entry
      data.entries[existingIndex] = entry;
      applyStockChange(data.stock, entry);
    } else {
      // Add new entry and apply stock changes
      data.entries.push(entry);
      applyStockChange(data.stock, entry);
    }

    // Sort entries by date then timestamp
    data.entries.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.timestamp - b.timestamp;
    });

    return saveData(data);
  } catch (error) {
    console.error("Failed to add/update entry:", error);
    return false;
  }
}

/**
 * Delete an entry by ID
 * Restores stock quantities when deleting an entry
 */
export function deleteEntry(entryId: string): boolean {
  try {
    const data = loadData();
    const entryToDelete = data.entries.find((e) => e.id === entryId);

    if (entryToDelete) {
      revertStockChange(data.stock, entryToDelete);
    }

    data.entries = data.entries.filter((e) => e.id !== entryId);
    return saveData(data);
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return false;
  }
}

/**
 * Helper to apply stock changes based on entry type
 */
function applyStockChange(stock: StockItem[], entry: DailyEntry) {
  if (entry.productId && entry.quantity) {
    const itemIndex = stock.findIndex((s) => s.id === entry.productId);
    if (itemIndex >= 0) {
      const item = stock[itemIndex];
      if (entry.type === "SALE") {
        // Sale: Decrease stock, increase total sold
        // Update weighted average price calculation
        const currentRevenue = item.totalSold * (item.unitPrice || 0);
        const newRevenue = currentRevenue + entry.amount;
        const newTotalSold = item.totalSold + entry.quantity;
        const newAveragePrice =
          newTotalSold > 0 ? newRevenue / newTotalSold : 0;

        stock[itemIndex] = {
          ...item,
          quantity: Math.max(0, item.quantity - entry.quantity),
          totalSold: newTotalSold,
          unitPrice: Math.round(newAveragePrice),
        };
      } else if (entry.type === "EXPENSE" && entry.category === "Stock") {
        // Stock Expense: Increase stock
        stock[itemIndex].quantity += entry.quantity;
      }
    }
  }
}

/**
 * Helper to revert stock changes (undo)
 */
function revertStockChange(stock: StockItem[], entry: DailyEntry) {
  if (entry.productId && entry.quantity) {
    const itemIndex = stock.findIndex((s) => s.id === entry.productId);
    if (itemIndex >= 0) {
      if (entry.type === "SALE") {
        // Undo Sale: Increase stock, decrease total sold
        // Note: We don't revert unitPrice average perfectly as it's complex,
        // we just revert the counts.
        stock[itemIndex].quantity += entry.quantity;
        stock[itemIndex].totalSold = Math.max(
          0,
          stock[itemIndex].totalSold - entry.quantity,
        );
      } else if (entry.type === "EXPENSE" && entry.category === "Stock") {
        // Undo Stock Expense: Decrease stock
        stock[itemIndex].quantity = Math.max(
          0,
          stock[itemIndex].quantity - entry.quantity,
        );
      }
    }
  }
}

/**
 * Get all entries for a specific date, sorted by timestamp
 */
export function getEntriesForDate(date: string): DailyEntry[] {
  const data = loadData();
  return data.entries
    .filter((e) => e.date === date)
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get total sales and expenses for a specific date
 */
export function getDayTotals(date: string): {
  sales: number;
  expenses: number;
} {
  const entries = getEntriesForDate(date);
  return {
    sales: entries
      .filter((e) => e.type === "SALE")
      .reduce((sum, e) => sum + e.amount, 0),
    expenses: entries
      .filter((e) => e.type === "EXPENSE")
      .reduce((sum, e) => sum + e.amount, 0),
  };
}

/**
 * Get an entry by ID
 */
export function getEntryById(entryId: string): DailyEntry | null {
  const data = loadData();
  return data.entries.find((e) => e.id === entryId) || null;
}

/**
 * Get all entries (unsorted, as stored)
 */
export function getAllEntries(): DailyEntry[] {
  const data = loadData();
  return data.entries;
}

/**
 * Returns all entries recorded during a given calendar month,
 * using timestamp boundaries so no string conversion is needed at query time.
 *
 * @param yearMonth - Month to filter for, in "YYYY-MM" format (e.g. "2025-06")
 */
export function getEntriesForMonth(yearMonth: string): DailyEntry[] {
  // Parse "YYYY-MM" into the start and end boundaries of that month
  const [year, month] = yearMonth.split("-").map(Number);

  const start = new Date(year, month - 1, 1).getTime(); // first ms of month
  const end = new Date(year, month, 1).getTime(); // first ms of NEXT month

  return loadData().entries.filter(
    (e) => e.timestamp >= start && e.timestamp < end,
  );
}
