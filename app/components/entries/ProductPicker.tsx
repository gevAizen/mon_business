import { StockItem } from "@/types";
import { useState } from "react";

export function ProductPicker({
  products,
  onSelect,
}: {
  products: StockItem[];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(query),
  );

  return (
    <div>
      <input
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#60b8c0]"
        type="text"
        placeholder="Saisir le nom du produit"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
      />

      {isOpen && query.length > 0 && (
        <ul className="text-gray-500 mt-1 rounded-sm p-1 max-h-32 border border-[#60b8c0] overflow-auto">
          {filteredProducts.map((product) => (
            <li
              className="border-b border-gray-200 py-1"
              key={product.id}
              onClick={() => {
                onSelect(product.id);
                setQuery(`${product.name} (Stock: ${product.quantity})`);
                setIsOpen(false);
              }}
            >
              {product.name} ({product.quantity})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
