/**
 * Secure localStorage utilities with validation
 * All data is validated against the expected schema
 * Supports migration from old format (sales/expenses) to new format (saleItems/expenseItems)
 */

import type { BusinessData, DailyEntry, StockItem, BusinessSettings } from "@/types";
import { isValidDailyEntry as typeIsValidDailyEntry, isValidStockItem as typeIsValidStockItem } from "@/types";

const STORAGE_KEY = "mon_business_data";

/**
 * Default empty business data structure
 */
function getDefaultData(): BusinessData {
  return {
    settings: {
      name: "",
      dailyTarget: undefined,
    },
    entries: [],
    stock: [],
  };
}

/**
 * Migrate old DailyEntry format to new format
 * Old format: { id, date, sales: number, expenses: number }
 * New format: { id, date, saleItems: [], expenseItems: [], sales, expenses }
 */
function migrateEntryToNewFormat(entry: Record<string, unknown>): DailyEntry {
  // If already in new format, return as-is
  if (Array.isArray(entry.saleItems) && Array.isArray(entry.expenseItems)) {
    return {
      id: entry.id as string,
      date: entry.date as string,
      saleItems: entry.saleItems as never,
      expenseItems: entry.expenseItems as never,
      sales: (entry.sales || 0) as number,
      expenses: (entry.expenses || 0) as number,
      timestamp: entry.timestamp as number | undefined,
    };
  }

  // Convert old format to new format
  const oldSales = (entry.sales as number) || 0;
  const oldExpenses = (entry.expenses as number) || 0;

  const saleItems = oldSales > 0 ? [{
    productId: "_legacy_",
    quantity: 1,
    total: oldSales,
  }] : [];

  const expenseItems = oldExpenses > 0 ? [{
    category: "Autre" as const,
    amount: oldExpenses,
  }] : [];

  return {
    id: entry.id as string,
    date: entry.date as string,
    saleItems,
    expenseItems,
    sales: oldSales,
    expenses: oldExpenses,
    timestamp: entry.timestamp as number | undefined,
  };
}

/**
 * Migrate old StockItem format to new format
 * Old format: { id, name, quantity, threshold }
 * New format: { id, name, quantity, threshold, totalSold: 0 }
 */
function migrateStockItemToNewFormat(item: Record<string, unknown>): StockItem {
  return {
    id: item.id as string,
    name: item.name as string,
    quantity: item.quantity as number,
    threshold: item.threshold as number,
    totalSold: (item.totalSold as number) || 0,
    unitPrice: item.unitPrice as number | undefined,
  };
}

/**
 * Validates that BusinessSettings has required fields with correct types
 */
function isValidBusinessSettings(settings: unknown): settings is BusinessSettings {
  if (typeof settings !== "object" || settings === null) return false;
  const s = settings as Record<string, unknown>;
  return (
    typeof s.name === "string" &&
    (s.dailyTarget === undefined || (typeof s.dailyTarget === "number" && s.dailyTarget >= 0))
  );
}

/**
 * Validates the entire BusinessData structure after migration
 */
function isValidBusinessData(data: unknown): data is BusinessData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;

  return (
    isValidBusinessSettings(d.settings) &&
    Array.isArray(d.entries) &&
    d.entries.every(typeIsValidDailyEntry) &&
    Array.isArray(d.stock) &&
    d.stock.every(typeIsValidStockItem)
  );
}

/**
 * Safely loads business data from localStorage
 * Automatically migrates old format to new format
 * Returns default structure if not found or invalid
 */
export function loadData(): BusinessData {
  try {
    if (typeof window === "undefined") {
      return getDefaultData();
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultData();
    }

    let parsed = JSON.parse(stored) as Record<string, unknown>;

    // Migrate entries if needed
    if (Array.isArray(parsed.entries)) {
      parsed.entries = parsed.entries.map((entry: Record<string, unknown>) => 
        migrateEntryToNewFormat(entry)
      );
    }

    // Migrate stock if needed
    if (Array.isArray(parsed.stock)) {
      parsed.stock = parsed.stock.map((item: Record<string, unknown>) => 
        migrateStockItemToNewFormat(item)
      );
    }

    if (!isValidBusinessData(parsed)) {
      console.warn("Invalid stored data structure after migration, returning defaults");
      return getDefaultData();
    }

    return parsed as BusinessData;
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    return getDefaultData();
  }
}

/**
 * Safely saves business data to localStorage
 * Validates data before saving to prevent corruption
 */
export function saveData(data: BusinessData): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    if (!isValidBusinessData(data)) {
      console.error("Cannot save invalid business data");
      return false;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
    return false;
  }
}

/**
 * Clears all business data from localStorage
 */
export function clearData(): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear data from localStorage:", error);
    return false;
  }
}
