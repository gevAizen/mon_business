// app/components/entries/EntriesList.tsx
"use client";
import {
  addOrUpdateEntry,
  deleteEntry,
  getEntriesForMonth,
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

interface EntriesListProps {
  onBack: () => void;
}

type EntriesByDay = Record<string, DailyEntry[]>;

// Type pour le filtre
type EntryFilter = "ALL" | "SALE" | "EXPENSE";

function groupEntriesByDay(entries: DailyEntry[]): EntriesByDay {
  const grouped: EntriesByDay = {};
  for (const entry of entries) {
    const key = entry.date;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(entry);
  }
  for (const key in grouped) {
    grouped[key].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  const sortedEntries = Object.entries(grouped).sort(([dateA], [dateB]) => {
    return dateB.localeCompare(dateA);
  });
  return Object.fromEntries(sortedEntries);
}

function getMonthValue(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function EntriesList({ onBack }: EntriesListProps) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    getMonthValue(new Date()),
  );
  const [stock, setStock] = useState<StockItem[]>(() => loadData().stock);
  const [filter, setFilter] = useState<EntryFilter>("ALL"); // Nouvel état pour le filtre

  const refreshStock = useCallback(() => {
    setStock(loadData().stock);
  }, []);

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

  const getCategoryName = useCallback((cat?: string) => {
    if (!cat) return "Autre";
    return fr.expenseCategories[cat as ExpenseCategory] ?? cat;
  }, []);

  const allEntries = getEntriesForMonth(selectedMonth);

  // Filtrer les entrées selon le filtre sélectionné
  const filteredEntries = useMemo(() => {
    if (filter === "ALL") return allEntries;
    return allEntries.filter((entry) => entry.type === filter);
  }, [allEntries, filter]);

  const entriesByDay = useMemo(
    () => groupEntriesByDay(filteredEntries),
    [filteredEntries],
  );

  // Calculer les totaux pour le mois (toujours basé sur toutes les entrées pour le résumé)
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

  const dayKeys = Object.keys(entriesByDay);

  return (
    <PageWrapper header={<EntriesHeader />}>
      <div className="flex-1 pb-4 overflow-auto space-y-4">
        {/* Ligne avec sélection du mois ET filtres */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          {/* Sélecteur de mois */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Filtres par type */}
          <div className="flex gap-1 border border-gray-300 p-1 rounded-lg">
            <button
              onClick={() => setFilter("ALL")}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all
                ${
                  filter === "ALL"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600  hover:text-gray-900"
                }
              `}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter("SALE")}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all
                ${
                  filter === "SALE"
                    ? "bg-white shadow-sm text-green-600"
                    : "text-gray-600  hover:text-gray-900"
                }
              `}
            >
              Ventes
            </button>
            <button
              onClick={() => setFilter("EXPENSE")}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all
                ${
                  filter === "EXPENSE"
                    ? "bg-white shadow-sm text-red-600"
                    : "text-gray-600  hover:text-gray-900"
                }
              `}
            >
              Dépenses
            </button>
          </div>
        </div>

        {/* Résumé du mois (toujours afficher le total) */}
        <MonthSummary
          sales={monthTotals.sales}
          expenses={monthTotals.expenses}
        />

        {/* Indicateur de filtre actif (optionnel) */}
        {filter !== "ALL" && (
          <div className="text-sm text-gray-500">
            Affichage des {filter === "SALE" ? "ventes" : "dépenses"} uniquement
          </div>
        )}

        <AddIconButton
          onPress={() => {
            setEditingEntry(undefined);
            setShowAddEntry(true);
          }}
          label="Ajouter une nouvelle transaction"
        />

        {dayKeys.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">
              {filter === "ALL"
                ? "Aucune entrée pour ce mois"
                : filter === "SALE"
                  ? "Aucune vente pour ce mois"
                  : "Aucune dépense pour ce mois"}
            </p>
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

const EntriesHeader: React.FC = () => (
  <div className="flex flex-col gap-2">
    <h1 className="text-2xl font-bold text-gray-900">Mes ventes et dépenses</h1>
    <p className="text-gray-600 text-sm">
      Enregistrez ici toutes vos transactions
    </p>
  </div>
);
