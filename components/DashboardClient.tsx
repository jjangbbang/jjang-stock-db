"use client";

import { useState } from "react";
import TopLists from "@/components/TopLists";
import SectorSummary from "@/components/SectorSummary";
import StockTable from "@/components/StockTable";
import AssetChart from "@/components/AssetChart";

export default function DashboardClient({
  stocks,
  holdings,
  dashboard,
}: {
  stocks: any[];
  holdings: any[];
  dashboard: any;
}) {
  const [selectedSector, setSelectedSector] = useState("전체");

  return (
    <>
      <TopLists stocks={stocks} />

<AssetChart holdings={holdings} dashboard={dashboard} />

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