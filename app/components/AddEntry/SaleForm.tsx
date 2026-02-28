import { fr } from "@/lib/i18n";
import type { DailyEntry, SaleLineItemInput, StockItem } from "@/types";
import { ProductPicker } from "../entries/ProductPicker";
import React from "react";

interface SaleFormProps {
  existingEntry?: DailyEntry;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  quantity: string;
  setQuantity: (q: string) => void;
  amount: string;
  setAmount: (a: string) => void;

  // multi-item props (only used when existingEntry is undefined)
  lineItems: SaleLineItemInput[];
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  updateLineItem: (
    id: string,
    changes: Partial<Omit<SaleLineItemInput, "id">>,
  ) => void;

  sortedStock: StockItem[];
  getProductDefaultSellingPrice: () => string;
  getProductUnitSellingPrice: () => number;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  existingEntry,
  selectedProductId,
  setSelectedProductId,
  quantity,
  setQuantity,
  amount,
  setAmount,
  lineItems,
  addLineItem,
  removeLineItem,
  updateLineItem,
  sortedStock,
  getProductDefaultSellingPrice,
  getProductUnitSellingPrice,
}) => {
  if (existingEntry) {
    // single-entry edit mode
    return (
      <>
        <ProductPicker onSelect={setSelectedProductId} products={sortedStock} />
        <div className="flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="quantity"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {fr.entry.quantity}
            </label>
            <input
              id="quantity"
              type="text"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.0"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="amount"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {fr.entry.total}
            </label>
            <input
              id="amount"
              type="number"
              value={amount || getProductDefaultSellingPrice()}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {selectedProductId && (
          <div className="text-sm text-gray-600 text-right">
            {fr.entry.sellingUnitPrice}:{" "}
            {getProductUnitSellingPrice().toLocaleString("fr-FR")} CFA
          </div>
        )}
      </>
    );
  }

  // otherwise, render multi-item sale form
  return (
    <div className="space-y-4">
      {lineItems.map((li) => {
        const qtyNum = parseFloat(li.quantity) || 0;
        const unitNum = parseFloat(li.unitPrice) || 0;
        const lineTotal = Math.round(qtyNum * unitNum);

        return (
          <div
            key={li.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-end"
          >
            <div className="col-span-2">
              <ProductPicker
                onSelect={(id) =>
                  updateLineItem(li.id, {
                    productId: id,
                    unitPrice:
                      sortedStock
                        .find((p) => p.id === id)
                        ?.unitSellingPrice.toString() || "",
                  })
                }
                products={sortedStock}
              />
            </div>
            <div>
              <label
                htmlFor={`qty_${li.id}`}
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                {fr.entry.quantity}
              </label>
              <input
                id={`qty_${li.id}`}
                type="text"
                inputMode="decimal"
                value={li.quantity}
                onChange={(e) =>
                  updateLineItem(li.id, { quantity: e.target.value })
                }
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor={`unit_${li.id}`}
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                {fr.entry.sellingUnitPrice}
              </label>
              <input
                id={`unit_${li.id}`}
                type="number"
                value={li.unitPrice}
                onChange={(e) =>
                  updateLineItem(li.id, { unitPrice: e.target.value })
                }
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600 text-right">
              {fr.entry.total}: {lineTotal.toLocaleString("fr-FR")} CFA
            </div>
            <div>
              {lineItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLineItem(li.id)}
                  className="text-red-500 text-xs"
                >
                  {fr.entry.removeLineItem}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div>
        <button
          type="button"
          onClick={addLineItem}
          className="text-blue-600 text-sm font-semibold"
        >
          {fr.entry.addLineItem}
        </button>
      </div>

      {/* grand total */}
      <div className="text-gray-500 text-right font-semibold pt-2">
        {fr.entry.total}:{" "}
        {lineItems
          .reduce(
            (sum, li) =>
              sum +
              (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0),
            0,
          )
          .toLocaleString("fr-FR")}{" "}
        CFA
      </div>
    </div>
  );
};
