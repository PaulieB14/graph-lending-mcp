import { tokenIcons, networkIcons } from '@web3icons/react';

const NET_MAP = {
  MAINNET: 'NetworkEthereum',
  MATIC: 'NetworkPolygon',
  ARBITRUM_ONE: 'NetworkArbitrumOne',
  AVALANCHE: 'NetworkAvalanche',
  BSC: 'NetworkBinanceSmartChain',
  FANTOM: 'NetworkFantom',
  OPTIMISM: 'NetworkOptimism',
  BASE: 'NetworkBase',
};

export function NetIcon({ network, className = 'icon' }) {
  const name = NET_MAP[network];
  const Icon = name && networkIcons[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

// Manual aliases for tokens web3icons knows by a different key,
// plus a mapping to the parent token for wrapped/staked variants.
const ALIAS = {
  // Wrapped native tokens
  WETH: 'ETH', WBTC: 'BTC', WMATIC: 'MATIC', WAVAX: 'AVAX', WBNB: 'BNB',
  // ETH LSTs/LRTs
  STETH: 'ETH', WSTETH: 'ETH', WEETH: 'ETH', CBETH: 'CBETH',
  RSETH: 'ETH', RETH: 'ETH', METH: 'ETH', SWETH: 'ETH',
  OSETH: 'ETH', EZETH: 'ETH', ETHFI: 'ETH', PUFETH: 'ETH', ANKRETH: 'ETH',
  // BTC variants
  CBBTC: 'BTC', TBTC: 'BTC', SBTC: 'BTC', EBTC: 'BTC', FBTC: 'BTC', LBTC: 'BTC',
  // Staked/wrapped stables
  SUSDE: 'USDE', SUSDS: 'USDC', SDAI: 'DAI', SFRAX: 'FRAX',
  USDS: 'USDC', USDG: 'USDC',
  FRXETH: 'ETH', SFRXETH: 'ETH',
  // Bridged tokens (strip .e suffix, strip chain prefix)
  'USDC.E': 'USDC', 'USDT.E': 'USDT', USDBC: 'USDC', AXLUSDC: 'USDC',
  // Iron Bank forex tokens -> generic dollar
  IBEUR: 'USDC', IBJPY: 'USDC', IBKRW: 'USDC', IBCHF: 'USDC',
  IBGBP: 'USDC', IBAUD: 'USDC',
  // mStable / misc stables
  MUSD: 'USDC', MBTC: 'BTC',
  // Misc fallbacks
  RLUSD: 'USDC', MAI: 'USDC', BUSD: 'USDC',
  MORPHO: 'ETH', ENA: 'ETH', EIGEN: 'ETH',
  QI: 'AVAX', GEIST: 'FTM', BOO: 'FTM', SCREAM: 'FTM',
};

export function TokIcon({ symbol, className = 'icon' }) {
  if (!symbol) return null;
  const upper = symbol.toUpperCase();

  // Try exact match first
  let Icon = tokenIcons[`Token${upper}`];
  if (Icon) return <Icon className={className} />;

  // Try alias
  const alias = ALIAS[upper];
  if (alias) {
    Icon = tokenIcons[`Token${alias}`];
    if (Icon) return <Icon className={className} />;
  }

  // Strip bridged suffixes like .e and try again
  const stripped = upper.replace(/\.E$/, '');
  if (stripped !== upper) {
    Icon = tokenIcons[`Token${stripped}`];
    if (Icon) return <Icon className={className} />;
  }

  // Smart pattern matching: extract known token from compound names
  // e.g. "PT-USDe-7MAY2026" -> USDE, "aWETH" -> ETH, "cUSDC" -> USDC
  const patterns = [
    /^PT[_-](\w+)/,       // Pendle PT tokens
    /^YT[_-](\w+)/,       // Pendle YT tokens
    /^A(\w{2,})/,          // Aave aTokens
    /^C(\w{2,})/,          // Compound cTokens
    /^V(\w{2,})/,          // Venus vTokens
  ];
  for (const pat of patterns) {
    const m = upper.match(pat);
    if (m) {
      const base = m[1].replace(/[-_].*$/, ''); // strip date suffixes
      Icon = tokenIcons[`Token${base}`];
      if (Icon) return <Icon className={className} />;
      const baseAlias = ALIAS[base];
      if (baseAlias) {
        Icon = tokenIcons[`Token${baseAlias}`];
        if (Icon) return <Icon className={className} />;
      }
    }
  }

  // Last resort: if symbol contains ETH/BTC/USD, show that
  if (upper.includes('ETH')) { Icon = tokenIcons.TokenETH; if (Icon) return <Icon className={className} />; }
  if (upper.includes('BTC')) { Icon = tokenIcons.TokenBTC; if (Icon) return <Icon className={className} />; }
  if (upper.includes('USD')) { Icon = tokenIcons.TokenUSDC; if (Icon) return <Icon className={className} />; }

  return null;
}
