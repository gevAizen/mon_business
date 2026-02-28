"use client";

import { fr } from "@/lib/i18n";
import { exportJSON, importJSON } from "@/lib/import_and_export";
import { clearData, loadData, saveData } from "@/lib/storage";
import type { BusinessData } from "@/types";
import { useRef, useState } from "react";
import PageWrapper from "./PageWrapper";

interface ExportImportProps {
  onBack: () => void;
}

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Reset input value so selecting the same file again triggers onChange
    event.target.value = "";

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setMessageType("error");
      setMessage(fr.settings.invalidFormat);
      setTimeout(() => setMessage(""), 5000);
      return;
    }

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
    // Preserve existing settings during import as requested in original logic
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
      <div className="flex-1 pb-8 overflow-auto">
        {/* Global Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              messageType === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span className="text-xl">
              {messageType === "success" ? "✅" : "⚠️"}
            </span>
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Main Actions Grid */}
        {/* 
           - grid-cols-1: Mobile (stacked)
           - md:grid-cols-3: Desktop (side-by-side)
           - gap-6: Generous spacing for big screens
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Export Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <div className="flex-1 space-y-3">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span className="text-2xl">📤</span> {fr.settings.exportTitle}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {fr.settings.exportDescription}
              </p>
            </div>
            <button
              onClick={handleExport}
              className="mt-6 w-full bg-[#60b8c0] hover:bg-[#5aaeb6] text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm active:scale-[0.98] transform"
            >
              {fr.settings.exportData}
            </button>
          </div>

          {/* Import Card */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <div className="flex-1 space-y-3">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span className="text-2xl">📥</span> {fr.settings.importTitle}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {fr.settings.importDescription}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm active:scale-[0.98] transform"
            >
              {fr.settings.importData}
            </button>
          </div>

          {/* Clear Data Card */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <div className="flex-1 space-y-3">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span className="text-2xl">🗑️</span>{" "}
                {fr.settings.clearDataTitle}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {fr.settings.clearDataDescription}
              </p>
            </div>
            <button
              onClick={handleClearData}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm active:scale-[0.98] transform"
            >
              {fr.settings.clearDataButton}
            </button>
          </div>
        </div>

        {/* Privacy Information Section */}
        {/* Spans full width below the grid */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🔒</span> {fr.settings.privacyTitle}
          </h3>
          <ul className="space-y-3">
            {[
              fr.settings.privacyPoint1,
              fr.settings.privacyPoint2,
              fr.settings.privacyPoint3,
            ].map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-gray-600"
              >
                <span className="mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}

const HeaderComponent: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        {fr.settings.dataTitle}
      </h1>
      <p className="text-gray-600 text-sm md:text-base">
        {fr.settings.dataSubtitle}
      </p>
    </div>
  );
};
