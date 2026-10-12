import React from 'react';
import { NewsItem } from '../types';

interface ArticleModalProps {
  article: NewsItem | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  const isPos = article.score > 0;
  const isNeg = article.score < 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e18]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#1c1f2a] rounded-xl p-4 shadow-2xl border border-[#262a35] space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#262a35] pb-2">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[10px] text-[#bdc8d1]">
              {article.source} • {article.timeAgo}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded font-data-mono-sm text-[10px] font-bold ${
                isPos
                  ? 'bg-[#30c88f]/20 text-[#56e5a9]'
                  : isNeg
                  ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                  : 'bg-[#3131c0]/30 text-[#c0c1ff]'
              }`}
            >
              {article.scoreLabel}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#bdc8d1] hover:text-[#dfe2f1]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-44 rounded-lg object-cover border border-[#262a35]"
          />
        )}

        <h2 className="font-headline-sm text-[18px] text-[#dfe2f1] font-bold leading-snug">
          {article.title}
        </h2>

        {article.summary && (
          <p className="font-body-md text-[13px] text-[#bdc8d1] leading-relaxed">
            {article.summary}
          </p>
        )}

        {article.tokens && article.tokens.length > 0 && (
          <div className="p-3 rounded-lg bg-[#171b26] border border-[#262a35] space-y-1.5">
            <span className="font-label-caps text-[10px] text-[#bdc8d1] uppercase block font-semibold">
              NLP Token Semantic Weights:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {article.tokens.map((tok, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded font-data-mono-sm text-[11px] ${
                    tok.weight > 0
                      ? 'bg-[#30c88f]/20 text-[#56e5a9]'
                      : tok.weight < 0
                      ? 'bg-[#93000a]/20 text-[#ffb4ab]'
                      : 'bg-[#262a35] text-[#bdc8d1]'
                  }`}
                >
                  {tok.text} ({tok.weight >= 0 ? '+' : ''}{tok.weight.toFixed(2)})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-[#262a35]">
          <span className="font-data-mono-sm text-[11px] text-[#bdc8d1]">
            Impact Level: <strong className="text-[#dfe2f1]">{article.impact}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#262a35] hover:bg-[#313540] text-[#dfe2f1] text-[12px] font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
