import Link from "next/link";

type Stock = {
  code: string;
  name: string;
  sector: string;
  profitRate: number;
  evalAmount: number;
};

const won = (v: number) => `${v.toLocaleString("ko-KR")}원`;
const rate = (v: number) => `${(v * 100).toFixed(2)}%`;

export default function SellCandidates({ stocks }: { stocks: Stock[] }) {
  const total = stocks.reduce((sum, s) => sum + s.evalAmount, 0);

  const candidates = stocks
    .map((s) => ({
      ...s,
      weight: total ? s.evalAmount / total : 0,
    }))
    .filter(
      (s) =>
        // 손실 큰 종목
        s.profitRate <= -0.1 ||
        // 비중 큰데 수익률 낮음
        (s.weight >= 0.1 && s.profitRate < 0.05) ||
        // 수익률 높은데 비중 큼 (익절 후보)
        (s.weight >= 0.1 && s.profitRate >= 0.3)
    )
    .sort((a, b) => Math.abs(b.profitRate) - Math.abs(a.profitRate))
    .slice(0, 8);

  if (candidates.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-bold">매도 후보</div>
        <div className="text-xs text-gray-400">리밸런싱</div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {candidates.map((s) => (
          <Link
            key={s.code}
            href={`/stocks/${s.code}`}
            className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100"
          >
            <div className="text-sm font-semibold">{s.name}</div>
            <div className="text-xs text-gray-400">{s.sector}</div>

            <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
              <span
                className={`font-bold ${
                  s.profitRate >= 0 ? "text-red-500" : "text-blue-500"
                }`}
              >
                {rate(s.profitRate)}
              </span>

              <span className="text-gray-300">·</span>

              <span className="text-gray-500">
                {(s.weight * 100).toFixed(1)}%
              </span>

              <span className="text-gray-300">·</span>

              <span className="text-gray-400">
                {won(s.evalAmount)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}