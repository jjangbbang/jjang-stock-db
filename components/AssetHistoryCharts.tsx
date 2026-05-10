"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

type History = {
  date: string;
  totalAsset: number;
  stockAsset: number;
  pension: number;
  annualProfit: number;
  cumulativeProfit: number;
};

const won = (v: number) =>
  `${Math.round(v).toLocaleString("ko-KR")}원`;

const eok = (v: number) =>
  `${Math.round(Number(v) / 100000000)}억`;

const rate = (v: number) =>
  `${(v * 100).toFixed(2)}%`;

export default function AssetHistoryCharts({
  history,
  years,
}: {
  history: History[];
  years: string[];
}) {
  const [selectedYear, setSelectedYear] = useState(
    years[years.length - 1] ?? ""
  );

  const [range, setRange] = useState<
    "all" | "5y" | "3y" | "1y"
  >("all");

  const filteredHistory = useMemo(() => {
    if (range === "all") return history;

    const months =
      range === "5y"
        ? 60
        : range === "3y"
        ? 36
        : 12;

    return history.slice(-months);
  }, [history, range]);

  const mdd = useMemo(() => {
    let peak = history[0]?.totalAsset ?? 0;
    let peakDate = history[0]?.date ?? "";

    let maxDrawdown = 0;
    let currentDrawdown = 0;

    let maxPeakDate = "";
    let maxTroughDate = "";

    let troughIndex = 0;

    history.forEach((h, index) => {
      if (h.totalAsset > peak) {
        peak = h.totalAsset;
        peakDate = h.date;
      }

      const drawdown =
        peak > 0
          ? h.totalAsset / peak - 1
          : 0;

      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;

        maxPeakDate = peakDate;
        maxTroughDate = h.date;

        troughIndex = index;
      }

      currentDrawdown = drawdown;
    });

    let recoveryDate = "";

    for (
      let i = troughIndex;
      i < history.length;
      i++
    ) {
      if (history[i].totalAsset >= peak) {
        recoveryDate = history[i].date;
        break;
      }
    }

    const recoveryMonths =
      recoveryDate && maxPeakDate
        ? (() => {
            const start = new Date(
              `${maxPeakDate}-01`
            );

            const end = new Date(
              `${recoveryDate}-01`
            );

            return (
              (end.getFullYear() -
                start.getFullYear()) *
                12 +
              (end.getMonth() -
                start.getMonth())
            );
          })()
        : null;

    return {
      maxDrawdown,
      currentDrawdown,
      maxPeakDate,
      maxTroughDate,
      recoveryMonths,
    };
  }, [history]);

  const annualProfitData = useMemo(() => {
    return history.filter((h) =>
      String(h.date).startsWith(selectedYear)
    );
  }, [history, selectedYear]);

  const latestAnnualProfit =
    annualProfitData[
      annualProfitData.length - 1
    ]?.annualProfit ?? 0;

  const heatmapData = useMemo(() => {
    return history
      .filter((h) =>
        String(h.date).startsWith(selectedYear)
      )
      .map((h, index, arr) => {
        const prev =
          index > 0 ? arr[index - 1] : null;

        const monthlyProfit = prev
          ? h.annualProfit -
            prev.annualProfit
          : h.annualProfit;

        return {
          month: String(h.date).slice(5, 7),
          value: monthlyProfit,
        };
      });
  }, [history, selectedYear]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <InfoCard
          title="📉 최대 낙폭 MDD"
          value={rate(mdd.maxDrawdown)}
          sub={`${mdd.maxPeakDate} → ${mdd.maxTroughDate}`}
          tone="blue"
        />

        <InfoCard
          title="🕒 회복 기간"
          value={
            mdd.recoveryMonths !== null
              ? `${mdd.recoveryMonths}개월`
              : "회복 전"
          }
          sub="고점 회복까지 걸린 시간"
          tone="gray"
        />

        <InfoCard
          title="현재 낙폭"
          value={rate(mdd.currentDrawdown)}
          sub="최근 고점 대비 현재 위치"
          tone={
            mdd.currentDrawdown < 0
              ? "blue"
              : "gray"
          }
        />
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold">
              총자산 추이
            </div>

            <div className="text-sm text-gray-400">
              기간별 자산 흐름
            </div>
          </div>

          <div className="flex rounded-full bg-gray-100 p-1 text-xs">
            {[
              ["all", "전체"],
              ["5y", "5년"],
              ["3y", "3년"],
              ["1y", "1년"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setRange(
                    key as
                      | "all"
                      | "5y"
                      | "3y"
                      | "1y"
                  )
                }
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  range === key
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer
          width="100%"
          height={360}
        >
          <LineChart data={filteredHistory}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              tickFormatter={(v) =>
                eok(Number(v))
              }
            />

            <Tooltip
              formatter={(value) =>
                won(Number(value ?? 0))
              }
            />

            <Line
              type="monotone"
              dataKey="totalAsset"
              name="총자산"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <ChartCard title="자산 구성 추이">
        <ResponsiveContainer
          width="100%"
          height={360}
        >
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              tickFormatter={(v) =>
                eok(Number(v))
              }
            />

            <Tooltip
              formatter={(value) =>
                won(Number(value ?? 0))
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="stockAsset"
              name="주식자산"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="pension"
              name="연금자산"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold">
              연간수익
            </div>

            <div
              className={`mt-1 text-2xl font-bold ${
                latestAnnualProfit >= 0
                  ? "text-red-500"
                  : "text-blue-500"
              }`}
            >
              {won(latestAnnualProfit)}
            </div>
          </div>

          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                e.target.value
              )
            }
            className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
          >
            {years.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>

        <ResponsiveContainer
          width="100%"
          height={260}
        >
          <LineChart data={annualProfitData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              tickFormatter={(v) =>
                eok(Number(v))
              }
            />

            <Tooltip
              formatter={(value) =>
                won(Number(value ?? 0))
              }
            />

            <Line
              type="monotone"
              dataKey="annualProfit"
              name="연간수익"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">
              🗓️ 월별 수익 히트맵
            </div>

            <div className="text-sm text-gray-400">
              {selectedYear}년 월별 수익 변화
            </div>
          </div>

          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                e.target.value
              )
            }
            className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
          >
            {years.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
          {heatmapData.map((m) => (
            <div
              key={m.month}
              className={`rounded-xl p-3 ${
                m.value >= 0
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <div className="text-xs font-semibold">
                {Number(m.month)}월
              </div>

              <div className="mt-1 text-sm font-bold">
                {won(m.value)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 text-lg font-bold">
        {title}
      </div>

      {children}
    </section>
  );
}

function InfoCard({
  title,
  value,
  sub,
  tone,
}: {
  title: string;
  value: string;
  sub: string;
  tone: "red" | "blue" | "gray";
}) {
  const color =
    tone === "red"
      ? "text-red-500"
      : tone === "blue"
      ? "text-blue-500"
      : "text-gray-900";

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">
        {title}
      </div>

      <div
        className={`mt-2 text-2xl font-bold ${color}`}
      >
        {value}
      </div>

      <div className="mt-1 text-xs text-gray-400">
        {sub}
      </div>
    </div>
  );
}