import React, { useState } from 'react';
import { StockInfo } from '../types';
import { STOCK_DATABASE } from '../data/mockData';
import { formatRupees } from '../utils/currency';

interface SignalsViewProps {
  currentStock: StockInfo;
  onSelectStock: (ticker: string) => void;
  onOpenSymbolSearch: () => void;
}

export const SignalsView: React.FC<SignalsViewProps> = ({
  currentStock,
  onSelectStock,
  onOpenSymbolSearch,
}) => {
  const [horizon, setHorizon] = useState<'T1' | 'T3' | 'T5'>('T1');
  const [isInferring, setIsInferring] = useState(false);
  const [btnText, setBtnText] = useState('Run Neural Ensemble Inference');
  const [latency, setLatency] = useState(142);
  const [agreement, setAgreement] = useState(94.8);
  const [probs, setProbs] = useState({
    upward: 76.5,
    neutral: 15.2,
    downward: 8.3,
  });

  const handleRunInference = () => {
    setIsInferring(true);
    setBtnText('Executing Monte-Carlo Pass...');

    setTimeout(() => {
      setIsInferring(false);
      setBtnText('Ensemble Re-converged');
      const newLatency = Math.floor(110 + Math.random() * 45);
      setLatency(newLatency);

      // Jitter probability slightly to simulate fresh convergence
      const delta = (Math.random() * 2) - 1;
      const newUp = Math.min(88, Math.max(65, 76.5 + delta));
      const newNeu = Math.max(8, 15.2 - (delta * 0.6));
      const newDown = Math.max(4, 100 - newUp - newNeu);

      setProbs({
        upward: parseFloat(newUp.toFixed(1)),
        neutral: parseFloat(newNeu.toFixed(1)),
        downward: parseFloat(newDown.toFixed(1)),
      });
      setAgreement(parseFloat((92 + Math.random() * 5).toFixed(1)));

      setTimeout(() => {
        setBtnText('Run Neural Ensemble Inference');
      }, 2500);
    }, 900);
  };

  const peerList = [
    { ticker: 'MSFT', price: 448.20 },
    { ticker: 'AAPL', price: 214.15 },
    { ticker: 'AMD', price: 156.90 },
  ];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 pb-8 space-y-3">
      {/* Stock Selector Header Card */}
      <section className="bg-[#171b26] rounded-xl p-3.5 flex flex-col gap-2 shadow-sm border border-[#262a35] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#8ed5ff]">hub</span>
            ACTIVE TARGET TELEMETRY
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#262a35] text-[#56e5a9] font-data-mono-sm text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#56e5a9] animate-ping" />
            REALTIME SYNC
          </span>
        </div>

        <div className="flex items-center justify-between bg-[#1c1f2a] p-2.5 rounded-lg border border-[#262a35]/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#262a35] flex items-center justify-center shrink-0 text-[#8ed5ff] font-data-mono-lg text-[20px] font-bold">
              {currentStock.ticker.slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-[16px] text-[#dfe2f1] font-bold truncate">
                  {currentStock.ticker}
                </span>
                <span className="font-body-sm text-[12px] text-[#bdc8d1] truncate">
                  {currentStock.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-data-mono-md text-[13px]">
                <span className="text-[#dfe2f1] font-semibold">{formatRupees(currentStock.price)}</span>
                <span className="text-[#56e5a9] flex items-center font-data-mono-sm text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span>
                  +{currentStock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenSymbolSearch}
            className="h-9 px-2.5 rounded-lg bg-[#262a35] hover:bg-[#313540] active:scale-95 transition-all flex items-center gap-1 text-[#bdc8d1] hover:text-[#dfe2f1] border border-[#313540]/60"
          >
            <span className="font-label-caps text-[10px] uppercase font-bold">CHANGE</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>

        {/* Quick Ticker Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="font-label-caps text-[10px] text-[#bdc8d1]/70 shrink-0 mr-1">PEERS:</span>
          {peerList.map((peer) => (
            <button
              key={peer.ticker}
              onClick={() => {
                if (STOCK_DATABASE[peer.ticker]) {
                  onSelectStock(peer.ticker);
                }
              }}
              className="px-2 py-0.5 rounded-md bg-[#1c1f2a] text-[#bdc8d1] font-data-mono-sm text-[11px] hover:text-[#dfe2f1] border border-[#262a35]/40"
            >
              {peer.ticker} {formatRupees(peer.price)}
            </button>
          ))}
        </div>
      </section>

      {/* Horizon Segment Control & Inference CTA */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <label className="font-label-caps text-[10px] text-[#bdc8d1]">FORECAST HORIZON</label>
          <span className="font-data-mono-sm text-[11px] text-[#8ed5ff]">SLIDING WINDOW: 60D</span>
        </div>

        <div className="grid grid-cols-3 p-1 rounded-xl bg-[#171b26] gap-1 border border-[#262a35]">
          <button
            onClick={() => setHorizon('T1')}
            className={`py-2 px-1 rounded-lg text-center font-data-mono-sm text-[11px] transition-all ${
              horizon === 'T1'
                ? 'bg-[#262a35] text-[#8ed5ff] font-semibold shadow-sm border border-[#313540]'
                : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
            }`}
          >
            Next Day
            <br />
            <span className="opacity-70 text-[10px]">(T+1)</span>
          </button>
          <button
            onClick={() => setHorizon('T3')}
            className={`py-2 px-1 rounded-lg text-center font-data-mono-sm text-[11px] transition-all ${
              horizon === 'T3'
                ? 'bg-[#262a35] text-[#8ed5ff] font-semibold shadow-sm border border-[#313540]'
                : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
            }`}
          >
            3-Day
            <br />
            <span className="opacity-70 text-[10px]">(T+3)</span>
          </button>
          <button
            onClick={() => setHorizon('T5')}
            className={`py-2 px-1 rounded-lg text-center font-data-mono-sm text-[11px] transition-all ${
              horizon === 'T5'
                ? 'bg-[#262a35] text-[#8ed5ff] font-semibold shadow-sm border border-[#313540]'
                : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
            }`}
          >
            1-Week
            <br />
            <span className="opacity-70 text-[10px]">(T+5)</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunInference}
          disabled={isInferring}
          className="relative w-full h-12 rounded-xl bg-[#38bdf8] text-[#001e2c] flex items-center justify-center gap-2 font-headline-sm text-[16px] tracking-tight active:scale-[0.98] transition-transform shadow-lg shadow-[#38bdf8]/20 overflow-hidden font-bold"
        >
          {isInferring ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          )}
          <span>{btnText}</span>
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent ${
              isInferring ? 'animate-pulse' : ''
            }`}
          />
        </button>

        <div className="flex items-center justify-between text-[#bdc8d1] font-data-mono-sm text-[11px] px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#56e5a9]" />
            Cluster: GPU-NODE-03 (Warm)
          </span>
          <span>Latency: {latency}ms</span>
        </div>
      </section>

      {/* Primary Prediction Output Card */}
      <section className="bg-[#1c1f2a] rounded-xl p-3.5 flex flex-col gap-3 shadow-md relative overflow-hidden border border-[#262a35]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#56e5a9] text-[20px]">
              psychology
            </span>
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase font-bold">
              ENSEMBLE CONSENSUS
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#262a35] text-[#56e5a9] font-data-mono-sm text-[11px]">
            {agreement.toFixed(1)}% Agreement
          </span>
        </div>

        {/* Directional Outcome Banner */}
        <div className="bg-[#262a35] rounded-xl p-3 flex items-center justify-between border border-[#313540]/60">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] text-[#56e5a9] tracking-wider uppercase font-bold">
              PROJECTED DIRECTION
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-headline-lg-mobile text-[20px] text-[#56e5a9] font-bold">
                UPWARD TREND
              </span>
            </div>
            <span className="font-body-sm text-[12px] text-[#bdc8d1] mt-0.5">
              High confidence vector convergence
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#56e5a9]/15 flex items-center justify-center text-[#56e5a9]">
            <span className="material-symbols-outlined text-[32px]">trending_up</span>
          </div>
        </div>

        {/* Probability Distribution Bar Stack */}
        <div className="flex flex-col gap-1.5 bg-[#0a0e18]/70 p-2.5 rounded-lg border border-[#262a35]/60">
          <div className="flex items-center justify-between font-label-caps text-[10px] text-[#bdc8d1]">
            <span>CALIBRATED PROBABILITY DISTRIBUTION</span>
            <span className="text-[#56e5a9] font-data-mono-sm text-[10px] font-bold">BULLISH SKEW</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#262a35] flex overflow-hidden">
            <div
              className="bg-[#56e5a9] h-full transition-all duration-700"
              style={{ width: `${probs.upward}%` }}
              title="Upward"
            />
            <div
              className="bg-[#87929a] h-full transition-all duration-700"
              style={{ width: `${probs.neutral}%` }}
              title="Neutral"
            />
            <div
              className="bg-[#ffb4ab] h-full transition-all duration-700"
              style={{ width: `${probs.downward}%` }}
              title="Downward"
            />
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1 text-center font-data-mono-sm text-[11px]">
            <div className="flex flex-col items-center">
              <span className="text-[#56e5a9] font-bold">{probs.upward}%</span>
              <span className="text-[#bdc8d1] text-[10px]">Upward</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[#87929a] font-bold">{probs.neutral}%</span>
              <span className="text-[#bdc8d1] text-[10px]">Neutral</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[#ffb4ab] font-bold">{probs.downward}%</span>
              <span className="text-[#bdc8d1] text-[10px]">Downward</span>
            </div>
          </div>
        </div>

        {/* Estimated Target Range with SVG Spark Trajectory */}
        <div className="bg-[#171b26] p-2.5 rounded-lg flex flex-col gap-1 border border-[#262a35]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-[#bdc8d1]">
              TARGET TRAJECTORY (LSTM-BOUND)
            </span>
            <span className="font-data-mono-sm text-[11px] text-[#8ed5ff]">Conf: 95% CI</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1 font-data-mono-lg text-[20px] text-[#dfe2f1]">
              <span className="text-[#56e5a9]">{formatRupees(currentStock.targetRange[0])}</span>
              <span className="text-[#bdc8d1] text-sm font-normal">to</span>
              <span className="text-[#56e5a9]">{formatRupees(currentStock.targetRange[1])}</span>
            </div>
            <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-medium">
              Δ +{currentStock.targetDelta[0]}% - +{currentStock.targetDelta[1]}%
            </span>
          </div>

          {/* SVG Mini Trajectory Ribbon */}
          <div className="w-full h-14 relative mt-1">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 320 60">
              <defs>
                <linearGradient id="signalsConeGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#56e5a9" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#56e5a9" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Historical path */}
              <path
                d="M 0 45 L 50 42 L 100 46 L 150 35 L 200 32"
                fill="none"
                stroke="#87929a"
                strokeLinecap="round"
                strokeWidth="2"
              />
              {/* Uncertainty cone */}
              <polygon fill="url(#signalsConeGrad)" points="200,32 320,12 320,26" />
              {/* Forecast median */}
              <path
                d="M 200 32 Q 260 22 320 18"
                fill="none"
                stroke="#56e5a9"
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              {/* Current Anchor Point */}
              <circle cx="200" cy="32" fill="#38bdf8" r="3.5" />
              {/* Target End Point */}
              <circle cx="320" cy="18" fill="#56e5a9" r="4" />
            </svg>

            <div className="absolute right-0 top-0 font-data-mono-sm text-[10px] text-[#56e5a9] bg-[#262a35] px-1.5 py-0.5 rounded border border-[#313540]/60">
              {formatRupees(currentStock.medianTarget)} Median
            </div>
          </div>
        </div>
      </section>

      {/* Visual Feature Asset Prompt Representation */}
      <section className="rounded-xl overflow-hidden bg-[#171b26] shadow-sm border border-[#262a35]">
        <div
          className="relative h-28 w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBWyT3HnF3DwnCarbaElhxjU6fvGJUAgC9_3KrnLCE4gQP_xbTEzLYZtJUJ70_DljL6btwQZNwS2fHJVMSwyzwWuaXMH_5-dyNerWSgyHFEmZOhN28USn3e_aKKZsV7bLrV82ycY_KavJqa_UxQxpUsilnAVIQmQOBp0IRHkXsiXz4gBIJquvWroUGG0jX3AWoIi1bF9RWncLZUNd3UmjB4DqerjUlasRIajjo0NlmpvkJV1OXxSagy7w')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#171b26] via-[#171b26]/70 to-transparent p-3 flex flex-col justify-end">
            <span className="font-label-caps text-[10px] text-[#8ed5ff] tracking-widest uppercase font-bold">
              MULTI-FACTOR FEATURE DRIVERS
            </span>
            <span className="font-body-sm text-[12px] text-[#dfe2f1]">
              Real-time weights processed across 128 indicators
            </span>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-2">
          {/* Feature 1 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-body-sm text-[12px]">
              <span className="text-[#dfe2f1] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#56e5a9]">monitoring</span>
                Technical Momentum (RSI + MACD)
              </span>
              <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-bold">+45% Impact</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#262a35] overflow-hidden">
              <div className="bg-[#56e5a9] h-full rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-body-sm text-[12px]">
              <span className="text-[#dfe2f1] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#8ed5ff]">chat</span>
                News Sentiment (FinBERT 24h)
              </span>
              <span className="font-data-mono-sm text-[11px] text-[#56e5a9] font-bold">+32% Impact</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#262a35] overflow-hidden">
              <div className="bg-[#8ed5ff] h-full rounded-full" style={{ width: '58%' }} />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-body-sm text-[12px]">
              <span className="text-[#dfe2f1] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">public</span>
                Macro Yield & Volatility Drag
              </span>
              <span className="font-data-mono-sm text-[11px] text-[#ffb4ab] font-bold">-12% Drag</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#262a35] overflow-hidden">
              <div className="bg-[#ffb4ab] h-full rounded-full" style={{ width: '24%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Model Comparison & Architecture Stack */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="font-label-caps text-[10px] text-[#bdc8d1] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">account_tree</span>
            BENCHMARK ARCHITECTURES
          </span>
          <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">3 Models Active</span>
        </div>

        {/* Model 1: Random Forest */}
        <article className="bg-[#171b26] rounded-xl p-3 flex flex-col gap-1.5 shadow-sm border border-[#262a35]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[#262a35] text-[#c0c1ff] font-label-caps text-[10px] font-bold">
                M1
              </span>
              <h3 className="font-headline-sm text-[15px] text-[#dfe2f1] font-semibold">
                Random Forest Classifier
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#56e5a9]/10 text-[#56e5a9] font-data-mono-sm text-[11px] font-semibold">
              Upward
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#1c1f2a] p-2 rounded-lg font-data-mono-sm text-[11px] border border-[#262a35]/40">
            <div>
              <span className="text-[#bdc8d1] block text-[10px]">ACCURACY</span>
              <span className="text-[#dfe2f1] font-semibold">68.4%</span>
            </div>
            <div>
              <span className="text-[#bdc8d1] block text-[10px]">F1-SCORE</span>
              <span className="text-[#dfe2f1] font-semibold">0.71</span>
            </div>
          </div>

          <div className="pt-0.5">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] block mb-1">
              KEY SPLIT FEATURES:
            </span>
            <div className="flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 rounded bg-[#262a35] font-data-mono-sm text-[10px] text-[#bdc8d1]">
                RSI_14
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#262a35] font-data-mono-sm text-[10px] text-[#bdc8d1]">
                Sentiment_Score_24h
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#262a35] font-data-mono-sm text-[10px] text-[#bdc8d1]">
                5D_Return
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#262a35] font-data-mono-sm text-[10px] text-[#bdc8d1]">
                Volume_ZScore
              </span>
            </div>
          </div>
        </article>

        {/* Model 2: Support Vector Machine */}
        <article className="bg-[#171b26] rounded-xl p-3 flex flex-col gap-1.5 shadow-sm border border-[#262a35]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[#262a35] text-[#8ed5ff] font-label-caps text-[10px] font-bold">
                M2
              </span>
              <h3 className="font-headline-sm text-[15px] text-[#dfe2f1] font-semibold">
                SVM (RBF Kernel)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#56e5a9]/10 text-[#56e5a9] font-data-mono-sm text-[11px] font-semibold">
              Upward
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#1c1f2a] p-2 rounded-lg font-data-mono-sm text-[11px] border border-[#262a35]/40">
            <div>
              <span className="text-[#bdc8d1] block text-[10px]">ACCURACY</span>
              <span className="text-[#dfe2f1] font-semibold">64.8%</span>
            </div>
            <div>
              <span className="text-[#bdc8d1] block text-[10px]">PRECISION</span>
              <span className="text-[#dfe2f1] font-semibold">0.66</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#bdc8d1] px-1 font-body-sm">
            <span>Hyperplane C=1.2, Gamma=Scale</span>
            <span className="font-data-mono-sm text-[#56e5a9] font-medium">Margin: +0.48σ</span>
          </div>
        </article>

        {/* Model 3: LSTM Deep Neural Network */}
        <article className="bg-[#171b26] rounded-xl p-3 flex flex-col gap-1.5 shadow-sm border border-[#262a35]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[#262a35] text-[#56e5a9] font-label-caps text-[10px] font-bold">
                M3
              </span>
              <h3 className="font-headline-sm text-[15px] text-[#dfe2f1] font-semibold">
                Deep LSTM Recurrent Net
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#56e5a9]/10 text-[#56e5a9] font-data-mono-sm text-[11px] font-semibold">
              Upward
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-[#1c1f2a] p-2 rounded-lg font-data-mono-sm text-[11px] text-center border border-[#262a35]/40">
            <div>
              <span className="text-[#bdc8d1] block text-[10px]">ACCURACY</span>
              <span className="text-[#dfe2f1] font-semibold">72.1%</span>
            </div>
            <div>
              <span className="text-[#bdc8d1] block text-[10px]">SEQ LEN</span>
              <span className="text-[#dfe2f1] font-semibold">60 Steps</span>
            </div>
            <div>
              <span className="text-[#bdc8d1] block text-[10px]">TEMPORAL LOSS</span>
              <span className="text-[#56e5a9] font-semibold">0.014</span>
            </div>
          </div>

          <div className="text-[11px] text-[#bdc8d1] px-1 font-body-sm flex items-center justify-between">
            <span>Topology: 2-Layer LSTM + Dropout(0.2) + Dense</span>
            <span className="font-data-mono-sm text-[#8ed5ff]">Epoch 80/100</span>
          </div>
        </article>
      </section>

      {/* Model Version & Provenance Pill Card */}
      <section className="bg-[#262a35]/60 rounded-xl p-3 flex items-start gap-2.5 border border-[#313540]/60">
        <span className="material-symbols-outlined text-[20px] text-[#8ed5ff] shrink-0 mt-0.5">
          memory
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[10px] text-[#8ed5ff] font-bold">BUILD ARTIFACT</span>
            <span className="font-data-mono-sm text-[11px] text-[#dfe2f1] font-bold">
              v2.4-ensemble
            </span>
          </div>
          <p className="font-body-sm text-[12px] text-[#bdc8d1] mt-0.5">
            Trained on chronologically split 2020-2024 data (Test split: Q1-Q2 2024 held-out evaluation window).
          </p>
        </div>
      </section>

      {/* Academic Disclaimer Banner */}
      <footer className="bg-[#0a0e18] p-3.5 rounded-xl flex items-start gap-2.5 border border-[#262a35]">
        <span className="material-symbols-outlined text-[20px] text-[#ffb4ab] shrink-0 mt-0.5">
          gavel
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-label-caps text-[10px] text-[#ffb4ab] tracking-wider uppercase font-bold">
            STRICT CSE ACADEMIC PROJECT DISCLAIMER
          </span>
          <p className="font-body-sm text-[12px] text-[#bdc8d1] leading-relaxed">
            Research estimates generated using machine learning models on held-out test splits. Stock markets carry risk; predictions are not financial guarantees. Developed strictly for algorithmic assessment and academic demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
};
