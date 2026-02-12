"use client";

import { useState, useRef } from "react";
import { loadData, saveData } from "@/lib/storage";
import type { BusinessData } from "@/types";
import { fr } from "@/lib/i18n";

interface ExportImportProps {
  onBack: () => void;
}

/**
 * Validates imported data structure
 */
function isValidImportData(data: unknown): data is BusinessData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;

  return (
    typeof d.settings === "object" &&
    d.settings !== null &&
    Array.isArray(d.entries) &&
    Array.isArray(d.stock)
  );
}

export function ExportImport({ onBack }: ExportImportProps) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = loadData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mon_business_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessageType("success");
      setMessage("✓ Données téléchargées avec succès");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Export failed:", error);
      setMessageType("error");
      setMessage("Erreur lors du téléchargement");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        if (!isValidImportData(importedData)) {
          throw new Error("Format de fichier invalide");
        }

        const confirmed = window.confirm(
          "Cette action va remplacer toutes vos données actuelles. Êtes-vous sûr ?"
        );

        if (!confirmed) return;

        if (saveData(importedData)) {
          setMessageType("success");
          setMessage("✓ Données importées avec succès");
          setTimeout(() => setMessage(""), 3000);
        } else {
          throw new Error("Impossible de sauvegarder les données");
        }
      } catch (error) {
        console.error("Import failed:", error);
        setMessageType("error");
        setMessage(`Erreur: ${error instanceof Error ? error.message : "Impossible d'importer"}`);
        setTimeout(() => setMessage(""), 5000);
      }
    };

    reader.onerror = () => {
      setMessageType("error");
      setMessage("Erreur lors de la lecture du fichier");
      setTimeout(() => setMessage(""), 3000);
    };

    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white px-6 pt-6 pb-8 flex items-center gap-4">
        <button onClick={onBack} className="text-2xl">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Données</h1>
          <p className="text-gray-600 text-sm">Sauvegardez et restaurez vos données</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 space-y-6">
        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              messageType === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Export Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            💾 Télécharger mes données
          </h2>
          <p className="text-sm text-gray-600">
            Créez une sauvegarde de toutes vos données de business. Vous pourrez réimporter ce fichier
            ultérieurement.
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {fr.settings.exportData}
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            📂 Importer mes données
          </h2>
          <p className="text-sm text-gray-600">
            Restaurez vos données à partir d'une sauvegarde précédente. Vos données actuelles seront
            remplacées.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {fr.settings.importData}
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">🔒 Votre vie privée</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✓ Aucune donnée n'est envoyée en ligne</li>
            <li>✓ Toutes les données restent sur votre appareil</li>
            <li>✓ Les fichiers de sauvegarde sont stockés localement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
