import { lookup, allEntries } from "../registry.js";
import { fanOut } from "../client.js";
import { GET_PROTOCOL_COMPARE, GET_TOP_MARKETS } from "../queries.js";

export async function compareProtocols(args: { protocols: string[] }) {
  const targets = args.protocols.map(p => {
    const entries = lookup(p);
    return { protocol: p, entry: entries[0] };
  });

  const results = await fanOut<any>(targets, GET_PROTOCOL_COMPARE);

  const succeeded = results
    .filter(r => r.data)
    .map(r => {
      const p = r.data!.lendingProtocols?.[0];
      return { ...r, proto: p };
    })
    .filter(r => r.proto)
    .sort((a, b) => Number(b.proto.totalValueLockedUSD) - Number(a.proto.totalValueLockedUSD));

  const failed = results.filter(r => r.error);

  const lines: string[] = [];

  for (const r of succeeded) {
    const p = r.proto;
    lines.push([
      `${p.name ?? r.protocol} (${r.slug})`,
      `  TVL: $${Number(p.totalValueLockedUSD).toLocaleString()}`,
      `  Deposits: $${Number(p.totalDepositBalanceUSD).toLocaleString()} | Borrows: $${Number(p.totalBorrowBalanceUSD).toLocaleString()}`,
      `  Users: ${Number(p.cumulativeUniqueUsers).toLocaleString()} (${Number(p.cumulativeUniqueDepositors ?? 0).toLocaleString()} depositors, ${Number(p.cumulativeUniqueBorrowers ?? 0).toLocaleString()} borrowers)`,
      `  Revenue: $${Number(p.cumulativeTotalRevenueUSD ?? 0).toLocaleString()} (supply: $${Number(p.cumulativeSupplySideRevenueUSD ?? 0).toLocaleString()}, protocol: $${Number(p.cumulativeProtocolSideRevenueUSD ?? 0).toLocaleString()})`,
      `  Pools: ${p.totalPoolCount} | Open Positions: ${Number(p.openPositionCount ?? 0).toLocaleString()}`,
      `  Cumulative Borrows: $${Number(p.cumulativeBorrowUSD ?? 0).toLocaleString()} | Cumulative Liquidations: $${Number(p.cumulativeLiquidateUSD ?? 0).toLocaleString()}`,
    ].join("\n"));
  }

  if (failed.length > 0) {
    lines.push("");
    lines.push(`--- ${failed.length} protocol(s) failed ---`);
    for (const f of failed) {
      lines.push(`  ${f.slug}: ${f.error}`);
    }
  }

  return {
    content: [{
      type: "text" as const,
      text: `Protocol comparison (${succeeded.length} succeeded, ${failed.length} failed):\n\n${lines.join("\n\n")}`,
    }],
  };
}

export async function topMarketsByTvl(args: {
  network?: string;
  first: number;
}) {
  let targets = allEntries();

  if (args.network) {
    const net = args.network.toUpperCase().replace(/-/g, "_");
    targets = targets.filter(t => t.entry.network === net);
  }

  if (targets.length === 0) {
    return { content: [{ type: "text" as const, text: "No protocols match the given network filter." }] };
  }

  const results = await fanOut<any>(targets, GET_TOP_MARKETS);

  // Collect all markets across all protocols, tag with protocol info
  const allMarkets: any[] = [];
  const errors: string[] = [];

  for (const r of results) {
    if (r.error) {
      errors.push(`${r.slug}: ${r.error}`);
      continue;
    }
    const markets = r.data?.markets ?? [];
    for (const m of markets) {
      allMarkets.push({ ...m, _protocol: r.protocol, _slug: r.slug });
    }
  }

  // Sort globally by TVL and take top N
  allMarkets.sort((a, b) => Number(b.totalValueLockedUSD) - Number(a.totalValueLockedUSD));
  const top = allMarkets.slice(0, args.first);

  if (top.length === 0) {
    return { content: [{ type: "text" as const, text: "No markets found across registered protocols." }] };
  }

  const lines = top.map((m: any, i: number) => {
    const rates = (m.rates ?? [])
      .map((r: any) => `${r.side} ${r.type}: ${Number(r.rate).toFixed(2)}%`)
      .join(", ");
    return `${i + 1}. ${m.name} (${m._protocol}) | ${m.inputToken?.symbol ?? "?"} | TVL: $${Number(m.totalValueLockedUSD).toLocaleString()} | Deposits: $${Number(m.totalDepositBalanceUSD).toLocaleString()} | Borrows: $${Number(m.totalBorrowBalanceUSD).toLocaleString()} | LTV: ${m.maximumLTV ?? "N/A"} | Rates: ${rates || "N/A"}`;
  });

  if (errors.length > 0) {
    lines.push("");
    lines.push(`--- ${errors.length} endpoint(s) failed ---`);
    for (const e of errors) {
      lines.push(`  ${e}`);
    }
  }

  return {
    content: [{
      type: "text" as const,
      text: `Top ${top.length} markets by TVL${args.network ? ` (${args.network})` : ""}:\n\n${lines.join("\n")}`,
    }],
  };
}
