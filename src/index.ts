#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { lookup, allProtocols } from "./registry.js";
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

// ── Shared schema helpers ────────────────────────────────────────────────────

const PROTOCOL_LIST = allProtocols().join(", ");

const NETWORK_HELP =
  "Network filter. Use these exact values: MAINNET (Ethereum), MATIC (Polygon), ARBITRUM_ONE (Arbitrum), AVALANCHE, BASE, BSC (BNB Chain), OPTIMISM, FANTOM, GNOSIS, BLAST, SCROLL, NEAR, HARMONY, MOONBEAM, MOONRIVER, AURORA, LINEA, ZKSYNC_ERA. Omit to use the default (first) deployment.";

const protocolParam = z.string().describe(
  `Protocol registry slug. Must be one of: ${PROTOCOL_LIST}`
);

const networkParam = z.string().optional().describe(NETWORK_HELP);

// ── Protocol ────────────────────────────────────────────────────────────────

server.registerTool(
  "list_protocols",
  {
    description: "List all supported lending protocols with live TVL, deposit/borrow totals, pool counts, and user counts. Fans out to all registered subgraph endpoints. Optionally filter by network or schema version.",
    inputSchema: {
      network: networkParam,
      schema_version: z.string().optional().describe("Filter by schema version prefix, e.g. '3' for v3+ or '2.0' for v2.x"),
    },
    annotations: { readOnlyHint: true },
  },
  protocol.listProtocols,
);

server.registerTool(
  "get_protocol",
  {
    description: "Detailed stats for a single lending protocol: TVL, deposits, borrows, revenue, user counts, transaction counts, pool counts, position counts.",
    inputSchema: { protocol: protocolParam, network: networkParam },
    annotations: { readOnlyHint: true },
  },
  protocol.getProtocol,
);

// ── Markets ──────────────────────────────────────────────────────────────────

server.registerTool(
  "get_markets",
  {
    description: "List markets (lending pools) for a protocol, ordered by TVL or borrows. Returns token, rates, caps, LTV thresholds, and reward info.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      first: z.number().int().min(1).max(100).default(20).describe("Number of markets to return (1-100)"),
      order_by: z.enum(["totalValueLockedUSD", "totalBorrowBalanceUSD"]).default("totalValueLockedUSD").describe("Sort field: totalValueLockedUSD or totalBorrowBalanceUSD"),
    },
    annotations: { readOnlyHint: true },
  },
  markets.getMarkets,
);

server.registerTool(
  "get_market",
  {
    description: "Deep-dive on a single market by its on-chain contract address. Returns balances, cumulative stats, position counts, risk parameters, rates, and rewards. Get market IDs from get_markets first.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      market_id: z.string().describe("Market contract address (0x...). Get this from get_markets results."),
    },
    annotations: { readOnlyHint: true },
  },
  markets.getMarket,
);

// ── Rates ─────────────────────────────────────────────────────────────────────

server.registerTool(
  "get_interest_rates",
  {
    description: "Current supply and borrow APRs across all markets in a protocol. Optionally filter by side (LENDER/BORROWER) or rate type (VARIABLE/STABLE/FIXED).",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      side: z.enum(["LENDER", "BORROWER"]).optional().describe("Filter: LENDER (supply APR) or BORROWER (borrow APR)"),
      type: z.enum(["VARIABLE", "STABLE", "FIXED"]).optional().describe("Filter by rate type"),
    },
    annotations: { readOnlyHint: true },
  },
  rates.getInterestRates,
);

// ── Account / Positions ───────────────────────────────────────────────────────

server.registerTool(
  "get_account",
  {
    description: "Account summary for a wallet address: open/closed position counts, deposit/borrow/liquidation activity, and list of current open positions.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      address: z.string().describe("Wallet address (0x...). Will be lowercased automatically."),
    },
    annotations: { readOnlyHint: true },
  },
  positions.getAccount,
);

server.registerTool(
  "get_positions",
  {
    description: "Open positions for a wallet address with balances, market prices, and activity counts. Optionally filter by side.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      address: z.string().describe("Wallet address (0x...). Will be lowercased automatically."),
      side: z.enum(["COLLATERAL", "BORROWER"]).optional().describe("Filter: COLLATERAL (deposits used as collateral) or BORROWER (borrows)"),
      first: z.number().int().min(1).max(100).default(50).describe("Max positions to return"),
    },
    annotations: { readOnlyHint: true },
  },
  positions.getPositions,
);

// ── Events ────────────────────────────────────────────────────────────────────

server.registerTool(
  "get_deposits",
  {
    description: "Recent deposit events. Optionally filter by market ID and/or account address.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      market_id: z.string().optional().describe("Market contract address to filter by (0x...). Get from get_markets."),
      account: z.string().optional().describe("Account address to filter by (0x...)"),
      first: z.number().int().default(25).describe("Number of events to return"),
    },
    annotations: { readOnlyHint: true },
  },
  events.getDeposits,
);

