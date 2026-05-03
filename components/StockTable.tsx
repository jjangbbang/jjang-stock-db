"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Stock = {
  code: string;
  name: string;
  sector: string;
  status: string;
  price: number;
  changeRate: number;
  invest: number;
  profit: number;
  profitRate: number;
};

type SortKey =
  | "name"
  | "sector"
  | "status"
  | "price"
  | "changeRate"
  | "invest"
  | "profit"
  | "profitRate";

type SortDirection = "asc" | "desc";

const won = (v: number) => v.toLocaleString("ko-KR");
const rate = (v: number) => `${(v * 100).toFixed(2)}%`;

export default function StockTable({
  stocks,
  externalSectorFilter = "전체",
}: {
  stocks: Stock[];
  externalSectorFilter?: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("profitRate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  useEffect(() => {
    setSectorFilter(externalSectorFilter);
  }, [externalSectorFilter]);

  useEffect(() => {
    const saved = localStorage.getItem("favoriteStocks");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (code: string) => {
    setFavorites((prev) => {
      const next = prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code];

      localStorage.setItem("favoriteStocks", JSON.stringify(next));
      return next;
    });
  };

  const sectors = useMemo(() => {
    const set = new Set(stocks.map((s) => s.sector).filter(Boolean));
    return ["전체", ...Array.from(set)];
  }, [stocks]);

  const statuses = useMemo(() => {
    const set = new Set(stocks.map((s) => s.status).filter(Boolean));
    return ["전체", ...Array.from(set)];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      const matchSearch = s.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchSector =
        sectorFilter === "전체" || s.sector === sectorFilter;

      const matchStatus =
        statusFilter === "전체" || s.status === statusFilter;

      const matchFavorite =
        !favoriteOnly || favorites.includes(s.code);

      return matchSearch && matchSector && matchStatus && matchFavorite;
    });
  }, [stocks, search, sectorFilter, statusFilter, favoriteOnly, favorites]);

  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue, "ko")
          : bValue.localeCompare(aValue, "ko");
      }

      const result = Number(aValue) - Number(bValue);
      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredStocks, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortMark = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-4 text-lg font-bold">전체 종목</div>

      <div className="flex flex-wrap gap-3 p-4">
        <input
          type="text"
          placeholder="종목 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {sectors.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={() => setFavoriteOnly((prev) => !prev)}
          className={`rounded-lg border px-3 py-2 text-sm ${
            favoriteOnly
              ? "bg-yellow-300 text-black"
              : "bg-white text-gray-600"
          }`}
        >
          ⭐ 즐겨찾기
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs md:text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3 text-center">⭐</th>
              <Th onClick={() => handleSort("name")}>종목{sortMark("name")}</Th>
              <Th onClick={() => handleSort("sector")}>섹터{sortMark("sector")}</Th>
              <Th onClick={() => handleSort("status")}>구분{sortMark("status")}</Th>
              <Th align="right" onClick={() => handleSort("price")}>
                현재가{sortMark("price")}
              </Th>
              <Th align="right" onClick={() => handleSort("changeRate")}>
                등락률{sortMark("changeRate")}
              </Th>
              <Th align="right" onClick={() => handleSort("invest")}>
                투자금{sortMark("invest")}
              </Th>
              <Th align="right" onClick={() => handleSort("profit")}>
                손익{sortMark("profit")}
              </Th>
              <Th align="right" onClick={() => handleSort("profitRate")}>
                수익률{sortMark("profitRate")}
              </Th>
            </tr>
          </thead>

          <tbody>
            {sortedStocks.map((s, index) => (
              <tr key={`${s.code}-${index}`} className="border-t hover:bg-gray-50">
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleFavorite(s.code)}
                    className="text-lg"
                  >
                    {favorites.includes(s.code) ? "⭐" : "☆"}
                  </button>
                </td>

                <td className="p-3 font-semibold">
                  <Link href={`/stocks/${s.code}`} className="hover:underline">
                    {s.name}
                  </Link>
                </td>

                <td className="p-3">{s.sector}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3 text-right">{won(s.price)}</td>

                <td
                  className={`p-3 text-right ${
                    s.changeRate >= 0 ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {s.changeRate.toFixed(2)}%
                </td>

                <td className="p-3 text-right">{won(s.invest)}</td>

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