# Subgraph Registry & Status

Tracking document for all lending subgraphs registered in `graph-lending-mcp`.

Source: [messari/subgraphs deployment.json](https://github.com/messari/subgraphs/blob/master/deployment/deployment.json) — filtered for `schema: "lending"`, `status: "prod"`, decentralized network deployments.

Last tested: 2026-03-06

## Status Legend

| Status | Meaning |
|--------|---------|
| LIVE | Responding with valid data |
| DOWN | Indexer unavailable — may recover |
| DEAD | No allocations or wrong schema — removed from registry |

## Registered Subgraphs

### Aave AMM
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| aave-amm-ethereum | Ethereum | 3.1.0 | LIVE | $606K | Low activity, AMM variant |

### Aave ARC
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| aave-arc-ethereum | Ethereum | 3.1.0 | LIVE | $57K | Permissioned pool |

### Aave RWA
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| aave-rwa-ethereum | Ethereum | 3.1.0 | LIVE | $4K | Real-world assets variant |

### Aave v2
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| aave-v2-ethereum | Ethereum | 3.1.0 | LIVE | $118M | |
| aave-v2-polygon | Polygon | 3.1.0 | LIVE | $5.6B | |
| aave-v2-avalanche | Avalanche | 3.1.0 | LIVE | $14M | |

### Aave v3
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| aave-v3-ethereum | Ethereum | 3.1.0 | LIVE | $34.3B | Largest by TVL |
| aave-v3-optimism | Optimism | 3.1.0 | LIVE | $88M | |
| aave-v3-arbitrum | Arbitrum | 3.1.0 | LIVE | $1.3B | |
| aave-v3-base | Base | 3.1.0 | LIVE | $1.2B | |
| aave-v3-polygon | Polygon | 3.1.0 | LIVE | $220M | |
| aave-v3-avalanche | Avalanche | 3.1.0 | LIVE | $670M | |
| aave-v3-bsc | BSC | 3.1.0 | DOWN | — | Indexer: bad attestation |
| aave-v3-scroll | Scroll | 3.1.0 | LIVE | $0 | Data may be stale |
| aave-v3-fantom | Fantom | 3.1.0 | LIVE | $189K | |
| aave-v3-harmony | Harmony | 3.1.0 | DOWN | — | Indexer unavailable |
| aave-v3-gnosis | Gnosis | 3.1.0 | DOWN | — | Indexer: bad attestation |

### Abracadabra
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| abracadabra-ethereum | Ethereum | 2.0.1 | DOWN | — | Indexer unavailable |
| abracadabra-arbitrum | Arbitrum | 2.0.1 | LIVE | $2.7M | |
| abracadabra-avalanche | Avalanche | 2.0.1 | LIVE | $47K | |
| abracadabra-bsc | BSC | 2.0.1 | LIVE | $169K | |
| abracadabra-fantom | Fantom | 2.0.1 | DOWN | — | Indexer unavailable |

### Alpaca Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| alpaca-finance-lending-bsc | BSC | 2.0.1 | DOWN | — | Indexer unavailable |
| alpaca-finance-lending-fantom | Fantom | 2.0.1 | LIVE | $174K | |

### Banker Joe
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| banker-joe-avalanche | Avalanche | 2.0.1 | LIVE | $3.3M | |

### Bastion Protocol
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| bastion-protocol-aurora | Aurora | 2.0.1 | DOWN | — | Indexer unavailable |

### BENQI
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| benqi-avalanche | Avalanche | 2.0.1 | LIVE | $192M | |

### Burrow
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| burrow-near | NEAR | 2.0.1 | LIVE | $60.9B | TVL appears inflated — verify |

### Compound v2
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| compound-v2-ethereum | Ethereum | 2.0.1 | LIVE | $134M | |

### Compound v3
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| compound-v3-ethereum | Ethereum | 3.1.0 | LIVE | $1.6B | |
| compound-v3-polygon | Polygon | 3.1.0 | LIVE | $12M | |
| compound-v3-arbitrum | Arbitrum | 3.1.0 | LIVE | $113M | |

> compound-v3-base omitted: deployment.json had duplicate of ethereum subgraphId

### CREAM Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| cream-finance-ethereum | Ethereum | 2.0.1 | LIVE | $0 | Appears drained/deprecated |
| cream-finance-bsc | BSC | 2.0.1 | LIVE | $4.5M | |
| cream-finance-arbitrum | Arbitrum | 2.0.1 | LIVE | $5K | |
| cream-finance-polygon | Polygon | 2.0.1 | LIVE | $39K | |

### dForce
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| dforce-ethereum | Ethereum | 2.0.1 | LIVE | $6.7M | |
| dforce-arbitrum | Arbitrum | 2.0.1 | LIVE | $250K | |
| dforce-bsc | BSC | 2.0.1 | DOWN | — | Indexer unavailable |
| dforce-optimism | Optimism | 2.0.1 | DOWN | — | Indexer: bad attestation |
| dforce-polygon | Polygon | 2.0.1 | DOWN | — | Indexer unavailable |

### Euler Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| euler-finance-ethereum | Ethereum | 1.3.0 | LIVE | $188M | v1 schema — limited fields |

### Geist Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| geist-finance-fantom | Fantom | 3.1.0 | LIVE | $132M | |

### Goldfinch
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| goldfinch-ethereum | Ethereum | 2.0.1 | LIVE | $112M | Credit protocol |

### Inverse Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| inverse-finance-ethereum | Ethereum | 1.3.0 | LIVE | $13M | v1 schema |

### Iron Bank
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| iron-bank-ethereum | Ethereum | 2.0.1 | LIVE | $112M | |
| iron-bank-fantom | Fantom | 2.0.1 | DOWN | — | Indexer unavailable |
| iron-bank-avalanche | Avalanche | 2.0.1 | LIVE | $192K | |
| iron-bank-optimism | Optimism | 2.0.1 | DOWN | — | Indexer unavailable |

### Liquity
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| liquity-ethereum | Ethereum | 2.0.1 | LIVE | $180M | CDP-style |

### MakerDAO
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| makerdao-ethereum | Ethereum | 2.0.1 | LIVE | $5.2B | CDP-style |

### Maple Finance v1
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| maple-finance-v1-ethereum | Ethereum | 1.3.0 | LIVE | ~$0 | Deprecated, v1 schema |

### Maple Finance v2
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| maple-finance-v2-ethereum | Ethereum | 3.0.1 | DOWN | — | Indexer unavailable |

### Moonwell
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| moonwell-moonbeam | Moonbeam | 2.0.1 | DOWN | — | Indexer unavailable |
| moonwell-moonriver | Moonriver | 2.0.1 | LIVE | $344K | |
| moonwell-base | Base | 2.0.1 | LIVE | $75M | |

### Morpho Aave v2
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| morpho-aave-v2-ethereum | Ethereum | 3.0.1 | LIVE | $179K | |

### Morpho Aave v3
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| morpho-aave-v3-ethereum | Ethereum | 3.0.1 | DOWN | — | Indexer unavailable |

### Morpho Compound
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| morpho-compound-ethereum | Ethereum | 3.0.1 | LIVE | $109K | |

### Notional Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| notional-finance-ethereum | Ethereum | 2.0.1 | LIVE | $0 | Appears inactive |

### PAC Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| pac-finance-blast | Blast | 3.1.0 | DOWN | — | Indexer: bad attestation |

### QiDao
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| qidao-polygon | Polygon | 1.3.0 | DOWN | — | Indexer unavailable |
| qidao-arbitrum | Arbitrum | 1.3.0 | LIVE | $85K | |
| qidao-avalanche | Avalanche | 1.3.0 | LIVE | $424K | |
| qidao-base | Base | 1.3.0 | LIVE | $1.3M | |
| qidao-bsc | BSC | 1.3.0 | DOWN | — | Indexer unavailable |
| qidao-ethereum | Ethereum | 1.3.0 | LIVE | $244K | |
| qidao-fantom | Fantom | 1.3.0 | LIVE | $9M | |
| qidao-moonriver | Moonriver | 1.3.0 | DOWN | — | Indexer unavailable |
| qidao-optimism | Optimism | 1.3.0 | DOWN | — | Indexer unavailable |
| qidao-gnosis | Gnosis | 1.3.1 | LIVE | $7K | |
| qidao-harmony | Harmony | 1.3.0 | DOWN | — | Indexer unavailable |

### Radiant Capital
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| radiant-capital-arbitrum | Arbitrum | 3.1.0 | LIVE | $441K | |

### Rari Fuse
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| rari-fuse-ethereum | Ethereum | 2.0.1 | LIVE | $2B | Isolated pool model |
| rari-fuse-arbitrum | Arbitrum | 2.0.1 | LIVE | $294K | |

### Scream
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| scream-fantom | Fantom | 2.0.1 | LIVE | $51M | |

### Seamless Protocol
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| seamless-protocol-base | Base | 3.1.0 | DOWN | — | Indexer: bad attestation |

### Seismic
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| seismic-blast | Blast | 3.1.0 | DOWN | — | Indexer unavailable |

### Sonne Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| sonne-finance-optimism | Optimism | 2.0.1 | LIVE | $37M | |

### Spark Lend
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| spark-lend-ethereum | Ethereum | 3.1.0 | LIVE | $3.1B | |
| spark-lend-gnosis | Gnosis | 3.1.0 | DOWN | — | Indexer unavailable |

### TrueFi
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| truefi-ethereum | Ethereum | 2.0.1 | LIVE | $7.7M | |

### UwU Lend
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| uwu-lend-ethereum | Ethereum | 3.1.0 | LIVE | $37M | |

### Venus
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| venus-protocol-bsc | BSC | 2.0.1 | LIVE | $1.9B | |

### Vesta Finance
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| vesta-finance-arbitrum | Arbitrum | 2.0.1 | LIVE | $116K | |

### ZeroLend
| Slug | Network | Schema | Status | TVL | Notes |
|------|---------|--------|--------|-----|-------|
| zerolend-ethereum | Ethereum | 3.1.0 | LIVE | $255K | |
| zerolend-blast | Blast | 3.1.0 | LIVE | $566K | |
| zerolend-zksync-era | zkSync Era | 3.1.0 | LIVE | $1.2M | |
| zerolend-linea | Linea | 3.1.0 | DOWN | — | Indexer unavailable |

## Removed Entries

| Protocol | Network | Reason |
|----------|---------|--------|
| kinza-finance | BSC | No allocations on The Graph network |
| superlend | Etherlink | Not a Messari lending schema (no `lendingProtocols` entity) |
| zerolend | X Layer | No allocations on The Graph network |
| compound-v3 | Base | deployment.json had duplicate of ethereum subgraphId |
| radiant-v2 | Various | Dev status only in deployment.json |

## Summary

| Category | Count |
|----------|-------|
| Total registered | 90 |
| LIVE | 65 |
| DOWN (indexer issues) | 25 |
| Removed | 5 |
| Protocols covered | 40 |
| Networks covered | 15 |
