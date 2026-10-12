import React, { useState } from 'react';

export const ModelsView: React.FC = () => {
  const [rfWeight, setRfWeight] = useState(30);
  const [svmWeight, setSvmWeight] = useState(25);
  const [lstmWeight, setLstmWeight] = useState(45);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [metrics, setMetrics] = useState({
    sharpe: 1.84,
    cumulativeReturn: 48.6,
    maxDrawdown: -11.2,
    winRate: 63.8,
  });

  const handleTune = () => {
    setIsReevaluating(true);
    setTimeout(() => {
      setIsReevaluating(false);
      // Recalculate metrics based on new weights
      const total = rfWeight + svmWeight + lstmWeight;
      const normalizedLstm = lstmWeight / total;
      const newSharpe = parseFloat((1.6 + normalizedLstm * 0.5).toFixed(2));
      const newReturn = parseFloat((42 + normalizedLstm * 14).toFixed(1));

      setMetrics({
        sharpe: newSharpe,
        cumulativeReturn: newReturn,
        maxDrawdown: -10.8,
        winRate: parseFloat((61 + normalizedLstm * 5).toFixed(1)),
      });
    }, 600);
  };

  const featureRanking = [
    { name: 'RSI (14-period Oscillator)', importance: 0.28, color: '#56e5a9' },
    { name: 'FinBERT 24h Sentiment Drift', importance: 0.24, color: '#8ed5ff' },
    { name: 'MACD Histogram Convergence', importance: 0.18, color: '#56e5a9' },
    { name: 'Rolling 20-Day Volatility Z-Score', importance: 0.14, color: '#c0c1ff' },
    { name: 'Bid-Ask Microstructure Imbalance', importance: 0.10, color: '#38bdf8' },
    { name: '5-Day Cumulative Return Momentum', importance: 0.06, color: '#bdc8d1' },
  ];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 pb-8 space-y-3">
      {/* Header Banner */}
      <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md border border-[#262a35]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8ed5ff] text-[20px]">
              hub
            </span>
            <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold">
              Quantitative Architecture & Zoo
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#262a35] text-[#56e5a9] font-data-mono-sm text-[11px] font-semibold">
            ENSEMBLE v4.2
          </span>
        </div>
        <p className="font-body-sm text-[12px] text-[#bdc8d1] mt-1">
          Multi-paradigm algorithmic synthesis combining Decision Trees, Kernel Classifiers, and Recurrent Neural Networks.
        </p>
      </div>

      {/* Backtest Benchmark Performance */}
      <div className="flex flex-col bg-[#1c1f2a] rounded-xl p-3.5 shadow-md space-y-3 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider font-bold">
            HISTORICAL BACKTEST MATRIX (2020-2024 EVALUATION)
          </span>
          <span className="font-data-mono-sm text-[11px] text-[#56e5a9]">HELD-OUT TEST</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-[#262a35] border border-[#313540]/40 flex flex-col">
            <span className="font-label-caps text-[10px] text-[#bdc8d1]">CUMULATIVE RETURN</span>
            <span className="font-data-mono-lg text-[22px] text-[#56e5a9] font-bold">
              +{metrics.cumulativeReturn}%
            </span>
            <span className="font-data-mono-sm text-[10px] text-[#bdc8d1] mt-0.5">
              vs S&P 500 (+18.2%)
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#262a35] border border-[#313540]/40 flex flex-col">
            <span className="font-label-caps text-[10px] text-[#bdc8d1]">SHARPE RATIO</span>
            <span className="font-data-mono-lg text-[22px] text-[#8ed5ff] font-bold">
              {metrics.sharpe}
            </span>
            <span className="font-data-mono-sm text-[10px] text-[#bdc8d1] mt-0.5">
              Risk-Adjusted Alpha
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#262a35] border border-[#313540]/40 flex flex-col">
            <span className="font-label-caps text-[10px] text-[#bdc8d1]">MAX DRAWDOWN</span>
            <span className="font-data-mono-lg text-[22px] text-[#ffb4ab] font-bold">
              {metrics.maxDrawdown}%
            </span>
            <span className="font-data-mono-sm text-[10px] text-[#bdc8d1] mt-0.5">
              Strict Risk Floor
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#262a35] border border-[#313540]/40 flex flex-col">
            <span className="font-label-caps text-[10px] text-[#bdc8d1]">DIRECTIONAL WIN RATE</span>
            <span className="font-data-mono-lg text-[22px] text-[#56e5a9] font-bold">
              {metrics.winRate}%
            </span>
            <span className="font-data-mono-sm text-[10px] text-[#bdc8d1] mt-0.5">
              Directional Hits
            </span>
          </div>
        </div>
      </div>

      {/* Ensemble Weighting Tuner */}
      <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-3 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#8ed5ff] text-[18px]">tune</span>
            <span className="font-label-caps text-[10px] text-[#dfe2f1] uppercase tracking-wider font-bold">
              ENSEMBLE VOTING WEIGHTS
            </span>
          </div>
          <button
            onClick={handleTune}
            disabled={isReevaluating}
            className="px-2.5 py-1 rounded bg-[#38bdf8] text-[#001e2c] font-data-mono-sm text-[11px] font-bold hover:bg-[#8ed5ff] active:scale-95 transition-all shadow-sm flex items-center gap-1"
          >
            {isReevaluating ? (
              <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
            ) : null}
            <span>Re-evaluate</span>
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex justify-between items-center font-data-mono-sm text-[11px] mb-1">
              <span className="text-[#dfe2f1]">Random Forest Classifier (M1)</span>
              <span className="text-[#c0c1ff] font-bold">{rfWeight}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={rfWeight}
              onChange={(e) => setRfWeight(parseInt(e.target.value))}
              className="w-full accent-[#c0c1ff] h-1.5 bg-[#262a35] rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center font-data-mono-sm text-[11px] mb-1">
              <span className="text-[#dfe2f1]">Support Vector Machine (M2)</span>
              <span className="text-[#8ed5ff] font-bold">{svmWeight}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={svmWeight}
              onChange={(e) => setSvmWeight(parseInt(e.target.value))}
              className="w-full accent-[#8ed5ff] h-1.5 bg-[#262a35] rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center font-data-mono-sm text-[11px] mb-1">
              <span className="text-[#dfe2f1]">Deep Bi-LSTM Recurrent Net (M3)</span>
              <span className="text-[#56e5a9] font-bold">{lstmWeight}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={lstmWeight}
              onChange={(e) => setLstmWeight(parseInt(e.target.value))}
              className="w-full accent-[#56e5a9] h-1.5 bg-[#262a35] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Feature Importance Ranking */}
      <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-2.5 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider font-bold">
            SHAP / GINI FEATURE IMPORTANCE
          </span>
          <span className="font-data-mono-sm text-[11px] text-[#8ed5ff]">Top 6 Indicators</span>
        </div>

        <div className="space-y-2">
          {featureRanking.map((feat) => (
            <div key={feat.name} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center font-body-sm text-[12px]">
                <span className="text-[#dfe2f1]">{feat.name}</span>
                <span className="font-data-mono-sm text-[11px] font-bold" style={{ color: feat.color }}>
                  {(feat.importance * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#262a35] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${feat.importance * 100 * 2.8}%`, backgroundColor: feat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confusion Matrix Modal Preview */}
      <div className="flex flex-col bg-[#171b26] rounded-xl p-3.5 shadow-md space-y-2 border border-[#262a35]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase tracking-wider font-bold">
            CONFUSION MATRIX (OUT-OF-SAMPLE)
          </span>
          <span className="font-data-mono-sm text-[11px] text-[#56e5a9]">N = 1,240 SESSIONS</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center font-data-mono-sm text-[11px] pt-1">
          <div className="p-2.5 rounded bg-[#30c88f]/15 border border-[#30c88f]/30">
            <span className="text-[#56e5a9] font-bold text-[14px]">512</span>
            <span className="block text-[#bdc8d1] text-[10px] mt-0.5">True Positive (Up)</span>
          </div>
          <div className="p-2.5 rounded bg-[#93000a]/20 border border-[#ffb4ab]/30">
            <span className="text-[#ffb4ab] font-bold text-[14px]">142</span>
            <span className="block text-[#bdc8d1] text-[10px] mt-0.5">False Positive</span>
          </div>
          <div className="p-2.5 rounded bg-[#93000a]/20 border border-[#ffb4ab]/30">
            <span className="text-[#ffb4ab] font-bold text-[14px]">118</span>
            <span className="block text-[#bdc8d1] text-[10px] mt-0.5">False Negative</span>
          </div>
          <div className="p-2.5 rounded bg-[#30c88f]/15 border border-[#30c88f]/30">
            <span className="text-[#56e5a9] font-bold text-[14px]">468</span>
            <span className="block text-[#bdc8d1] text-[10px] mt-0.5">True Negative (Down)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
