"use client";

import { useState } from "react";
import type { BusinessSettings } from "@/types";
import { loadData } from "@/lib/storage";
import { fr } from "@/lib/i18n";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { StockManagement } from "./components/stock/StockManagement";
import { EntriesList } from "./components/entries/EntriesList";
import { ExportImport } from "./components/ExportImport";
import { InstallBanner } from "./components/InstallBanner";
import { Analytics } from "./components/Analytics";
import {
  BookText,
  ChartColumn,
  Database,
  Layers,
  SquareActivity,
  Warehouse,
} from "lucide-react";

export type Page =
  | "dashboard"
  | "stock"
  | "entries"
  | "settings"
  | "onboarding"
  | "analytics";

export default function Home() {
  // ✅ Compute initial state synchronously
  const initialAppState = (() => {
    const data = loadData();

    if (!data.settings.name) {
      return {
        page: "onboarding" as Page,
        settings: null,
      };
    }

    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");

    let page: Page = "dashboard";
    if (action === "stock") page = "stock";
    if (action === "add-entry") page = "dashboard";

    return {
      page,
      settings: data.settings,
    };
  })();

  const [currentPage, setCurrentPage] = useState<Page>(initialAppState.page);
  const [settings, setSettings] = useState<BusinessSettings | null>(
    initialAppState.settings,
  );

  const handleOnboardingComplete = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    setCurrentPage("dashboard");
  };

  // ✅ Strongly typed (no cast needed)
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  // Onboarding screen
  if (currentPage === "onboarding") {
    return (
      <>
        <Onboarding onComplete={handleOnboardingComplete} />
        <InstallBanner />
      </>
    );
  }

  if (!settings) return null;

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
        <div className="flex max-w-md mx-auto">
          <button
            onClick={() => handleNavigate("dashboard")}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              currentPage === "dashboard"
                ? "text-[#60b8c0] border-t-2 border-[#60b8c0]"
                : "text-gray-600 border-t-2 border-transparent hover:text-gray-900"
            }`}
          >
            <span className="text-xl">
              <ChartColumn />
            </span>
            <span className="text-xs font-semibold">{fr.nav.dashboard}</span>
          </button>

          <button
            onClick={() => handleNavigate("entries")}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              currentPage === "entries"
                ? "text-[#60b8c0] border-t-2 border-[#60b8c0]"
                : "text-gray-600 border-t-2 border-transparent hover:text-gray-900"
            }`}
          >
            <span className="text-xl">
              <BookText />
            </span>
            <span className="text-xs font-semibold">{fr.nav.entries}</span>
          </button>

          <button
            onClick={() => handleNavigate("stock")}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              currentPage === "stock"
                ? "text-[#60b8c0] border-t-2 border-[#60b8c0]"
                : "text-gray-600 border-t-2 border-transparent hover:text-gray-900"
            }`}
          >
            <span className="text-xl">
              <Layers />
            </span>
            <span className="text-xs font-semibold">{fr.nav.stock}</span>
          </button>

          <button
            onClick={() => handleNavigate("settings")}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              currentPage === "settings"
                ? "text-[#60b8c0] border-t-2 border-[#60b8c0]"
                : "text-gray-600 border-t-2 border-transparent hover:text-gray-900"
            }`}
          >
            <span className="text-xl">
              <Database />
            </span>
            <span className="text-xs font-semibold">{fr.nav.settings}</span>
          </button>
        </div>
      </nav>

      {currentPage === "dashboard" && (
        <Dashboard settings={settings} onNavigate={handleNavigate} />
      )}
      {currentPage === "stock" && (
        <StockManagement onBack={() => handleNavigate("dashboard")} />
      )}
      {currentPage === "entries" && (
        <EntriesList onBack={() => handleNavigate("dashboard")} />
      )}
      {currentPage === "settings" && (
        <ExportImport onBack={() => handleNavigate("dashboard")} />
      )}
      {currentPage === "analytics" && (
        <Analytics onBack={() => handleNavigate("dashboard")} />
      )}

      <InstallBanner />
    </>
  );
}
