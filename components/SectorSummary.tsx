"use client";

import { useMemo, useState } from "react";

type Stock = {
  sector: string;
  invest: number;
  evalAmount: number;
  profit: number;
};

type SortKey = "sector" | "invest" | "evalAmount" | "profit" | "profitRate";
type SortDirection = "asc" | "desc";

const won = (v: number) => `${v.toLocaleString("ko-KR")}원`;
const rate = (v: number) => `${(v * 100).toFixed(2)}%`;




export default function SectorSummary({
  stocks,
  selectedSector,
  onSelectSector,
}: {
  stocks: Stock[];
  selectedSector: string;
  onSelectSector: (sector: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("invest");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");



  const sectors = useMemo(() => {
    const map = new Map<
      string,
      { invest: number; evalAmount: number; profit: number }
    >();

    stocks.forEach((s) => {
      if (!s.sector) return;

      const current = map.get(s.sector) ?? {
        invest: 0,
        evalAmount: 0,
        profit: 0,
      };

      map.set(s.sector, {
        invest: current.invest + s.invest,
        evalAmount: current.evalAmount + s.evalAmount,
        profit: current.profit + s.profit,
      });
    });

    return Array.from(map.entries())
      .map(([sector, data]) => ({
        sector,
        ...data,
        profitRate: data.invest ? data.profit / data.invest : 0,
      }))
      .filter((s) => s.invest > 0);
  }, [stocks]);

  const sorted = useMemo(() => {
    return [...sectors].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // ⭐ 이 부분이 에러 해결 핵심
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal, "ko")
          : bVal.localeCompare(aVal, "ko");
      }

      return sortDirection === "asc"
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });
  }, [sectors, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };
  const totalEval = sectors.reduce((sum, s) => sum + s.evalAmount, 0);
  const mark = (key: SortKey) =>
    sortKey === key ? (sortDirection === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-bold">섹터 요약</div>

        <button
          onClick={() => onSelectSector("전체")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            selectedSector === "전체"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          전체
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <Th onClick={() => handleSort("sector")}>
                섹터{mark("sector")}
              </Th>
              <Th align="right" onClick={() => handleSort("invest")}>
                투자금{mark("invest")}
              </Th>
              <Th align="right" onClick={() => handleSort("evalAmount")}>
                평가금{mark("evalAmount")}
              </Th>
              <Th align="right" onClick={() => handleSort("profit")}>
                손익{mark("profit")}
              </Th>
              <Th align="right" onClick={() => handleSort("profitRate")}>
                수익률{mark("profitRate")}
              </Th>
              <th className="p-3 text-right">비중</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((s) => (
              <tr key={s.sector} className="border-t hover:bg-gray-50">
                <td className="p-3 font-semibold">
                  <button
                    onClick={() => onSelectSector(s.sector)}
                    className={`hover:underline ${
                      selectedSector === s.sector ? "text-blue-600" : ""
                    }`}
                  >
                    {s.sector}
                  </button>
                </td>

                <td className="p-3 text-right">{won(s.invest)}</td>
                <td className="p-3 text-right">{won(s.evalAmount)}</td>

                <td
                  className={`p-3 text-right ${
                    s.profit >= 0 ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {won(s.profit)}
                </td>

                <td
                  className={`p-3 text-right ${
                    s.profitRate >= 0 ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {rate(s.profitRate)}
                </td>
                <td className="p-3 text-right">
  {((s.evalAmount / totalEval) * 100).toFixed(2)}%
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  align = "left",
}: {
  children: React.ReactNode;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none p-3 text-${align} hover:bg-gray-100`}
    >
      {children}
    </th>
  );
}