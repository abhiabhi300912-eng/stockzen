import React, { useState, useMemo } from 'react';
import { StockInfo, NewsItem } from '../types';
import { STOCK_DATABASE, NEWS_ITEMS } from '../data/mockData';
import { searchStocks, UniverseStock } from '../data/stocksUniverse';
import { formatRupees } from '../utils/currency';

interface DashboardViewProps {
  currentStock: StockInfo;
  onSelectStock: (ticker: string) => void;
  onOpenArticle: (news: NewsItem) => void;
  onSimulateTrade: (type: 'BUY' | 'SELL') => void;
  onOpenSearchModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentStock,
  onSelectStock,
  onOpenArticle,
  onOpenSearchModal,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  const [isAlertSet, setIsAlertSet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const watchlistTickers = ['NVDA', 'AAPL', 'TSLA', 'SPY', 'MSFT', 'AMZN', 'GOOGL', 'PLTR'];
  const quickChips = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'PLTR', 'ARM', 'COIN'];

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchStocks(searchQuery, undefined, 6);
  }, [searchQuery]);

  const handleAlertToggle = () => {
    setIsAlertSet(!isAlertSet);
  };

  const isPositive = currentStock.change >= 0;

  return (
    <div className="flex flex-col w-full space-y-3 p-4 max-w-2xl mx-auto">
      {/* Live Watchlist Ticker Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {watchlistTickers.map((t) => {
          const item = STOCK_DATABASE[t] || { ticker: t, change: 1.5, changePercent: 1.2 };
          const isUp = item.change >= 0;
          const isSelected = item.ticker === currentStock.ticker;

          return (
            <button
              key={t}
              onClick={() => onSelectStock(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 shadow-sm transition-transform active:scale-95 text-left border ${
                isSelected
                  ? 'bg-[#262a35] border-[#38bdf8]/50 text-[#dfe2f1]'
                  : 'bg-[#1c1f2a] border-transparent text-[#bdc8d1] hover:text-[#dfe2f1]'
              }`}
            >
              <span className="font-data-mono-sm text-[11px] font-semibold">
                {item.ticker}
              </span>
              <span
                className={`font-data-mono-sm text-[11px] flex items-center font-semibold ${
                  isUp ? 'text-[#56e5a9]' : 'text-[#ffb4ab]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px] leading-none">
                  {isUp ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
                {Math.abs(item.changePercent).toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Quick Ticker Selection across 5,000+ Stocks */}
      <div className="flex flex-col gap-2 relative">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-[#bdc8d1] text-[18px]">
            search
          </span>
          <input
            className="w-full bg-[#171b26] text-[#dfe2f1] pl-9 pr-9 py-2.5 rounded-lg text-[13px] font-sans focus:outline-none focus:ring-1 focus:ring-[#38bdf8] focus:bg-[#1c1f2a] transition-all placeholder:text-[#87929a] border border-[#262a35]"
            placeholder="Search 5,000+ stocks, ETFs, crypto (e.g. NVDA, PLTR, Apple)..."
            type="text"
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                const upper = searchQuery.trim().toUpperCase();
                onSelectStock(upper);
                setSearchQuery('');
                setShowSuggestions(false);
              }
            }}
          />
          <button
            aria-label="Open 5,000+ stocks browser"
            onClick={onOpenSearchModal}
            className="absolute right-2.5 p-1 rounded text-[#bdc8d1] hover:text-[#8ed5ff] transition-colors"
            title="Browse all 5,000+ stocks"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
          </button>
        </div>

        {/* Live Dropdown Suggestions across 5,000+ Stocks */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-12 left-0 right-0 z-30 bg-[#1c1f2a] border border-[#38bdf8]/40 rounded-xl shadow-2xl p-1.5 space-y-1">
            <div className="flex justify-between items-center px-2 py-1 text-[10px] font-label-caps text-[#bdc8d1] border-b border-[#262a35]">
              <span>5,000+ STOCKS AUTOCOMPLETE</span>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-[#87929a] hover:text-[#dfe2f1]"
              >
                Close
              </button>
            </div>
            {suggestions.map((s: UniverseStock) => (
              <button
                key={s.ticker}
                onClick={() => {
                  onSelectStock(s.ticker);
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-[#262a35] transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-data-mono-sm text-[12px] font-bold text-[#8ed5ff]">
                    {s.ticker}
                  </span>
                  <span className="font-body-sm text-[11px] text-[#dfe2f1] truncate max-w-[200px]">
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-data-mono-sm">
                  <span className="text-[#bdc8d1]">{formatRupees(s.price)}</span>
                  <span className="text-[#56e5a9] text-[9px] px-1 rounded bg-[#56e5a9]/10">
                    {s.exchange}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick selection chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] shrink-0 mr-1 uppercase">
            Watchlist
          </span>
          {quickChips.map((ticker) => {
            const isActive = currentStock.ticker === ticker;
            return (
              <button
                key={ticker}
                onClick={() => onSelectStock(ticker)}
                className={`px-2.5 py-0.5 rounded font-data-mono-sm text-[11px] transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[#38bdf8] text-[#001e2c] font-semibold shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                    : 'bg-[#262a35] text-[#bdc8d1] hover:text-[#dfe2f1]'
                }`}
              >
                {ticker}
              </button>
            );
          })}
          <button
            onClick={onOpenSearchModal}
            className="px-2 py-0.5 rounded bg-[#1c1f2a] text-[#8ed5ff] font-data-mono-sm text-[11px] hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>+5,000</span>
          </button>
        </div>
      </div>

      {/* Featured Active Stock Hero Card */}
      <div className="relative overflow-hidden rounded-xl bg-[#171b26] shadow-md p-3.5 border border-[#262a35]">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-[#56e5a9]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-[#8ed5ff]/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col space-y-2.5">
          {/* Title + Live Feed Tag */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#313540] flex items-center justify-center text-[#8ed5ff] font-data-mono-md text-[13px] font-bold shadow-inner">
                {currentStock.ticker.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-lg-mobile text-[20px] text-[#dfe2f1] font-bold tracking-tight">
                    {currentStock.ticker}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#313540] text-[#bdc8d1] font-label-caps text-[10px]">
                    {currentStock.exchange}
                  </span>
                </div>
                <p className="font-body-sm text-[12px] text-[#bdc8d1] leading-none">
                  {currentStock.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1 font-data-mono-sm text-[11px] text-[#56e5a9]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#56e5a9] animate-ping" />
                14:32:05 EST
              </span>
              <span className="font-label-caps text-[10px] text-[#bdc8d1] opacity-70">
                Yahoo Finance API
              </span>
            </div>
          </div>

          {/* Price Big Display */}
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-data-mono-lg text-[24px] text-[#dfe2f1] font-bold tracking-tight">
                  {formatRupees(currentStock.price)}
                </span>
                <span
                  className={`font-data-mono-md text-[13px] font-bold flex items-center ${
                    isPositive ? 'text-[#56e5a9]' : 'text-[#ffb4ab]'
                  }`}
                >
                  {formatRupees(currentStock.change, { showSign: true })} (
                  {isPositive ? '+' : ''}{currentStock.changePercent.toFixed(2)}%)
                </span>
              </div>
              <p className="font-data-mono-sm text-[11px] text-[#bdc8d1] mt-0.5">
                Vol {currentStock.volume} • Day Range {formatRupees(currentStock.dayLow)} - {formatRupees(currentStock.dayHigh)}
              </p>
            </div>

            {/* Alert Button */}
            <button
              aria-label="Set AI Price Alert"
              onClick={handleAlertToggle}
              className={`p-2 rounded-lg transition-all shadow-sm active:scale-90 ${
                isAlertSet
                  ? 'bg-[#30c88f] text-[#003824] shadow-[0_0_10px_rgba(48,200,143,0.4)]'
                  : 'bg-[#262a35] text-[#8ed5ff] hover:bg-[#353944]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={isAlertSet ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
              >
                notifications_active
              </span>
            </button>
          </div>

          {/* Timeframe Switcher Tabs */}
          <div className="flex items-center justify-between bg-[#1c1f2a] rounded-lg p-0.5">
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 py-1 rounded font-data-mono-sm text-[11px] transition-all ${
                  timeframe === tf
                    ? 'bg-[#38bdf8] text-[#001e2c] font-semibold shadow-sm'
                    : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* SVG Candlestick + Volume Chart */}
          <div className="w-full bg-[#0a0e18]/80 rounded-lg p-2.5 flex flex-col space-y-1 border border-[#262a35]/60">
            <div className="flex justify-between items-center text-[#bdc8d1] font-data-mono-sm text-[11px]">
              <span className="flex items-center gap-1 text-[#8ed5ff]">
                <span className="w-2 h-0.5 bg-[#8ed5ff] inline-block" /> 20-EMA {formatRupees(currentStock.ema20)}
              </span>
              <span className="text-[#56e5a9]">High {formatRupees(currentStock.dayHigh)}</span>
            </div>

            {/* Candlestick Visualizer */}
            <svg
              className="w-full h-36 overflow-visible select-none"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 320 120"
            >
              <defs>
                <linearGradient id="dashAreaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#56e5a9" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#56e5a9" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="dashEmaGradient" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#8ed5ff" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line stroke="#313540" strokeDasharray="3 3" strokeWidth="0.75" x1="0" x2="320" y1="20" y2="20" />
              <line stroke="#313540" strokeDasharray="3 3" strokeWidth="0.75" x1="0" x2="320" y1="55" y2="55" />
              <line stroke="#313540" strokeDasharray="3 3" strokeWidth="0.75" x1="0" x2="320" y1="90" y2="90" />

              {/* Area Under Price Curve */}
              <path
                d="M 10 95 Q 40 85, 70 88 T 130 65 T 190 70 T 250 40 T 310 24 L 310 110 L 10 110 Z"
                fill="url(#dashAreaGradient)"
              />

              {/* Candlesticks (Wicks and Bodies) */}
              {/* Candle 1 */}
              <line stroke="#56e5a9" strokeWidth="1" x1="20" x2="20" y1="90" y2="105" />
              <rect fill="#56e5a9" height="8" rx="1" width="6" x="17" y="93" />

              {/* Candle 2 */}
              <line stroke="#ffb4ab" strokeWidth="1" x1="50" x2="50" y1="82" y2="98" />
              <rect fill="#ffb4ab" height="7" rx="1" width="6" x="47" y="86" />

              {/* Candle 3 */}
              <line stroke="#56e5a9" strokeWidth="1" x1="80" x2="80" y1="80" y2="94" />
              <rect fill="#56e5a9" height="8" rx="1" width="6" x="77" y="82" />

              {/* Candle 4 */}
              <line stroke="#56e5a9" strokeWidth="1" x1="110" x2="110" y1="62" y2="84" />
              <rect fill="#56e5a9" height="13" rx="1" width="6" x="107" y="66" />

              {/* Candle 5 */}
              <line stroke="#ffb4ab" strokeWidth="1" x1="140" x2="140" y1="58" y2="76" />
              <rect fill="#ffb4ab" height="7" rx="1" width="6" x="137" y="63" />

              {/* Candle 6 */}
              <line stroke="#56e5a9" strokeWidth="1" x1="170" x2="170" y1="62" y2="75" />
              <rect fill="#56e5a9" height="3" rx="0.5" width="6" x="167" y="67" />

              {/* Candle 7 */}
              <line stroke="#56e5a9" strokeWidth="1" x1="200" x2="200" y1="50" y2="68" />
              <rect fill="#56e5a9" height="12" rx="1" width="6" x="197" y="52" />

              {/* Candle 8 */}
              <line stroke="#ffb4ab" strokeWidth="1" x1="230" x2="230" y1="42" y2="58" />
              <rect fill="#ffb4ab" height="6" rx="1" width="6" x="227" y="46" />

              {/* Candle 9 */}
              <line stroke="#56e5a9" strokeWidth="1" x1="260" x2="260" y1="28" y2="48" />
              <rect fill="#56e5a9" height="12" rx="1" width="6" x="257" y="32" />

              {/* Candle 10: Current Active Bullish Candle */}
              <line stroke="#56e5a9" strokeWidth="1.5" x1="290" x2="290" y1="18" y2="38" />
              <rect className="animate-pulse" fill="#56e5a9" height="13" rx="1" width="7" x="286.5" y="21" />

              {/* 20-EMA Trend Line Overlay */}
              <path
                d="M 15 97 C 65 92, 120 78, 175 70 S 260 45, 305 28"
                fill="none"
                stroke="url(#dashEmaGradient)"
                strokeLinecap="round"
                strokeWidth="2"
              />

              {/* Current Price Beacon Point */}
              <circle cx="290" cy="21" fill="#56e5a9" r="3.5" stroke="#0a0e18" strokeWidth="1.5" />
            </svg>

            {/* Volume Histogram Section */}
            <div className="pt-1 flex flex-col">
              <div className="flex justify-between items-center text-[#bdc8d1] font-label-caps text-[10px] pb-0.5">
                <span>VOLUME HISTOGRAM (REAL-TIME)</span>
                <span className="text-[#56e5a9] font-data-mono-sm">4.82M BAR</span>
              </div>
              <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 320 28">
                <rect fill="#56e5a9" height="14" opacity="0.6" rx="0.5" width="6" x="17" y="14" />
                <rect fill="#ffb4ab" height="10" opacity="0.6" rx="0.5" width="6" x="47" y="18" />
                <rect fill="#56e5a9" height="17" opacity="0.6" rx="0.5" width="6" x="77" y="11" />
                <rect fill="#56e5a9" height="23" opacity="0.85" rx="0.5" width="6" x="107" y="5" />
                <rect fill="#ffb4ab" height="12" opacity="0.5" rx="0.5" width="6" x="137" y="16" />
                <rect fill="#56e5a9" height="8" opacity="0.4" rx="0.5" width="6" x="167" y="20" />
                <rect fill="#56e5a9" height="18" opacity="0.75" rx="0.5" width="6" x="197" y="10" />
                <rect fill="#ffb4ab" height="13" opacity="0.5" rx="0.5" width="6" x="227" y="15" />
                <rect fill="#56e5a9" height="22" opacity="0.9" rx="0.5" width="6" x="257" y="6" />
                <rect fill="#56e5a9" height="26" opacity="1" rx="0.5" width="6" x="287" y="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* StockZen AI Consensus Signal Card */}
      <div className="relative overflow-hidden rounded-xl bg-[#1c1f2a] shadow-md p-3.5 border border-[#262a35]">
        {/* AI Energy Flow Ambient Background Decor */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#30c88f]/15 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col space-y-2.5">
          {/* Section Tag & Model Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8ed5ff] text-[18px]">
                psychology
              </span>
              <span className="font-label-caps text-[10px] text-[#dfe2f1] tracking-wider uppercase font-bold">
                Consensus Inference
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#262a35] text-[#56e5a9] font-data-mono-sm text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#56e5a9] animate-pulse" />
              ENSEMBLE v4.2
            </div>
          </div>

          {/* Main Direction Badge + Confidence */}
          <div className="flex items-center justify-between bg-[#171b26] rounded-lg p-2.5 border border-[#262a35]/60">
            <div className="flex items-center">
              <div className="w-11 h-11 rounded-lg bg-[#30c88f]/20 flex items-center justify-center text-[#56e5a9] relative">
                <span className="material-symbols-outlined text-[24px]">trending_up</span>
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#56e5a9] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#56e5a9]" />
                </span>
              </div>
              <div className="ml-2.5">
                <span className="font-label-caps text-[10px] text-[#56e5a9] font-bold tracking-widest block uppercase">
                  Direction Signal
                </span>
                <span className="font-headline-sm text-[18px] text-[#dfe2f1] font-extrabold tracking-tight">
                  {currentStock.direction}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-data-mono-lg text-[20px] text-[#56e5a9] font-bold">
                {currentStock.consensusConfidence.toFixed(1)}%
              </span>
              <p className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
                Calibrated Conf.
              </p>
            </div>
          </div>

          {/* Confidence Gauge Meter */}
          <div className="w-full bg-[#262a35] h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-[#56e5a9] h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(86,229,169,0.5)]"
              style={{ width: `${currentStock.consensusConfidence}%` }}
            />
          </div>

          {/* Sub-model Breakdown Pills */}
          <div className="flex flex-col space-y-1.5 pt-1">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase">
              Model Consensus Breakdown
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col p-2 rounded bg-[#171b26] border border-[#262a35]/40">
                <span className="font-label-caps text-[10px] text-[#bdc8d1]">
                  Random Forest
                </span>
                <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-bold pt-0.5">
                  Bullish {currentStock.rfConfidence}%
                </span>
              </div>
              <div className="flex flex-col p-2 rounded bg-[#171b26] border border-[#262a35]/40">
                <span className="font-label-caps text-[10px] text-[#bdc8d1]">
                  Linear SVM
                </span>
                <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-bold pt-0.5">
                  Bullish {currentStock.svmConfidence}%
                </span>
              </div>
              <div className="flex flex-col p-2 rounded bg-[#171b26] border border-[#262a35]/40">
                <span className="font-label-caps text-[10px] text-[#bdc8d1]">
                  Bi-LSTM
                </span>
                <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-bold pt-0.5">
                  Upward {currentStock.lstmConfidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Sentiment Composite Insight */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#262a35]/70 border border-[#313540]/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#3131c0]/40 flex items-center justify-center text-[#c0c1ff]">
                <span className="material-symbols-outlined text-[16px]">sensors</span>
              </div>
              <div>
                <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase block">
                  NLP Sentiment Composite
                </span>
                <span className="font-body-sm text-[12px] font-semibold text-[#dfe2f1]">
                  +{currentStock.sentimentComposite.toFixed(2)} {currentStock.sentimentLabel}
                </span>
              </div>
            </div>
            <span className="font-data-mono-sm text-[11px] text-[#bdc8d1] text-right">
              {currentStock.newsCount} News / 24h
            </span>
          </div>
        </div>
      </div>

      {/* Technical Summary Indicator 4-Grid */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between px-0.5">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold tracking-wider">
            Quant Telemetry
          </span>
          <span className="font-data-mono-sm text-[11px] text-[#8ed5ff]">
            Indicators Active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* RSI Tile */}
          <div className="p-2.5 rounded-lg bg-[#1c1f2a] shadow-sm flex flex-col justify-between border border-[#262a35]">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-[#bdc8d1]">RSI (14)</span>
              <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-bold">
                {currentStock.rsi.toFixed(1)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-body-sm text-[12px] text-[#dfe2f1] font-medium">
                Neutral-Bullish
              </span>
              <span className="w-2 h-2 rounded-full bg-[#56e5a9]" />
            </div>
          </div>

          {/* MACD Tile */}
          <div className="p-2.5 rounded-lg bg-[#1c1f2a] shadow-sm flex flex-col justify-between border border-[#262a35]">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-[#bdc8d1]">MACD HIST</span>
              <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-bold">
                +{currentStock.macdHist.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-body-sm text-[12px] text-[#dfe2f1] font-medium">
                Bullish Cross
              </span>
              <span className="w-2 h-2 rounded-full bg-[#56e5a9] animate-pulse" />
            </div>
          </div>

          {/* 20-EMA Tile */}
          <div className="p-2.5 rounded-lg bg-[#1c1f2a] shadow-sm flex flex-col justify-between border border-[#262a35]">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-[#bdc8d1]">20-EMA BASIS</span>
              <span className="font-data-mono-sm text-[11px] text-[#8ed5ff] font-bold">
                {formatRupees(currentStock.ema20)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-body-sm text-[12px] text-[#dfe2f1] font-medium">
                +3.5% Above
              </span>
              <span className="material-symbols-outlined text-[#8ed5ff] text-[14px]">
                north_east
              </span>
            </div>
          </div>

          {/* Volatility Tile */}
          <div className="p-2.5 rounded-lg bg-[#1c1f2a] shadow-sm flex flex-col justify-between border border-[#262a35]">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-[#bdc8d1]">HIST. VOLATILITY</span>
              <span className="font-data-mono-sm text-[11px] text-[#dfe2f1] font-bold">
                {currentStock.volatility.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-body-sm text-[12px] text-[#dfe2f1] font-medium">
                Moderate Range
              </span>
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            </div>
          </div>
        </div>
      </div>

      {/* Curated Intelligence News Feed */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#bdc8d1]">
              newspaper
            </span>
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold tracking-wider">
              Scraped Intelligence
            </span>
          </div>
          <button
            onClick={() => onOpenArticle(NEWS_ITEMS[0])}
            className="font-data-mono-sm text-[11px] text-[#8ed5ff] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          {NEWS_ITEMS.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenArticle(item)}
              className="p-2.5 rounded-lg bg-[#1c1f2a] shadow-sm flex items-start gap-2.5 hover:bg-[#262a35] transition-colors cursor-pointer border border-[#262a35]"
            >
              {item.imageUrl && (
                <img
                  className="w-16 h-16 rounded object-cover shrink-0 bg-[#313540]"
                  src={item.imageUrl}
                  alt={item.title}
                />
              )}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-label-caps text-[10px] text-[#bdc8d1]">
                    {item.source} • {item.timeAgo}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#30c88f]/20 text-[#56e5a9] font-data-mono-sm text-[10px] font-semibold">
                    {item.scoreLabel}
                  </span>
                </div>
                <p className="font-body-md text-[13px] text-[#dfe2f1] font-semibold line-clamp-2 leading-snug">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-data-mono-sm text-[10px] text-[#bdc8d1]">
                    Sentiment Impact: {item.impact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSE Research Educational Disclaimer Badge */}
      <div className="p-2.5 rounded-lg bg-[#171b26] flex items-center gap-2.5 border border-[#262a35]/60">
        <span className="material-symbols-outlined text-[#87929a] text-[18px] shrink-0">
          info
        </span>
        <p className="font-body-sm text-[12px] text-[#bdc8d1] leading-tight">
          Estimates generated for educational & CSE research purposes. Quantitative signals are algorithmic heuristics, not financial advice.
        </p>
      </div>
    </div>
  );
};
