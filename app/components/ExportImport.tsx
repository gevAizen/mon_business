'use client';

import { useState, useRef } from 'react';
import { loadData, saveData } from '@/lib/storage';
import type { BusinessData } from '@/types';
import { fr } from '@/lib/i18n';

interface ExportImportProps {
  onBack: () => void;
}

/**
 * Validates imported data structure
 */
function isValidImportData(data: unknown): data is BusinessData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  return (
    typeof d.settings === 'object' &&
    d.settings !== null &&
    Array.isArray(d.entries) &&
    Array.isArray(d.stock)
  );
}

export function ExportImport({ onBack }: ExportImportProps) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = loadData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mon_business_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessageType('success');
      setMessage(fr.settings.exportSuccess);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setMessageType('error');
      setMessage(fr.settings.exportError);
      setTimeout(() => setMessage(''), 3000);
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
          throw new Error(fr.settings.invalidFormat);
        }

        const confirmed = window.confirm(fr.settings.importConfirm);

        if (!confirmed) return;

        if (saveData(importedData)) {
          setMessageType('success');
          setMessage(fr.settings.importSuccess);
          setTimeout(() => setMessage(''), 3000);
        } else {
          throw new Error(fr.settings.importError);
        }
      } catch (error) {
        console.error('Import failed:', error);
        setMessageType('error');
        setMessage(
          `${fr.common.error}: ${error instanceof Error ? error.message : fr.settings.importError}`,
        );
        setTimeout(() => setMessage(''), 5000);
      }
    };

    reader.onerror = () => {
      setMessageType('error');
      setMessage(fr.settings.fileReadError);
      setTimeout(() => setMessage(''), 3000);
    };

    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-linear-to-b from-blue-50 to-white px-6 pt-6 pb-8 flex items-center gap-4">
        {/* <button onClick={onBack} className="text-2xl">
          ←
        </button> */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {fr.settings.dataTitle}
          </h1>
          <p className="text-gray-600 text-sm">{fr.settings.dataSubtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 space-y-6">
        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
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
            className="w-full bg-[#60b8c0] hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
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
    </div>
  );
}
