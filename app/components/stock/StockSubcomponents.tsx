import { fr } from "@/lib/i18n";

// -- Stock card (single list item) --

import { isLowStock } from "@/lib/stock";
import { StockItem } from "@/types";

interface StockCardProps {
  item: StockItem;
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
  onInitialStock: (item: StockItem) => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  item,
  onEdit,
  onDelete,
  onInitialStock,
}) => {
  const low = isLowStock(item);

  // Dynamic classes for the card border/background based on stock status
  const cardBaseClasses = "border-2 rounded-xl p-5 transition-all duration-200";
  const cardStatusClasses = low
    ? "border-amber-200 bg-amber-50"
    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg";

  return (
    <div className={`${cardBaseClasses} ${cardStatusClasses}`}>
      {/* --- Header Section: Name & Badge --- */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
            {low && (
              <span className="text-xs font-medium bg-amber-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                ⚠️ Bas
              </span>
            )}
          </div>

          {/* Quantity Info */}
          <p className="text-sm text-gray-600 mt-2">
            Quantité:{" "}
            <span
              className={`font-semibold ${low ? "text-amber-700" : "text-gray-900"}`}
            >
              {item.quantity}
            </span>
            <span className="text-gray-400 mx-1">/</span>
            Seuil: {item.threshold}
          </p>
        </div>
      </div>

      {/* --- Stats Row: Price & Sales --- */}
      <div className="flex gap-3 mb-5 text-sm">
        <div className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg flex-1">
          <span className="block text-xs text-gray-500 mb-0.5">Prix Unit.</span>
          <span className="font-semibold text-gray-700">
            💰{" "}
            {item.unitSellingPrice
              ? item.unitSellingPrice.toLocaleString("fr-FR")
              : 0}{" "}
            CFA
          </span>
        </div>
        <div className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg flex-1">
          <span className="block text-xs text-blue-600 mb-0.5">Vendus</span>
          <span className="font-semibold text-blue-800">
            📈 {item.totalSold ?? 0}
          </span>
        </div>
      </div>

      {/* --- Debug Info (Hidden by default, useful for dev) --- */}
      <div className="hidden text-[10px] text-gray-400 font-mono mb-4 break-all">
        <p>Selling: {JSON.stringify(item.unitSellingPrice)}</p>
        <p>Cost: {JSON.stringify(item.unitPrice)}</p>
      </div>

      {/* --- Action Buttons --- */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onEdit(item)}
          className="py-2.5 text-sm font-semibold text-[#60b8c0] bg-white hover:bg-[#60b8c0]/5 rounded-lg transition-colors border border-[#60b8c0]/30"
        >
          Modifier
        </button>
        <button
          onClick={() => {
            if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
              onDelete(item.id);
            }
          }}
          className="py-2.5 text-sm font-semibold text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors border border-red-200"
        >
          Supprimer
        </button>
      </div>

      {/* --- Initial Stock Button (Conditional) --- */}
      {!item.hasInitialStockTransaction && (
        <div className="mt-4 pt-4 border-t border-amber-100">
          <button
            onClick={() => onInitialStock(item)}
            className="w-full py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            ➕ Ajouter le stock initial
          </button>
        </div>
      )}
    </div>
  );
};

import { InitialStockFormData, StockFormData } from "./StockManagement";

// -- Stock form (add / edit) --

interface StockFormProps {
  editingId: string | null;
  formData: StockFormData;
  error: string;
  onChange: (field: keyof StockFormData, value: string) => void;
  onSubmit: (e: React.SubmitEvent) => void;
  onCancel: () => void;
}

export const StockForm: React.FC<StockFormProps> = ({
  editingId,
  formData,
  error,
  onChange,
  onSubmit,
  onCancel,
}) => (
  <div className="fixed inset-0 p-6 bg-black/40 flex items-center justify-center z-50 mb-0">
    <div className="w-full max-w-4xl bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 text-lg">
        {editingId ? "Modifier le produit" : "Ajouter un produit"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {fr.stock.productName}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Ex: Tissu, Fil, Savon..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Only shown Quantity when editing an existing item */}
        {editingId && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {fr.stock.quantity}
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {fr.stock.unitSellingPrice}
          </label>
          <input
            type="number"
            value={formData.unitSellingPrice}
            onChange={(e) => onChange("unitSellingPrice", e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {fr.stock.threshold}
          </label>
          <input
            type="number"
            value={formData.threshold}
            onChange={(e) => onChange("threshold", e.target.value)}
            placeholder="Min"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {fr.common.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-[#60b8c0] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {editingId ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// -- Search bar --

interface StockSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const StockSearchBar: React.FC<StockSearchBarProps> = ({
  value,
  onChange,
}) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
      🔍
    </span>
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Rechercher un produit..."
      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#60b8c0]"
    />
  </div>
);

// -- Empty state --
// Two cases: no items at all, or search returned nothing

interface EmptyStockProps {
  hasItems: boolean;
}

export const EmptyStock: React.FC<EmptyStockProps> = ({ hasItems }) => (
  <div className="text-center py-12 text-gray-500">
    <p className="text-lg">
      {hasItems
        ? "Aucun produit ne correspond à votre recherche"
        : fr.stock.noProducts}
    </p>
  </div>
);

// -- Initial stock modal --

interface InitialStockModalProps {
  item: StockItem;
  formData: InitialStockFormData;
  error: string;
  onChange: (field: keyof InitialStockFormData, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const InitialStockModal: React.FC<InitialStockModalProps> = ({
  item,
  formData,
  error,
  onChange,
  onSubmit,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 mb-0">
    <div className="bg-white text-gray-600 rounded-xl p-6 w-[90%] max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Stock initial — {item.name}</h2>

      <div>
        <label className="block text-sm font-semibold mb-1">Date</label>
        <input
          type="date"
          value={formData.date}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => onChange("date", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">
          Quantité achetée
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={formData.qty}
          placeholder="Ex: 10"
          onChange={(e) => onChange("qty", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">
          Montant total (CFA)
        </label>
        <input
          type="number"
          value={formData.amount}
          placeholder="Ex: 50000"
          onChange={(e) => onChange("amount", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2 border rounded-lg">
          Annuler
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 py-2 bg-[#60b8c0] text-white rounded-lg"
        >
          Enregistrer
        </button>
      </div>
    </div>
  </div>
);
