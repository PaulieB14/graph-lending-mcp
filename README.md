# graph-lending-mcp

<a href="https://glama.ai/mcp/servers/@PaulieB14/graph-lending-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@PaulieB14/graph-lending-mcp/badge" />
</a>

MCP server that exposes unified AI-friendly tools over [Messari's standardized lending subgraphs](https://github.com/messari/subgraphs) on [The Graph](https://thegraph.com/).

One natural-language query → fan out across 40+ lending protocols on multiple chains → get back structured, comparable data.


## Features

- **19 MCP tools** covering protocols, markets, rates, positions, events, snapshots, and cross-protocol analytics
- **40+ lending protocols** across Ethereum, Polygon, Arbitrum, Avalanche, BSC, Optimism, Base, and more
- **Cross-protocol comparison** — compare TVL, revenue, users across any set of protocols in one call
- **Graceful failure handling** — dead subgraphs don't crash queries; failures are reported alongside successes
- **Schema-version aware** — automatically selects compatible queries for v1.x, v2.x, and v3.x subgraphs

## Tools

| Tool | Description |
|------|-------------|
| `list_protocols` | List all registered protocols with live TVL data |
| `get_protocol` | Detailed protocol stats (TVL, revenue, users, pool counts) |
| `get_markets` | List markets for a protocol, sorted by any field |
| `get_market` | Detailed single market data including rates, caps, and positions |
| `get_interest_rates` | Interest rates across all markets, with optional side/type filters |
| `get_account` | Account overview with position counts and activity |
| `get_positions` | Open positions for an address, with optional side filter |
| `get_deposits` | Recent deposit events, filterable by market and account |
| `get_borrows` | Recent borrow events |
| `get_repays` | Recent repay events |
| `get_withdrawals` | Recent withdrawal events |
| `get_liquidations` | Recent liquidation events with profit data |
| `get_flashloans` | Recent flashloan events |
| `get_daily_financials` | Daily financial snapshots (TVL, volume, revenue) |
| `get_market_snapshots` | Daily market-level snapshots with rates and activity |
| `get_usage_metrics` | Daily user activity and transaction counts |
| `compare_protocols` | Side-by-side comparison of multiple protocols |
| `top_markets_by_tvl` | Top markets across all protocols, optionally filtered by network |
| `query_subgraph` | Raw GraphQL escape hatch for any registered subgraph |

## Setup

### Prerequisites

- Node.js 18+
- A Graph API key from [The Graph Studio](https://thegraph.com/studio/apikeys/)

### Install & Build

```bash
git clone https://github.com/PaulieB14/graph-lending-mcp.git
cd graph-lending-mcp
npm install
npx tsc
```

### Configure in Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "graph-lending": {
      "command": "node",
      "args": ["/path/to/graph-lending-mcp/dist/index.js"],
      "env": {
        "GRAPH_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Architecture

```
src/
├── index.ts          # MCP server entry — registers all 19 tools
├── registry.ts       # Protocol → subgraph ID mapping (see SUBGRAPHS.md)
├── client.ts         # GraphQL fetch with retry, timeout, fan-out
├── queries.ts        # All GraphQL query constants
└── tools/
    ├── protocol.ts   # list_protocols, get_protocol
    ├── markets.ts    # get_markets, get_market
    ├── rates.ts      # get_interest_rates
    ├── positions.ts  # get_account, get_positions
    ├── events.ts     # deposits, borrows, repays, withdrawals, liquidations, flashloans
    ├── snapshots.ts  # daily_financials, market_snapshots, usage_metrics
    └── cross.ts      # compare_protocols, top_markets_by_tvl
```

All queries use Messari's [standardized lending schema](https://github.com/messari/subgraphs/tree/master/subgraphs) — same entities and fields across every protocol.

## Subgraph Registry

See [SUBGRAPHS.md](SUBGRAPHS.md) for the full list of registered subgraphs with their status, network, schema version, and notes.

## License

MIT
