import { BusinessData, DailyEntry, StockItem } from "@/types";
import { loadData } from "./storage";

export function objectsToCSV<T extends Record<string, unknown>>(
  rows: T[],
): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]) as (keyof T)[];

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";

    const str = String(value);

    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  };

  const lines = [
    headers.join(","), // header row
    ...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
  ];

  return lines.join("\n");
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const exportCSV = async (): Promise<void> => {
  try {
    // 1. Prepare Data (Same as before)
    const data = loadData() as {
      stock: StockItem[];
      entries: DailyEntry[];
    };

    const stockCSV = objectsToCSV<StockItem>(data.stock);
    const entriesCSV = objectsToCSV<DailyEntry>(data.entries);

    const csvContent = ["# STOCK", stockCSV, "", "# ENTRIES", entriesCSV].join(
      "\n",
    );

    // 2. Create Blob and URL
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    // 3. Create and Trigger Link
    const link = document.createElement("a");
    link.href = url;
    link.download = `mon_business_${new Date().toISOString().split("T")[0]}.csv`;

    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 4. Cleanup URL (Keep this immediate to free memory)
    // We revoke immediately after click because the browser has already
    // grabbed the data reference for the download stream.
    URL.revokeObjectURL(url);

    // 5. THE FIX: Wait briefly to simulate "completion"
    // Since we can't detect exact OS-level download finish,
    // 1.5 seconds is usually enough for the browser to hand off the file.
    await wait(1500);
  } catch (error) {
    // If anything above fails (e.g., memory issue creating Blob), we catch it here
    console.error("Export preparation failed:", error);
    throw error; // Re-throw so the caller knows it failed
  }
};
