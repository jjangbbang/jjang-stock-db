"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type Holding = {
  account: string;
  evalAmount: number;
};

type Props = {
  holdings: Holding[];
  dashboard: {
    cash: number;
    pension: number;
    totalAsset: number;
  };
};

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#84cc16",
  "#22c55e",
  "#f97316",
  "#06b6d4",
];

export default function AssetChart({
  holdings = [],
  dashboard,
}: Props) {
  const data = useMemo(() => {
    const map = new Map<string, number>();

    holdings.forEach((h) => {
      if (!h.account) return;
      map.set(h.account, (map.get(h.account) ?? 0) + h.evalAmount);
    });

    const result = Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    if (dashboard.cash > 0) {
      result.push({ name: "예수금", value: dashboard.cash });
    }

    if (dashboard.pension > 0) {
      result.push({ name: "연금자산", value: dashboard.pension });
    }

    return result.filter((item) => item.value > 0);
  }, [holdings, dashboard]);

  const total =
    dashboard.totalAsset ||
    data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 text-lg font-bold">자산 비중</div>

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
              formatter={(value) =>
                `${Number(value ?? 0).toLocaleString("ko-KR")}원`
              }
            />

            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10">
          <div className="text-sm text-gray-500">자산 합계</div>
          <div className="text-2xl font-bold">
            {total.toLocaleString("ko-KR")}원
          </div>
        </div>
      </div>
    </div>
  );
}