import React, { useState } from 'react';

interface CustomRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (start: string, end: string) => void;
}

export const CustomRangeModal: React.FC<CustomRangeModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-11-20');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(startDate, endDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e18]/80 backdrop-blur-sm flex items-end justify-center p-4">
      <div className="w-full max-w-md bg-[#1c1f2a] rounded-xl p-4 space-y-3 shadow-2xl border border-[#262a35]">
        <div className="flex items-center justify-between border-none">
          <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
            Custom Time Horizon
          </span>
          <button
            onClick={onClose}
            className="text-[#bdc8d1] hover:text-[#dfe2f1] p-1 rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-[12px] text-[#bdc8d1]">
          Select custom historical analysis interval for algorithmic backtesting.
        </p>

        <form onSubmit={handleSubmit} className="space-y-2 pt-1">
          <div className="flex justify-between items-center bg-[#262a35] p-2 rounded border border-[#313540]/60">
            <span className="font-data-mono-sm text-[11px] text-[#dfe2f1]">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent font-data-mono-sm text-[11px] text-[#8ed5ff] text-right focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center bg-[#262a35] p-2 rounded border border-[#313540]/60">
            <span className="font-data-mono-sm text-[11px] text-[#dfe2f1]">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent font-data-mono-sm text-[11px] text-[#8ed5ff] text-right focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#38bdf8] text-[#001e2c] font-data-mono-md text-[13px] font-bold rounded-lg mt-2 active:scale-95 transition-transform hover:bg-[#8ed5ff] shadow-md"
          >
            Apply Horizon
          </button>
        </form>
      </div>
    </div>
  );
};
