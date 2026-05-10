import Link from "next/link";
import { getAssetHistory, getDashboard } from "@/data/api";
import AssetHistoryCharts from "@/components/AssetHistoryCharts";

const won = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}원`;
const rate = (v: number) => `${(v * 100).toFixed(2)}%`;

export default async function AssetHistoryPage() {
  const history = await getAssetHistory();
  const dashboard = await getDashboard();

  const first = history[0];
  const latest = history[history.length - 1];

  const fireGoal = dashboard.fireGoal || 0;

  const assetGrowth =
    first && latest ? latest.totalAsset - first.totalAsset : 0;

  const fireProgress =
    fireGoal > 0 && latest ? latest.totalAsset / fireGoal : 0;

  const startDate = first ? new Date(`${first.date}-01`) : null;
  const endDate = latest ? new Date(`${latest.date}-01`) : null;

  const elapsedYears =
    startDate && endDate
      ? (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365)
      : 0;

  const cagr =
    elapsedYears > 0 && first?.totalAsset && latest?.totalAsset
      ? Math.pow(latest.totalAsset / first.totalAsset, 1 / elapsedYears) - 1
      : 0;

      const expectedFireDate =
  fireGoal > 0 && latest?.totalAsset > 0 && cagr > 0
    ? (() => {
        const yearsToFire =
          Math.log(fireGoal / latest.totalAsset) / Math.log(1 + cagr);

        const expectedYear = new Date().getFullYear() + yearsToFire;

        return {
          yearsToFire,
          year: expectedYear,
        };
      })()
    : null;

const years = Array.from(
  new Set(
    history.map((h: { date: string }) =>
      String(h.date).slice(0, 4)
    )
  )
) as string[];

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header>
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← 대시보드로
          </Link>

          <div className="mt-3 text-sm text-gray-400">Asset History</div>
          <h1 className="text-3xl font-bold">📈 자산 추이</h1>
        </header>

        <div className="grid gap-3 md:grid-cols-4">
          <Kpi label="현재 총자산" value={latest ? won(latest.totalAsset) : "-"} />
          <Kpi label="주식자산" value={latest ? won(latest.stockAsset) : "-"} />
          <Kpi label="연금자산" value={latest ? won(latest.pension) : "-"} />
          <Kpi
            label="자산증가액"
            subLabel={`${first?.date ?? "-"} 기준`}
            value={won(assetGrowth)}
            highlight={assetGrowth}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
  <Kpi
    label="🔥 FIRE 진행률"
    subLabel={`${(fireGoal / 100000000).toFixed(0)}억 목표`}
    value={rate(fireProgress)}
    highlight={fireProgress >= 1 ? 1 : fireProgress}
  />

  <Kpi
    label="📈 CAGR"
    subLabel="연평균 자산 성장률"
    value={rate(cagr)}
    highlight={cagr}
  />

  <Kpi
    label="🏁 예상 달성 시점"
    subLabel="현재 CAGR 유지 시"
    value={
      expectedFireDate
        ? `${Math.floor(expectedFireDate.year)}년`
        : "-"
    }
  />
</div>

        <AssetHistoryCharts history={history} years={years} />
      </div>
    </main>
  );
}

function Kpi({
  label,
  subLabel,
  value,
  highlight,
}: {
  label: string;
  subLabel?: string;
  value: string;
  highlight?: number;
}) {
  const color =
    highlight === undefined
      ? "text-gray-900"
      : highlight >= 0
      ? "text-red-500"
      : "text-blue-500";

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{label}</span>
        {subLabel && <span className="text-xs text-gray-400">{subLabel}</span>}
      </div>
      <div className={`mt-2 text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}