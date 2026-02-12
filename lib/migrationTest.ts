/**
 * Migration testing utilities
 * Used to verify data migration from old format to new format works correctly
 * This file is NOT imported by the app, it's for testing/development only
 */

import type { BusinessData, DailyEntry, StockItem } from "@/types";

/**
 * Sample old format data (pre-Phase 1)
 * This is what users might have stored before the new format
 */
export function createSampleOldFormatData(): BusinessData {
  return {
    settings: {
      name: "Mon Salon",
      dailyTarget: 50000,
    },
    entries: [
      {
        id: "entry_1",
        date: "2024-01-15",
        sales: 100000,
        expenses: 30000,
        timestamp: 1705334400000,
      } as unknown as DailyEntry,
      {
        id: "entry_2",
        date: "2024-01-15",
        sales: 50000,
        expenses: 15000,
        timestamp: 1705348800000,
      } as unknown as DailyEntry,
      {
        id: "entry_3",
        date: "2024-01-16",
        sales: 75000,
        expenses: 0,
        timestamp: 1705420800000,
      } as unknown as DailyEntry,
    ],
    stock: [
      {
        id: "stock_1",
        name: "Shampooing",
        quantity: 15,
        threshold: 5,
      } as unknown as StockItem,
      {
        id: "stock_2",
        name: "Conditionneur",
        quantity: 3,
        threshold: 5,
      } as unknown as StockItem,
    ],
  };
}

/**
 * Sample new format data (post-Phase 1)
 * This is what entries should look like after migration
 */
export function createSampleNewFormatData(): BusinessData {
  return {
    settings: {
      name: "Mon Salon",
      dailyTarget: 50000,
    },
    entries: [
      {
        id: "entry_1",
        date: "2024-01-15",
        saleItems: [
          {
            productId: "product_1",
            quantity: 2,
            total: 120000,
          },
        ],
        expenseItems: [
          {
            category: "Stock",
            amount: 20000,
          },
          {
            category: "Transport",
            amount: 10000,
          },
        ],
        sales: 120000,
        expenses: 30000,
        timestamp: 1705334400000,
      },
      {
        id: "entry_2",
        date: "2024-01-15",
        saleItems: [
          {
            productId: "product_2",
            quantity: 1,
            total: 50000,
          },
        ],
        expenseItems: [
          {
            category: "Autre",
            amount: 15000,
          },
        ],
        sales: 50000,
        expenses: 15000,
        timestamp: 1705348800000,
      },
    ],
    stock: [
      {
        id: "product_1",
        name: "Shampooing",
        quantity: 13,
        threshold: 5,
        totalSold: 7,
        unitPrice: 60000,
      },
      {
        id: "product_2",
        name: "Conditionneur",
        quantity: 2,
        threshold: 5,
        totalSold: 3,
        unitPrice: 50000,
      },
    ],
  };
}

/**
 * Verify that old format entries are properly migrated
 * This function tests the migration logic
 */
export function testMigration(oldData: BusinessData, newData: BusinessData): boolean {
  // Check entries count matches
  if (oldData.entries.length !== newData.entries.length) {
    console.error(
      `Entry count mismatch: old=${oldData.entries.length}, new=${newData.entries.length}`
    );
    return false;
  }

  // Check each entry was migrated
  for (let i = 0; i < oldData.entries.length; i++) {
    const oldEntry = oldData.entries[i];
    const newEntry = newData.entries[i];

    if (oldEntry.id !== newEntry.id) {
      console.error(`Entry ID mismatch at index ${i}: ${oldEntry.id} vs ${newEntry.id}`);
      return false;
    }

    if (oldEntry.date !== newEntry.date) {
      console.error(`Entry date mismatch at index ${i}: ${oldEntry.date} vs ${newEntry.date}`);
      return false;
    }

    // Check backward compat fields
    if ((oldEntry.sales || 0) !== newEntry.sales) {
      console.error(
        `Entry sales mismatch at index ${i}: ${oldEntry.sales} vs ${newEntry.sales}`
      );
      return false;
    }

    if ((oldEntry.expenses || 0) !== newEntry.expenses) {
      console.error(
        `Entry expenses mismatch at index ${i}: ${oldEntry.expenses} vs ${newEntry.expenses}`
      );
      return false;
    }

    // Check new format fields exist
    if (!Array.isArray(newEntry.saleItems) || !Array.isArray(newEntry.expenseItems)) {
      console.error(`Entry ${i} missing saleItems or expenseItems array`);
      return false;
    }
  }

  // Check stock items were migrated
  if (oldData.stock.length !== newData.stock.length) {
    console.error(
      `Stock count mismatch: old=${oldData.stock.length}, new=${newData.stock.length}`
    );
    return false;
  }

  for (let i = 0; i < oldData.stock.length; i++) {
    const oldItem = oldData.stock[i];
    const newItem = newData.stock[i];

    if (oldItem.id !== newItem.id) {
      console.error(`Stock ID mismatch at index ${i}: ${oldItem.id} vs ${newItem.id}`);
      return false;
    }

    if (oldItem.quantity !== newItem.quantity) {
      console.error(
        `Stock quantity mismatch at index ${i}: ${oldItem.quantity} vs ${newItem.quantity}`
      );
      return false;
    }

    // Check totalSold was added
    if (typeof newItem.totalSold !== "number") {
      console.error(`Stock item ${i} missing totalSold field`);
      return false;
    }
  }

  return true;
}

/**
 * Log migration summary for debugging
 */
export function logMigrationSummary(data: BusinessData): void {
  console.log("=== Migration Summary ===");
  console.log(`Business: ${data.settings.name}`);
  console.log(`Daily Target: ${data.settings.dailyTarget}`);
  console.log(`\nEntries: ${data.entries.length}`);

  const totalSales = data.entries.reduce((sum, e) => sum + e.sales, 0);
  const totalExpenses = data.entries.reduce((sum, e) => sum + e.expenses, 0);
  console.log(`  Total Sales: ${totalSales}`);
  console.log(`  Total Expenses: ${totalExpenses}`);
  console.log(`  Total Profit: ${totalSales - totalExpenses}`);

  console.log(`\nStock Items: ${data.stock.length}`);
  data.stock.forEach((item) => {
    console.log(
      `  - ${item.name}: ${item.quantity}/${item.threshold} threshold, sold: ${item.totalSold}`
    );
  });
}
