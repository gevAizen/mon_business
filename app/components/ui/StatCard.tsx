interface StatCardProps {
  label: string;
  value: number;
  colorClass: string; // e.g., "text-green-600"
}

export function StatCard({ label, value, colorClass }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-2">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-lg md:text-xl font-bold mt-1 ${colorClass}`}>
        {value.toLocaleString("fr-FR")}
      </span>
    </div>
  );
}
