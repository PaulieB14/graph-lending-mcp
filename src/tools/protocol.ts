import { lookup, allEntries, schemaAtLeast, type SubgraphEntry } from "../registry.js";
import { fetchProtocol, fanOut } from "../client.js";
import { GET_PROTOCOL_LITE, GET_PROTOCOL, GET_PROTOCOL_V2 } from "../queries.js";

function formatProtocol(p: any, slug: string): string {
  const lines = [
    `${p.name} (${p.slug ?? slug})`,
    `  Network: ${p.network}`,
    `  Type: ${p.lendingType}`,
    `  TVL: $${Number(p.totalValueLockedUSD).toLocaleString()}`,
    `  Total Deposits: $${Number(p.totalDepositBalanceUSD).toLocaleString()}`,
    `  Total Borrows: $${Number(p.totalBorrowBalanceUSD).toLocaleString()}`,
  ];
  if (p.riskType) lines.push(`  Risk Type: ${p.riskType}`);
  if (p.cumulativeUniqueUsers) lines.push(`  Unique Users: ${Number(p.cumulativeUniqueUsers).toLocaleString()}`);
  if (p.totalPoolCount) lines.push(`  Pool Count: ${p.totalPoolCount}`);
  if (p.cumulativeTotalRevenueUSD) lines.push(`  Cumulative Revenue: $${Number(p.cumulativeTotalRevenueUSD).toLocaleString()}`);
  if (p.transactionCount) lines.push(`  Transactions: ${Number(p.transactionCount).toLocaleString()}`);
  if (p.openPositionCount) lines.push(`  Open Positions: ${Number(p.openPositionCount).toLocaleString()}`);
  return lines.join("\n");
}

export async function listProtocols(args: { network?: string; schema_version?: string }) {
  let targets = allEntries();

  if (args.network) {
    const net = args.network.toUpperCase().replace(/-/g, "_");
    targets = targets.filter(t => t.entry.network === net);
  }
  if (args.schema_version) {
    targets = targets.filter(t => t.entry.schemaVersion.startsWith(args.schema_version!));
  }

  if (targets.length === 0) {
    return { content: [{ type: "text" as const, text: "No protocols match the given filters." }] };
  }

  const results = await fanOut<any>(targets, GET_PROTOCOL_LITE);

  const lines: string[] = [];
  const succeeded = results.filter(r => r.data);
  const failed = results.filter(r => r.error);

  // Sort by TVL descending
  succeeded.sort((a, b) => {
    const tvlA = Number(a.data?.lendingProtocols?.[0]?.totalValueLockedUSD ?? 0);
    const tvlB = Number(b.data?.lendingProtocols?.[0]?.totalValueLockedUSD ?? 0);
    return tvlB - tvlA;
  });

  for (const r of succeeded) {
    const p = r.data?.lendingProtocols?.[0];
    if (!p) continue;
    lines.push(
      `${p.name ?? r.protocol} | ${r.slug} | TVL: $${Number(p.totalValueLockedUSD).toLocaleString()} | Deposits: $${Number(p.totalDepositBalanceUSD).toLocaleString()} | Borrows: $${Number(p.totalBorrowBalanceUSD).toLocaleString()} | Pools: ${p.totalPoolCount} | Users: ${Number(p.cumulativeUniqueUsers).toLocaleString()}`
    );
  }

  if (failed.length > 0) {
    lines.push("");
    lines.push(`--- ${failed.length} endpoint(s) failed ---`);
    for (const f of failed) {
      lines.push(`  ${f.slug}: ${f.error}`);
    }
  }

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}

export async function getProtocol(args: { protocol: string; network?: string }) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  // Use schema-appropriate query
  const query = schemaAtLeast(entry, "3.0.0") ? GET_PROTOCOL : GET_PROTOCOL_V2;

  const p = await fetchProtocol(entry, query);
  if (!p) {
    return { content: [{ type: "text" as const, text: `No protocol data found for ${args.protocol}` }] };
  }

  return { content: [{ type: "text" as const, text: formatProtocol(p, entry.slug) }] };
}
