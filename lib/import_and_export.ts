// lib/import_and_export.ts

import type { DailyEntry, StockItem } from "@/types";
import { loadData } from "./storage";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The shape of the exported JSON file.
 * Versioning lets us handle breaking changes in the future:
 * if a user imports a v1 file into a v2 app, we can detect the mismatch
 * and either migrate or show a clear error — instead of silently corrupting data.
 */
export interface ExportPayload {
  version: 1;
  exportedAt: number; // Unix ms timestamp
  stock: StockItem[];
  entries: DailyEntry[];
}

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Serialises the entire app dataset to a JSON file and triggers a browser download.
 * JSON is used instead of CSV because our data contains typed fields (numbers,
 * booleans, union strings) that CSV would flatten to strings, requiring fragile
 * re-parsing on import.
 */
export async function exportJSON(): Promise<void> {
  const data = loadData();

  const payload: ExportPayload = {
    version: 1,
    exportedAt: Date.now(),
    stock: data.stock,
    entries: data.entries,
  };

  // Pretty-print (2-space indent) so the file is human-readable if opened in a text editor
  const json = JSON.stringify(payload, null, 2);

  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `mon_business_${toDateString(Date.now())}.json`;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke after a tick so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ─── Import ───────────────────────────────────────────────────────────────────

type ImportResult =
  | { ok: true; data: ExportPayload }
  | { ok: false; error: string };

export type { ImportResult };

/**
 * Reads a JSON export file and validates its structure before returning the data.
 * Returns a discriminated union so the caller always handles both cases explicitly —
 * no silent failures, no thrown errors to remember to catch.
 *
 * WHY a Result type instead of throw?
 * Throwing makes the error path implicit — every caller must remember to wrap in
 * try/catch. A Result type makes failure a first-class value: TypeScript forces
 * the caller to check `result.ok` before accessing `result.data`.
 */
export async function importJSON(file: File): Promise<ImportResult> {
  // 1. Read the file
  let raw: string;
  try {
    raw = await file.text();
  } catch {
    return { ok: false, error: "Impossible de lire le fichier." };
  }

  // 2. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Le fichier n'est pas un JSON valide." };
  }

  // 3. Validate shape
  const validation = validatePayload(parsed);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  return { ok: true, data: validation.data };
}

// ─── Validation ───────────────────────────────────────────────────────────────

type ValidationResult =
  | { ok: true; data: ExportPayload }
  | { ok: false; error: string };

/**
 * Validates that an unknown value matches the ExportPayload shape.
 *
 * WHY manual validation instead of a library like Zod?
 * This keeps the file dependency-free. If you're already using Zod elsewhere,
 * replacing these checks with a Zod schema would be cleaner and more robust.
 */
function validatePayload(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "Format de fichier invalide." };
  }

  const obj = raw as Record<string, unknown>;

  if (obj["version"] !== 1) {
    return {
      ok: false,
      error: `Version de fichier non supportée (reçu: ${obj["version"]}).`,
    };
  }

  if (!Array.isArray(obj["stock"])) {
    return { ok: false, error: 'Champ "stock" manquant ou invalide.' };
  }

  if (!Array.isArray(obj["entries"])) {
    return { ok: false, error: 'Champ "entries" manquant ou invalide.' };
  }

  // Spot-check a few critical fields on individual items
  for (const item of obj["stock"] as unknown[]) {
    const result = validateStockItem(item);
    if (!result.ok) return result;
  }

  for (const item of obj["entries"] as unknown[]) {
    const result = validateEntry(item);
    if (!result.ok) return result;
  }

  return { ok: true, data: obj as unknown as ExportPayload };
}

function validateStockItem(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Article de stock invalide." };
  }

  const item = raw as Record<string, unknown>;

  if (typeof item["id"] !== "string") {
    return { ok: false, error: 'Article de stock sans champ "id" valide.' };
  }
  if (typeof item["name"] !== "string") {
    return { ok: false, error: 'Article de stock sans champ "name" valide.' };
  }
  if (typeof item["quantity"] !== "number") {
    return {
      ok: false,
      error: `Stock "${item["id"]}" : "quantity" doit être un nombre.`,
    };
  }

  return { ok: true, data: undefined as unknown as ExportPayload };
}

function validateEntry(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Entrée invalide." };
  }

  const entry = raw as Record<string, unknown>;

  if (typeof entry["id"] !== "string") {
    return { ok: false, error: 'Entrée sans champ "id" valide.' };
  }
  if (typeof entry["timestamp"] !== "number") {
    return {
      ok: false,
      error: `Entrée "${entry["id"]}" : "timestamp" doit être un nombre.`,
    };
  }
  if (entry["type"] !== "SALE" && entry["type"] !== "EXPENSE") {
    return {
      ok: false,
      error: `Entrée "${entry["id"]}" : type "${entry["type"]}" inconnu.`,
    };
  }
  if (typeof entry["amount"] !== "number") {
    return {
      ok: false,
      error: `Entrée "${entry["id"]}" : "amount" doit être un nombre.`,
    };
  }

  return { ok: true, data: undefined as unknown as ExportPayload };
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Returns a local YYYY-MM-DD string for a Unix timestamp.
 * Used to name the export file by today's date.
 */
function toDateString(timestamp: number): string {
  const d = new Date(timestamp);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
