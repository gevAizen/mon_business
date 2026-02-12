import { fr } from "@/lib/i18n";

interface AnalyticsProps {
  onBack: () => void;
}

export function Analytics({ onBack }: AnalyticsProps) {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-linear-to-b from-blue-50 to-white px-6 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {fr.analytics.title}
          </h1>
        </div>
        <p className="text-gray-600">Feature coming in Phase 8...</p>
      </div>
    </div>
  );
}
