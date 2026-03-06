import { lookup } from "../registry.js";
import { request } from "../client.js";
import { GET_RATES } from "../queries.js";

export async function getInterestRates(args: {
  protocol: string;
  network?: string;
  side?: string;
  type?: string;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const data = await request<any>(entry, GET_RATES);
  const markets = data.markets ?? [];

  // Flatten rates with market context
  let results = markets.flatMap((m: any) =>
    (m.rates ?? []).map((r: any) => ({
      market: m.name,
      symbol: m.inputToken?.symbol,
      tvl: m.totalValueLockedUSD,
      deposits: m.totalDepositBalanceUSD,
      borrows: m.totalBorrowBalanceUSD,
      side: r.side,
      type: r.type,
      rate: r.rate,
    }))
  );

  // Client-side filtering
  if (args.side) results = results.filter((r: any) => r.side === args.side);
  if (args.type) results = results.filter((r: any) => r.type === args.type);

  if (results.length === 0) {
    return { content: [{ type: "text" as const, text: `No rates found for ${args.protocol} with the given filters.` }] };
  }

  const lines = results.map((r: any) =>
    `${r.market} (${r.symbol}) | ${r.side} ${r.type}: ${Number(r.rate).toFixed(2)}% | TVL: $${Number(r.tvl).toLocaleString()}`
  );

  return {
    content: [{
      type: "text" as const,
      text: `Interest rates for ${entry.slug}:\n\n${lines.join("\n")}`,
    }],
  };
}
