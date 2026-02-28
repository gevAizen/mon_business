"use client";

// ─── Imports ────────────────────────────────────────────────────────────────
import {
  addOrUpdateEntry,
  deleteEntry,
  getEntriesForMonth, // assumes you add this helper, see note below
} from "@/lib/entries";
import { fr } from "@/lib/i18n";
import { loadData } from "@/lib/storage";
import type { DailyEntry, ExpenseCategory, StockItem } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { AddEntry } from "../AddEntry/index";
import AddIconButton from "../common/AddIconButton";
import PageWrapper from "../PageWrapper";
import { MonthSummary } from "./MonthSummary";
import { SingleEntryList } from "./SingleEntryList";
// import { DayCard, MonthSummaryBar } from "./EntriesSubcomponents";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EntriesListProps {
  onBack: () => void;
}

// Grouped shape: { "2025-06-01": DailyEntry[], "2025-06-02": ... }
type EntriesByDay = Record<string, DailyEntry[]>;

// ─── Pure helper functions (no side effects, easy to test) ───────────────────

/**
 * Returns the local calendar date (YYYY-MM-DD) for a given Unix timestamp.
 * Uses local time rather than UTC so entries are bucketed into the correct
 * day for the user's timezone.
 */
function toDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Groups a flat list of entries by their calendar day.
 * Returns days in reverse-chronological order (most recent first).
 *
 * WHY NOT in a useEffect + setState?
 * Because this is derived data — it can always be computed from `entries`.
 * Storing it in state would mean keeping two things in sync, which is a
 * classic source of stale-data bugs.
 */
function groupEntriesByDay(entries: DailyEntry[]): EntriesByDay {
  const grouped: EntriesByDay = {};

  for (const entry of entries) {
    const key = toDateKey(entry.timestamp);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  }

  // Sort each day's entries newest-first
  for (const key in grouped) {
    grouped[key].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  // Return days sorted newest-first
  return Object.fromEntries(
    Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)),
  );
}

function getMonthValue(date: Date): string {
  // Returns "YYYY-MM" for use with <input type="month">
  return date.toISOString().slice(0, 7);
}

export function EntriesList({ onBack }: EntriesListProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    getMonthValue(new Date()),
  );

  // Stock is read from storage; refreshed after mutations
  const [stock, setStock] = useState<StockItem[]>(() => loadData().stock);

  const refreshStock = useCallback(() => {
    setStock(loadData().stock);
  }, []);

  // ── Lookups (memoised so they don't re-run on every render) ──────────────

  /*
   * WHY useMemo here?
   * Building lookup maps is O(n). Without memo, it runs on every render even
   * when stock hasn't changed. With small datasets it's negligible, but it's a
   * good habit and signals intent: "this is derived from stock, not fresh data".
   */
  const stockById = useMemo(
    () => new Map(stock.map((s) => [s.id, s])),
    [stock],
  );

  const getProductName = useCallback(
    (id?: string) => {
      if (!id) return "Inconnu";
      return stockById.get(id)?.name ?? "Produit supprimé";
    },
    [stockById],
  );

  const getCategoryName = useCallback(
    (cat?: string) => {
      if (!cat) return "Autre";
      return fr.expenseCategories[cat as ExpenseCategory] ?? cat;
    },
    [], // fr is a module-level constant, never changes
  );

  // ── Data ─────────────────────────────────────────────────────────────────

  /*
   * NOTE: Ideally `getEntriesForMonth(selectedMonth)` exists in your data layer.
   * If it doesn't, you can derive it from `getEntriesForDate` by iterating days,
   * or filter all entries by month prefix here. Keeping data-fetching logic
   * OUT of the component is the right boundary — components shouldn't know
   * how data is stored.
   */
  const allEntries = getEntriesForMonth(selectedMonth);

  /*
   * useMemo: grouping and sorting is pure computation over `allEntries`.
   * No need to store the result in state — it's always derivable.
   */
  const entriesByDay = useMemo(
    () => groupEntriesByDay(allEntries),
    [allEntries],
  );

  const monthTotals = useMemo(
    () =>
      allEntries.reduce(
        (acc, e) => {
          if (e.type === "SALE") return { ...acc, sales: acc.sales + e.amount };
          return { ...acc, expenses: acc.expenses + e.amount };
        },
        { sales: 0, expenses: 0 },
      ),
    [allEntries],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveEntry = (entries: DailyEntry[]) => {
    let ok = true;
    entries.forEach((entry) => {
      if (!addOrUpdateEntry(entry)) {
        ok = false;
      }
    });
    if (ok) {
      setShowAddEntry(false);
      setEditingEntry(undefined);
      refreshStock();
    }
  };

  const handleDelete = useCallback(
    (entryId: string) => {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
        if (deleteEntry(entryId)) {
          refreshStock();
        }
      }
    },
    [refreshStock],
  );

  const handleEdit = useCallback((entry: DailyEntry) => {
    setEditingEntry(entry);
    setShowAddEntry(true);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const dayKeys = Object.keys(entriesByDay); // already sorted newest-first

  return (
    <PageWrapper header={<EntriesHeader />}>
      <div className="flex-1 pb-4 overflow-auto space-y-4">
        {/* Month Selector */}
        <div className="flex gap-2 items-center">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Month Summary */}
        <MonthSummary
          sales={monthTotals.sales}
          expenses={monthTotals.expenses}
        />

        {/* Add Entry Button */}
        <AddIconButton
          onPress={() => {
            setEditingEntry(undefined);
            setShowAddEntry(true);
          }}
          label="Ajouter une nouvelle transaction"
        />

        {/* Entries grouped by day */}
        {dayKeys.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Aucune entrée pour ce mois</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-between gap-4">
            {dayKeys.map((dateKey) => (
              <SingleEntryList
                key={dateKey}
                dateKey={dateKey}
                entries={entriesByDay[dateKey]}
                getProductName={getProductName}
                getCategoryName={getCategoryName}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {showAddEntry && (
        <AddEntry
          existingEntry={editingEntry}
          onSave={handleSaveEntry}
          onCancel={() => {
            setShowAddEntry(false);
            setEditingEntry(undefined);
          }}
        />
      )}
    </PageWrapper>
  );
}

// Defined outside the component so React never remounts it between renders
const EntriesHeader: React.FC = () => (
  <div className="flex flex-col gap-2">
    <h1 className="text-2xl font-bold text-gray-900">Mes ventes et dépenses</h1>
    <p className="text-gray-600 text-sm">
      Enregistrez ici toutes vos transactions
    </p>
  </div>
);
