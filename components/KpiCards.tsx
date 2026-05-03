type Stock = {
  invest: number;
  evalAmount: number;
  profit: number;
};

type Dashboard = {
  cash: number;
  pension: number;
  totalAsset: number;
  annualProfit: number;
};

const formatWon = (value: number) => value.toLocaleString("ko-KR") + "원";
const formatRate = (value: number) => (value * 100).toFixed(2) + "%";

export default function KpiCards({
  stocks,
  dashboard,
}: {
  stocks: Stock[];
  dashboard: Dashboard;
}) {
  const invest = stocks.reduce((sum, s) => sum + s.invest, 0);
  const evalAmount = stocks.reduce((sum, s) => sum + s.evalAmount, 0);
  const profit = stocks.reduce((sum, s) => sum + s.profit, 0);
  const profitRate = invest ? profit / invest : 0;

  const topItems = [
    {
      label: "총자산",
      value: formatWon(dashboard.totalAsset),
    },
    {
      label: "주식자산",
      value: formatWon(evalAmount),
    },
    {
      label: "연금자산",
      value: formatWon(dashboard.pension),
    },
    {
      label: "예수금",
      value: formatWon(dashboard.cash),
    },
  ];

  const bottomItems = [
    {
      label: "투자원금",
      value: formatWon(invest),
    },
    {
      label: "현재손익",
      value: formatWon(profit),
      highlight: profit,
    },
    {
      label: "수익률",
      value: formatRate(profitRate),
      highlight: profitRate,
    },
    {
      label: "연간수익",
      value: formatWon(dashboard.annualProfit),
      highlight: dashboard.annualProfit,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {topItems.map((item) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {bottomItems.map((item) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            highlight={item.highlight}
          />
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  highlight,
}: {
  label: string;
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
    <div className="rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-2 text-xl font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}