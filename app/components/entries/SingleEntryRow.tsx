import React from "react";
import { Trash2, Edit2 } from "lucide-react";
import { DailyEntry } from "@/types";

interface SingleEntryRowProps {
  entry: DailyEntry;
  getProductName: (id?: string) => string;
  getCategoryName: (cat?: string) => string;
  onEdit: (entry: DailyEntry) => void;
  onDelete: (id: string) => void;
}

export function SingleEntryRow({
  entry,
  getProductName,
  getCategoryName,
  onEdit,
  onDelete,
}: SingleEntryRowProps) {
  const isSale = entry.type === "SALE";
  const isStockExpense = entry.type === "EXPENSE" && entry.category === "Stock";

  // Dynamic Label Logic
  let label = "";
  if (isSale) {
    label = getProductName(entry.productId);
  } else if (isStockExpense) {
    label = `Stock · ${getProductName(entry.productId)}`;
  } else {
    label = getCategoryName(entry.category) || "Divers";
  }

  const amountColor = isSale ? "text-green-600" : "text-red-500";
  const sign = isSale ? "+" : "−";
  const badgeBg = isSale
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
  const badgeText = isSale ? "Vente" : "Dépense";

  // --- Mobile Layout (Default) ---
  const mobileView = (
    <div className="flex flex-col py-3 px-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors md:hidden">
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-gray-800 text-sm truncate max-w-[70%]">
          {label}
        </span>
        <span className={`font-bold text-sm ${amountColor}`}>
          {sign}
          {entry.amount.toLocaleString("fr-FR")} CFA
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {entry.quantity && (
            <span className="text-xs text-gray-400">{entry.quantity} u.</span>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeBg}`}
          >
            {badgeText}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            aria-label="Modifier"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm("Supprimer cette entrée ?")) onDelete(entry.id);
            }}
            className="p-1.5 text-orange-500 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  // --- Desktop Layout (Table Row) ---
  const desktopView = (
    <div className="hidden md:grid grid-cols-12 gap-4 items-center py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group">
      {/* Description */}
      <div className="col-span-5">
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        {entry.quantity && (
          <p className="text-xs text-gray-400 mt-0.5">
            {entry.quantity} unités
          </p>
        )}
      </div>

      {/* Category/Type Badge */}
      <div className="col-span-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${badgeBg}`}
        >
          {badgeText}
        </span>
      </div>

      {/* Amount (Right Aligned) */}
      <div
        className={`col-span-2 text-right font-mono font-semibold ${amountColor}`}
      >
        {sign}
        {entry.amount.toLocaleString("fr-FR")}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(entry)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Modifier"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => {
            if (confirm("Supprimer cette ligne ?")) onDelete(entry.id);
          }}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}