server.registerTool(
  "get_borrows",
  {
    description: "Recent borrow events. Optionally filter by market ID and/or account address.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      market_id: z.string().optional().describe("Market contract address to filter by (0x...). Get from get_markets."),
      account: z.string().optional().describe("Account address to filter by (0x...)"),
      first: z.number().int().default(25).describe("Number of events to return"),
    },
    annotations: { readOnlyHint: true },
  },
  events.getBorrows,
);

server.registerTool(
  "get_repays",
  {
    description: "Recent repay events. Optionally filter by market ID and/or account address.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      market_id: z.string().optional().describe("Market contract address to filter by (0x...). Get from get_markets."),
      account: z.string().optional().describe("Account address to filter by (0x...)"),
      first: z.number().int().default(25).describe("Number of events to return"),
    },
    annotations: { readOnlyHint: true },
  },
  events.getRepays,
);

server.registerTool(
  "get_withdrawals",
  {
    description: "Recent withdrawal events. Optionally filter by market ID and/or account address.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      market_id: z.string().optional().describe("Market contract address to filter by (0x...). Get from get_markets."),
      account: z.string().optional().describe("Account address to filter by (0x...)"),
      first: z.number().int().default(25).describe("Number of events to return"),
    },
    annotations: { readOnlyHint: true },
  },
  events.getWithdrawals,
);

server.registerTool(
  "get_liquidations",
  {
    description: "Recent liquidation events with liquidator, liquidatee, collateral asset, and profit amounts. Optionally filter by market.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      market_id: z.string().optional().describe("Market contract address to filter by (0x...). Get from get_markets."),
      first: z.number().int().default(25).describe("Number of events to return"),
    },
    annotations: { readOnlyHint: true },
  },
  events.getLiquidations,
);

server.registerTool(
  "get_flashloans",
  {
    description: "Recent flashloan events including fee amounts. Only available for v3+ schema protocols (e.g. aave-v3, compound-v3, spark-lend).",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      first: z.number().int().default(25).describe("Number of events to return"),
    },
    annotations: { readOnlyHint: true },
  },
  events.getFlashloans,
);

// ── Snapshots ─────────────────────────────────────────────────────────────────

server.registerTool(
  "get_daily_financials",
  {
    description: "Protocol-level daily snapshots: TVL, deposit/borrow/liquidation volume, and revenue breakdown (supply-side vs protocol-side). Returns last N days.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      days: z.number().int().min(1).max(365).default(30).describe("Number of days of history (1-365)"),
    },
    annotations: { readOnlyHint: true },
  },
  snapshots.getDailyFinancials,
);

server.registerTool(
  "get_market_snapshots",
  {
    description: "Daily snapshots for a specific market: token price, TVL, volume, revenue, rates history, and active user counts.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      market_id: z.string().describe("Market contract address (0x...). Get from get_markets."),
      days: z.number().int().min(1).max(365).default(30).describe("Number of days of history (1-365)"),
    },
    annotations: { readOnlyHint: true },
  },
  snapshots.getMarketSnapshots,
);

server.registerTool(
  "get_usage_metrics",
  {
    description: "Daily active user counts and transaction activity breakdown (deposits, borrows, repays, liquidations) for a protocol.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      days: z.number().int().min(1).max(365).default(30).describe("Number of days of history (1-365)"),
    },
    annotations: { readOnlyHint: true },
  },
  snapshots.getUsageMetrics,
);

// ── Cross-Protocol ────────────────────────────────────────────────────────────

server.registerTool(
  "compare_protocols",
  {
    description: "Compare multiple protocols side-by-side: TVL, deposits, borrows, revenue, users, pools. Sorted by TVL. Tolerates individual endpoint failures.",
    inputSchema: {
      protocols: z.array(z.string()).min(2).max(20).describe(
        `Array of protocol slugs to compare. Must be from: ${PROTOCOL_LIST}`
      ),
    },
    annotations: { readOnlyHint: true },
  },
  cross.compareProtocols,
);

server.registerTool(
  "top_markets_by_tvl",
  {
    description: "Global top N markets by TVL across ALL registered lending protocols. Fans out to every endpoint. Optionally filter by network.",
    inputSchema: {
      network: networkParam,
      first: z.number().int().min(1).max(50).default(10).describe("Number of top markets to return"),
    },
    annotations: { readOnlyHint: true },
  },
  cross.topMarketsByTvl,
);

// ── Escape Hatch ──────────────────────────────────────────────────────────────

server.registerTool(
  "query_subgraph",
  {
    description: "Execute a raw GraphQL query against any registered lending subgraph. Use for custom filters, uncommon fields, or exploratory queries. All subgraphs use the Messari standardized lending schema with entities: lendingProtocols, markets, accounts, positions, deposits, borrows, repays, withdraws, liquidates, flashloans, financialsDailySnapshots, marketDailySnapshots, usageMetricsDailySnapshots.",
    inputSchema: {
      protocol: protocolParam,
      network: networkParam,
      query: z.string().describe("A valid GraphQL query string for the Messari lending schema"),
      variables: z.record(z.unknown()).optional().describe("Optional GraphQL variables as key-value pairs"),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
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
