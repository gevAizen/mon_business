import { DailyEntry } from "@/types";
import { calculateDayTotal, formatDayLabel } from "@/utils/entries";
import { SingleEntryRow } from "./SingleEntryRow";
// import { EntryRow } from './EntryRow';
// import { calculateDayTotal, formatDayLabel } from './utils';

interface SingleEntryListProps {
  dateKey: string;
  entries: DailyEntry[];
  getProductName: (id?: string) => string;
  getCategoryName: (cat?: string) => string;
  onEdit: (entry: DailyEntry) => void;
  onDelete: (id: string) => void;
}

export function SingleEntryList({
  dateKey,
  entries,
  getProductName,
  getCategoryName,
  onEdit,
  onDelete,
}: SingleEntryListProps) {
  const totals = calculateDayTotal(entries);
  const net = totals.sales - totals.expenses;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 w-full lg:w-[calc(1/3*100%-16px)] md:w-[calc(50%-16px)]">
      {/* Header: Responsive Flex */}
      <div className="bg-gray-50/80 backdrop-blur-sm px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Date Title */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-500 rounded-full hidden sm:block"></div>
          <h3 className="font-bold text-gray-700 capitalize">
            {formatDayLabel(dateKey)}
          </h3>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          {totals.sales > 0 && (
            <span className="text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>+
              {totals.sales.toLocaleString("fr-FR")}
            </span>
          )}

          {totals.sales > 0 && totals.expenses > 0 && (
            <span className="text-gray-300">|</span>
          )}

          {totals.expenses > 0 && (
            <span className="text-red-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>−
              {totals.expenses.toLocaleString("fr-FR")}
            </span>
          )}

          {/* Net Profit (Desktop Only usually, but fits here) */}
          <span
            className={`hidden sm:inline-block ml-2 px-2 py-0.5 rounded ${
              net >= 0
                ? "bg-gray-200 text-gray-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            Net: {net.toLocaleString("fr-FR")}
          </span>
        </div>
      </div>

      {/* Table Header (Desktop Only) */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
        <div className="col-span-5">Description</div>
        <div className="col-span-3">Type</div>
        <div className="col-span-2 text-right">Montant</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {entries.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400 italic">
            Aucune activité enregistrée ce jour.
          </div>
        ) : (
          entries.map((entry) => (
            <SingleEntryRow
              key={entry.id}
              entry={entry}
              getProductName={getProductName}
              getCategoryName={getCategoryName}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
