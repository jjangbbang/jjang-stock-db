"use client";

import { useState } from "react";
import TopLists from "@/components/TopLists";
import SectorSummary from "@/components/SectorSummary";
import StockTable from "@/components/StockTable";
import AssetChart from "@/components/AssetChart";
import SectorChart from "@/components/SectorChart";
import VolatilityAlert from "@/components/VolatilityAlert";
import AccountKpiCards from "@/components/AccountKpiCards";
import SellCandidates from "@/components/SellCandidates";

export default function DashboardClient({
  stocks,
  holdings,
  dashboard,
}: any) {
  const [selectedSector, setSelectedSector] = useState("전체");

  return (
    <>
      <TopLists stocks={stocks} />

      <VolatilityAlert stocks={stocks} />
      
      <SellCandidates stocks={stocks} />

    <div className="grid gap-4 lg:grid-cols-2">
  <AssetChart holdings={holdings} dashboard={dashboard} />
  <SectorChart stocks={stocks} />
</div>

<AccountKpiCards holdings={holdings} />

<SectorSummary
  stocks={stocks}
  selectedSector={selectedSector}
  onSelectSector={setSelectedSector}
/>

      <StockTable
        stocks={stocks}
        externalSectorFilter={selectedSector}
      />
    </>
  );
}