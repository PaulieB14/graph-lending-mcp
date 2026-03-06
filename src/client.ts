import type { SubgraphEntry } from "./registry.js";

const TIMEOUT_MS = 8_000;
const MAX_RETRIES = 2;

function getApiKey(): string {
  const key = process.env.GRAPH_API_KEY;
  if (!key) {
    throw new Error(
      "GRAPH_API_KEY environment variable is required. " +
      "Get one at https://thegraph.com/studio/apikeys/"
    );
  }
  return key;
}

function gatewayUrl(subgraphId: string): string {
  return `https://gateway.thegraph.com/api/${getApiKey()}/subgraphs/id/${subgraphId}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export async function request<T = any>(
  entry: SubgraphEntry,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = gatewayUrl(entry.subgraphId);
  const body: Record<string, unknown> = { query };
  if (variables && Object.keys(variables).length > 0) body.variables = variables;

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 400) {
          const text = await response.text();
          throw new Error(`Bad query (HTTP 400): ${text}`);
        }
        throw new Error(`HTTP ${status}: ${response.statusText}`);
      }

      const json = (await response.json()) as { data?: T; errors?: unknown[] };
      if (json.errors?.length) {
        throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
      }
      return json.data as T;
    } catch (err) {
      lastError = err;
      const msg = String(err);
      // Don't retry on bad queries or missing API key
      if (msg.includes("400") || msg.includes("GRAPH_API_KEY")) break;
      if (attempt < MAX_RETRIES) await sleep(300 * 2 ** attempt);
    }
  }
  throw lastError;
}

export async function fetchProtocol(entry: SubgraphEntry, query: string) {
  const data = await request<any>(entry, query);
  return data.lendingProtocols?.[0] ?? null;
}

export async function fetchMarkets(
  entry: SubgraphEntry,
  query: string,
  variables: { first: number; orderBy: string }
) {
  const data = await request<any>(entry, query, variables);
  return data.markets ?? [];
}

/** Single request with short timeout and no retries — used by fanOut */
async function requestFast<T = any>(
  entry: SubgraphEntry,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = gatewayUrl(entry.subgraphId);
  const body: Record<string, unknown> = { query };
  if (variables && Object.keys(variables).length > 0) body.variables = variables;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json = (await response.json()) as { data?: T; errors?: unknown[] };
  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

const FAN_OUT_CONCURRENCY = 15;

export async function fanOut<T>(
  entries: { protocol: string; entry: SubgraphEntry }[],
  query: string,
  variables?: Record<string, unknown>
): Promise<Array<{ protocol: string; slug: string; data?: T; error?: string }>> {
  type Result = { protocol: string; slug: string; data?: T; error?: string };
  const results: Result[] = new Array(entries.length);

  // Process in batches to avoid overwhelming the gateway
  for (let i = 0; i < entries.length; i += FAN_OUT_CONCURRENCY) {
    const batch = entries.slice(i, i + FAN_OUT_CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(({ protocol, entry }) =>
        requestFast<T>(entry, query, variables).then(data => ({
          protocol,
          slug: entry.slug,
          data,
        }))
      )
    );
    for (let j = 0; j < batchResults.length; j++) {
      const r = batchResults[j];
      results[i + j] = r.status === "fulfilled"
        ? r.value
        : {
            protocol: batch[j].protocol,
            slug: batch[j].entry.slug,
            error: String(r.reason),
          };
    }
  }
  return results;
}
