import { DailyEntry } from "@/types";
import { Trash2 } from "lucide-react";

/**
 * MonthSummaryBar — shows sales, expenses, profit for the selected month.
 *
 * WHY a separate component?
 * It has no state of its own and receives only what it needs. This makes it
 * trivial to test and reuse (e.g. on a dashboard).
 */
interface MonthSummaryBarProps {
  sales: number;
  expenses: number;
}

export function MonthSummaryBar({ sales, expenses }: MonthSummaryBarProps) {
  const profit = sales - expenses;

  return (
    <div className="border border-gray-200 rounded-xl p-3 grid grid-cols-3 gap-4">
      <SummaryCell label="Ventes" value={sales} color="text-green-600" />
      <SummaryCell label="Dépenses" value={expenses} color="text-red-600" />
      <SummaryCell label="Profit" value={profit} color="text-gray-600" />
    </div>
  );
}

export function SummaryCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className={`font-bold mt-1 ${color}`}>
        {value.toLocaleString("fr-FR")}
      </p>
    </div>
  );
}

/**
 * EntryRow — a single compact transaction.
 *
 * WHY click-to-edit instead of always-visible edit button?
 * Less visual clutter. The whole row is a natural click target.
 * Delete is intentionally separate (destructive action) with a small icon.
 *
 * BAD PATTERN: rendering <EditForm /> inline inside the row for every entry.
 * That would mount/unmount forms on every render. We lift editing state up.
 */
interface EntryRowProps {
  entry: DailyEntry;
  getProductName: (id?: string) => string;
  getCategoryName: (cat?: string) => string;
  onEdit: (entry: DailyEntry) => void;
  onDelete: (id: string) => void;
}

export function EntryRow({
  entry,
  getProductName,
  getCategoryName,
  onEdit,
  onDelete,
}: EntryRowProps) {
  const isSale = entry.type === "SALE";
  const isStockExpense = entry.type === "EXPENSE" && entry.category === "Stock";

  const label = isSale
    ? getProductName(entry.productId)
    : isStockExpense
      ? `Stock · ${getProductName(entry.productId)}`
      : getCategoryName(entry.category);

  return (
    <div className="flex items-center justify-between py-2.5 px-1 group">
      {/* Clickable label area → opens edit */}
      <button
        onClick={() => onEdit(entry)}
        className="flex-1 text-left hover:text-blue-600 transition-colors min-w-0"
      >
        <span className="text-sm font-medium text-gray-800 truncate block">
          {label}
        </span>
        {(isSale || isStockExpense) && entry.quantity && (
          <span className="text-xs text-gray-400">
            {entry.quantity} unité(s)
          </span>
        )}
      </button>

      <div className="flex items-center gap-1">
        {/* Amount — color signals type (green = sale, orange = expense) */}
        <span
          className={`text-xs mr-2 shrink-0 text-end ${
            isSale ? "text-green-600" : "text-red-500"
          }`}
        >
          {isSale ? "+" : "−"} {entry.amount.toLocaleString("fr-FR")} CFA
        </span>

        {/* Trash icon — only visible on row hover to reduce noise */}
        <button
          onClick={() => onDelete(entry.id)}
          aria-label="Supprimer"
          className="p-1 text-orange-400 border border-orange-200 rounded "
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * DayCard — groups all entries for one calendar day in a single card.
 *
 * WHY group by day visually?
 * It maps to how users think about their business ("what happened on Monday?").
 * The card boundary is a natural separator; no need for explicit dividers between days.
 *
 * WHY a separator between rows instead of individual cards?
 * Individual cards would add ~48px of padding overhead per entry, making long
 * lists exhausting to scroll. Compact rows inside one card are scannable.
 */
interface DayCardProps {
  dateKey: string;
  entries: DailyEntry[];
  getProductName: (id?: string) => string;
  getCategoryName: (cat?: string) => string;
  onEdit: (entry: DailyEntry) => void;
  onDelete: (id: string) => void;
}

export function DayCard({
  dateKey,
  entries,
  getProductName,
  getCategoryName,
  onEdit,
  onDelete,
}: DayCardProps) {
  const dayTotal = entries.reduce(
    (acc, e) => {
      if (e.type === "SALE") return { ...acc, sales: acc.sales + e.amount };
      return { ...acc, expenses: acc.expenses + e.amount };
    },
    { sales: 0, expenses: 0 },
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Day header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 capitalize">
          {formatDayLabel(dateKey)}
        </span>
        <span className="text-xs font-bold text-gray-400">
          {dayTotal.sales > 0 && (
            <span className="text-green-600">
              +{dayTotal.sales.toLocaleString("fr-FR")} CFA
            </span>
          )}
          {dayTotal.sales > 0 && dayTotal.expenses > 0 && (
            <span className="mx-1 text-gray-300">|</span>
          )}
          {dayTotal.expenses > 0 && (
            <span className="text-red-500">
              −{dayTotal.expenses.toLocaleString("fr-FR")} CFA
            </span>
          )}
        </span>
      </div>

      {/* Rows with thin dividers between them */}
      <div className="divide-y divide-gray-100 px-4">
        {entries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            getProductName={getProductName}
            getCategoryName={getCategoryName}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function formatDayLabel(dateKey: string): string {
  return new Date(dateKey).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
