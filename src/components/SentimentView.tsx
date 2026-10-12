import React, { useState } from 'react';
import { StockInfo, NewsItem } from '../types';
import { NEWS_ITEMS } from '../data/mockData';
import { formatRupees } from '../utils/currency';

interface SentimentViewProps {
  currentStock: StockInfo;
  onSelectStock: (ticker: string) => void;
  onOpenArticle: (news: NewsItem) => void;
}

export const SentimentView: React.FC<SentimentViewProps> = ({
  currentStock,
  onSelectStock,
  onOpenArticle,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [expandedHeadlines, setExpandedHeadlines] = useState<Record<string, boolean>>({
    n3: true, // first headline expanded by default as in design
  });
  const [customHeadline, setCustomHeadline] = useState('');
  const [customAnalyzed, setCustomAnalyzed] = useState<{ score: number; label: string; tokens: { text: string; weight: number }[] } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedHeadlines((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredNews = NEWS_ITEMS.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const handleAnalyzeCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHeadline.trim()) return;

    // Simulated FinBERT tokenizer & scoring
    const words = customHeadline.split(/\s+/);
    const score = Math.min(0.95, Math.max(-0.95, (Math.random() * 1.6) - 0.6));
    const tokenList = words.slice(0, 4).map((w) => ({
      text: w,
      weight: parseFloat(((Math.random() * 1.2) - 0.4).toFixed(2)),
    }));

    setCustomAnalyzed({
      score: parseFloat(score.toFixed(2)),
      label: score > 0.2 ? 'Positive' : score < -0.2 ? 'Negative' : 'Neutral',
      tokens: tokenList,
    });
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 pb-8 space-y-3">
      {/* Asset 1: Conceptual Ambient Header Art */}
      <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-lg bg-[#262a35] flex flex-col justify-end p-3.5 border border-[#262a35]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgOjerPA7ivAeBCcZmo8FaWwUl40U6sythAJQZOKlPNlv1bRpAQ4Nbeq5PzZ0grccO6bp1Vf3zjyGDlf51_Y_djvMxA3930LxVflRwOeB2M8TjJAiWjLXZInjs3OS8uK53L6PsLx_2ntQ8B_e9mOr0hTB8R1Qmy_3mdg-sA5EGpvYasPrZeR7zBelMrkIRX9ftkDKihgy-_JOq4xQllrHnj8haN3JA9Q5VH_1f9yFeGWkKrvsC6duZsA')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#262a35] via-[#262a35]/60 to-transparent" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#56e5a9] animate-ping" />
              <span className="font-label-caps text-[10px] text-[#56e5a9] uppercase tracking-wider font-semibold">
                Live Neural Stream
              </span>
            </div>
            <span className="font-headline-lg-mobile text-[20px] text-[#dfe2f1] font-bold">
              FinBERT Real-time Telemetry
            </span>
          </div>
          <div className="p-2 rounded-lg bg-[#1c1f2a] text-[#8ed5ff] flex items-center justify-center shadow-sm border border-[#313540]/60">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
        </div>
      </div>

      {/* Stock Selector Bar */}
      <div className="flex items-center justify-between p-2.5 bg-[#1c1f2a] rounded-xl shadow-sm border border-[#262a35]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#262a35] flex items-center justify-center text-[#8ed5ff] font-data-mono-md text-[13px] font-bold shrink-0">
            {currentStock.ticker}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold truncate">
                {currentStock.name}
              </span>
              <span className="font-data-mono-sm text-[10px] text-[#56e5a9] px-1 py-0.5 rounded bg-[#262a35]">
                {currentStock.exchange}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
                {formatRupees(currentStock.price)}
              </span>
              <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-medium">
                {currentStock.change >= 0 ? '+' : ''}{currentStock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            const next = currentStock.ticker === 'TSLA' ? 'NVDA' : currentStock.ticker === 'NVDA' ? 'AAPL' : 'TSLA';
            onSelectStock(next);
          }}
          aria-label="Switch ticker"
          className="w-9 h-9 rounded-lg bg-[#262a35] text-[#dfe2f1] flex items-center justify-center hover:text-[#8ed5ff] active:scale-95 transition-all border border-[#313540]/60"
          title="Switch stock"
        >
          <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
        </button>
      </div>

      {/* Primary Score & Gauge Bento Grid Card */}
      <div className="flex flex-col p-3.5 bg-[#1c1f2a] rounded-xl shadow-md gap-3 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#8ed5ff] text-[18px]">
              neurology
            </span>
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider font-bold">
              Algorithmic Consensus
            </span>
          </div>
          <span className="font-data-mono-sm text-[11px] text-[#56e5a9] px-2 py-0.5 rounded bg-[#262a35]">
            FinBERT v4.82
          </span>
        </div>

        {/* Gauge & Metrics Hero Split */}
        <div className="flex items-center gap-3">
          {/* Donut Gauge Chart SVG */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Base Ring */}
              <circle
                className="text-[#262a35]"
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="currentColor"
                strokeWidth="10"
              />
              {/* Negative segment: 14% (Circumference ~ 238.76 => 14% = 33.4) */}
              <circle
                className="text-[#ffb4ab]"
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="currentColor"
                strokeDasharray="33.4 238.8"
                strokeDashoffset="0"
                strokeWidth="10"
              />
              {/* Neutral segment: 24% => 57.3 */}
              <circle
                className="text-[#c0c1ff]"
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="currentColor"
                strokeDasharray="57.3 238.8"
                strokeDashoffset="-33.4"
                strokeWidth="10"
              />
              {/* Positive segment: 62% => 148.0 */}
              <circle
                className="text-[#56e5a9]"
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="currentColor"
                strokeDasharray="148.0 238.8"
                strokeDashoffset="-90.7"
                strokeWidth="10"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-headline-lg-mobile text-[20px] text-[#56e5a9] font-bold leading-none">
                +{currentStock.vaderScore.toFixed(2)}
              </span>
              <span className="font-label-caps text-[10px] text-[#bdc8d1] mt-1 font-semibold">
                VADER
              </span>
            </div>
          </div>

          {/* Score Telemetry Summary */}
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <span className="font-headline-sm text-[16px] text-[#56e5a9] font-bold leading-tight">
              Moderately Bullish
            </span>
            <span className="font-body-sm text-[12px] text-[#bdc8d1] mt-1 leading-snug">
              Strong semantic drift toward positive growth expectations across analyst news cycles.
            </span>
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded bg-[#262a35] border border-[#313540]/40">
              <span className="material-symbols-outlined text-[14px] text-[#8ed5ff]">
                auto_read_pause
              </span>
              <span className="font-data-mono-sm text-[11px] text-[#dfe2f1] truncate">
                {currentStock.newsCount} items ingested today
              </span>
            </div>
          </div>
        </div>

        {/* Sentiment Distribution Legend Bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#262a35]">
            <div className="h-full bg-[#56e5a9]" style={{ width: `${currentStock.sentimentDistribution.pos}%` }} />
            <div className="h-full bg-[#c0c1ff]" style={{ width: `${currentStock.sentimentDistribution.neu}%` }} />
            <div className="h-full bg-[#ffb4ab]" style={{ width: `${currentStock.sentimentDistribution.neg}%` }} />
          </div>
          <div className="flex items-center justify-between text-[#bdc8d1] pt-0.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#56e5a9] shrink-0" />
              <span className="font-data-mono-sm text-[11px]">{currentStock.sentimentDistribution.pos}% Pos</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#c0c1ff] shrink-0" />
              <span className="font-data-mono-sm text-[11px]">{currentStock.sentimentDistribution.neu}% Neu</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab] shrink-0" />
              <span className="font-data-mono-sm text-[11px]">{currentStock.sentimentDistribution.neg}% Neg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual-Axis Sentiment vs Price Correlation Chart (14-Day Trend) */}
      <div className="flex flex-col p-3.5 bg-[#1c1f2a] rounded-xl shadow-md gap-2 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider">
              Correlation Matrix
            </span>
            <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
              14D Sentiment vs Price Trend
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-data-mono-sm text-[11px] text-[#8ed5ff]">
              <span className="w-2.5 h-0.5 bg-[#8ed5ff] rounded" /> Price
            </span>
            <span className="flex items-center gap-1 font-data-mono-sm text-[11px] text-[#56e5a9]">
              <span className="w-2.5 h-0.5 bg-[#56e5a9] rounded" /> Sent
            </span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative w-full h-44 rounded-lg bg-[#171b26] p-2 overflow-hidden flex flex-col justify-between border border-[#262a35]/60">
          <div className="flex justify-between items-center text-[#bdc8d1] font-data-mono-sm text-[11px]">
            <span>{formatRupees(260)} | +0.80</span>
            <span className="text-[#56e5a9] font-medium">Peak Bullish Drift</span>
          </div>

          {/* Inline Dual-Axis SVG Curve */}
          <svg className="w-full h-28 overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 100">
            <defs>
              <linearGradient id="sentPriceGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8ed5ff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8ed5ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            <line stroke="#3e484f" strokeDasharray="2 2" strokeOpacity="0.3" x1="0" x2="320" y1="25" y2="25" />
            <line stroke="#3e484f" strokeDasharray="4 2" strokeOpacity="0.3" x1="0" x2="320" y1="50" y2="50" />
            <line stroke="#3e484f" strokeDasharray="2 2" strokeOpacity="0.3" x1="0" x2="320" y1="75" y2="75" />

            {/* Stock Price Path Fill */}
            <path
              d="M 0,70 Q 30,85 60,60 T 120,55 T 180,35 T 240,48 T 320,20 L 320,100 L 0,100 Z"
              fill="url(#sentPriceGradient)"
            />

            {/* Stock Price Line (Primary Cyan) */}
            <path
              d="M 0,70 Q 30,85 60,60 T 120,55 T 180,35 T 240,48 T 320,20"
              fill="none"
              stroke="#8ed5ff"
              strokeWidth="2"
            />

            {/* BERT Sentiment Vector (Tertiary Mint dotted overlay) */}
            <path
              d="M 0,80 Q 35,90 70,68 T 130,45 T 190,30 T 250,38 T 320,15"
              fill="none"
              stroke="#56e5a9"
              strokeDasharray="4 3"
              strokeWidth="2"
            />

            {/* Data points */}
            <circle cx="190" cy="30" r="3" fill="#56e5a9" className="animate-pulse" />
            <circle cx="320" cy="20" r="3.5" fill="#8ed5ff" stroke="#0a0e18" strokeWidth="1" />
          </svg>

          <div className="flex justify-between items-center text-[#bdc8d1] font-data-mono-sm text-[11px] pt-1">
            <span>T-14 Days</span>
            <span>T-7 Days</span>
            <span className="text-[#56e5a9] font-medium">Today (r = +0.78)</span>
          </div>
        </div>
      </div>

      {/* Source Attribution Breakdown */}
      <div className="flex flex-col p-3.5 bg-[#1c1f2a] rounded-xl shadow-md gap-2 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
            Source Attribution
          </span>
          <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
            3 Feeds Filtered
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Bloomberg & Reuters */}
          <div className="flex flex-col p-2.5 rounded-lg bg-[#262a35] gap-1.5 border border-[#313540]/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#56e5a9]">
                  feed
                </span>
                <span className="font-body-md text-[13px] text-[#dfe2f1] font-semibold">
                  Bloomberg & Reuters
                </span>
              </div>
              <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-medium">
                71% Positive
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
                44 news items verified
              </span>
              <div className="w-32 h-1.5 rounded-full bg-[#0a0e18] overflow-hidden flex">
                <div className="h-full bg-[#56e5a9]" style={{ width: '71%' }} />
                <div className="h-full bg-[#c0c1ff]" style={{ width: '20%' }} />
                <div className="h-full bg-[#ffb4ab]" style={{ width: '9%' }} />
              </div>
            </div>
          </div>

          {/* Yahoo Finance & MarketWatch */}
          <div className="flex flex-col p-2.5 rounded-lg bg-[#262a35] gap-1.5 border border-[#313540]/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#56e5a9]">
                  public
                </span>
                <span className="font-body-md text-[13px] text-[#dfe2f1] font-semibold">
                  Yahoo Finance & MarketWatch
                </span>
              </div>
              <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-medium">
                59% Positive
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
                58 items ingested
              </span>
              <div className="w-32 h-1.5 rounded-full bg-[#0a0e18] overflow-hidden flex">
                <div className="h-full bg-[#56e5a9]" style={{ width: '59%' }} />
                <div className="h-full bg-[#c0c1ff]" style={{ width: '28%' }} />
                <div className="h-full bg-[#ffb4ab]" style={{ width: '13%' }} />
              </div>
            </div>
          </div>

          {/* SEC EDGAR */}
          <div className="flex flex-col p-2.5 rounded-lg bg-[#262a35] gap-1.5 border border-[#313540]/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#c0c1ff]">
                  verified_user
                </span>
                <span className="font-body-md text-[13px] text-[#dfe2f1] font-semibold">
                  Regulatory / SEC EDGAR 8-K
                </span>
              </div>
              <span className="font-data-mono-sm text-[11px] text-[#c0c1ff] font-medium">
                Neutral Drift
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
                26 filings analyzed
              </span>
              <div className="w-32 h-1.5 rounded-full bg-[#0a0e18] overflow-hidden flex">
                <div className="h-full bg-[#56e5a9]" style={{ width: '12%' }} />
                <div className="h-full bg-[#c0c1ff]" style={{ width: '80%' }} />
                <div className="h-full bg-[#ffb4ab]" style={{ width: '8%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Headline Sentiment Inspector */}
      <div className="flex flex-col p-3.5 bg-[#1c1f2a] rounded-xl shadow-md gap-2.5 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider">
              Semantic Parse
            </span>
            <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
              Headline Inspector
            </span>
          </div>
          <span className="material-symbols-outlined text-[#8ed5ff] text-[18px]">
            manage_search
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full font-data-mono-sm text-[11px] whitespace-nowrap shadow-sm transition-all ${
              activeFilter === 'all'
                ? 'bg-[#38bdf8] text-[#001e2c] font-bold'
                : 'bg-[#262a35] text-[#dfe2f1]'
            }`}
          >
            All (128)
          </button>
          <button
            onClick={() => setActiveFilter('positive')}
            className={`px-3 py-1 rounded-full font-data-mono-sm text-[11px] whitespace-nowrap transition-all ${
              activeFilter === 'positive'
                ? 'bg-[#30c88f] text-[#003824] font-bold'
                : 'bg-[#262a35] text-[#56e5a9]'
            }`}
          >
            Positive (79)
          </button>
          <button
            onClick={() => setActiveFilter('neutral')}
            className={`px-3 py-1 rounded-full font-data-mono-sm text-[11px] whitespace-nowrap transition-all ${
              activeFilter === 'neutral'
                ? 'bg-[#c0c1ff] text-[#1000a9] font-bold'
                : 'bg-[#262a35] text-[#c0c1ff]'
            }`}
          >
            Neutral (31)
          </button>
          <button
            onClick={() => setActiveFilter('negative')}
            className={`px-3 py-1 rounded-full font-data-mono-sm text-[11px] whitespace-nowrap transition-all ${
              activeFilter === 'negative'
                ? 'bg-[#ffb4ab] text-[#690005] font-bold'
                : 'bg-[#262a35] text-[#ffb4ab]'
            }`}
          >
            Negative (18)
          </button>
        </div>

        {/* Live Test Playground Form */}
        <form onSubmit={handleAnalyzeCustom} className="flex gap-1.5 pt-1">
          <input
            type="text"
            value={customHeadline}
            onChange={(e) => setCustomHeadline(e.target.value)}
            placeholder="Type any news headline to run FinBERT parse..."
            className="flex-1 bg-[#171b26] border border-[#262a35] rounded-lg px-2.5 py-1.5 text-[12px] text-[#dfe2f1] focus:outline-none focus:border-[#38bdf8] placeholder:text-[#87929a]"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-[#262a35] hover:bg-[#313540] text-[#8ed5ff] text-[11px] font-data-mono-sm rounded-lg border border-[#313540] transition-colors"
          >
            Inspect
          </button>
        </form>

        {customAnalyzed && (
          <div className="p-2.5 rounded-lg bg-[#171b26] border border-[#38bdf8]/40 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-semibold text-[#dfe2f1]">
                Analyzed: &ldquo;{customHeadline}&rdquo;
              </span>
              <span
                className={`px-2 py-0.5 rounded font-data-mono-sm text-[11px] font-bold ${
                  customAnalyzed.score >= 0
                    ? 'bg-[#30c88f]/20 text-[#56e5a9]'
                    : 'bg-[#93000a]/30 text-[#ffb4ab]'
                }`}
              >
                {customAnalyzed.score >= 0 ? '+' : ''}{customAnalyzed.score.toFixed(2)} {customAnalyzed.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="font-label-caps text-[10px] text-[#bdc8d1]">TOKENS:</span>
              {customAnalyzed.tokens.map((t, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-[#262a35] font-data-mono-sm text-[10px] text-[#56e5a9]"
                >
                  &ldquo;{t.text}&rdquo; ({t.weight >= 0 ? '+' : ''}{t.weight})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* List of Inspectable Headlines */}
        <div className="flex flex-col gap-2 mt-1">
          {filteredNews.map((item) => {
            const isExpanded = !!expandedHeadlines[item.id];
            const isPos = item.score > 0;
            const isNeg = item.score < 0;

            return (
              <div
                key={item.id}
                className="flex flex-col p-2.5 rounded-lg bg-[#262a35] gap-2 border border-[#313540]/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-body-md text-[13px] text-[#dfe2f1] font-medium leading-snug">
                    {item.title}
                  </p>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded bg-[#1c1f2a] font-data-mono-sm text-[11px] font-semibold ${
                      isPos ? 'text-[#56e5a9]' : isNeg ? 'text-[#ffb4ab]' : 'text-[#c0c1ff]'
                    }`}
                  >
                    {item.scoreLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between font-data-mono-sm text-[11px] text-[#bdc8d1]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPos ? 'bg-[#56e5a9]' : isNeg ? 'bg-[#ffb4ab]' : 'bg-[#c0c1ff]'
                      }`}
                    />
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.timeAgo}</span>
                  </div>

                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-[#8ed5ff] flex items-center gap-0.5 text-[11px] font-semibold hover:underline"
                  >
                    Tokenized{' '}
                    <span className="material-symbols-outlined text-[14px]">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>

                {/* Token Visual Breakdown Drawer */}
                {isExpanded && item.tokens && (
                  <div className="p-2 rounded bg-[#0a0e18] flex flex-wrap gap-1.5 items-center border border-[#262a35]">
                    <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase mr-1">
                      Extracted Tokens:
                    </span>
                    {item.tokens.map((token, idx) => (
                      <span
                        key={idx}
                        className={`font-data-mono-sm text-[11px] px-1.5 py-0.5 rounded bg-[#262a35] ${
                          token.weight > 0
                            ? 'text-[#56e5a9]'
                            : token.weight < 0
                            ? 'text-[#ffb4ab]'
                            : 'text-[#bdc8d1]'
                        }`}
                      >
                        {token.text} ({token.weight >= 0 ? '+' : ''}{token.weight.toFixed(2)})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset 2: NLP Pipeline Architecture Card */}
      <div className="flex flex-col p-3.5 bg-[#1c1f2a] rounded-xl shadow-md gap-2 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8ed5ff] text-[20px]">
              account_tree
            </span>
            <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
              Inference Pipeline
            </span>
          </div>
          <span className="font-data-mono-sm text-[11px] text-[#8ed5ff]">
            BERT-Large-uncased
          </span>
        </div>

        {/* Illustrated Visual Architecture Flow */}
        <div className="grid grid-cols-4 gap-1.5 py-2">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-2 rounded-lg bg-[#262a35] border border-[#313540]/40">
            <span className="material-symbols-outlined text-[#8ed5ff] text-[18px] mb-1">
              splitscreen
            </span>
            <span className="font-label-caps text-[10px] text-[#dfe2f1] font-semibold">
              1. Tokenize
            </span>
            <span className="font-data-mono-sm text-[9px] text-[#bdc8d1] mt-0.5">
              Subwords
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-2 rounded-lg bg-[#262a35] border border-[#313540]/40">
            <span className="material-symbols-outlined text-[#c0c1ff] text-[18px] mb-1">
              filter_alt
            </span>
            <span className="font-label-caps text-[10px] text-[#dfe2f1] font-semibold">
              2. Clean
            </span>
            <span className="font-data-mono-sm text-[9px] text-[#bdc8d1] mt-0.5">
              Keep Lexicon
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-2 rounded-lg bg-[#262a35] border border-[#313540]/40">
            <span className="material-symbols-outlined text-[#56e5a9] text-[18px] mb-1">
              model_training
            </span>
            <span className="font-label-caps text-[10px] text-[#dfe2f1] font-semibold">
              3. FinBERT
            </span>
            <span className="font-data-mono-sm text-[9px] text-[#bdc8d1] mt-0.5">
              VADER Weights
            </span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-2 rounded-lg bg-[#262a35] border border-[#313540]/40">
            <span className="material-symbols-outlined text-[#8ed5ff] text-[18px] mb-1">
              stacked_line_chart
            </span>
            <span className="font-label-caps text-[10px] text-[#dfe2f1] font-semibold">
              4. Aggregate
            </span>
            <span className="font-data-mono-sm text-[9px] text-[#bdc8d1] mt-0.5">
              Score Drift
            </span>
          </div>
        </div>

        {/* Asset 3: Server Ingestion Room Context */}
        <div className="relative w-full h-24 rounded-lg overflow-hidden flex items-center p-3 bg-[#262a35] shadow-inner border border-[#313540]/60">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqPR_sIkvYskEkd19YnCs21tUB4fXvwC3RWYkqh1fXb78hYNOaqwZ3H__z6nfH-77V7vGZmSR5UJTuOeFxQlAunE4Hd5TsvB-L31YC5vHhmxqyd-t2i3Jfb4SozT5mJ3FPbDnflJe-fN5CknqFn7JpVpM9OEU8l1Nxc_FEAvk912eKuI5IKMzl66F7gG53qbEwr-t8V4PPzRQsZCRHEitpl1rJSX_0HGz4qyL8mSlntu67qwYk2tWeog')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#262a35] via-[#262a35]/70 to-transparent" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8ed5ff]/20 flex items-center justify-center text-[#8ed5ff] shrink-0">
              <span className="material-symbols-outlined text-[18px]">memory</span>
            </div>
            <div className="flex flex-col">
              <span className="font-data-mono-sm text-[11px] text-[#dfe2f1] font-semibold">
                Domain-Specific Financial Corpus
              </span>
              <span className="font-body-sm text-[12px] text-[#bdc8d1]">
                Preserves terms like &apos;bullish call spread&apos; without aggressive stopword clipping.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Disclaimer Box */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#262a35] text-[#bdc8d1] shadow-sm border border-[#313540]/60">
        <span className="material-symbols-outlined text-[#c0c1ff] text-[18px] shrink-0 mt-0.5">
          info
        </span>
        <p className="font-body-sm text-[12px] leading-relaxed">
          <strong className="text-[#dfe2f1]">Educational note:</strong> Sentiment indicates public market perception and does not imply direct causation or price guarantees. Model signals update continuously alongside exchange feed availability.
        </p>
      </div>
    </div>
  );
};
