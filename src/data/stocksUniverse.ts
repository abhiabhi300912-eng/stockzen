import stocksData from './stocksUniverse.json';
import { StockInfo } from '../types';
import { STOCK_DATABASE } from './mockData';

export interface UniverseStock {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  price: number;
}

export const STOCK_UNIVERSE: UniverseStock[] = stocksData as UniverseStock[];

// Fast lookup map
const universeMap = new Map<string, UniverseStock>();
STOCK_UNIVERSE.forEach((item) => {
  universeMap.set(item.ticker.toUpperCase(), item);
});

// Deterministic telemetry generator for any of the 5,000+ stocks
export function getStockTelemetry(symbol: string): StockInfo {
  const upper = symbol.toUpperCase();

  // Return handcrafted stock if present (NVDA, AAPL, TSLA, MSFT, SPY)
  if (STOCK_DATABASE[upper]) {
    return STOCK_DATABASE[upper];
  }

  const base = universeMap.get(upper) || {
    ticker: upper,
    name: `${upper} Inc.`,
    exchange: 'NASDAQ',
    sector: 'Technology',
    price: 150.0,
  };

  // Deterministic seed hash from ticker string
  let hash = 0;
  for (let i = 0; i < upper.length; i++) {
    hash = (hash << 5) - hash + upper.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const price = base.price;
  const isUp = absHash % 2 === 0;
  const changePct = parseFloat(((isUp ? 1 : -1) * (0.2 + (absHash % 450) / 100)).toFixed(2));
  const change = parseFloat(((price * changePct) / 100).toFixed(2));

  const dayHigh = parseFloat((price * (1 + (absHash % 30) / 1000 + 0.005)).toFixed(2));
  const dayLow = parseFloat((price * (1 - (absHash % 25) / 1000 - 0.005)).toFixed(2));
  const open = parseFloat((price - change * 0.7).toFixed(2));
  const prevClose = parseFloat((price - change).toFixed(2));
  const adjClose = price;

  const volNum = Math.floor(5000000 + (absHash % 45000000));
  const volStr = `${(volNum / 1000000).toFixed(1)}M`;

  const ema20 = parseFloat((price * (1 + ((absHash % 40) - 20) / 1000)).toFixed(2));
  const sma20 = ema20;
  const sma50 = parseFloat((price * 0.96).toFixed(2));
  const sma200 = parseFloat((price * 0.88).toFixed(2));

  const rsi = parseFloat((38 + (absHash % 38)).toFixed(1));
  const macdHist = parseFloat((((absHash % 200) - 90) / 100).toFixed(2));
  const macd = parseFloat((macdHist + 0.35).toFixed(2));
  const signal = 0.35;

  const volatility = parseFloat((14 + (absHash % 28)).toFixed(1));
  const ivRank = 20 + (absHash % 60);
  const beta = parseFloat((0.85 + (absHash % 90) / 100).toFixed(2));
  const atr = parseFloat((price * 0.025).toFixed(2));

  const direction = changePct >= 0 ? 'UPWARD TREND' : 'DOWNWARD TREND';
  const consensusConfidence = parseFloat((68 + (absHash % 24)).toFixed(1));
  const rfConfidence = Math.min(95, Math.floor(consensusConfidence + 2));
  const svmConfidence = Math.max(55, Math.floor(consensusConfidence - 3));
  const lstmConfidence = Math.min(96, Math.floor(consensusConfidence + 1));

  const sentimentComposite = parseFloat((((absHash % 120) - 30) / 100).toFixed(2));
  const sentimentLabel =
    sentimentComposite > 0.3
      ? 'Highly Positive'
      : sentimentComposite > 0
      ? 'Mildly Positive'
      : 'Cautious';

  const newsCount = 20 + (absHash % 70);
  const targetLow = parseFloat((price * (1 + (isUp ? 0.02 : -0.04))).toFixed(2));
  const targetHigh = parseFloat((price * (1 + (isUp ? 0.05 : -0.01))).toFixed(2));
  const medianTarget = parseFloat(((targetLow + targetHigh) / 2).toFixed(2));

  const posDist = Math.min(85, Math.max(30, Math.floor(50 + sentimentComposite * 30)));
  const negDist = Math.min(40, Math.max(10, Math.floor(25 - sentimentComposite * 15)));
  const neuDist = Math.max(10, 100 - posDist - negDist);

  return {
    ticker: upper,
    name: base.name,
    exchange: base.exchange,
    price,
    change,
    changePercent: changePct,
    open,
    dayHigh,
    dayLow,
    prevClose,
    adjClose,
    volume: volStr,
    volumeNum: volNum,
    ema20,
    sma20,
    sma50,
    sma200,
    rsi,
    macd,
    signal,
    macdHist,
    volatility,
    ivRank,
    beta,
    atr,
    dailyReturn: changePct,
    weeklyReturn: parseFloat((changePct * 1.8).toFixed(2)),
    direction,
    consensusConfidence,
    rfConfidence,
    svmConfidence,
    lstmConfidence,
    sentimentComposite,
    sentimentLabel,
    newsCount,
    targetRange: [Math.min(targetLow, targetHigh), Math.max(targetLow, targetHigh)],
    medianTarget,
    targetDelta: [1.8, 4.2],
    vaderScore: sentimentComposite,
    sentimentDistribution: {
      pos: posDist,
      neu: neuDist,
      neg: negDist,
    },
    sentimentTrendCorrelation: parseFloat((0.65 + (absHash % 25) / 100).toFixed(2)),
  };
}

// Fast search function across all 5,200 stocks
export function searchStocks(query: string, sectorFilter?: string, limit = 50): UniverseStock[] {
  const q = query.trim().toUpperCase();

  let filtered = STOCK_UNIVERSE;

  if (sectorFilter && sectorFilter !== 'ALL') {
    filtered = filtered.filter((s) => s.sector === sectorFilter);
  }

  if (!q) {
    return filtered.slice(0, limit);
  }

  const results: UniverseStock[] = [];

  // 1. Exact ticker matches first
  for (const s of filtered) {
    if (s.ticker === q) {
      results.push(s);
      break;
    }
  }

  // 2. Starts with ticker
  for (const s of filtered) {
    if (s.ticker !== q && s.ticker.startsWith(q)) {
      results.push(s);
      if (results.length >= limit) return results;
    }
  }

  // 3. Name or ticker contains query
  for (const s of filtered) {
    if (!s.ticker.startsWith(q) && (s.ticker.includes(q) || s.name.toUpperCase().includes(q))) {
      results.push(s);
      if (results.length >= limit) return results;
    }
  }

  return results;
}
