import React, { useState, useMemo } from 'react';
import { searchStocks, STOCK_UNIVERSE, UniverseStock } from '../data/stocksUniverse';
import { formatRupees } from '../utils/currency';

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ticker: string) => void;
}

export const SymbolSearchModal: React.FC<SymbolSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');

  const sectors = [
    'ALL',
    'Technology',
    'Healthcare',
    'Financial Services',
    'Consumer Cyclical',
    'Energy',
    'Industrials',
    'ETF',
  ];

  const results = useMemo(() => {
    return searchStocks(query, selectedSector, 60);
  }, [query, selectedSector]);

  if (!isOpen) return null;

  const popularPicks = ['NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD', 'PLTR', 'ARM', 'SMCI', 'COIN'];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e18]/85 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl bg-[#1c1f2a] rounded-2xl p-4 shadow-2xl border border-[#262a35] space-y-3 mt-8 sm:mt-0 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#262a35] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8ed5ff] text-[22px]">
              travel_explore
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
                  StockZen Stock Universe
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#30c88f]/20 text-[#56e5a9] font-data-mono-sm text-[10px] font-bold">
                  5,200+ STOCKS
                </span>
              </div>
              <p className="font-body-sm text-[11px] text-[#bdc8d1]">
                Search all NYSE, NASDAQ, Russell & AMEX equities in real time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#bdc8d1] hover:text-[#dfe2f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#bdc8d1] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type ticker or company (e.g., NVDA, PLTR, Apple, Biotech)..."
            autoFocus
            className="w-full bg-[#171b26] text-[#dfe2f1] pl-9 pr-8 py-2 rounded-lg text-[13px] border border-[#262a35] focus:outline-none focus:border-[#38bdf8] placeholder:text-[#87929a] font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-2.5 text-[#87929a] hover:text-[#dfe2f1]"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-data-mono-sm whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                  : 'bg-[#262a35] text-[#bdc8d1] hover:text-[#dfe2f1]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Popular marquee chips */}
        {!query && selectedSector === 'ALL' && (
          <div className="space-y-1">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-semibold">
              TRENDING / HIGH VOLUME:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularPicks.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onSelect(t);
                    onClose();
                  }}
                  className="px-2 py-0.5 rounded bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] font-data-mono-sm text-[11px] font-semibold transition-colors border border-[#313540]/40"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock List Results View */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-72">
          {results.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <span className="material-symbols-outlined text-[#87929a] text-[32px]">
                sentiment_dissatisfied
              </span>
              <p className="font-data-mono-sm text-[12px] text-[#bdc8d1]">
                No stocks found matching &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : (
            results.map((stock: UniverseStock) => (
              <button
                key={stock.ticker}
                onClick={() => {
                  onSelect(stock.ticker);
                  onClose();
                }}
                className="w-full p-2.5 rounded-lg bg-[#171b26] hover:bg-[#262a35] transition-colors flex items-center justify-between text-left border border-[#262a35]/60 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded bg-[#262a35] group-hover:bg-[#313540] flex items-center justify-center font-data-mono-md text-[12px] font-bold text-[#8ed5ff] shrink-0 border border-[#313540]/40">
                    {stock.ticker.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-data-mono-sm text-[12px] font-bold text-[#dfe2f1]">
                        {stock.ticker}
                      </span>
                      <span className="font-label-caps text-[9px] text-[#bdc8d1] px-1 py-0.2 rounded bg-[#262a35]">
                        {stock.exchange}
                      </span>
                      <span className="font-label-caps text-[9px] text-[#56e5a9] px-1 py-0.2 rounded bg-[#56e5a9]/10">
                        {stock.sector}
                      </span>
                    </div>
                    <span className="font-body-sm text-[11px] text-[#bdc8d1] block truncate max-w-[240px]">
                      {stock.name}
                    </span>
                  </div>
                </div>

                <div className="text-right font-data-mono-sm text-[11px] shrink-0 ml-2">
                  <span className="text-[#dfe2f1] font-semibold">{formatRupees(stock.price)}</span>
                  <span className="block font-medium text-[#56e5a9]">
                    Select &rarr;
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer info badge */}
        <div className="flex justify-between items-center pt-2 border-t border-[#262a35] text-[#bdc8d1] font-data-mono-sm text-[10px]">
          <span>Index: 5,200 Active Tickers</span>
          <span>Latency: ~1.2ms local engine</span>
        </div>
      </div>
    </div>
  );
};
