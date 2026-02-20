"use client";

import { useState, useRef } from "react";
import { loadData, saveData, clearData } from "@/lib/storage";
import type { BusinessData, DailyEntry, StockItem } from "@/types";
import { fr } from "@/lib/i18n";
import PageWrapper from "./PageWrapper";
import { exportJSON, importJSON } from "@/lib/import_and_export";

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

  // ─── Export ──────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    try {
      await exportJSON();
      setMessageType("success");
      setMessage(fr.settings.exportSuccess);
    } catch {
      setMessageType("error");
      setMessage(fr.settings.exportError);
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ─── Import ───────────────────────────────────────────────────────────────────

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Always reset the input so the same file can be re-selected after an error
    event.target.value = "";

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setMessageType("error");
      setMessage(fr.settings.invalidFormat);
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    // importJSON returns a Result — no try/catch needed here, errors are values
    const result = await importJSON(file);

    if (!result.ok) {
      setMessageType("error");
      setMessage(result.error);
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    const confirmed = window.confirm(fr.settings.importConfirm);
    if (!confirmed) return;

    const currentData = loadData();
    if (saveData({ ...result.data, settings: currentData.settings })) {
      setMessageType("success");
      setMessage(fr.settings.importSuccess);
    } else {
      setMessageType("error");
      setMessage(fr.settings.importError);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleClearData = () => {
    const confirmed = window.confirm(fr.settings.clearDataConfirm);
    if (!confirmed) return;

    if (clearData()) {
      setMessageType("success");
      setMessage(fr.settings.clearDataSuccess);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  };

  return (
    <PageWrapper header={<HeaderComponent />}>
      {/* Content */}
      <div className="flex-1 pb-4 overflow-auto space-y-6">
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
            {fr.settings.exportTitle}
          </h2>
          <p className="text-sm text-gray-600">
            {fr.settings.exportDescription}
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-[#60b8c0] text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {fr.settings.exportData}
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            {fr.settings.importTitle}
          </h2>
          <p className="text-sm text-gray-600">
            {fr.settings.importDescription}
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

        {/* Clear Data Section - Destructive action */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            {fr.settings.clearDataTitle}
          </h2>
          <p className="text-sm text-gray-600">
            {fr.settings.clearDataDescription}
          </p>
          <button
            onClick={handleClearData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {fr.settings.clearDataButton}
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">
            {fr.settings.privacyTitle}
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>{fr.settings.privacyPoint1}</li>
            <li>{fr.settings.privacyPoint2}</li>
            <li>{fr.settings.privacyPoint3}</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}

// Define HeaderComponent outside with props
const HeaderComponent: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-gray-900">
        {fr.settings.dataTitle}
      </h1>
      <p className="text-gray-600 text-sm">{fr.settings.dataSubtitle}</p>
    </div>
  );
};
