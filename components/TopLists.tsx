"use client";

import Link from "next/link";
import { useState } from "react";

type Stock = {
  code: string;
  name: string;
  sector: string;
  invest: number;
  profit: number;
  profitRate: number;
  upside: number;
};

const won = (v: number) =>
  `${v.toLocaleString("ko-KR")}원`;

const rate = (v: number) =>
  `${(v * 100).toFixed(2)}%`;

const plainRate = (v: number) =>
  `${v.toFixed(2)}`;

export default function TopLists({
  stocks,
}: {
  stocks: Stock[];
}) {
  const holdings = stocks.filter(
    (s) => s.invest > 0
  );

  const profitTop = [...holdings]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  const profitWorst = [...holdings]
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 10);

  const rateTop = [...holdings]
    .sort(
      (a, b) =>
        b.profitRate - a.profitRate
    )
    .slice(0, 10);

  const rateWorst = [...holdings]
    .sort(
      (a, b) =>
        a.profitRate - b.profitRate
    )
    .slice(0, 10);

  const investTop = [...holdings]
    .sort((a, b) => b.invest - a.invest)
    .slice(0, 10);

  const upsideTop = [...stocks]
    .filter((s) => s.upside > 0)
    .sort((a, b) => b.upside - a.upside)
    .slice(0, 10);

  const efficiencyTop = [...holdings]
    .filter((s) => s.invest > 0)
    .sort(
      (a, b) =>
        b.profit / b.invest -
        a.profit / a.invest
    )
    .slice(0, 10);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <RankingCard
        title="손익 랭킹"
        tabs={[
          {
            label: "TOP",
            items: profitTop.map((s) => ({
              code: s.code,
              name: s.name,
              sub: s.sector,
              value: won(s.profit),
              raw: s.profit,
            })),
          },
          {
            label: "WORST",
            items: profitWorst.map((s) => ({
              code: s.code,
              name: s.name,
              sub: s.sector,
              value: won(s.profit),
              raw: s.profit,
            })),
          },
        ]}
      />

      <RankingCard
        title="수익률 랭킹"
        tabs={[
          {
            label: "TOP",
            items: rateTop.map((s) => ({
              code: s.code,
              name: s.name,
              sub: s.sector,
              value: rate(s.profitRate),
              raw: s.profitRate,
            })),
          },
          {
            label: "WORST",
            items: rateWorst.map((s) => ({
              code: s.code,
              name: s.name,
              sub: s.sector,
              value: rate(s.profitRate),
              raw: s.profitRate,
            })),
          },
        ]}
      />

      <RankingCard
        title="투자 지표"
        tabs={[
          {
            label: "투자금",
            items: investTop.map((s) => ({
              code: s.code,
              name: s.name,
              sub: s.sector,
              value: won(s.invest),
              raw: s.invest,
              neutral: true,
            })),
          },
          {
            label: "업사이드",
            items: upsideTop.map((s) => ({
              code: s.code,
              name: s.name,
              sub: s.sector,
              value: plainRate(s.upside),
              raw: s.upside,
              neutral: true,
            })),
          },
          {
            label: "효율",
            items: efficiencyTop.map((s) => ({
              code: s.code,
              name: s.name,
              sub: s.sector,
              value: rate(
                s.profit / s.invest
              ),
              raw: s.profit / s.invest,
            })),
          },
        ]}
      />
    </div>
  );
}

function RankingCard({
  title,
  tabs,
}: {
  title: string;
  tabs: {
    label: string;
    items: {
      code: string;
      name: string;
      sub: string;
      value: string;
      raw: number;
      neutral?: boolean;
    }[];
  }[];
}) {
  const [activeTab, setActiveTab] =
    useState(0);

  const items = tabs[activeTab].items;

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-bold text-gray-900">
          {title}
        </div>

        <div className="text-xs text-gray-500">
          {items.length}개
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() =>
              setActiveTab(index)
            }
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              activeTab === index
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="rounded-xl border border-gray-100 bg-gray-50 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/stocks/${item.code}`}
                  className="text-sm font-semibold leading-snug text-gray-900 hover:underline"
                >
                  {index + 1}. {item.name}
                </Link>

                <div className="mt-0.5 text-xs text-gray-500">
                  {item.sub}
                </div>
              </div>

              <div
                className={`shrink-0 text-sm font-bold ${
                  item.neutral
                    ? "text-gray-900"
                    : item.raw >= 0
                    ? "text-red-500"
                    : "text-blue-500"
                }`}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}