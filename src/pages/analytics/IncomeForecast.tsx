import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PdfRecord } from "../../hooks/usePdf/types";
import {
  buildIncomeForecast,
  getForecastSummary,
} from "../../hooks/useAnalytics/forecastUtils";
import { normalizeProfit } from "../../components/contentCard/ContentCard.utils";

type IncomeForecastProps = {
  pdfs: PdfRecord[];
  year: number;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number; color?: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-color-bg-card border border-color-border-light rounded-radius-md px-3 py-2 shadow-shadow-medium">
      <p className="text-sm font-medium text-color-text-main">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="text-sm font-semibold"
          style={{ color: entry.color }}
        >
          {entry.dataKey === "actual" ? "Ist" : "Prognose"}:{" "}
          {normalizeProfit(entry.value ?? 0)} €
        </p>
      ))}
    </div>
  );
};

export const IncomeForecast = ({ pdfs, year }: IncomeForecastProps) => {
  const forecastData = useMemo(
    () => buildIncomeForecast(pdfs, year),
    [pdfs, year],
  );
  const summary = useMemo(
    () => getForecastSummary(forecastData),
    [forecastData],
  );

  const hasActualData = forecastData.some(
    (d) => d.actual !== null && d.actual > 0,
  );
  const hasForecastData = forecastData.some((d) => d.forecast !== null);

  // Find the transition point index
  const transitionIdx = forecastData.findIndex(
    (d) => d.actual !== null && d.forecast !== null,
  );

  return (
    <div className="bg-color-bg-card border border-color-border-light rounded-radius-lg p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-color-text-main">
            Einnahmenprognose
          </h4>
          <p className="text-xs text-color-text-subtle mt-0.5">
            Lineare Trendprognose basierend auf bisherigen Einnahmen
          </p>
        </div>
      </div>

      {!hasActualData ? (
        <div className="flex items-center justify-center h-48 text-color-text-subtle text-sm">
          Keine Daten für eine Prognose vorhanden
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-color-bg-main rounded-radius-md p-3">
              <span className="text-xs text-color-text-subtle uppercase tracking-wide">
                Bisherige Einnahmen
              </span>
              <p className="text-lg font-bold text-color-primary mt-0.5">
                {normalizeProfit(summary.totalActual)} €
              </p>
            </div>
            <div className="bg-color-bg-main rounded-radius-md p-3">
              <span className="text-xs text-color-text-subtle uppercase tracking-wide">
                Prognostiziert (Rest)
              </span>
              <p className="text-lg font-bold text-color-text-main mt-0.5 opacity-70">
                {hasForecastData
                  ? `${normalizeProfit(summary.totalForecast)} €`
                  : "–"}
              </p>
            </div>
            <div className="bg-color-bg-main rounded-radius-md p-3">
              <span className="text-xs text-color-text-subtle uppercase tracking-wide">
                Hochrechnung Gesamt
              </span>
              <p className="text-lg font-bold text-color-primary mt-0.5">
                {normalizeProfit(summary.projectedTotal)} €
              </p>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={forecastData}
              margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="incomeActualGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="incomeForecastGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-light)"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--color-text-subtle)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-border-light)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  `${(v / 1000).toFixed(v >= 1000 ? 0 : 1)}k`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              {transitionIdx >= 0 && (
                <ReferenceLine
                  x={forecastData[transitionIdx].month}
                  stroke="var(--color-border-light)"
                  strokeDasharray="5 5"
                  label={{
                    value: "Heute",
                    position: "top",
                    fill: "var(--color-text-subtle)",
                    fontSize: 11,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#incomeActualGradient)"
                dot={{
                  fill: "var(--color-primary)",
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  strokeWidth: 0,
                  fill: "var(--color-primary)",
                }}
                connectNulls={false}
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#22d3ee"
                strokeWidth={2}
                strokeDasharray="6 3"
                fill="url(#incomeForecastGradient)"
                dot={{ fill: "#22d3ee", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#22d3ee" }}
                connectNulls={false}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-color-text-subtle">
              <span className="w-3 h-0.5 bg-color-primary rounded-full inline-block" />
              Tatsächlich
            </div>
            <div className="flex items-center gap-1.5 text-xs text-color-text-subtle">
              <span
                className="w-3 h-0.5 rounded-full inline-block"
                style={{ background: "#22d3ee" }}
              />
              Prognose
            </div>
          </div>
        </>
      )}
    </div>
  );
};
