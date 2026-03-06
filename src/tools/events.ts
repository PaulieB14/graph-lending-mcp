import { lookup } from "../registry.js";
import { request } from "../client.js";

function formatTimestamp(ts: string): string {
  return new Date(Number(ts) * 1000).toISOString();
}

function formatEvent(e: any): string {
  return `${formatTimestamp(e.timestamp)} | ${e.asset?.symbol ?? "?"} | Amount: ${e.amount} ($${Number(e.amountUSD).toLocaleString()}) | Account: ${e.account?.id ?? "?"} | Market: ${e.market?.name ?? "?"} | Tx: ${e.hash}`;
}

// Build where clause dynamically — The Graph treats null values as "filter for null"
// so we must omit unused filters entirely
function buildEventQuery(
  entityName: string,
  fields: string,
  args: { first: number; market_id?: string; account?: string }
): { query: string; variables: Record<string, unknown> } {
  const whereParts: string[] = [];
  const varDefs: string[] = ["$first: Int!"];
  const variables: Record<string, unknown> = { first: args.first };

  if (args.market_id) {
    varDefs.push("$market: String!");
    whereParts.push("market: $market");
    variables.market = args.market_id;
  }
  if (args.account) {
    varDefs.push("$account: String!");
    whereParts.push("account: $account");
    variables.account = args.account.toLowerCase();
  }

  const whereClause = whereParts.length > 0
    ? `, where: { ${whereParts.join(", ")} }`
    : "";

  const query = `query Q(${varDefs.join(", ")}) {
    ${entityName}(first: $first, orderBy: timestamp, orderDirection: desc${whereClause}) {
      ${fields}
    }
  }`;

  return { query, variables };
}

const EVENT_FIELDS = `hash timestamp blockNumber
      account { id } market { name } asset { symbol decimals }
      amount amountUSD`;

export async function getDeposits(args: {
  protocol: string;
  network?: string;
  market_id?: string;
  account?: string;
  first: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];
  const { query, variables } = buildEventQuery("deposits", EVENT_FIELDS, args);
  const data = await request<any>(entry, query, variables);
  const events = data.deposits ?? [];

  if (events.length === 0) {
    return { content: [{ type: "text" as const, text: `No deposits found for ${args.protocol}` }] };
  }

  const lines = events.map(formatEvent);
  return {
    content: [{
      type: "text" as const,
      text: `${events.length} recent deposit(s) for ${entry.slug}:\n\n${lines.join("\n")}`,
    }],
  };
}

export async function getBorrows(args: {
  protocol: string;
  network?: string;
  market_id?: string;
  account?: string;
  first: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];
  const { query, variables } = buildEventQuery("borrows", EVENT_FIELDS, args);
  const data = await request<any>(entry, query, variables);
  const events = data.borrows ?? [];

  if (events.length === 0) {
    return { content: [{ type: "text" as const, text: `No borrows found for ${args.protocol}` }] };
  }

  const lines = events.map(formatEvent);
  return {
    content: [{
      type: "text" as const,
      text: `${events.length} recent borrow(s) for ${entry.slug}:\n\n${lines.join("\n")}`,
    }],
  };
}

export async function getRepays(args: {
  protocol: string;
  network?: string;
  market_id?: string;
  account?: string;
  first: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];
  const { query, variables } = buildEventQuery("repays", EVENT_FIELDS, args);
  const data = await request<any>(entry, query, variables);
  const events = data.repays ?? [];

  if (events.length === 0) {
    return { content: [{ type: "text" as const, text: `No repays found for ${args.protocol}` }] };
  }

  const lines = events.map(formatEvent);
  return {
    content: [{
      type: "text" as const,
      text: `${events.length} recent repay(s) for ${entry.slug}:\n\n${lines.join("\n")}`,
    }],
  };
}

export async function getWithdrawals(args: {
  protocol: string;
  network?: string;
  market_id?: string;
  account?: string;
  first: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];
  const { query, variables } = buildEventQuery("withdraws", EVENT_FIELDS, args);
  const data = await request<any>(entry, query, variables);
  const events = data.withdraws ?? [];

  if (events.length === 0) {
    return { content: [{ type: "text" as const, text: `No withdrawals found for ${args.protocol}` }] };
  }

  const lines = events.map(formatEvent);
  return {
    content: [{
      type: "text" as const,
      text: `${events.length} recent withdrawal(s) for ${entry.slug}:\n\n${lines.join("\n")}`,
    }],
  };
}

export async function getLiquidations(args: {
  protocol: string;
  network?: string;
  market_id?: string;
  first: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const LIQUIDATION_FIELDS = `hash timestamp blockNumber
      liquidator { id } liquidatee { id }
      market { name } asset { symbol decimals }
      amount amountUSD profitUSD`;

  const { query, variables } = buildEventQuery("liquidates", LIQUIDATION_FIELDS, args);
  const data = await request<any>(entry, query, variables);
  const events = data.liquidates ?? [];

  if (events.length === 0) {
    return { content: [{ type: "text" as const, text: `No liquidations found for ${args.protocol}` }] };
  }

  const lines = events.map((e: any) =>
    `${formatTimestamp(e.timestamp)} | ${e.asset?.symbol ?? "?"} | Amount: ${e.amount} ($${Number(e.amountUSD).toLocaleString()}) | Profit: $${Number(e.profitUSD ?? 0).toLocaleString()} | Liquidator: ${e.liquidator?.id ?? "?"} | Liquidatee: ${e.liquidatee?.id ?? "?"} | Market: ${e.market?.name ?? "?"} | Tx: ${e.hash}`
  );

  return {
    content: [{
      type: "text" as const,
      text: `${events.length} recent liquidation(s) for ${entry.slug}:\n\n${lines.join("\n")}`,
    }],
  };
}

export async function getFlashloans(args: {
  protocol: string;
  network?: string;
  first: number;
}) {
  const entries = lookup(args.protocol, args.network);
  const entry = entries[0];

  const query = `query Q($first: Int!) {
    flashloans(first: $first, orderBy: timestamp, orderDirection: desc) {
      hash timestamp blockNumber
      account { id } market { name } asset { symbol decimals }
      amount amountUSD feeAmount feeAmountUSD
    }
  }`;

  const data = await request<any>(entry, query, { first: args.first });
  const events = data.flashloans ?? [];

  if (events.length === 0) {
    return { content: [{ type: "text" as const, text: `No flashloans found for ${args.protocol}` }] };
  }

  const lines = events.map((e: any) =>
    `${formatTimestamp(e.timestamp)} | ${e.asset?.symbol ?? "?"} | Amount: ${e.amount} ($${Number(e.amountUSD).toLocaleString()}) | Fee: ${e.feeAmount} ($${Number(e.feeAmountUSD ?? 0).toLocaleString()}) | Account: ${e.account?.id ?? "?"} | Market: ${e.market?.name ?? "?"} | Tx: ${e.hash}`
  );

  return {
    content: [{
      type: "text" as const,
      text: `${events.length} recent flashloan(s) for ${entry.slug}:\n\n${lines.join("\n")}`,
    }],
  };
}
