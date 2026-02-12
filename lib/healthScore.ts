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

import type { HealthScoreResult } from '@/types';
import type { DailyEntry } from '@/types';
import {
  getTodayProfit,
  getMonthlyProfit,
  getExpenseRatio,
  getMissingEntryCount,
  getLast7DaysTrend,
  getWeeklyGrowth,
} from './profit';

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
 * Generate contextual, encouraging message based on business health
 * "Start with Why" principle: Help them understand the WHY behind the score
 */
function generateHealthMessage(
  score: number,
  trend: number,
  expenseRatio: number,
  missingEntries: number,
): string {
  // Excellent (8.5-10)
  if (score >= 8.5) {
    if (trend === 1) {
      return 'Votre business est en excellente santé et en croissance ! Continuez comme ça.';
    }
    return 'Votre business est en excellente santé. Maintenez ce rythme.';
  }

  // Good (6.5-8.4)
  if (score >= 6.5) {
    if (expenseRatio > 0.75) {
      return 'Bien ! Contrôlez vos dépenses pour améliorer les marges.';
    }
    return 'Bonne trajectoire. Restez discipliné dans votre suivi.';
  }

  // Warning (4.5-6.4)
  if (score >= 4.5) {
    if (missingEntries > 2) {
      return 'À surveiller. Soyez rigoureux dans votre suivi quotidien.';
    }
    if (expenseRatio > 0.8) {
      return 'Attention : vos dépenses sont trop élevées. Réduisez les coûts.';
    }
    if (trend === -1) {
      return 'La tendance est négative. Analysez et ajustez votre stratégie.';
    }
    return 'À surveiller. Améliorez votre rentabilité.';
  }

  // Critical (0-4.4)
  if (expenseRatio > 0.9) {
    return 'Critique : dépenses > revenus. Action immédiate requise.';
  }
  if (trend === -1 && missingEntries > 3) {
    return 'Critique : suivi irrégulier et tendance négative. Reprenez le contrôle.';
  }
  return 'Situation critique. Ré-évaluez votre stratégie commerciale.';
}

/**
 * Get color coding for health score UI
 * "100 Things Designer Needs to Know": Color conveys meaning instantly
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 bg-green-50';
  if (score >= 6) return 'text-[#60b8c0] bg-blue-50';
  if (score >= 4) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

/**
 * Get emoji indicator for health score
 * "100 Things Designer Needs to Know": Icons/emojis aid recognition and memory
 */
export function getHealthScoreEmoji(score: number): string {
  if (score >= 8.5) return '🚀';
  if (score >= 6.5) return '📈';
  if (score >= 4.5) return '⚠️';
  return '🆘';
}
