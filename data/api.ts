type RawStock = {
  종목코드: string;
  표시종목명: string;
  공식종목명: string;
  섹터: string;
  구분: string;
  설명: string;
  메모: string;
  업사이드: string;
  현재가: string;
  등락률: string;
  총수량: string;
  총투자금: string;
  총평가금: string;
  총손익: string;
  총수익률: string;
  인포스탁: string;
};

type RawHolding = {
  계좌: string;
  종목명: string;
  종목코드: string;
  수익률: string;
  수량: string;
  평단: string;
  투자금: string;
  손익: string;
  평가금: string;
};

const SHEET_ID = "11Ixji08etS19E0pTgQmc5vfFlUoLtgJzapwitvIagC0";

function toNumber(value: string | number | undefined) {
  if (value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  const cleaned = value
    .replace(/,/g, "")
    .replace(/원/g, "")
    .replace(/%/g, "")
    .trim();

  const num = Number(cleaned);
  return Number.isNaN(num) ? 0 : num;
}
function toRatio(value: string | number | undefined) {
  const num = toNumber(value);
  const text = String(value ?? "");

  // 셀 값이 "390.02%"처럼 % 문자를 포함할 때만 /100
  if (text.includes("%")) return num / 100;

  // 시트 원본값이 3.9면 그대로 3.9 = 390%
  return num;
}

function toPercentPoint(value: string | number | undefined) {
  const num = toNumber(value);
  const text = String(value ?? "");

  if (text.includes("%")) return num;
  if (Math.abs(num) <= 1) return num * 100;

  return num;
}
export async function getStocks() {
  const res = await fetch(
    `https://opensheet.elk.sh/${SHEET_ID}/WEB_Stocks`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("WEB_Stocks 데이터를 불러오지 못했습니다.");
  }

  const rows: RawStock[] = await res.json();

  return rows.map((row) => {
    const invest = toNumber(row.총투자금);
    const profit = toNumber(row.총손익);
    const profitRate = toRatio(row.총수익률);
const changeRate = toPercentPoint(row.등락률);

    return {
  code: normalizeCode(row.종목코드),
  name: row.표시종목명,
  officialName: row.공식종목명,
  sector: row.섹터,
  status: row.구분,
  summary: row.설명,
  memo: row.메모,
  link: row.인포스탁,
  upside: toNumber(row.업사이드),
  price: toNumber(row.현재가),
  changeRate,
  quantity: toNumber(row.총수량),
  invest,
  evalAmount: toNumber(row.총평가금),
  profit,
  profitRate,
};
  });
}

export async function getHoldings() {
  const res = await fetch(
    `https://opensheet.elk.sh/${SHEET_ID}/WEB_Holdings`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("WEB_Holdings 데이터를 불러오지 못했습니다.");
  }

  const rows: RawHolding[] = await res.json();

  return rows.map((row) => {
    const profitRate = toRatio(row.수익률);

    return {
      account: row.계좌,
      code: normalizeCode(row.종목코드),
      name: row.종목명,
      quantity: toNumber(row.수량),
      avgPrice: toNumber(row.평단),
      invest: toNumber(row.투자금),
      evalAmount: toNumber(row.평가금),
      profit: toNumber(row.손익),
      profitRate,
    };
  });
}
function normalizeCode(value: string | number | undefined) {
  if (value === undefined) return "";
  const text = String(value).trim();

  // 숫자 6자리 종목코드는 앞에 0 채우기
  if (/^\d+$/.test(text)) {
    return text.padStart(6, "0");
  }

  return text;
}
type RawDashboard = {
  항목: string;
  값: string;
};

export async function getDashboard() {
  const res = await fetch(
    `https://opensheet.elk.sh/${SHEET_ID}/WEB_Dashboard`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("WEB_Dashboard 데이터를 불러오지 못했습니다.");
  }

  const rows = await res.json();

  const map = new Map<string, string>();

  rows.forEach((row: any) => {
    map.set(row["항목"], row["값"]);
  });

  return {
    totalAsset: toNumber(map.get("총자산")),
    cash: toNumber(map.get("예수금")),
    pension: toNumber(map.get("연금자산")),
    annualProfit: toNumber(map.get("연수익")),
    updatedAt: map.get("업데이트시간"), // 🔥 핵심 추가
   fireGoal: toNumber(map.get("FIRE목표")),
  };
}
export async function getAssetHistory() {
  const res = await fetch(
    `https://opensheet.elk.sh/${SHEET_ID}/WEB_AssetHistory`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("WEB_AssetHistory 데이터를 불러오지 못했습니다.");
  }

  const rows = await res.json();

  return rows.map((row: any) => ({
    date: row["날짜"],
    totalAsset: Number(row["총자산"] || 0),
    stockAsset: Number(row["주식자산"] || 0),
    pension: Number(row["연금자산"] || 0),
    annualProfit: Number(row["연수익"] || 0),
    cumulativeProfit: Number(row["누적수익금"] || 0),
  }));
}