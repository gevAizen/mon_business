"use client";

import { useState } from "react";
import type { BusinessSettings } from "@/types";
import { saveData, loadData } from "@/lib/storage";
import { fr } from "@/lib/i18n";
import Image from "next/image";

interface OnboardingProps {
  onComplete: (settings: BusinessSettings) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [businessName, setBusinessName] = useState("");
  const [dailyTarget, setDailyTarget] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!businessName.trim()) {
      setError("Veuillez entrer le nom de votre business");
      return;
    }

    const settings: BusinessSettings = {
      name: businessName.trim(),
      dailyTarget: dailyTarget ? parseInt(dailyTarget, 10) : undefined,
    };

    // Save to storage
    const data = loadData();
    data.settings = settings;
    if (!saveData(data)) {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
      return;
    }

    onComplete(settings);
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-blue-50 to-white flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        {/* Hero Section - Start with Why */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/img/icon.png"
              alt="MonBusiness icon"
              width={100}
              height={100}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {fr.onboarding.title}
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            {fr.onboarding.description}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-6">
          {/* Business Name Input */}
          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {fr.onboarding.businessNameLabel}
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={fr.onboarding.businessNamePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              autoFocus
            />
          </div>

          {/* Daily Target Input */}
          <div>
            <label
              htmlFor="dailyTarget"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {fr.onboarding.dailyTargetLabel}
            </label>
            <input
              id="dailyTarget"
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              placeholder={fr.onboarding.dailyTargetPlaceholder}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button - Large and prominent */}
          <button
            type="submit"
            className="w-full py-4 bg-[#60b8c0] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            {fr.onboarding.startButton}
          </button>
        </form>

        {/* Trust/Why Section - Build confidence */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-lg text-green-500">✓</span>
            <span>{fr.onboarding.trust.security}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg text-green-500">✓</span>
            <span>{fr.onboarding.trust.offline}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg text-green-500">✓</span>
            <span>{fr.onboarding.trust.privacy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
