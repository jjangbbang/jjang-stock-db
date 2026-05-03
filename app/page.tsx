import { getStocks, getDashboard, getHoldings } from "@/data/api";
import KpiCards from "@/components/KpiCards";
import DashboardClient from "@/components/DashboardClient";

export default async function Home() {
  const stocks = await getStocks();
  const dashboard = await getDashboard();
  const holdings = await getHoldings();

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header>
          <div className="text-sm text-gray-500">JJANG Portfolio Viewer</div>
          <h1 className="text-3xl font-bold">JJANG Stock DB</h1>
        </header>

<KpiCards stocks={stocks} dashboard={dashboard} />

        <DashboardClient
          stocks={stocks}
          holdings={holdings}
          dashboard={dashboard}
        />
      </div>
    </main>
  );
}