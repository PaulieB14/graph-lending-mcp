#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { lookup } from "./registry.js";
import { request } from "./client.js";
import * as protocol from "./tools/protocol.js";
import * as markets from "./tools/markets.js";
import * as rates from "./tools/rates.js";
import * as positions from "./tools/positions.js";
import * as events from "./tools/events.js";
import * as snapshots from "./tools/snapshots.js";
import * as cross from "./tools/cross.js";

const server = new McpServer({
  name: "graph-lending-mcp",
  version: "1.0.0",
});

// ── Protocol ────────────────────────────────────────────────────────────────

server.tool(
  "list_protocols",
  "List all supported lending protocols with TVL, borrow totals, and network. Optionally filter by network or schema version.",
  { network: z.string().optional(), schema_version: z.string().optional() },
  protocol.listProtocols,
);

server.tool(
  "get_protocol",
  "Full LendingProtocol data for a single protocol: revenue, user counts, transaction counts, TVL.",
  { protocol: z.string(), network: z.string().optional() },
  protocol.getProtocol,
);

// ── Markets ──────────────────────────────────────────────────────────────────

server.tool(
  "get_markets",
  "Top markets for a protocol ordered by TVL. Returns rates, caps, LTV thresholds.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    first: z.number().int().min(1).max(100).default(20),
    order_by: z.enum(["totalValueLockedUSD", "totalBorrowBalanceUSD"]).default("totalValueLockedUSD"),
  },
  markets.getMarkets,
);

server.tool(
  "get_market",
  "Deep-dive on a single market by its contract address ID.",
  { protocol: z.string(), network: z.string().optional(), market_id: z.string() },
  markets.getMarket,
);

// ── Rates ─────────────────────────────────────────────────────────────────────

server.tool(
  "get_interest_rates",
  "Current supply and borrow APRs across all markets in a protocol. Filter by side or rate type.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    side: z.enum(["LENDER", "BORROWER"]).optional(),
    type: z.enum(["VARIABLE", "STABLE", "FIXED"]).optional(),
  },
  rates.getInterestRates,
);

// ── Account / Positions ───────────────────────────────────────────────────────

server.tool(
  "get_account",
  "Account summary: open/closed position counts, deposit/borrow/liquidation counts, and current open positions.",
  { protocol: z.string(), network: z.string().optional(), address: z.string() },
  positions.getAccount,
);

server.tool(
  "get_positions",
  "Open positions for a wallet address. Optionally filter by side (COLLATERAL or BORROWER).",
  {
    protocol: z.string(),
    network: z.string().optional(),
    address: z.string(),
    side: z.enum(["COLLATERAL", "BORROWER"]).optional(),
    first: z.number().int().min(1).max(100).default(50),
  },
  positions.getPositions,
);

// ── Events ────────────────────────────────────────────────────────────────────

server.tool(
  "get_deposits",
  "Recent deposit transactions for a market or account.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    market_id: z.string().optional(),
    account: z.string().optional(),
    first: z.number().int().default(25),
  },
  events.getDeposits,
);

server.tool(
  "get_borrows",
  "Recent borrow transactions for a market or account.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    market_id: z.string().optional(),
    account: z.string().optional(),
    first: z.number().int().default(25),
  },
  events.getBorrows,
);

server.tool(
  "get_repays",
  "Recent repay transactions for a market or account.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    market_id: z.string().optional(),
    account: z.string().optional(),
    first: z.number().int().default(25),
  },
  events.getRepays,
);

server.tool(
  "get_withdrawals",
  "Recent withdrawal transactions for a market or account.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    market_id: z.string().optional(),
    account: z.string().optional(),
    first: z.number().int().default(25),
  },
  events.getWithdrawals,
);

server.tool(
  "get_liquidations",
  "Recent liquidation events with liquidator, liquidatee, collateral asset, profitUSD.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    market_id: z.string().optional(),
    first: z.number().int().default(25),
  },
  events.getLiquidations,
);

server.tool(
  "get_flashloans",
  "Recent flashloan events including fee amounts.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    first: z.number().int().default(25),
  },
  events.getFlashloans,
);

// ── Snapshots ─────────────────────────────────────────────────────────────────

server.tool(
  "get_daily_financials",
  "Protocol-level daily snapshots: TVL, volume, revenue. Last N days.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    days: z.number().int().min(1).max(365).default(30),
  },
  snapshots.getDailyFinancials,
);

server.tool(
  "get_market_snapshots",
  "Daily snapshots for a specific market: price, TVL, volume, rates history.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    market_id: z.string(),
    days: z.number().int().min(1).max(365).default(30),
  },
  snapshots.getMarketSnapshots,
);

server.tool(
  "get_usage_metrics",
  "Daily active user counts and transaction activity for a protocol.",
  {
    protocol: z.string(),
    network: z.string().optional(),
    days: z.number().int().min(1).max(365).default(30),
  },
  snapshots.getUsageMetrics,
);

// ── Cross-Protocol ────────────────────────────────────────────────────────────

server.tool(
  "compare_protocols",
  "Fetch and compare multiple protocols side-by-side sorted by TVL. Tolerates individual endpoint failures.",
  { protocols: z.array(z.string()).min(2).max(20) },
  cross.compareProtocols,
);

server.tool(
  "top_markets_by_tvl",
  "Global top N markets by TVL across all registered protocols. Optionally filter by network.",
  {
    network: z.string().optional(),
    first: z.number().int().min(1).max(50).default(10),
  },
  cross.topMarketsByTvl,
);

// ── Escape Hatch ──────────────────────────────────────────────────────────────

server.tool(
  "query_subgraph",
  "Execute a raw GraphQL query against any registered lending subgraph. Use this when the built-in tools don't cover what you need — custom filters, uncommon fields, exploratory queries. Returns raw JSON.",
  {
    protocol: z.string().describe("Protocol slug, e.g. 'aave-v2'"),
    network: z.string().optional(),
    query: z.string().describe("A valid GraphQL query string"),
    variables: z.record(z.unknown()).optional(),
  },
  async (args) => {
    const [entry] = lookup(args.protocol, args.network);
    const data = await request(entry, args.query, args.variables);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  },
);

// ── Boot ──────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("graph-lending-mcp running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
