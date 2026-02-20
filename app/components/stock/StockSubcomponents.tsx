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

  return (
    <div
      className={`border-2 rounded-xl p-4 ${
        low
          ? "border-amber-200 bg-amber-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            {low && (
              <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full">
                ⚠️ Bas
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Quantité: <span className="font-semibold">{item.quantity}</span>{" "}
            (Seuil: {item.threshold})
          </p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">
              💰 {item.unitPrice ? item.unitPrice.toLocaleString("fr-FR") : 0}{" "}
              CFA
            </span>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
              📈 Vendus: {item.totalSold ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 py-2 text-sm font-semibold text-[#60b8c0] hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
        >
          {fr.stock.edit}
        </button>
        <button
          onClick={() => {
            if (confirm("Êtes-vous sûr ?")) onDelete(item.id);
          }}
          className="flex-1 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
        >
          {fr.stock.delete}
        </button>
      </div>

      {!item.hasInitialStockTransaction && (
        <div className="mt-3">
          <button
            onClick={() => onInitialStock(item)}
            className="w-full py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Ajouter le stock initial
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
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
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

      {/* Quantity only shown when editing an existing item */}
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
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
          type="number"
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
