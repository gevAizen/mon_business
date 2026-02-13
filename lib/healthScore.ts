/**
 * Business Health Score Logic
 * Deterministic 0-10 scoring system
 * Inspired by "Start with Why" - focus on business vitality and momentum
 *
 * Scoring factors:
 * - Profitability (are you making money?)
 * - Consistency (do you have predictable income?)
 * - Efficiency (are you controlling costs?)
 * - Momentum (is the trend positive?)
 * - Discipline (are you tracking consistently?)
 */

import type { HealthScoreResult } from "@/types";
import type { DailyEntry } from "@/types";
import {
  getTodayProfit,
  getMonthlyProfit,
  getExpenseRatio,
  getMissingEntryCount,
  getLast7DaysTrend,
  getWeeklyGrowth,
} from "./profit";

export function calculateHealthScore(
  entries: DailyEntry[],
  dailyTarget?: number,
): HealthScoreResult {
  let score = 70; // Start at 7/10 (neutral base)

  // Factor 1: Profitability (20 points) - Start with Why: Purpose requires profitability
  const todayProfit = getTodayProfit(entries);
  const monthlyProfit = getMonthlyProfit(entries);

  if (todayProfit > 0) {
    score += 5;
  } else if (todayProfit < 0) {
    score -= 15;
  }

  if (monthlyProfit > 0) {
    score += 10;
  } else if (monthlyProfit < 0) {
    score -= 20;
  }

  // Factor 2: Consistency & Discipline (15 points)
  // "100 Things Designer Needs to Know": People respond to consistency
  const missingEntries = getMissingEntryCount(entries, 7);

  if (missingEntries === 0) {
    score += 10;
  } else if (missingEntries === 1) {
    score += 5;
  } else if (missingEntries >= 5) {
    score -= 10;
  }

  // Factor 3: Expense Control (15 points)
  // "Start with Why": Control what you can control
  const expenseRatio = getExpenseRatio(entries, 7);

  if (expenseRatio < 0.5) {
    score += 15; // Less than 50% of sales = excellent
  } else if (expenseRatio < 0.7) {
    score += 5; // 50-70% = acceptable
  } else if (expenseRatio > 0.9) {
    score -= 15; // More than 90% = critical
  } else {
    score -= 5; // 70-90% = warning
  }

  // Factor 4: Momentum (15 points)
  // "Start with Why": Movement toward your vision
  const trend = getLast7DaysTrend(entries);
  const weeklyGrowth = getWeeklyGrowth(entries);

  if (trend === 1) {
    score += 10;
  } else if (trend === -1) {
    score -= 10;
  }

  if (weeklyGrowth > 10) {
    score += 5; // Strong growth
  } else if (weeklyGrowth < -10) {
    score -= 5; // Strong decline
  }

  // Factor 5: Daily Target Achievement (10 points if target exists)
  // "100 Things Designer Needs to Know": People need clear goals and feedback
  if (dailyTarget && dailyTarget > 0) {
    if (todayProfit >= dailyTarget) {
      score += 10;
    } else if (todayProfit >= dailyTarget * 0.75) {
      score += 5;
    }
  }

  // Clamp score to 0-100 range, then normalize to 0-10
  const clampedScore = Math.max(0, Math.min(100, score));
  const finalScore = Math.round((clampedScore / 100) * 10 * 2) / 2; // Round to nearest 0.5

  // Generate contextual message based on score and factors
  const message = generateHealthMessage(
    finalScore,
    trend,
    expenseRatio,
    missingEntries,
  );

  return {
    score: finalScore,
    message,
  };
}

/**
 * Génère un message contextuel et encourageant basé sur la santé du business.
 * Aide l'utilisateur à comprendre le "POURQUOI" derrière le score et propose des actions concrètes.
 */
function generateHealthMessage(
  score: number,
  trend: number, // 1: amélioration, 0: stable, -1: détérioration
  expenseRatio: number, // Ratio dépenses/revenus (ex: 0.8 = 80% des revenus en dépenses)
  missingEntries: number, // Nombre d'entrées manquantes dans le suivi
): string {
  // Excellente santé (8.5-10)
  if (score >= 8.5) {
    if (trend === 1) {
      return "Excellente santé ! Votre business est en pleine croissance. 🎉\nConseil : Continuez à suivre vos performances pour maintenir cette dynamique.";
    }
    return "Votre business est en excellente santé.\nConseil : Maintenez ce rythme et célébrez vos progrès !";
  }

  // Bonne santé (6.5-8.4)
  if (score >= 6.5) {
    if (expenseRatio > 0.75) {
      return "Bonne santé globale, mais vos marges pourraient être optimisées.\nEssayez de réduire vos dépenses non essentielles ce mois-ci.";
    }
    if (trend === 0) {
      return "Votre business est stable. Restez discipliné dans votre suivi pour préparer la croissance.";
    }
    return "Bonne trajectoire ! Un suivi régulier vous aidera à atteindre vos objectifs.";
  }

  // À surveiller (4.5-6.4)
  if (score >= 4.5) {
    if (missingEntries > 2) {
      return "Votre business a besoin d’un suivi plus rigoureux.\nPrenez 5 minutes par jour pour mettre à jour vos entrées.";
    }
    if (expenseRatio > 0.8) {
      return "Vos dépenses sont élevées ce mois-ci.\nIdentifiez 1 ou 2 postes à réduire pour améliorer vos marges.";
    }
    if (trend === -1) {
      return "La tendance est à la baisse. Analysez vos dépenses et revenus pour inverser la situation.";
    }
    return "À surveiller : améliorez votre rentabilité en réduisant les coûts superflus.";
  }

  // Critique (0-4.4)
  if (expenseRatio > 0.9) {
    return "Situation urgente : vos dépenses dépassent vos revenus.\nCommencez par lister vos 3 plus grosses dépenses et réduisez-les dès aujourd’hui.";
  }
  if (trend === -1 && missingEntries > 3) {
    return "Votre business a besoin d’une attention immédiate : suivi irrégulier et tendance négative.\nUtilisez notre outil d’analyse pour identifier les solutions ou contactez un conseiller.";
  }
  if (missingEntries > 5) {
    return "Situation critique : votre suivi est incomplet.\nMettez à jour vos données pour prendre les bonnes décisions.";
  }
  return "Votre business traverse une période difficile.\nRéévaluez votre stratégie ou demandez de l’aide pour rebondir.";
}

/**
 * Get color coding for health score UI
 * "100 Things Designer Needs to Know": Color conveys meaning instantly
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 8) return "text-green-600 bg-green-50";
  if (score >= 6) return "text-[#60b8c0] bg-blue-50";
  if (score >= 4) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

/**
 * Get emoji indicator for health score
 * "100 Things Designer Needs to Know": Icons/emojis aid recognition and memory
 */
export function getHealthScoreEmoji(score: number): string {
  if (score >= 8.5) return "🚀";
  if (score >= 6.5) return "📈";
  if (score >= 4.5) return "⚠️";
  return "🆘";
}
