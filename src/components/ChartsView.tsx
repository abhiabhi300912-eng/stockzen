import React, { useState } from 'react';
import { StockInfo } from '../types';
import { ORDER_BOOK_DATA } from '../data/mockData';
import { formatRupees } from '../utils/currency';

interface ChartsViewProps {
  currentStock: StockInfo;
  onOpenCustomModal: () => void;
  onSimulateTrade: (type: 'BUY' | 'SELL') => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  currentStock,
  onOpenCustomModal,
  onSimulateTrade,
}) => {
  const [timeHorizon, setTimeHorizon] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [activeSegment, setActiveSegment] = useState<'indicators' | 'orderbook' | 'volatility'>('indicators');
  const [isAlertSet, setIsAlertSet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredData, setHoveredData] = useState<{ o: number; h: number; l: number; c: number } | null>(null);

  const isUp = currentStock.change >= 0;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 pb-8 space-y-3">
      {/* Ticker Micro-Header & Real-Time Price Overview */}
      <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md border border-[#262a35]">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-headline-lg-mobile text-[20px] text-[#dfe2f1] font-semibold tracking-tight truncate">
              {currentStock.ticker}
            </span>
            <span className="font-data-mono-sm text-[11px] text-[#bdc8d1] truncate">
              {currentStock.name} • {currentStock.exchange}
            </span>
          </div>

          <button
            aria-label="Toggle Alert"
            onClick={() => setIsAlertSet(!isAlertSet)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors active:scale-95 ${
              isAlertSet
                ? 'bg-[#30c88f] text-[#003824] font-bold shadow-[0_0_8px_rgba(48,200,143,0.4)]'
                : 'bg-[#262a35] text-[#8ed5ff] hover:bg-[#313540]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isAlertSet ? 'check_circle' : 'notifications_active'}
            </span>
            <span className="font-data-mono-sm text-[11px] font-semibold">
              {isAlertSet ? 'SET' : 'ALERT'}
            </span>
          </button>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-data-mono-lg text-[20px] text-[#dfe2f1] tracking-tight">
              {formatRupees(currentStock.price)}
            </span>
            <span
              className={`font-data-mono-sm text-[11px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                isUp
                  ? 'text-[#56e5a9] bg-[#56e5a9]/20'
                  : 'text-[#ffb4ab] bg-[#93000a]/30'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">
                {isUp ? 'trending_up' : 'trending_down'}
              </span>
              {formatRupees(currentStock.change, { showSign: true })} ({isUp ? '+' : ''}
              {currentStock.changePercent.toFixed(2)}%)
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#bdc8d1] font-data-mono-sm text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#56e5a9] animate-ping" />
            <span className="text-[#56e5a9]">BULLISH V4</span>
          </div>
        </div>

        {/* Data Ingestion Status Banner */}
        <div className="flex items-center justify-between mt-2 pt-1 bg-[#1c1f2a]/60 rounded px-2 py-1 border border-[#262a35]/40">
          <div className="flex items-center gap-1.5 text-[#bdc8d1] font-data-mono-sm text-[11px] truncate">
            <span className="material-symbols-outlined text-[14px] text-[#8ed5ff]">
              cloud_sync
            </span>
            <span className="truncate">Real-time ingestion via yfinance • Synced 2m ago</span>
          </div>
          <span className="font-data-mono-sm text-[11px] text-[#56e5a9] shrink-0 font-medium">
            99.98% SLA
          </span>
        </div>
      </div>

      {/* Time Horizon Filter Selector */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#171b26] rounded-lg shadow-sm border border-[#262a35]">
        {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimeHorizon(period)}
            className={`flex-1 py-1.5 text-center font-data-mono-sm text-[11px] rounded transition-all active:scale-95 ${
              timeHorizon === period
                ? 'bg-[#38bdf8] text-[#001e2c] font-semibold shadow-sm'
                : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
            }`}
          >
            {period}
          </button>
        ))}
        <button
          onClick={onOpenCustomModal}
          className="flex items-center justify-center px-2.5 py-1.5 gap-1 rounded bg-[#262a35] text-[#dfe2f1] hover:text-[#8ed5ff] transition-colors active:scale-95 border border-[#313540]/60"
        >
          <span className="material-symbols-outlined text-[14px]">tune</span>
          <span className="font-data-mono-sm text-[11px]">Custom</span>
        </button>
      </div>

      {/* Interactive SVG Candlestick & Bollinger Bands Canvas */}
      <div
        className={`flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-2 relative overflow-hidden border border-[#262a35] transition-all ${
          isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto max-w-none' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider">
              CHART CANVAS
            </span>
            <span className="font-data-mono-sm text-[11px] text-[#8ed5ff] bg-[#8ed5ff]/10 px-1.5 py-0.5 rounded">
              BOLLINGER (20,2)
            </span>
            <span className="font-data-mono-sm text-[11px] text-[#c0c1ff] bg-[#c0c1ff]/10 px-1.5 py-0.5 rounded">
              SMA 20
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded bg-[#1c1f2a] hover:bg-[#262a35] text-[#bdc8d1] hover:text-[#dfe2f1] transition-colors"
              title="Fullscreen toggle"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic SVG Chart Surface */}
        <div className={`w-full ${isFullscreen ? 'h-96' : 'h-48'} relative bg-[#0a0e18] rounded-lg p-1 overflow-hidden border border-[#262a35]/60`}>
          <svg
            className="w-full h-full select-none"
            preserveAspectRatio="none"
            viewBox="0 0 340 180"
          >
            <defs>
              <linearGradient id="bb-band" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#8ed5ff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#8ed5ff" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Subtle Grid System */}
            <line stroke="#313540" strokeDasharray="3,3" strokeWidth="0.5" x1="0" x2="340" y1="45" y2="45" />
            <line stroke="#313540" strokeDasharray="3,3" strokeWidth="0.5" x1="0" x2="340" y1="90" y2="90" />
            <line stroke="#313540" strokeDasharray="3,3" strokeWidth="0.5" x1="0" x2="340" y1="135" y2="135" />
            <line stroke="#313540" strokeDasharray="3,3" strokeWidth="0.5" x1="85" x2="85" y1="0" y2="180" />
            <line stroke="#313540" strokeDasharray="3,3" strokeWidth="0.5" x1="170" x2="170" y1="0" y2="180" />
            <line stroke="#313540" strokeDasharray="3,3" strokeWidth="0.5" x1="255" x2="255" y1="0" y2="180" />

            {/* Bollinger Upper & Lower Fill Envelope */}
            <polygon
              fill="url(#bb-band)"
              points="10,38 45,35 80,48 115,52 150,42 185,32 220,38 255,48 290,56 330,62 330,148 290,140 255,134 220,128 185,120 150,132 115,142 80,138 45,122 10,126"
            />

            {/* Bollinger Outer Bands */}
            <polyline
              fill="none"
              opacity="0.6"
              points="10,38 45,35 80,48 115,52 150,42 185,32 220,38 255,48 290,56 330,62"
              stroke="#8ed5ff"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
            <polyline
              fill="none"
              opacity="0.6"
              points="10,126 45,122 80,138 115,142 150,132 185,120 220,128 255,134 290,140 330,148"
              stroke="#8ed5ff"
              strokeDasharray="2,2"
              strokeWidth="1"
            />

            {/* SMA 20 Overlay Ribbon */}
            <path
              d="M 10 82 Q 45 78 80 93 T 150 87 T 220 83 T 290 98 T 330 105"
              fill="none"
              stroke="#c0c1ff"
              strokeLinecap="round"
              strokeWidth="1.5"
            />

            {/* Institutional Candlesticks (Wick & Real Body) */}
            {/* Candle 1: Up */}
            <line stroke="#56e5a9" strokeWidth="1" x1="25" x2="25" y1="65" y2="105" />
            <rect fill="#56e5a9" height="24" rx="1" width="6" x="22" y="72" />

            {/* Candle 2: Down */}
            <line stroke="#ffb4ab" strokeWidth="1" x1="55" x2="55" y1="60" y2="108" />
            <rect fill="#ffb4ab" height="30" rx="1" width="6" x="52" y="66" />

            {/* Candle 3: Up */}
            <line stroke="#56e5a9" strokeWidth="1" x1="85" x2="85" y1="80" y2="125" />
            <rect fill="#56e5a9" height="26" rx="1" width="6" x="82" y="86" />

            {/* Candle 4: Up Strong */}
            <line stroke="#56e5a9" strokeWidth="1" x1="115" x2="115" y1="70" y2="118" />
            <rect fill="#56e5a9" height="32" rx="1" width="6" x="112" y="74" />

            {/* Candle 5: Down */}
            <line stroke="#ffb4ab" strokeWidth="1" x1="145" x2="145" y1="62" y2="115" />
            <rect fill="#ffb4ab" height="34" rx="1" width="6" x="142" y="68" />

            {/* Candle 6: Up Hammer */}
            <line stroke="#56e5a9" strokeWidth="1" x1="175" x2="175" y1="50" y2="100" />
            <rect fill="#56e5a9" height="22" rx="1" width="6" x="172" y="52" />

            {/* Candle 7: Down */}
            <line stroke="#ffb4ab" strokeWidth="1" x1="205" x2="205" y1="58" y2="112" />
            <rect fill="#ffb4ab" height="38" rx="1" width="6" x="202" y="64" />

            {/* Candle 8: Down Pinbar */}
            <line stroke="#ffb4ab" strokeWidth="1" x1="235" x2="235" y1="70" y2="128" />
            <rect fill="#ffb4ab" height="28" rx="1" width="6" x="232" y="80" />

            {/* Candle 9: Up */}
            <line stroke="#56e5a9" strokeWidth="1" x1="265" x2="265" y1="80" y2="135" />
            <rect fill="#56e5a9" height="32" rx="1" width="6" x="262" y="88" />

            {/* Candle 10: Current Active Down Ticker */}
            <line stroke="#ffb4ab" strokeWidth="1.2" x1="295" x2="295" y1="92" y2="142" />
            <rect className="animate-pulse" fill="#ffb4ab" height="30" rx="1" width="6" x="292" y="98" />

            {/* Last Price Marker Horizontal Target */}
            <line opacity="0.8" stroke="#ffb4ab" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="340" y1="102" y2="102" />
            <rect fill="#93000a" height="13" rx="2" width="56" x="284" y="96" />
            <text fill="#ffdad6" fontFamily="JetBrains Mono" fontSize="8" fontWeight="600" x="287" y="106">
              ₹{currentStock.price.toFixed(2)}
            </text>
          </svg>

          {/* Float Telemetry Badge */}
          <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1.5 bg-[#262a35]/90 px-2 py-0.5 rounded shadow border border-[#313540]/60">
            <span className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-[#56e5a9]' : 'bg-[#ffb4ab]'}`} />
            <span className="font-data-mono-sm text-[11px] text-[#dfe2f1]">
              O:{formatRupees(currentStock.open)} H:{formatRupees(currentStock.dayHigh)} L:{formatRupees(currentStock.dayLow)}
            </span>
          </div>
        </div>

        {/* Chart Scale Footer */}
        <div className="flex items-center justify-between text-[#bdc8d1] font-data-mono-sm text-[11px] px-1">
          <span>OCT 02</span>
          <span>OCT 16</span>
          <span>NOV 01</span>
          <span>NOV 18</span>
          <span className="text-[#8ed5ff] font-semibold">TODAY</span>
        </div>
      </div>

      {/* Interactive Key Statistics Matrix */}
      <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-1.5 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider">
            KEY STATISTICS • DAILY EXECUTION
          </span>
          <span className="font-data-mono-sm text-[11px] text-[#56e5a9]">
            REGULAR HOURS
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="flex flex-col p-2 bg-[#1c1f2a] rounded-lg hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
            <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">Open</span>
            <span className="font-data-mono-md text-[13px] text-[#dfe2f1] font-semibold">
              {formatRupees(currentStock.open)}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-[#1c1f2a] rounded-lg hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
            <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">Day High</span>
            <span className="font-data-mono-md text-[13px] text-[#56e5a9] font-semibold">
              {formatRupees(currentStock.dayHigh)}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-[#1c1f2a] rounded-lg hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
            <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">Day Low</span>
            <span className="font-data-mono-md text-[13px] text-[#ffb4ab] font-semibold">
              {formatRupees(currentStock.dayLow)}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-[#1c1f2a] rounded-lg hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
            <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">Prev Close</span>
            <span className="font-data-mono-md text-[13px] text-[#dfe2f1] font-semibold">
              {formatRupees(currentStock.prevClose)}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-[#1c1f2a] rounded-lg hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
            <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">Adj Close</span>
            <span className="font-data-mono-md text-[13px] text-[#dfe2f1] font-semibold">
              {formatRupees(currentStock.adjClose)}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-[#1c1f2a] rounded-lg hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
            <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">Volume</span>
            <span className="font-data-mono-md text-[13px] text-[#8ed5ff] font-semibold">
              {currentStock.volume}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Comparison Return Module */}
      <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-2 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider">
            RETURN SPREAD VARIANCE
          </span>
          <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
            DAILY VS WEEKLY
          </span>
        </div>
        <div className="space-y-2">
          {/* Daily Bar */}
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center font-data-mono-sm text-[11px]">
              <span className="text-[#dfe2f1]">Daily Return (Session)</span>
              <span className={`font-semibold ${isUp ? 'text-[#56e5a9]' : 'text-[#ffb4ab]'}`}>
                {isUp ? '+' : ''}{currentStock.dailyReturn.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-[#262a35] h-2.5 rounded-full overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isUp ? 'bg-[#56e5a9]' : 'bg-[#ffb4ab]'
                }`}
                style={{ width: `${Math.min(100, Math.max(15, Math.abs(currentStock.dailyReturn) * 20))}%` }}
              />
            </div>
          </div>
          {/* Weekly Bar */}
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center font-data-mono-sm text-[11px]">
              <span className="text-[#dfe2f1]">Weekly Cumulative (5D)</span>
              <span className="text-[#56e5a9] font-semibold">
                +{currentStock.weeklyReturn.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-[#262a35] h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-[#56e5a9] h-full rounded-full transition-all duration-500"
                style={{ width: '68%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Analytical Perspective Segment Switcher */}
      <div className="flex p-1 bg-[#171b26] rounded-lg gap-1 shadow-sm border border-[#262a35]">
        <button
          onClick={() => setActiveSegment('indicators')}
          className={`flex-1 py-1.5 text-center font-data-mono-sm text-[11px] rounded transition-all ${
            activeSegment === 'indicators'
              ? 'bg-[#38bdf8] text-[#001e2c] font-semibold'
              : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
          }`}
        >
          Indicators
        </button>
        <button
          onClick={() => setActiveSegment('orderbook')}
          className={`flex-1 py-1.5 text-center font-data-mono-sm text-[11px] rounded transition-all ${
            activeSegment === 'orderbook'
              ? 'bg-[#38bdf8] text-[#001e2c] font-semibold'
              : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
          }`}
        >
          Order Depth
        </button>
        <button
          onClick={() => setActiveSegment('volatility')}
          className={`flex-1 py-1.5 text-center font-data-mono-sm text-[11px] rounded transition-all ${
            activeSegment === 'volatility'
              ? 'bg-[#38bdf8] text-[#001e2c] font-semibold'
              : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
          }`}
        >
          Volatility
        </button>
      </div>

      {/* TAB PANE 1: Technical Indicators */}
      {activeSegment === 'indicators' && (
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-3 border border-[#262a35]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#8ed5ff] text-[18px]">
                  query_stats
                </span>
                <span className="font-label-caps text-[10px] text-[#dfe2f1] font-semibold uppercase tracking-wider">
                  MOMENTUM & OSCILLATORS
                </span>
              </div>
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1] bg-[#1c1f2a] px-1.5 py-0.5 rounded border border-[#262a35]/60">
                NEUTRAL REGIME
              </span>
            </div>

            {/* RSI (14) Indicator Module */}
            <div className="flex flex-col space-y-1.5 bg-[#1c1f2a] p-2.5 rounded-lg border border-[#262a35]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-body-sm text-[12px] text-[#dfe2f1] font-semibold">
                    RSI (14)
                  </span>
                  <span className="font-data-mono-sm text-[10px] text-[#bdc8d1] bg-[#262a35] px-1 py-0.5 rounded">
                    Relative Strength
                  </span>
                </div>
                <span className="font-data-mono-md text-[13px] text-[#8ed5ff] font-bold">
                  {currentStock.rsi.toFixed(2)}
                </span>
              </div>

              {/* Slider Bar Visualizer */}
              <div className="relative w-full h-3 bg-[#313540] rounded-full overflow-hidden flex items-center">
                <div className="w-[30%] h-full bg-[#56e5a9]/20" />
                <div className="w-[40%] h-full bg-[#8ed5ff]/20" />
                <div className="w-[30%] h-full bg-[#ffb4ab]/20" />
                <div
                  className="absolute h-full w-2 bg-[#8ed5ff] rounded-full shadow-[0_0_8px_#8ed5ff]"
                  style={{ left: `calc(${currentStock.rsi}% - 4px)` }}
                />
              </div>

              <div className="flex justify-between items-center text-[#bdc8d1] font-data-mono-sm text-[10px] pt-0.5">
                <span className="text-[#56e5a9]">30 (Oversold)</span>
                <span className="text-[#dfe2f1] font-medium">NEUTRAL ({currentStock.rsi.toFixed(1)})</span>
                <span className="text-[#ffb4ab]">70 (Overbought)</span>
              </div>
            </div>

            {/* MACD (12, 26, 9) Visualizer Card */}
            <div className="flex flex-col space-y-2 bg-[#1c1f2a] p-2.5 rounded-lg border border-[#262a35]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-body-sm text-[12px] text-[#dfe2f1] font-semibold">
                    MACD (12, 26, 9)
                  </span>
                  <span className="font-data-mono-sm text-[10px] text-[#ffb4ab] bg-[#93000a]/30 px-1 py-0.5 rounded font-semibold">
                    Bearish Cross
                  </span>
                </div>
                <div className="flex items-center gap-2 font-data-mono-sm text-[11px]">
                  <span className="text-[#8ed5ff] font-semibold">MACD: {currentStock.macd.toFixed(2)}</span>
                  <span className="text-[#c0c1ff] font-semibold">Signal: {currentStock.signal.toFixed(2)}</span>
                </div>
              </div>

              {/* Inline Histogram Bar Visual Graph */}
              <div className="h-10 w-full bg-[#313540] rounded flex items-center px-2 relative">
                <div className="absolute inset-x-0 h-[1px] bg-[#3e484f]/60" />
                <div className="w-full flex items-center justify-between gap-1 z-10">
                  <div className="h-5 w-2 bg-[#56e5a9] rounded-t-sm self-end" />
                  <div className="h-6 w-2 bg-[#56e5a9] rounded-t-sm self-end" />
                  <div className="h-4 w-2 bg-[#56e5a9] rounded-t-sm self-end" />
                  <div className="h-3 w-2 bg-[#56e5a9] rounded-t-sm self-end" />
                  <div className="h-1 w-2 bg-[#56e5a9] rounded-t-sm self-end" />
                  <div className="h-2 w-2 bg-[#ffb4ab] rounded-b-sm self-start" />
                  <div className="h-4 w-2 bg-[#ffb4ab] rounded-b-sm self-start" />
                  <div className="h-6 w-2 bg-[#ffb4ab] rounded-b-sm self-start" />
                  <div className="h-5 w-2 bg-[#ffb4ab] rounded-b-sm self-start" />
                  <div className="h-4 w-2 bg-[#ffb4ab] rounded-b-sm self-start" />
                </div>
              </div>
              <p className="font-body-sm text-[12px] text-[#bdc8d1]">
                Momentum slowing down; slight bearish divergence converging on the 4H timeframe.
              </p>
            </div>

            {/* Moving Averages Aggregation Matrix */}
            <div className="flex flex-col space-y-1.5">
              <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider">
                TREND CONTINUITY • MOVING AVERAGES
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded bg-[#1c1f2a] hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#56e5a9]" />
                    <span className="font-body-sm text-[12px] text-[#dfe2f1] font-medium">20-SMA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-data-mono-md text-[13px] text-[#dfe2f1] font-semibold">
                      {formatRupees(currentStock.sma20)}
                    </span>
                    <span className="font-data-mono-sm text-[10px] text-[#56e5a9] bg-[#30c88f]/20 px-1.5 py-0.5 rounded font-semibold">
                      BULLISH
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#1c1f2a] hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#56e5a9]" />
                    <span className="font-body-sm text-[12px] text-[#dfe2f1] font-medium">50-SMA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-data-mono-md text-[13px] text-[#dfe2f1] font-semibold">
                      {formatRupees(currentStock.sma50)}
                    </span>
                    <span className="font-data-mono-sm text-[10px] text-[#56e5a9] bg-[#30c88f]/20 px-1.5 py-0.5 rounded font-semibold">
                      BULLISH
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#1c1f2a] hover:bg-[#262a35] transition-colors border border-[#262a35]/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8ed5ff]" />
                    <span className="font-body-sm text-[12px] text-[#dfe2f1] font-medium">200-SMA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-data-mono-md text-[13px] text-[#dfe2f1] font-semibold">
                      {formatRupees(currentStock.sma200)}
                    </span>
                    <span className="font-data-mono-sm text-[10px] text-[#8ed5ff] bg-[#38bdf8]/20 px-1.5 py-0.5 rounded font-semibold">
                      STRONG SUPPORT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB PANE 2: Order Depth */}
      {activeSegment === 'orderbook' && (
        <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-2 border border-[#262a35]">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider">
              LEVEL 2 MARKET DEPTH
            </span>
            <span className="font-data-mono-sm text-[11px] text-[#56e5a9]">SPREAD ₹0.02</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[#dfe2f1]">
            {/* Bid Column */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between font-label-caps text-[10px] text-[#bdc8d1] px-1">
                <span>BID SIZE</span>
                <span>PRICE</span>
              </div>
              {ORDER_BOOK_DATA.map((row, idx) => (
                <div
                  key={`bid-${idx}`}
                  className="flex justify-between items-center bg-[#1c1f2a] p-1.5 rounded relative overflow-hidden font-data-mono-sm text-[11px]"
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-[#56e5a9]/15"
                    style={{ width: `${Math.min(95, (row.bidSize / 3500) * 100)}%` }}
                  />
                  <span className="relative z-10 text-[#dfe2f1] font-medium">{row.bidSize.toLocaleString()}</span>
                  <span className="relative z-10 text-[#56e5a9] font-bold">{formatRupees(row.bidPrice)}</span>
                </div>
              ))}
            </div>

            {/* Ask Column */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between font-label-caps text-[10px] text-[#bdc8d1] px-1">
                <span>PRICE</span>
                <span>ASK SIZE</span>
              </div>
              {ORDER_BOOK_DATA.map((row, idx) => (
                <div
                  key={`ask-${idx}`}
                  className="flex justify-between items-center bg-[#1c1f2a] p-1.5 rounded relative overflow-hidden font-data-mono-sm text-[11px]"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-[#ffb4ab]/15"
                    style={{ width: `${Math.min(95, (row.askSize / 2500) * 100)}%` }}
                  />
                  <span className="relative z-10 text-[#ffb4ab] font-bold">{formatRupees(row.askPrice)}</span>
                  <span className="relative z-10 text-[#dfe2f1] font-medium">{row.askSize.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB PANE 3: Volatility */}
      {activeSegment === 'volatility' && (
        <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-3 border border-[#262a35]">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider">
              VOLATILITY COMPOSITE
            </span>
            <span className="font-data-mono-sm text-[11px] text-[#8ed5ff]">
              IV RANK: {currentStock.ivRank}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#1c1f2a] p-3 rounded-lg border border-[#262a35]/40">
            <div className="flex flex-col">
              <span className="font-body-sm text-[12px] text-[#dfe2f1] font-semibold">
                Historical Volatility (30D)
              </span>
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
                Annualized standard deviation
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-data-mono-lg text-[20px] text-[#8ed5ff] font-bold">
                {currentStock.volatility.toFixed(1)}%
              </span>
              <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-medium">
                Low to Moderate
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col p-2.5 bg-[#1c1f2a] rounded-lg border border-[#262a35]/40">
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">Beta (vs SPY)</span>
              <span className="font-data-mono-md text-[13px] text-[#dfe2f1] font-semibold">
                {currentStock.beta.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col p-2.5 bg-[#1c1f2a] rounded-lg border border-[#262a35]/40">
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">Average True Range (14D)</span>
              <span className="font-data-mono-md text-[13px] text-[#dfe2f1] font-semibold">
                {formatRupees(currentStock.atr)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Execution Floating Action Strip */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSimulateTrade('BUY')}
          className="flex-1 py-3 bg-[#30c88f] hover:bg-[#56e5a9] text-[#003824] font-headline-sm text-[16px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Simulate Buy</span>
        </button>

        <button
          onClick={() => onSimulateTrade('SELL')}
          className="flex-1 py-3 bg-[#262a35] hover:bg-[#313540] text-[#ffb4ab] border border-[#ffb4ab]/30 font-headline-sm text-[16px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">remove_circle</span>
          <span>Simulate Sell</span>
        </button>
      </div>
    </div>
  );
};
