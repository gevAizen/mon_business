/**
 * Core business domain types
 * All types are strictly typed for production safety
 */

// Expense categories - fixed list for analytics
export type ExpenseCategory =
  | "Stock"
  | "Transport"
  | "Loyer"
  | "Salaire"
  | "Internet"
  | "Autre";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Stock",
  "Transport",
  "Loyer",
  "Salaire",
  "Internet",
  "Autre",
];

/**
 * Single product sale line item
 * Supports product-based sales with automatic stock deduction
 */
export interface SaleLineItem {
  productId: string; // Reference to stock item
  quantity: number; // Units sold
  unitPrice?: number; // Price per unit (for reference/validation)
  total: number; // Total amount for this line (quantity * unitPrice or explicit total)
}

/**
 * Single expense line item
 * Each expense is categorized for analytics
 */
export interface ExpenseLineItem {
  category: ExpenseCategory;
  amount: number;
}

/**
 * Transaction Entry
 * Represents a single financial event (Sale or Expense)
 */
export interface DailyEntry {
  id: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  timestamp: number; // For sorting
  type: "SALE" | "EXPENSE";

  // Specifics
  productId?: string; // For SALE or EXPENSE (Stock)
  quantity?: number; // For SALE or EXPENSE (Stock)
  category?: ExpenseCategory; // For EXPENSE

  // Financials
  amount: number; // Total value (Revenue for Sale, Cost for Expense)

  [key: string]: string | number | boolean | undefined; //  For export
}

/**
 * Stock Item
 * Tracks inventory with sales history for analytics
 */
export interface StockItem {
  id: string;
  name: string;
  quantity: number; // Current stock level
  threshold: number; // Alert threshold
  totalSold: number; // Cumulative units sold (for analytics)
  unitPrice?: number; // Optional: unit cost/price
  hasInitialStockTransaction: boolean; // True once the first stocking purchase has been recorded

  [key: string]: string | number | boolean | undefined; //  For export
}

export interface BusinessSettings {
  name: string;
  dailyTarget?: number;
}

export interface BusinessData {
  settings: BusinessSettings;
  entries: DailyEntry[];
  stock: StockItem[];
}

export interface HealthScoreResult {
  score: number; // 0-10
  message: string;
}

/**
 * Validation utilities
 */

export function isValidExpenseCategory(
  category: string,
): category is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
}

export function isValidDailyEntry(entry: unknown): entry is DailyEntry {
  if (typeof entry !== "object" || entry === null) return false;
  const obj = entry as Record<string, unknown>;

  const hasValidId = typeof obj.id === "string" && obj.id.length > 0;
  const hasValidDate =
    typeof obj.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(obj.date);

  const isValidType = obj.type === "SALE" || obj.type === "EXPENSE";
  const hasValidAmount = typeof obj.amount === "number" && obj.amount >= 0;

  // Optional fields checks
  const hasValidCategory =
    !obj.category || isValidExpenseCategory(obj.category as string);
  const hasValidQuantity =
    !obj.quantity || (typeof obj.quantity === "number" && obj.quantity >= 0);

  return (
    hasValidId &&
    hasValidDate &&
    isValidType &&
    hasValidAmount &&
    hasValidCategory &&
    hasValidQuantity
  );
}

export function isValidStockItem(item: unknown): item is StockItem {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    obj.id.length > 0 &&
    typeof obj.name === "string" &&
    obj.name.length > 0 &&
    typeof obj.quantity === "number" &&
    obj.quantity >= 0 &&
    typeof obj.threshold === "number" &&
    obj.threshold >= 0 &&
    (obj.totalSold === undefined ||
      (typeof obj.totalSold === "number" && obj.totalSold >= 0))
  );
}
