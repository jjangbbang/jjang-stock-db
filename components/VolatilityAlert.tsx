import Link from "next/link";

type Stock = {
  code: string;
  name: string;
  sector: string;
  changeRate: number;
  profitRate: number;
  evalAmount: number;
};

const won = (v: number) => `${v.toLocaleString("ko-KR")}원`;
const rate = (v: number) => `${(v * 100).toFixed(2)}%`;

export default function VolatilityAlert({ stocks }: { stocks: Stock[] }) {
  const movers = stocks
    .filter((s) => s.changeRate >= 10 || s.changeRate <= -10)
    .sort((a, b) => Math.abs(b.changeRate) - Math.abs(a.changeRate));

  if (movers.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-bold">급등락 종목</div>
        <div className="text-xs text-gray-400">±10% 이상</div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {movers.map((s) => (
          <Link
            key={s.code}
            href={`/stocks/${s.code}`}
            className="rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition"
          >
            {/* 종목명 */}
            <div className="text-sm font-semibold">{s.name}</div>

            {/* 섹터 */}
            <div className="text-xs text-gray-400">{s.sector}</div>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
  <span className="text-gray-400">등락률</span>
  <span
    className={`font-bold ${
      s.changeRate >= 0 ? "text-red-500" : "text-blue-500"
    }`}
  >
    {s.changeRate.toFixed(2)}%
  </span>

  <span className="text-gray-300">·</span>

  <span className="text-gray-400">수익률</span>
  <span
    className={`font-bold ${
      s.profitRate >= 0 ? "text-red-500" : "text-blue-500"
    }`}
  >
    {rate(s.profitRate)}
  </span>

  <span className="text-gray-300">·</span>

  <span className="text-gray-500">{won(s.evalAmount)}</span>
</div>
          </Link>
        ))}
      </div>
    </div>
  );
}