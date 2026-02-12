/**
 * Entry management utilities
 * Handle CRUD operations for DailyEntry with proper data validation
 */

import type { DailyEntry, BusinessData } from "@/types";
import { saveData, loadData } from "./storage";
import { applyEntryToStock } from "./stock";

/**
 * Add or update an entry in the database
 * If entry with same ID exists, it updates it. Otherwise, adds new entry.
 * Automatically updates stock based on product sales.
 */
export function addOrUpdateEntry(entry: DailyEntry): boolean {
  try {
    const data = loadData();

    // Find existing entry by ID
    const existingIndex = data.entries.findIndex((e) => e.id === entry.id);

    if (existingIndex >= 0) {
      // Update existing: revert old stock changes, apply new ones
      const oldEntry = data.entries[existingIndex];
      
      // Revert old sales stock (add quantity back)
      oldEntry.saleItems.forEach((sale) => {
        const stockIndex = data.stock.findIndex((s) => s.id === sale.productId);
        if (stockIndex >= 0) {
          data.stock[stockIndex].quantity += sale.quantity;
          data.stock[stockIndex].totalSold = Math.max(0, data.stock[stockIndex].totalSold - sale.quantity);
        }
      });

      // Apply new entry
      data.entries[existingIndex] = entry;
      data.stock = applyEntryToStock(data.stock, entry.saleItems);
    } else {
      // Add new entry and apply stock changes
      data.entries.push(entry);
      data.stock = applyEntryToStock(data.stock, entry.saleItems);
    }

    // Sort entries by date then timestamp
    data.entries.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return timeA - timeB;
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
      // Restore stock (add quantities back)
      entryToDelete.saleItems.forEach((sale) => {
        const stockIndex = data.stock.findIndex((s) => s.id === sale.productId);
        if (stockIndex >= 0) {
          data.stock[stockIndex].quantity += sale.quantity;
          data.stock[stockIndex].totalSold = Math.max(0, data.stock[stockIndex].totalSold - sale.quantity);
        }
      });
    }

    data.entries = data.entries.filter((e) => e.id !== entryId);
    return saveData(data);
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return false;
  }
}

/**
 * Get all entries for a specific date, sorted by timestamp
 */
export function getEntriesForDate(date: string): DailyEntry[] {
  const data = loadData();
  return data.entries
    .filter((e) => e.date === date)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

/**
 * Get total sales and expenses for a specific date
 */
export function getDayTotals(date: string): { sales: number; expenses: number } {
  const entries = getEntriesForDate(date);
  return {
    sales: entries.reduce((sum, e) => sum + e.sales, 0),
    expenses: entries.reduce((sum, e) => sum + e.expenses, 0),
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
