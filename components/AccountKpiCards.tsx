type Holding = {
  account: string;
  invest: number;
  evalAmount: number;
  profit: number;
};

const won = (v: number) => `${v.toLocaleString("ko-KR")}원`;
const rate = (v: number) => `${(v * 100).toFixed(2)}%`;

export default function AccountKpiCards({
  holdings,
}: {
  holdings: Holding[];
}) {
  const accountMap = new Map<
    string,
    { invest: number; evalAmount: number; profit: number }
  >();

  holdings.forEach((h) => {
    if (!h.account) return;

    const current = accountMap.get(h.account) ?? {
      invest: 0,
      evalAmount: 0,
      profit: 0,
    };

    accountMap.set(h.account, {
      invest: current.invest + h.invest,
      evalAmount: current.evalAmount + h.evalAmount,
      profit: current.profit + h.profit,
    });
  });

  const accounts = Array.from(accountMap.entries())
    .map(([account, data]) => ({
      account,
      ...data,
      profitRate: data.invest ? data.profit / data.invest : 0,
    }))
    .sort((a, b) => b.evalAmount - a.evalAmount);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-bold">계좌별 KPI</div>
        <div className="text-xs text-gray-400">{accounts.length}개 계좌</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {accounts.map((a) => (
          <div key={a.account} className="rounded-2xl bg-gray-50 p-4">
            <div className="mb-3 text-base font-bold">{a.account}</div>

            <div className="space-y-2 text-sm">
              <Row label="평가금" value={won(a.evalAmount)} />
              <Row label="투자금" value={won(a.invest)} />
              <Row
                label="손익"
                value={won(a.profit)}
                color={a.profit >= 0 ? "text-red-500" : "text-blue-500"}
              />
              <Row
                label="수익률"
                value={rate(a.profitRate)}
                color={a.profitRate >= 0 ? "text-red-500" : "text-blue-500"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}