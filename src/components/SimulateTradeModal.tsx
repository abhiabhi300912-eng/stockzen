import React, { useState, useEffect } from 'react';
import { StockInfo } from '../types';
import { formatRupees } from '../utils/currency';

interface SimulateTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'BUY' | 'SELL';
  stock: StockInfo;
  availableCash: number;
  currentShares: number;
  onExecuteTrade: (ticker: string, type: 'BUY' | 'SELL', shares: number, price: number) => void;
}

export const SimulateTradeModal: React.FC<SimulateTradeModalProps> = ({
  isOpen,
  onClose,
  type,
  stock,
  availableCash,
  currentShares,
  onExecuteTrade,
}) => {
  // Input mode: 'RUPEES' (Value in ₹) or 'SHARES' (Quantity)
  const [inputMode, setInputMode] = useState<'RUPEES' | 'SHARES'>('RUPEES');
  const [rupeeAmount, setRupeeAmount] = useState<number>(Math.round(stock.price * 10));
  const [shares, setShares] = useState<number>(10);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync rupeeAmount and shares when mode or stock changes
  useEffect(() => {
    if (stock && stock.price > 0) {
      if (inputMode === 'RUPEES') {
        const computedShares = Math.max(1, Math.floor(rupeeAmount / stock.price));
        setShares(computedShares);
      } else {
        const computedRupees = Math.round(shares * stock.price);
        setRupeeAmount(computedRupees);
      }
    }
  }, [stock.ticker]);

  if (!isOpen) return null;

  // When rupee amount changes
  const handleRupeeChange = (val: number) => {
    const validVal = Math.max(0, val);
    setRupeeAmount(validVal);
    const computedShares = Math.max(1, Math.floor(validVal / stock.price));
    setShares(computedShares);
  };

  // When shares change
  const handleSharesChange = (val: number) => {
    const validShares = Math.max(1, val);
    setShares(validShares);
    const computedRupees = Math.round(validShares * stock.price);
    setRupeeAmount(computedRupees);
  };

  const totalCost = shares * stock.price;
  const canAfford = type === 'BUY' ? availableCash >= totalCost : currentShares >= shares;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0 || !canAfford) return;

    onExecuteTrade(stock.ticker, type, shares, stock.price);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e18]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#1c1f2a] rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#262a35] space-y-3.5 relative animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#262a35] pb-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2 rounded-xl flex items-center justify-center ${
                type === 'BUY' ? 'bg-[#30c88f]/20 text-[#56e5a9]' : 'bg-[#93000a]/20 text-[#ffb4ab]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {type === 'BUY' ? 'add_circle' : 'remove_circle'}
              </span>
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
                  Simulate {type === 'BUY' ? 'Buy Order' : 'Sell Order'}
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-[#38bdf8]/15 text-[#8ed5ff] font-data-mono-sm text-[9px] font-bold border border-[#38bdf8]/30">
                  IN RUPEES (₹)
                </span>
              </div>
              <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
                {stock.ticker} • {stock.name} • {formatRupees(stock.price)} / share
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#bdc8d1] hover:text-[#dfe2f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2.5 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-[#30c88f]/20 border border-[#56e5a9]/50 flex items-center justify-center text-[#56e5a9]">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <p className="font-headline-sm text-[18px] text-[#56e5a9] font-bold">
              Order Executed Successfully
            </p>
            <p className="font-data-mono-md text-[14px] text-[#dfe2f1]">
              {shares} shares of {stock.ticker} @ {formatRupees(stock.price)}
            </p>
            <p className="font-data-mono-sm text-[12px] text-[#8ed5ff]">
              Total Value: <span className="font-bold">{formatRupees(totalCost)}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Input Preference: Value in Rupees vs Number of Shares */}
            <div className="space-y-1">
              <label className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold flex justify-between">
                <span>ORDER INPUT MODE:</span>
                <span className="text-[#38bdf8] lowercase font-normal">choose form input unit</span>
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#171b26] rounded-xl border border-[#262a35]">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('RUPEES');
                    setRupeeAmount(Math.round(shares * stock.price));
                  }}
                  className={`py-1.5 font-data-mono-sm text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    inputMode === 'RUPEES'
                      ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                      : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
                  }`}
                >
                  <span className="font-bold text-[13px]">₹</span>
                  <span>Value in Rupees</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('SHARES');
                  }}
                  className={`py-1.5 font-data-mono-sm text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    inputMode === 'SHARES'
                      ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                      : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
                  <span>Number of Shares</span>
                </button>
              </div>
            </div>

            {/* Order Execution Type (Market vs Limit) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#171b26] rounded-xl border border-[#262a35]">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`py-1.5 font-data-mono-sm text-[11px] rounded-lg transition-all ${
                  orderType === 'MARKET'
                    ? 'bg-[#262a35] text-[#8ed5ff] font-bold'
                    : 'text-[#bdc8d1]'
                }`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`py-1.5 font-data-mono-sm text-[11px] rounded-lg transition-all ${
                  orderType === 'LIMIT'
                    ? 'bg-[#262a35] text-[#8ed5ff] font-bold'
                    : 'text-[#bdc8d1]'
                }`}
              >
                Limit Order
              </button>
            </div>

            {/* PRIMARY FORM INPUT: IN RUPEES MODE */}
            {inputMode === 'RUPEES' ? (
              <div className="space-y-1.5 bg-[#171b26] p-3 rounded-xl border border-[#38bdf8]/30">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold flex items-center gap-1">
                    <span className="text-[#38bdf8] text-[13px] font-bold">₹</span>
                    <span>Order Value in Rupees:</span>
                  </label>
                  <span className="font-data-mono-sm text-[11px] text-[#8ed5ff]">
                    ≈ {shares} shares
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#38bdf8] font-bold text-[18px]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    max="10000000"
                    value={rupeeAmount}
                    onChange={(e) => handleRupeeChange(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount in Rupees"
                    className="w-full bg-[#1c1f2a] text-[#dfe2f1] font-data-mono-lg text-[16px] font-bold pl-9 pr-3 py-2.5 rounded-lg border border-[#262a35] focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                {/* Quick Rupees Buttons in ₹ */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[1000, 5000, 10000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleRupeeChange(amt)}
                      className={`py-1 rounded bg-[#262a35] hover:bg-[#313540] text-[10px] font-data-mono-sm transition-colors border border-[#313540] ${
                        rupeeAmount === amt ? 'border-[#38bdf8] text-[#8ed5ff] font-bold' : 'text-[#bdc8d1]'
                      }`}
                    >
                      {formatRupees(amt, { decimals: 0 })}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[50000, 100000, Math.floor(availableCash)].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRupeeChange(amt)}
                      className="py-1 rounded bg-[#262a35] hover:bg-[#313540] text-[10px] font-data-mono-sm text-[#bdc8d1] transition-colors border border-[#313540]"
                    >
                      {idx === 2 ? 'All Cash' : formatRupees(amt, { decimals: 0 })}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ALTERNATIVE FORM INPUT: IN SHARES MODE */
              <div className="space-y-1.5 bg-[#171b26] p-3 rounded-xl border border-[#262a35]">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold">
                    Number of Shares:
                  </label>
                  <span className="font-data-mono-sm text-[11px] text-[#8ed5ff]">
                    Value: {formatRupees(totalCost)}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={shares}
                    onChange={(e) => handleSharesChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1c1f2a] text-[#dfe2f1] font-data-mono-md text-[15px] px-3 py-2 rounded-lg border border-[#262a35] focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                {/* Quick Shares Chips */}
                <div className="flex gap-1.5 pt-1">
                  {[5, 10, 25, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleSharesChange(count)}
                      className={`flex-1 py-1 rounded bg-[#262a35] hover:bg-[#313540] font-data-mono-sm text-[10px] ${
                        shares === count ? 'border border-[#38bdf8] text-[#8ed5ff] font-bold' : 'text-[#bdc8d1]'
                      }`}
                    >
                      +{count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calculations Breakdown in RUPEES */}
            <div className="bg-[#171b26] p-3 rounded-xl space-y-1.5 font-data-mono-sm text-[11px] border border-[#262a35]">
              <div className="flex justify-between text-[#bdc8d1]">
                <span>Unit Share Price:</span>
                <span className="text-[#dfe2f1] font-semibold">{formatRupees(stock.price)}</span>
              </div>
              <div className="flex justify-between text-[#bdc8d1]">
                <span>Allocated Shares:</span>
                <span className="text-[#dfe2f1] font-bold">{shares} Shares</span>
              </div>
              <div className="flex justify-between text-[#bdc8d1] pt-0.5 border-t border-[#262a35]">
                <span className="text-[#dfe2f1] font-bold">Total Order Value:</span>
                <span className="text-[#38bdf8] font-bold text-[13px]">{formatRupees(totalCost)}</span>
              </div>
              <div className="flex justify-between text-[#bdc8d1]">
                <span>Available Cash:</span>
                <span className="text-[#56e5a9] font-medium">{formatRupees(availableCash)}</span>
              </div>
              <div className="flex justify-between text-[#bdc8d1]">
                <span>Est. Balance After Order:</span>
                <span className={type === 'BUY' ? 'text-[#dfe2f1]' : 'text-[#56e5a9]'}>
                  {formatRupees(type === 'BUY' ? availableCash - totalCost : availableCash + totalCost)}
                </span>
              </div>
              <div className="flex justify-between text-[#bdc8d1]">
                <span>Current Holdings:</span>
                <span className="text-[#dfe2f1]">{currentShares} shares</span>
              </div>
            </div>

            {!canAfford && (
              <div className="p-2 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/40 text-[11px] font-data-mono-sm text-[#ffb4ab]">
                {type === 'BUY'
                  ? `Insufficient cash. Need ${formatRupees(totalCost)}, available ${formatRupees(availableCash)}.`
                  : `Insufficient shares. You only own ${currentShares} shares.`}
              </div>
            )}

            {/* Submit CTA with Rupee Value */}
            <button
              type="submit"
              disabled={!canAfford || shares <= 0}
              className={`w-full py-2.5 font-headline-sm text-[14px] font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                type === 'BUY'
                  ? 'bg-[#30c88f] hover:bg-[#56e5a9] text-[#003824] disabled:opacity-40'
                  : 'bg-[#93000a] hover:bg-[#ffb4ab] hover:text-[#000] text-[#ffdad6] disabled:opacity-40'
              }`}
            >
              <span>Confirm {type === 'BUY' ? 'Buy' : 'Sell'} for</span>
              <span className="underline decoration-current">{formatRupees(totalCost)}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
