/**
 * Secure localStorage utilities with validation
 * All data is validated against the expected schema
 */

import type { BusinessData, DailyEntry, StockItem, BusinessSettings } from "@/types";

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
 * Validates that a DailyEntry has required fields with correct types
 */
function isValidDailyEntry(entry: unknown): entry is DailyEntry {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.date === "string" &&
    typeof e.sales === "number" &&
    typeof e.expenses === "number" &&
    !isNaN(e.sales) &&
    !isNaN(e.expenses) &&
    e.sales >= 0 &&
    e.expenses >= 0
  );
}

/**
 * Validates that a StockItem has required fields with correct types
 */
function isValidStockItem(item: unknown): item is StockItem {
  if (typeof item !== "object" || item === null) return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.id === "string" &&
    typeof i.name === "string" &&
    typeof i.quantity === "number" &&
    typeof i.threshold === "number" &&
    !isNaN(i.quantity) &&
    !isNaN(i.threshold) &&
    i.quantity >= 0 &&
    i.threshold >= 0
  );
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
 * Validates the entire BusinessData structure
 */
function isValidBusinessData(data: unknown): data is BusinessData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;

  return (
    isValidBusinessSettings(d.settings) &&
    Array.isArray(d.entries) &&
    d.entries.every(isValidDailyEntry) &&
    Array.isArray(d.stock) &&
    d.stock.every(isValidStockItem)
  );
}

/**
 * Safely loads business data from localStorage
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

    const parsed = JSON.parse(stored);

    if (!isValidBusinessData(parsed)) {
      console.warn("Invalid stored data structure, returning defaults");
      return getDefaultData();
    }

    return parsed;
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
