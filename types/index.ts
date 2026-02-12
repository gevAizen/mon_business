/**
 * Core business domain types
 * All types are strictly typed for production safety
 */

export interface DailyEntry {
  date: string; // ISO 8601 format: YYYY-MM-DD
  sales: number;
  expenses: number;
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
