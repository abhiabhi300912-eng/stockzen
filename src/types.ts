export type TabType = 'dashboard' | 'charts' | 'sentiment' | 'signals' | 'models';

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
}

export interface StockInfo {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  prevClose: number;
  adjClose: number;
  volume: string;
  volumeNum: number;
  ema20: number;
  sma20: number;
  sma50: number;
  sma200: number;
  rsi: number;
  macd: number;
  signal: number;
  macdHist: number;
  volatility: number;
  ivRank: number;
  beta: number;
  atr: number;
  dailyReturn: number;
  weeklyReturn: number;
  direction: 'UPWARD TREND' | 'DOWNWARD TREND' | 'NEUTRAL';
  consensusConfidence: number;
  rfConfidence: number;
  svmConfidence: number;
  lstmConfidence: number;
  sentimentComposite: number;
  sentimentLabel: string;
  newsCount: number;
  targetRange: [number, number];
  medianTarget: number;
  targetDelta: [number, number];
  vaderScore: number;
  sentimentDistribution: {
    pos: number;
    neu: number;
    neg: number;
  };
  sentimentTrendCorrelation: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  score: number;
  scoreLabel: string;
  impact: 'Strong' | 'Moderate' | 'Neutral' | 'Bearish';
  category: 'positive' | 'neutral' | 'negative';
  imageUrl?: string;
  tokens?: { text: string; weight: number }[];
  summary?: string;
}

export interface OrderBookRow {
  bidSize: number;
  bidPrice: number;
  askPrice: number;
  askSize: number;
}

export interface PaperTrade {
  id: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'bullish' | 'alert' | 'system' | 'inference';
  time: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  handle: string;
  avatarUrl: string;
  tier: string;
  bio: string;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive' | 'Quantitative Dynamic';
  defaultOrderSize: number;
  autoStopLossPercent: number;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
}

