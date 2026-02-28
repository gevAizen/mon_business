import React from "react";
import { StatCard } from "../ui/StatCard";

interface MonthSummaryProps {
  sales: number;
  expenses: number;
}

export function MonthSummary({ sales, expenses }: MonthSummaryProps) {
  const profit = sales - expenses;

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
      <StatCard label="Ventes" value={sales} colorClass="text-green-600" />
      <StatCard label="Dépenses" value={expenses} colorClass="text-red-600" />
      <StatCard
        label="Profit"
        value={profit}
        colorClass={profit >= 0 ? "text-blue-600" : "text-orange-600"}
      />
    </div>
  );
}
