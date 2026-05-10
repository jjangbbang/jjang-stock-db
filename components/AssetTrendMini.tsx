"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
} from "recharts";

const won = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}원`;

export default function AssetTrendMini({ history }: { history: any[] }) {
  const [mode, setMode] = useState<"year" | "month">("year");

  const monthlyData = useMemo(() => {
    return history.map((h) => ({
      date: h.date,
      label: h.date,
      totalAsset: h.totalAsset,
    }));
  }, [history]);

  const yearlyData = useMemo(() => {
    const map = new Map<string, any>();

    history.forEach((h) => {
      const year = String(h.date).slice(0, 4);
      map.set(year, {
        date: year,
        label: year,
        totalAsset: h.totalAsset,
      });
    });

    return Array.from(map.values());
  }, [history]);

  const data = mode === "year" ? yearlyData : monthlyData;
  const latest = data[data.length - 1];

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Link href="/asset-history" className="hover:underline">
          <div className="text-lg font-bold">📈 자산 추이</div>
          <div className="text-sm text-gray-400">
            {mode === "year" ? "연도별" : `최근 ${data.length}개월`}
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">현재 총자산</div>
            <div className="text-lg font-bold">
              {latest ? won(latest.totalAsset) : "-"}
            </div>
          </div>

          <div className="flex rounded-full bg-gray-100 p-1 text-xs">
            <button
              onClick={() => setMode("year")}
              className={`rounded-full px-3 py-1 font-semibold ${
                mode === "year" ? "bg-gray-900 text-white" : "text-gray-500"
              }`}
            >
              연
            </button>
            <button
              onClick={() => setMode("month")}
              className={`rounded-full px-3 py-1 font-semibold ${
                mode === "month" ? "bg-gray-900 text-white" : "text-gray-500"
              }`}
            >
              월
            </button>
          </div>
        </div>
      </div>

      <Link href="/asset-history" className="block h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #eee",
                fontSize: "12px",
              }}
              formatter={(value) => won(Number(value ?? 0))}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="totalAsset"
              strokeWidth={3}
              dot={mode === "year"}
            />
          </LineChart>
        </ResponsiveContainer>
      </Link>
    </div>
  );
}