/**
 * Core business domain types
 * All types are strictly typed for production safety
 */

// Expense categories - fixed list for analytics
export type ExpenseCategory = 'Stock' | 'Transport' | 'Loyer' | 'Salaire' | 'Internet' | 'Autre';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Stock', 'Transport', 'Loyer', 'Salaire', 'Internet', 'Autre'];

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
 * Transaction Entry (redesigned)
 * Users can record multiple transactions per day with categorized expenses
 * Supports backward compatibility with old format
 */
export interface DailyEntry {
  id: string; // Unique identifier for the entry
  date: string; // ISO 8601 format: YYYY-MM-DD
  saleItems: SaleLineItem[]; // Product-based sales
  expenseItems: ExpenseLineItem[]; // Categorized expenses
  timestamp?: number; // Optional: milliseconds since epoch for ordering within same day
  // Backward compatibility fields (populated during migration from old format)
  // Will be gradually removed as components migrate to new format
  sales: number; // Total sales (calculated from saleItems or migrated from old format)
  expenses: number; // Total expenses (calculated from expenseItems or migrated from old format)
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

export function isValidExpenseCategory(category: string): category is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
}

export function isValidSaleLineItem(item: unknown): item is SaleLineItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.productId === 'string' &&
    typeof obj.quantity === 'number' &&
    obj.quantity > 0 &&
    typeof obj.total === 'number' &&
    obj.total > 0
  );
}

export function isValidExpenseLineItem(item: unknown): item is ExpenseLineItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    isValidExpenseCategory(obj.category as string) &&
    typeof obj.amount === 'number' &&
    obj.amount > 0
  );
}

export function isValidDailyEntry(entry: unknown): entry is DailyEntry {
  if (typeof entry !== 'object' || entry === null) return false;
  const obj = entry as Record<string, unknown>;
  
  const hasValidId = typeof obj.id === 'string' && obj.id.length > 0;
  const hasValidDate = typeof obj.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.date);
  const hasValidSaleItems = Array.isArray(obj.saleItems) && obj.saleItems.every(isValidSaleLineItem);
  const hasValidExpenseItems = Array.isArray(obj.expenseItems) && obj.expenseItems.every(isValidExpenseLineItem);
  
  return hasValidId && hasValidDate && hasValidSaleItems && hasValidExpenseItems;
}

export function isValidStockItem(item: unknown): item is StockItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    typeof obj.quantity === 'number' &&
    obj.quantity >= 0 &&
    typeof obj.threshold === 'number' &&
    obj.threshold >= 0 &&
    typeof obj.totalSold === 'number' &&
    obj.totalSold >= 0
  );
}
