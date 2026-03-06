// Canonical GraphQL query strings for Messari lending schema
// All queries are fixed strings — no dynamic building.

// ── Protocol ────────────────────────────────────────────────────────────────

export const GET_PROTOCOL_LITE = `{
  lendingProtocols(first: 1) {
    id name slug network lendingType
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    totalPoolCount cumulativeUniqueUsers
  }
}`;

export const GET_PROTOCOL = `{
  lendingProtocols(first: 1) {
    id name slug network lendingType riskType collateralizationType
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    cumulativeBorrowUSD cumulativeLiquidateUSD cumulativeDepositUSD
    cumulativeUniqueUsers cumulativeUniqueDepositors cumulativeUniqueBorrowers
    cumulativeUniqueLiquidators cumulativeUniqueLiquidatees
    cumulativeSupplySideRevenueUSD cumulativeProtocolSideRevenueUSD cumulativeTotalRevenueUSD
    totalPoolCount openPositionCount cumulativePositionCount
    transactionCount depositCount withdrawCount borrowCount repayCount
    liquidationCount transferCount flashloanCount
  }
}`;

// v2-compatible version without transferCount/flashloanCount
export const GET_PROTOCOL_V2 = `{
  lendingProtocols(first: 1) {
    id name slug network lendingType riskType collateralizationType
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    cumulativeBorrowUSD cumulativeLiquidateUSD cumulativeDepositUSD
    cumulativeUniqueUsers cumulativeUniqueDepositors cumulativeUniqueBorrowers
    cumulativeUniqueLiquidators cumulativeUniqueLiquidatees
    cumulativeSupplySideRevenueUSD cumulativeProtocolSideRevenueUSD cumulativeTotalRevenueUSD
    totalPoolCount openPositionCount cumulativePositionCount
    transactionCount depositCount withdrawCount borrowCount repayCount
    liquidationCount
  }
}`;

// ── Markets ──────────────────────────────────────────────────────────────────

export const GET_MARKETS = `
  query GetMarkets($first: Int!, $orderBy: Market_orderBy!) {
    markets(first: $first, orderBy: $orderBy, orderDirection: desc) {
      id name isActive canBorrowFrom canUseAsCollateral
      inputToken { symbol decimals }
      inputTokenPriceUSD totalValueLockedUSD
      totalDepositBalanceUSD totalBorrowBalanceUSD
      maximumLTV liquidationThreshold liquidationPenalty
      supplyCap borrowCap reserves reserveFactor
      rates { rate side type }
      rewardTokens { token { symbol } type }
    }
  }
`;

export const GET_MARKET = `
  query GetMarket($id: ID!) {
    market(id: $id) {
      id name isActive canBorrowFrom canUseAsCollateral
      inputToken { id symbol decimals }
      inputTokenPriceUSD
      totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
      cumulativeDepositUSD cumulativeBorrowUSD cumulativeLiquidateUSD
      openPositionCount closedPositionCount positionCount
      maximumLTV liquidationThreshold liquidationPenalty
      supplyCap borrowCap reserves reserveFactor
      rates { rate side type }
      rewardTokens { token { symbol } type }
      rewardTokenEmissionsAmount rewardTokenEmissionsUSD
    }
  }
`;

export const GET_RATES = `{
  markets(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id name
    inputToken { symbol }
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    rates { rate side type }
  }
}`;

// ── Account / Positions ───────────────────────────────────────────────────────

export const GET_ACCOUNT = `
  query GetAccount($address: ID!) {
    account(id: $address) {
      id positionCount openPositionCount closedPositionCount
      depositCount withdrawCount borrowCount repayCount liquidateCount liquidationCount
      positions(where: { hashClosed: null }) {
        id side balance
        asset { symbol }
        market { name }
        isCollateral isIsolated timestampOpened
      }
    }
  }
`;

export const GET_POSITIONS = `
  query GetPositions($address: String!, $first: Int!) {
    positions(
      where: { account: $address, hashClosed: null }
      first: $first
      orderBy: timestampOpened
      orderDirection: desc
    ) {
      id side balance principal
      asset { symbol decimals }
      market { name inputTokenPriceUSD totalValueLockedUSD }
      isCollateral isIsolated type
      timestampOpened blockNumberOpened
      depositCount withdrawCount borrowCount repayCount liquidationCount
    }
  }
`;

export const GET_POSITIONS_BY_SIDE = `
  query GetPositionsBySide($address: String!, $side: PositionSide!, $first: Int!) {
    positions(
      where: { account: $address, hashClosed: null, side: $side }
      first: $first
      orderBy: timestampOpened
      orderDirection: desc
    ) {
      id side balance principal
      asset { symbol decimals }
      market { name inputTokenPriceUSD totalValueLockedUSD }
      isCollateral isIsolated type
      timestampOpened blockNumberOpened
      depositCount withdrawCount borrowCount repayCount liquidationCount
    }
  }
`;

// ── Events ───────────────────────────────────────────────────────────────────

