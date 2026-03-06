import { lookup } from "../registry.js";
import { request } from "../client.js";
import { GET_MARKETS, GET_MARKET } from "../queries.js";

function formatRate(r: any): string {
  return `${r.side} ${r.type}: ${Number(r.rate).toFixed(2)}%`;
}

function formatMarketSummary(m: any): string {
  const rates = (m.rates ?? []).map(formatRate).join(", ");
  const rewards = (m.rewardTokens ?? []).map((rt: any) => `${rt.token?.symbol} (${rt.type})`).join(", ");
  const lines = [
    `${m.name} (${m.id})`,
    `  Token: ${m.inputToken?.symbol} | Price: $${Number(m.inputTokenPriceUSD ?? 0).toFixed(2)}`,
    `  TVL: $${Number(m.totalValueLockedUSD).toLocaleString()} | Deposits: $${Number(m.totalDepositBalanceUSD).toLocaleString()} | Borrows: $${Number(m.totalBorrowBalanceUSD).toLocaleString()}`,
    `  Active: ${m.isActive} | Borrowable: ${m.canBorrowFrom} | Collateral: ${m.canUseAsCollateral}`,
    `  LTV: ${m.maximumLTV} | Liq Threshold: ${m.liquidationThreshold} | Liq Penalty: ${m.liquidationPenalty}`,
  ];
  if (m.supplyCap) lines.push(`  Supply Cap: ${m.supplyCap} | Borrow Cap: ${m.borrowCap}`);
  if (rates) lines.push(`  Rates: ${rates}`);
  if (rewards) lines.push(`  Rewards: ${rewards}`);
  return lines.join("\n");
}

export async function getMarkets(args: {
  protocol: string;
  network?: string;
  first: number;
  order_by: string;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const data = await request<any>(entry, GET_MARKETS, {
    first: args.first,
    orderBy: args.order_by,
  });

  const markets = data.markets ?? [];
  if (markets.length === 0) {
    return { content: [{ type: "text" as const, text: `No markets found for ${args.protocol}` }] };
  }

  const text = markets.map(formatMarketSummary).join("\n\n");
  return { content: [{ type: "text" as const, text: `${markets.length} markets for ${entry.slug}:\n\n${text}` }] };
}

export async function getMarket(args: {
  protocol: string;
  network?: string;
  market_id: string;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const data = await request<any>(entry, GET_MARKET, { id: args.market_id });
  const m = data.market;

  if (!m) {
    return { content: [{ type: "text" as const, text: `Market ${args.market_id} not found in ${args.protocol}` }] };
  }

  const rates = (m.rates ?? []).map(formatRate).join(", ");
  const rewards = (m.rewardTokens ?? []).map((rt: any) => `${rt.token?.symbol} (${rt.type})`).join(", ");

  const lines = [
    `${m.name} (${m.id})`,
    `  Token: ${m.inputToken?.symbol} (${m.inputToken?.id})`,
    `  Price: $${Number(m.inputTokenPriceUSD ?? 0).toFixed(2)}`,
    `  Active: ${m.isActive} | Borrowable: ${m.canBorrowFrom} | Collateral: ${m.canUseAsCollateral}`,
    "",
    "  Balances:",
    `    TVL: $${Number(m.totalValueLockedUSD).toLocaleString()}`,
    `    Deposits: $${Number(m.totalDepositBalanceUSD).toLocaleString()}`,
    `    Borrows: $${Number(m.totalBorrowBalanceUSD).toLocaleString()}`,
    "",
    "  Cumulative:",
    `    Deposits: $${Number(m.cumulativeDepositUSD ?? 0).toLocaleString()}`,
    `    Borrows: $${Number(m.cumulativeBorrowUSD ?? 0).toLocaleString()}`,
    `    Liquidations: $${Number(m.cumulativeLiquidateUSD ?? 0).toLocaleString()}`,
    "",
    "  Positions:",
    `    Open: ${m.openPositionCount ?? "N/A"} | Closed: ${m.closedPositionCount ?? "N/A"} | Total: ${m.positionCount ?? "N/A"}`,
    "",
    "  Risk Parameters:",
    `    Max LTV: ${m.maximumLTV} | Liq Threshold: ${m.liquidationThreshold} | Liq Penalty: ${m.liquidationPenalty}`,
    `    Supply Cap: ${m.supplyCap ?? "N/A"} | Borrow Cap: ${m.borrowCap ?? "N/A"}`,
    `    Reserve Factor: ${m.reserveFactor ?? "N/A"} | Reserves: ${m.reserves ?? "N/A"}`,
  ];
  if (rates) lines.push(`  Rates: ${rates}`);
  if (rewards) lines.push(`  Rewards: ${rewards}`);
  if (m.rewardTokenEmissionsUSD?.length) {
    lines.push(`  Reward Emissions (USD): ${m.rewardTokenEmissionsUSD.join(", ")}`);
  }

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}
