import { lookup } from "../registry.js";
import { request } from "../client.js";
import { GET_ACCOUNT, GET_POSITIONS, GET_POSITIONS_BY_SIDE } from "../queries.js";

export async function getAccount(args: {
  protocol: string;
  network?: string;
  address: string;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const data = await request<any>(entry, GET_ACCOUNT, {
    address: args.address.toLowerCase(),
  });

  const acct = data.account;
  if (!acct) {
    return {
      content: [{
        type: "text" as const,
        text: `Account ${args.address} not found in ${args.protocol}. The account may not have interacted with this protocol.`,
      }],
    };
  }

  const lines = [
    `Account: ${acct.id}`,
    `  Positions: ${acct.positionCount} total | ${acct.openPositionCount} open | ${acct.closedPositionCount} closed`,
    `  Activity: ${acct.depositCount} deposits | ${acct.withdrawCount} withdraws | ${acct.borrowCount} borrows | ${acct.repayCount} repays`,
    `  Liquidations: ${acct.liquidateCount ?? 0} as liquidator | ${acct.liquidationCount ?? 0} as liquidatee`,
  ];

  const positions = acct.positions ?? [];
  if (positions.length > 0) {
    lines.push("");
    lines.push(`  Open Positions (${positions.length}):`);
    for (const pos of positions) {
      const ts = pos.timestampOpened
        ? new Date(Number(pos.timestampOpened) * 1000).toISOString().split("T")[0]
        : "?";
      lines.push(
        `    ${pos.side} ${pos.asset?.symbol ?? "?"} in ${pos.market?.name ?? "?"} | Balance: ${pos.balance} | Collateral: ${pos.isCollateral} | Opened: ${ts}`
      );
    }
  }

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}

export async function getPositions(args: {
  protocol: string;
  network?: string;
  address: string;
  side?: string;
  first: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  // Select query based on whether side filter is present
  const query = args.side ? GET_POSITIONS_BY_SIDE : GET_POSITIONS;
  const variables: Record<string, unknown> = {
    address: args.address.toLowerCase(),
    first: args.first,
  };
  if (args.side) variables.side = args.side;

  const data = await request<any>(entry, query, variables);
  const positions = data.positions ?? [];

  if (positions.length === 0) {
    return {
      content: [{
        type: "text" as const,
        text: `No open positions found for ${args.address} in ${args.protocol}${args.side ? ` (side: ${args.side})` : ""}`,
      }],
    };
  }

  const lines = positions.map((pos: any) => {
    const ts = pos.timestampOpened
      ? new Date(Number(pos.timestampOpened) * 1000).toISOString().split("T")[0]
      : "?";
    return [
      `${pos.side} ${pos.asset?.symbol ?? "?"} in ${pos.market?.name ?? "?"}`,
      `  Balance: ${pos.balance} | Principal: ${pos.principal ?? "N/A"}`,
      `  Market Price: $${Number(pos.market?.inputTokenPriceUSD ?? 0).toFixed(2)} | Market TVL: $${Number(pos.market?.totalValueLockedUSD ?? 0).toLocaleString()}`,
      `  Collateral: ${pos.isCollateral} | Isolated: ${pos.isIsolated ?? "N/A"}`,
      `  Opened: ${ts} (block ${pos.blockNumberOpened ?? "?"})`,
      `  Activity: ${pos.depositCount ?? 0} deposits | ${pos.withdrawCount ?? 0} withdraws | ${pos.borrowCount ?? 0} borrows | ${pos.repayCount ?? 0} repays | ${pos.liquidationCount ?? 0} liquidations`,
    ].join("\n");
  });

  return {
    content: [{
      type: "text" as const,
      text: `${positions.length} open position(s) for ${args.address} in ${entry.slug}:\n\n${lines.join("\n\n")}`,
    }],
  };
}