export const GET_DEPOSITS = `
  query GetDeposits($first: Int!, $market: String, $account: String) {
    deposits(first: $first, orderBy: timestamp, orderDirection: desc,
      where: { market: $market, account: $account }) {
      hash timestamp blockNumber
      account { id } market { name } asset { symbol decimals }
      amount amountUSD
    }
  }
`;

export const GET_BORROWS = `
  query GetBorrows($first: Int!, $market: String, $account: String) {
    borrows(first: $first, orderBy: timestamp, orderDirection: desc,
      where: { market: $market, account: $account }) {
      hash timestamp blockNumber
      account { id } market { name } asset { symbol decimals }
      amount amountUSD
    }
  }
`;

export const GET_REPAYS = `
  query GetRepays($first: Int!, $market: String, $account: String) {
    repays(first: $first, orderBy: timestamp, orderDirection: desc,
      where: { market: $market, account: $account }) {
      hash timestamp blockNumber
      account { id } market { name } asset { symbol decimals }
      amount amountUSD
    }
  }
`;

export const GET_WITHDRAWALS = `
  query GetWithdrawals($first: Int!, $market: String, $account: String) {
    withdraws(first: $first, orderBy: timestamp, orderDirection: desc,
      where: { market: $market, account: $account }) {
      hash timestamp blockNumber
      account { id } market { name } asset { symbol decimals }
      amount amountUSD
    }
  }
`;

export const GET_LIQUIDATIONS = `
  query GetLiquidations($first: Int!, $market: String) {
    liquidates(first: $first, orderBy: timestamp, orderDirection: desc,
      where: { market: $market }) {
      hash timestamp blockNumber
      liquidator { id } liquidatee { id }
      market { name } asset { symbol decimals }
      amount amountUSD profitUSD
    }
  }
`;

export const GET_FLASHLOANS = `
  query GetFlashloans($first: Int!) {
    flashloans(first: $first, orderBy: timestamp, orderDirection: desc) {
      hash timestamp blockNumber
      account { id } market { name } asset { symbol decimals }
      amount amountUSD feeAmount feeAmountUSD
    }
  }
`;

// ── Snapshots ─────────────────────────────────────────────────────────────────

export const GET_DAILY_FINANCIALS = `
  query GetDailyFinancials($days: Int!) {
    financialsDailySnapshots(first: $days, orderBy: timestamp, orderDirection: desc) {
      days timestamp totalValueLockedUSD
      dailyDepositUSD dailyBorrowUSD dailyLiquidateUSD dailyWithdrawUSD dailyRepayUSD
      dailySupplySideRevenueUSD dailyProtocolSideRevenueUSD dailyTotalRevenueUSD
      totalDepositBalanceUSD totalBorrowBalanceUSD
    }
  }
`;

export const GET_MARKET_SNAPSHOTS = `
  query GetMarketSnapshots($market: ID!, $days: Int!) {
    marketDailySnapshots(first: $days, orderBy: timestamp, orderDirection: desc,
      where: { market: $market }) {
      days timestamp
      totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
      dailyDepositUSD dailyBorrowUSD dailyLiquidateUSD dailyWithdrawUSD dailyRepayUSD
      dailySupplySideRevenueUSD dailyProtocolSideRevenueUSD dailyTotalRevenueUSD
      inputTokenPriceUSD
      rates { rate side type }
      dailyActiveUsers dailyDepositCount dailyBorrowCount dailyLiquidateCount
    }
  }
`;

export const GET_USAGE_METRICS = `
  query GetUsageMetrics($days: Int!) {
    usageMetricsDailySnapshots(first: $days, orderBy: timestamp, orderDirection: desc) {
      days timestamp
      dailyActiveUsers dailyActiveDepositors dailyActiveBorrowers
      dailyActiveLiquidators dailyActiveLiquidatees
      cumulativeUniqueUsers cumulativeUniqueDepositors cumulativeUniqueBorrowers
      dailyTransactionCount dailyDepositCount dailyWithdrawCount
      dailyBorrowCount dailyRepayCount dailyLiquidateCount
      totalPoolCount openPositionCount
    }
  }
`;

// ── Cross-Protocol ───────────────────────────────────────────────────────────

export const GET_PROTOCOL_COMPARE = `{
  lendingProtocols(first: 1) {
    id name slug network lendingType
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    cumulativeBorrowUSD cumulativeLiquidateUSD
    cumulativeUniqueUsers cumulativeUniqueBorrowers cumulativeUniqueDepositors
    cumulativeSupplySideRevenueUSD cumulativeProtocolSideRevenueUSD cumulativeTotalRevenueUSD
    totalPoolCount openPositionCount
  }
}`;

export const GET_TOP_MARKETS = `{
  markets(first: 20, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id name
    inputToken { symbol }
    inputTokenPriceUSD
    totalValueLockedUSD totalDepositBalanceUSD totalBorrowBalanceUSD
    maximumLTV liquidationThreshold
    rates { rate side type }
  }
}`;
