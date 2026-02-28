import { DailyEntry } from "@/types";

export function formatDayLabel(dateKey: string): string {
  return new Date(dateKey).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function calculateDayTotal(entries: DailyEntry[]) {
  return entries.reduce(
    (acc, entry) => {
      if (entry.type === "SALE") {
        return { ...acc, sales: acc.sales + entry.amount };
      }
      return { ...acc, expenses: acc.expenses + entry.amount };
    },
    { sales: 0, expenses: 0 },
  );
}
