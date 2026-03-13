import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { allEntries, lookup } from "../dist/registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ── Graph client ────────────────────────────────────────────────────────────

function gw(id) {
  const key = process.env.GRAPH_API_KEY;
  if (!key) throw new Error("GRAPH_API_KEY env var required");
  return `https://gateway.thegraph.com/api/${key}/subgraphs/id/${id}`;
}

async function gql(entry, query, variables) {
  const body = { query };
  if (variables && Object.keys(variables).length > 0) body.variables = variables;
  const res = await fetch(gw(entry.subgraphId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function fanOut(entries, query, variables) {
  const results = [];
  for (let i = 0; i < entries.length; i += 15) {
    const batch = entries.slice(i, i + 15);
    const settled = await Promise.allSettled(
      batch.map(({ protocol, entry }) =>
        gql(entry, query, variables).then(data => ({
          protocol, slug: entry.slug, network: entry.network, data,
        }))
      )
    );
    for (let j = 0; j < settled.length; j++) {
      const r = settled[j];
      results.push(r.status === "fulfilled" ? r.value : { protocol: batch[j].protocol, slug: batch[j].entry.slug, error: true });
    }
  }
  return results;
}

// ── Curated LIVE subgraphs with >$1M TVL ────────────────────────────────────
const CURATED = new Set([
  "aave-v3-ethereum","aave-v2-polygon","makerdao-ethereum","spark-lend-ethereum",
  "rari-fuse-ethereum","venus-protocol-bsc","compound-v3-ethereum",
  "aave-v3-base","aave-v3-arbitrum","aave-v3-avalanche","radiant-capital-arbitrum",
  "aave-v3-polygon","benqi-avalanche","euler-finance-ethereum","liquity-ethereum",
  "compound-v2-ethereum","geist-finance-fantom","goldfinch-ethereum",
  "iron-bank-ethereum","aave-v2-ethereum","compound-v3-arbitrum",
  "aave-v3-optimism","moonwell-base","scream-fantom","sonne-finance-optimism",
  "uwu-lend-ethereum","aave-v2-avalanche","inverse-finance-ethereum",
  "compound-v3-polygon","qidao-fantom","truefi-ethereum","dforce-ethereum",
  "cream-finance-bsc","banker-joe-avalanche","abracadabra-arbitrum",
]);

function curated() { return allEntries().filter(({ entry }) => CURATED.has(entry.slug)); }

// ── UNIVERSAL QUERIES (work on v1, v2, v3) ──────────────────────────────────
// Only fields that exist across ALL Messari lending schema versions.

const Q_PROTOCOL = `{
  lendingProtocols(first: 1) {
    id name slug network lendingType
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    cumulativeUniqueUsers totalPoolCount
  }
}`;

const Q_MARKETS = `query($first: Int!, $orderBy: Market_orderBy!) {
  markets(first: $first, orderBy: $orderBy, orderDirection: desc) {
    id name
    inputToken { symbol }
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    rates { rate side type }
  }
}`;

const Q_RATES = `{
  markets(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id name
    inputToken { symbol }
    totalValueLockedUSD
    rates { rate side type }
  }
}`;

const Q_FINANCIALS = `query($days: Int!) {
  financialsDailySnapshots(first: $days, orderBy: timestamp, orderDirection: desc) {
    timestamp totalValueLockedUSD
    dailyDepositUSD dailyBorrowUSD dailyLiquidateUSD
    totalDepositBalanceUSD totalBorrowBalanceUSD
  }
}`;

const Q_USAGE = `query($days: Int!) {
  usageMetricsDailySnapshots(first: $days, orderBy: timestamp, orderDirection: desc) {
    timestamp dailyActiveUsers cumulativeUniqueUsers
    dailyTransactionCount dailyDepositCount dailyBorrowCount
    dailyRepayCount dailyLiquidateCount totalPoolCount
  }
}`;

const Q_TOP_MARKETS = `{
  markets(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id name
    inputToken { symbol }
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    rates { rate side type }
  }
}`;

// ── API Routes ──────────────────────────────────────────────────────────────

// Registry (curated only)
app.get("/api/registry", (req, res) => {
  res.json(curated().map(({ protocol, entry }) => ({
    protocol, slug: entry.slug, network: entry.network,
  })));
});

// All protocols overview
app.get("/api/protocols", async (req, res) => {
  try {
    const results = await fanOut(curated(), Q_PROTOCOL);
    const protocols = results
      .filter(r => r.data?.lendingProtocols?.[0])
      .map(r => ({ protocol: r.protocol, slug: r.slug, network: r.network, ...r.data.lendingProtocols[0] }))
      .filter(p => parseFloat(p.totalValueLockedUSD || 0) > 0)
      .sort((a, b) => parseFloat(b.totalValueLockedUSD || 0) - parseFloat(a.totalValueLockedUSD || 0));
    res.json({ protocols, live: protocols.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Protocol detail
app.get("/api/protocol/:slug", async (req, res) => {
  try {
    const [entry] = lookup(req.params.slug, req.query.network);
    const data = await gql(entry, Q_PROTOCOL);
    res.json(data.lendingProtocols?.[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Markets
app.get("/api/markets/:slug", async (req, res) => {
  try {
    const [entry] = lookup(req.params.slug, req.query.network);
    const first = parseInt(req.query.first) || 20;
    const data = await gql(entry, Q_MARKETS, { first, orderBy: "totalValueLockedUSD" });
    res.json(data.markets || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Rates
app.get("/api/rates/:slug", async (req, res) => {
  try {
    const [entry] = lookup(req.params.slug, req.query.network);
    const data = await gql(entry, Q_RATES);
    res.json(data.markets || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Financials
app.get("/api/financials/:slug", async (req, res) => {
  try {
    const [entry] = lookup(req.params.slug, req.query.network);
    const days = parseInt(req.query.days) || 30;
    const data = await gql(entry, Q_FINANCIALS, { days });
    res.json(data.financialsDailySnapshots || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Usage
app.get("/api/usage/:slug", async (req, res) => {
  try {
    const [entry] = lookup(req.params.slug, req.query.network);
    const days = parseInt(req.query.days) || 30;
    const data = await gql(entry, Q_USAGE, { days });
    res.json(data.usageMetricsDailySnapshots || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Top markets across all protocols
app.get("/api/top-markets", async (req, res) => {
  try {
    const results = await fanOut(curated(), Q_TOP_MARKETS);
    const all = results
      .filter(r => r.data?.markets)
      .flatMap(r => r.data.markets.map(m => ({ ...m, protocol: r.protocol, network: r.network })));
    all.sort((a, b) => parseFloat(b.totalValueLockedUSD || 0) - parseFloat(a.totalValueLockedUSD || 0));
    res.json(all.slice(0, parseInt(req.query.first) || 25));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Compare
app.post("/api/compare", async (req, res) => {
  try {
    const slugs = req.body.protocols || [];
    const entries = slugs.flatMap(s => {
      try { return lookup(s).map(entry => ({ protocol: s, entry })); }
      catch { return []; }
    });
    const results = await fanOut(entries, Q_PROTOCOL);
    const protocols = results
      .filter(r => r.data?.lendingProtocols?.[0])
      .map(r => ({ protocol: r.protocol, slug: r.slug, network: r.network, ...r.data.lendingProtocols[0] }))
      .sort((a, b) => parseFloat(b.totalValueLockedUSD || 0) - parseFloat(a.totalValueLockedUSD || 0));
    res.json(protocols);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Local dev: listen. Vercel: export the app.
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Dashboard at http://localhost:${PORT}`));
}
export default app;
