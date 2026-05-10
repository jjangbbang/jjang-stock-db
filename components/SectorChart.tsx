"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Stock = {
  sector: string;
  evalAmount: number;
};

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#a855f7",
  "#0ea5e9",
  "#f97316",
];

export default function SectorChart({ stocks }: { stocks: Stock[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();

    stocks.forEach((s) => {
      if (!s.sector || s.evalAmount <= 0) return;
      map.set(s.sector, (map.get(s.sector) ?? 0) + s.evalAmount);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [stocks]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const topRatios = useMemo(() => {
    const major = data
      .map((item) => ({
        ...item,
        percent: total ? (item.value / total) * 100 : 0,
      }))
      .filter((item) => item.percent >= 5);

    const etcValue = data
      .map((item) => ({
        ...item,
        percent: total ? (item.value / total) * 100 : 0,
      }))
      .filter((item) => item.percent < 5)
      .reduce((sum, item) => sum + item.value, 0);

    const result = [...major];

    if (etcValue > 0) {
      result.push({
        name: "기타",
        value: etcValue,
        percent: total ? (etcValue / total) * 100 : 0,
      });
    }

    return result.sort((a, b) => b.percent - a.percent);
  }, [data, total]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-bold">섹터 비중</div>
        <div className="text-xs text-gray-400">{data.length}개 섹터</div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {topRatios.map((item) => (
          <div
            key={item.name}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs"
          >
            {item.name} {item.percent.toFixed(1)}%
          </div>
        ))}
      </div>

      <div className="relative h-[360px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #eee",
                fontSize: "12px",
              }}
              formatter={(value, name) => {
                const num = Number(value ?? 0);
                const percent = total ? (num / total) * 100 : 0;

                return [
                  `${num.toLocaleString("ko-KR")}원 (${percent.toFixed(2)}%)`,
                  String(name),
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm text-gray-500">주식자산</div>
          <div className="text-xl font-bold">
            {total.toLocaleString("ko-KR")}원
          </div>
        </div>
      </div>
    </div>
  );
}