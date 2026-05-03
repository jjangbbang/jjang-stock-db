import Link from "next/link";
import { getStocks, getHoldings } from "@/data/api";

const won = (v: number) => v.toLocaleString("ko-KR");
const rate = (v: number) => `${(v * 100).toFixed(2)}%`;

export default async function StockDetail({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;

  const stocks = await getStocks();
  const holdings = await getHoldings();

  const code = rawCode.trim().padStart(6, "0");

  const stock = stocks.find((s) => s.code === code);
  const stockHoldings = holdings.filter((h) => h.code === code);

  if (!stock) return <div className="p-8">종목 없음</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* 헤더 */}
        <div>
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← 대시보드
          </Link>

          <div className="mt-2 text-sm text-gray-500">
            {stock.sector} · {stock.status} · {stock.code}
          </div>

          <h1 className="text-3xl font-bold mt-1">{stock.name}</h1>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="현재가" value={`${won(stock.price)}원`} />
          <Kpi label="투자금" value={`${won(stock.invest)}원`} />
          <Kpi label="손익" value={`${won(stock.profit)}원`} highlight={stock.profit} />
          <Kpi label="수익률" value={rate(stock.profitRate)} highlight={stock.profitRate} />
        </div>

        {/* 계좌별 */}
        <Section title="계좌별 보유현황">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left p-2">계좌</th>
                <th className="text-right p-2">수량</th>
                <th className="text-right p-2">평단</th>
                <th className="text-right p-2">투자금</th>
                <th className="text-right p-2">평가금</th>
                <th className="text-right p-2">손익</th>
                <th className="text-right p-2">수익률</th>
              </tr>
            </thead>

            <tbody>
              {stockHoldings.map((h, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{h.account}</td>
                  <td className="p-2 text-right">{h.quantity}</td>
                  <td className="p-2 text-right">{won(h.avgPrice)}</td>
                  <td className="p-2 text-right">{won(h.invest)}</td>
                  <td className="p-2 text-right">{won(h.evalAmount)}</td>
                  <td className={`p-2 text-right ${h.profit >= 0 ? "text-red-500" : "text-blue-500"}`}>
                    {won(h.profit)}
                  </td>
                  <td className={`p-2 text-right ${h.profitRate >= 0 ? "text-red-500" : "text-blue-500"}`}>
                    {rate(h.profitRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* 🔥 핵심 분석 */}
        <Section title="투자 분석">
          <div className="grid md:grid-cols-2 gap-4">

            <Card title="📌 투자 요약">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {stock.summary || "내용 없음"}
              </p>
            </Card>

            <Card title="🧠 투자 포인트">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {stock.memo || "내용 없음"}
              </p>
            </Card>

            <Card title="🚀 업사이드">
              <div className="text-2xl font-bold text-green-600">
                {stock.upside ? `${stock.upside}` : "-"}
              </div>
            </Card>

            <Card title="🔗 외부 정보">
              {stock.link ? (
                <a
                  href={stock.link}
                  target="_blank"
                  className="inline-block rounded-lg bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
                >
                  인포스탁 바로가기
                </a>
              ) : (
                <div className="text-gray-400 text-sm">링크 없음</div>
              )}
            </Card>

          </div>
        </Section>

      </div>
    </main>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <div className="font-bold mb-3">{title}</div>
      {children}
    </div>
  );
}

function Card({ title, children }: any) {
  return (
    <div className="rounded-xl border p-3 bg-gray-50">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}

function Kpi({ label, value, highlight }: any) {
  return (
    <div className="rounded-xl bg-white p-3 border">
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`text-lg font-bold ${
          highlight > 0
            ? "text-red-500"
            : highlight < 0
            ? "text-blue-500"
            : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}