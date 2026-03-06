import { lookup } from "../registry.js";
import { request } from "../client.js";
import { GET_DAILY_FINANCIALS, GET_MARKET_SNAPSHOTS, GET_USAGE_METRICS } from "../queries.js";

function formatDate(ts: string): string {
  return new Date(Number(ts) * 1000).toISOString().split("T")[0];
}

function fmtUSD(val: any): string {
  return `$${Number(val ?? 0).toLocaleString()}`;
}

export async function getDailyFinancials(args: {
  protocol: string;
  network?: string;
  days: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const data = await request<any>(entry, GET_DAILY_FINANCIALS, { days: args.days });
  const snapshots = data.financialsDailySnapshots ?? [];

  if (snapshots.length === 0) {
    return { content: [{ type: "text" as const, text: `No financial snapshots found for ${args.protocol}` }] };
  }

  const lines = snapshots.map((s: any) =>
    `${formatDate(s.timestamp)} | TVL: ${fmtUSD(s.totalValueLockedUSD)} | Deposits: ${fmtUSD(s.dailyDepositUSD)} | Borrows: ${fmtUSD(s.dailyBorrowUSD)} | Liquidations: ${fmtUSD(s.dailyLiquidateUSD)} | Revenue: ${fmtUSD(s.dailyTotalRevenueUSD)} (supply: ${fmtUSD(s.dailySupplySideRevenueUSD)}, protocol: ${fmtUSD(s.dailyProtocolSideRevenueUSD)})`
  );

  return {
    content: [{
      type: "text" as const,
      text: `Daily financials for ${entry.slug} (${snapshots.length} days):\n\n${lines.join("\n")}`,
    }],
  };
}

export async function getMarketSnapshots(args: {
  protocol: string;
  network?: string;
  market_id: string;
  days: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const data = await request<any>(entry, GET_MARKET_SNAPSHOTS, {
    market: args.market_id,
    days: args.days,
  });
  const snapshots = data.marketDailySnapshots ?? [];

  if (snapshots.length === 0) {
    return { content: [{ type: "text" as const, text: `No market snapshots found for market ${args.market_id} in ${args.protocol}` }] };
  }

  const lines = snapshots.map((s: any) => {
    const rates = (s.rates ?? [])
      .map((r: any) => `${r.side} ${r.type}: ${Number(r.rate).toFixed(2)}%`)
      .join(", ");
    return `${formatDate(s.timestamp)} | Price: $${Number(s.inputTokenPriceUSD ?? 0).toFixed(2)} | TVL: ${fmtUSD(s.totalValueLockedUSD)} | Deposits: ${fmtUSD(s.dailyDepositUSD)} | Borrows: ${fmtUSD(s.dailyBorrowUSD)} | Revenue: ${fmtUSD(s.dailyTotalRevenueUSD)} | Users: ${s.dailyActiveUsers ?? 0} | Rates: ${rates || "N/A"}`;
  });

  return {
    content: [{
      type: "text" as const,
      text: `Market snapshots for ${args.market_id} in ${entry.slug} (${snapshots.length} days):\n\n${lines.join("\n")}`,
    }],
  };
}

export async function getUsageMetrics(args: {
  protocol: string;
  network?: string;
  days: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const data = await request<any>(entry, GET_USAGE_METRICS, { days: args.days });
  const snapshots = data.usageMetricsDailySnapshots ?? [];

  if (snapshots.length === 0) {
    return { content: [{ type: "text" as const, text: `No usage metrics found for ${args.protocol}` }] };
  }

  const lines = snapshots.map((s: any) =>
    `${formatDate(s.timestamp)} | Active Users: ${s.dailyActiveUsers} (depositors: ${s.dailyActiveDepositors ?? 0}, borrowers: ${s.dailyActiveBorrowers ?? 0}) | Txns: ${s.dailyTransactionCount} | Deposits: ${s.dailyDepositCount} | Borrows: ${s.dailyBorrowCount} | Liquidations: ${s.dailyLiquidateCount} | Open Positions: ${s.openPositionCount}`
  );

  return {
    content: [{
      type: "text" as const,
      text: `Usage metrics for ${entry.slug} (${snapshots.length} days):\n\n${lines.join("\n")}`,
    }],
  };
}
