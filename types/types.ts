export interface TokenAddition {
  amount: number;
  timestamp: number;
  priceAtPurchaseCurrency1: number | null;
  walletId: string;
}

export interface Token {
  id: string;
  name: string;
  additions: TokenAddition[];
  selectedCurrency1: string;
  walletId: string;
}

export interface TokenData {
  name: string;
  additions: TokenAddition[];
  id: string;
  totalAmount: number;
  selectedCurrency1: string;
  currentValue: number | null;
  percentageChange: number | null;
  walletId: string;
}

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
}

export interface Wallet {
  id: string;
  name: string;
  tokens: Token[]; // Lista de tokens que pertencem a esta carteira
}

export interface Currency {
  id: string;
  symbol: string;
  name: string;
}

export interface CachedPrice {
  value: number;
  lastFetched: number;
}
