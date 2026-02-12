/**
 * Core business domain types
 * All types are strictly typed for production safety
 */

/**
 * Transaction Entry
 * Users can record multiple transactions per day (e.g., morning sale, lunch expense, afternoon sale)
 * Multiple entries with the same date are allowed and encouraged for real-time tracking
 */
export interface DailyEntry {
  id: string; // Unique identifier for the entry
  date: string; // ISO 8601 format: YYYY-MM-DD
  sales: number;
  expenses: number;
  timestamp?: number; // Optional: milliseconds since epoch for ordering within same day
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
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
