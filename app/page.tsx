import { getStocks, getDashboard, getHoldings } from "@/data/api";
import KpiCards from "@/components/KpiCards";
import DashboardClient from "@/components/DashboardClient";
import AssetTrendMini from "@/components/AssetTrendMini";
import { getAssetHistory } from "@/data/api";

export default async function Home() {
  const stocks = await getStocks();
  const dashboard = await getDashboard();
  const holdings = await getHoldings();
const assetHistory = await getAssetHistory();

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* 헤더 */}
        <header>
          <div className="text-sm text-gray-500">
            JJANG Portfolio Viewer
          </div>
          <h1 className="text-3xl font-bold">JJANG Stock DB</h1>

          {/* 🔥 업데이트 시간 */}
          {dashboard.updatedAt && (
            <div className="mt-1 text-xs text-gray-400">
              마지막 업데이트: {formatDate(dashboard.updatedAt)}
            </div>
          )}
        </header>

        {/* KPI */}
        <KpiCards stocks={stocks} dashboard={dashboard} />

        <AssetTrendMini history={assetHistory} />

        {/* 본문 */}
        <DashboardClient
          stocks={stocks}
          holdings={holdings}
          dashboard={dashboard}
        />
      </div>
    </main>
  );
}

/* 🔥 날짜 포맷 함수 */
function formatDate(value: string | number) {
  const date = new Date(value);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}