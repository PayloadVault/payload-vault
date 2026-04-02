import type { ExpenseRecord, StoredProduct } from "../useExpenses/types";
import type { PdfRecord } from "../usePdf/types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];

export type MonthlyTotal = {
  month: string;
  monthIndex: number;
  total: number;
};

export type ForecastPoint = {
  month: string;
  monthIndex: number;
  actual: number | null;
  forecast: number | null;
};

/**
 * Aggregate expenses by month (0-11)
 */
export function getMonthlyExpenseTotals(
  expenses: ExpenseRecord[],
): MonthlyTotal[] {
  const map = new Map<number, number>();
  expenses.forEach((e) => {
    const m = new Date(e.expense_date).getMonth();
    map.set(m, (map.get(m) ?? 0) + e.amount);
  });
  return Array.from({ length: 12 }, (_, i) => ({
    month: MONTH_NAMES[i],
    monthIndex: i,
    total: map.get(i) ?? 0,
  }));
}

/**
 * Aggregate income (pdf_records profit) by month (0-11)
 */
export function getMonthlyIncomeTotals(pdfs: PdfRecord[]): MonthlyTotal[] {
  const map = new Map<number, number>();
  pdfs.forEach((p) => {
    const m = new Date(p.date_created).getMonth();
    map.set(m, (map.get(m) ?? 0) + p.profit);
  });
  return Array.from({ length: 12 }, (_, i) => ({
    month: MONTH_NAMES[i],
    monthIndex: i,
    total: map.get(i) ?? 0,
  }));
}

/**
 * Get current month index (0-based) from the wall clock.
 */
function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

/**
 * Simple linear-regression-based expense forecast.
 * Uses data from months 0..currentMonth to project currentMonth+1..11.
 */
export function buildExpenseForecast(
  expenses: ExpenseRecord[],
  year: number,
): ForecastPoint[] {
  const monthly = getMonthlyExpenseTotals(expenses);
  const currentYear = new Date().getFullYear();
  const currentMonth =
    year < currentYear ? 11 : year > currentYear ? -1 : getCurrentMonthIndex();

  // Collect months that have data up to and including current month
  const knownPoints = monthly
    .filter((m) => m.monthIndex <= currentMonth && m.total > 0)
    .map((m) => ({ x: m.monthIndex, y: m.total }));

  // Simple linear regression
  let slope = 0;
  let intercept = 0;

  if (knownPoints.length >= 2) {
    const n = knownPoints.length;
    const sumX = knownPoints.reduce((s, p) => s + p.x, 0);
    const sumY = knownPoints.reduce((s, p) => s + p.y, 0);
    const sumXY = knownPoints.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = knownPoints.reduce((s, p) => s + p.x * p.x, 0);
    const denom = n * sumXX - sumX * sumX;
    if (denom !== 0) {
      slope = (n * sumXY - sumX * sumY) / denom;
      intercept = (sumY - slope * sumX) / n;
    }
  } else if (knownPoints.length === 1) {
    // With only one data point, use it as flat projection
    intercept = knownPoints[0].y;
    slope = 0;
  }

  return monthly.map((m) => {
    if (m.monthIndex <= currentMonth) {
      return {
        month: m.month,
        monthIndex: m.monthIndex,
        actual: m.total,
        forecast:
          m.monthIndex === currentMonth && knownPoints.length >= 1
            ? m.total // overlap point
            : null,
      };
    }
    // Future months
    const projected = Math.max(0, intercept + slope * m.monthIndex);
    return {
      month: m.month,
      monthIndex: m.monthIndex,
      actual: null,
      forecast: Math.round(projected * 100) / 100,
    };
  });
}

/**
 * Simple linear-regression-based income forecast.
 * Uses data from months 0..currentMonth to project currentMonth+1..11.
 */
export function buildIncomeForecast(
  pdfs: PdfRecord[],
  year: number,
): ForecastPoint[] {
  const monthly = getMonthlyIncomeTotals(pdfs);
  const currentYear = new Date().getFullYear();
  const currentMonth =
    year < currentYear ? 11 : year > currentYear ? -1 : getCurrentMonthIndex();

  // Collect months that have data up to and including current month
  const knownPoints = monthly
    .filter((m) => m.monthIndex <= currentMonth && m.total > 0)
    .map((m) => ({ x: m.monthIndex, y: m.total }));

  // Simple linear regression
  let slope = 0;
  let intercept = 0;

  if (knownPoints.length >= 2) {
    const n = knownPoints.length;
    const sumX = knownPoints.reduce((s, p) => s + p.x, 0);
    const sumY = knownPoints.reduce((s, p) => s + p.y, 0);
    const sumXY = knownPoints.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = knownPoints.reduce((s, p) => s + p.x * p.x, 0);
    const denom = n * sumXX - sumX * sumX;
    if (denom !== 0) {
      slope = (n * sumXY - sumX * sumY) / denom;
      intercept = (sumY - slope * sumX) / n;
    }
  } else if (knownPoints.length === 1) {
    intercept = knownPoints[0].y;
    slope = 0;
  }

  return monthly.map((m) => {
    if (m.monthIndex <= currentMonth) {
      return {
        month: m.month,
        monthIndex: m.monthIndex,
        actual: m.total,
        forecast:
          m.monthIndex === currentMonth && knownPoints.length >= 1
            ? m.total
            : null,
      };
    }
    const projected = Math.max(0, intercept + slope * m.monthIndex);
    return {
      month: m.month,
      monthIndex: m.monthIndex,
      actual: null,
      forecast: Math.round(projected * 100) / 100,
    };
  });
}

/**
 * Calculate total forecast for rest of year
 */
export function getForecastSummary(forecastData: ForecastPoint[]) {
  const totalActual = forecastData.reduce((s, p) => s + (p.actual ?? 0), 0);
  const totalForecast = forecastData.reduce((s, p) => s + (p.forecast ?? 0), 0);
  const projectedTotal = totalActual + totalForecast;
  // Exclude overlap point (where actual and forecast both exist)
  const overlapAmount = forecastData
    .filter((p) => p.actual !== null && p.forecast !== null)
    .reduce((s, p) => s + (p.forecast ?? 0), 0);
  return {
    totalActual,
    totalForecast: totalForecast - overlapAmount,
    projectedTotal: projectedTotal - overlapAmount,
  };
}

/**
 * Get per-category expense totals from expense records.
 */
export function getCategoryExpenseTotals(
  expenses: ExpenseRecord[],
): Map<string, number> {
  const map = new Map<string, number>();
  expenses.forEach((e) => {
    const products = Array.isArray(e.products)
      ? (e.products as StoredProduct[])
      : [];
    if (products.length > 0) {
      products.forEach((p) => {
        map.set(p.category, (map.get(p.category) ?? 0) + p.amount);
      });
    } else {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
  });
  return map;
}
