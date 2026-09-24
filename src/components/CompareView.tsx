import React, { useState } from 'react';
import { DIFF_COMPARISONS } from '../data/mockData';
import { ContractDiffItem } from '../types';
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Check,
  X
} from 'lucide-react';

interface CompareViewProps {
  onBackToWorkspace?: () => void;
  onInspectClause: (page: number, sectionRef: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  onBackToWorkspace,
  onInspectClause,
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'commercial' | 'legal'>('all');
  const [reviewedItems, setReviewedItems] = useState<Record<string, boolean>>({});

  const toggleReviewed = (id: string) => {
    setReviewedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = DIFF_COMPARISONS.filter((item) => {
    if (filter === 'urgent') return item.reviewStatus === 'Urgent';
    if (filter === 'commercial') return item.category.toLowerCase().includes('payment') || item.category.toLowerCase().includes('commercial') || item.category.toLowerCase().includes('renewal');
    if (filter === 'legal') return item.category.toLowerCase().includes('liability') || item.category.toLowerCase().includes('jurisdiction');
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="mb-8">
        {onBackToWorkspace && (
          <button
            onClick={onBackToWorkspace}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </button>
        )}
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
          <GitCompare className="w-3.5 h-3.5" />
          <span>VERSION COMPARISON INTELLIGENCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 uppercase">
          What changed?
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 mb-6">
          <span className="font-semibold text-slate-200">Version 1.0 (Signed Master)</span>
          <span className="text-cyan-400">→</span>
          <span className="font-semibold text-cyan-300">Version 2.1 (Proposed Amendment)</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">4 key commercial & legal variances detected</span>
        </div>

        {/* Operational Overview Callout */}
        <div className="p-4 rounded-xl bg-[#0F142A] border border-violet-800/40 flex items-start gap-3.5 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <span className="font-bold text-white uppercase tracking-wider block">
              AI Operational Impact Assessment
            </span>
            <p className="text-slate-300 leading-relaxed">
              Proposed amendment shortens the non-renewal notice window from 60 to 30 days (creating acute calendar pressure) and increases payment cycle to Net 45. Liability cap remains unchanged at 12 months fees.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            filter === 'all'
              ? 'gradient-brand-cta text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
              : 'bg-[#0D1122] text-slate-400 hover:text-white border border-violet-950/80'
          }`}
        >
          All Changes (4)
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            filter === 'urgent'
              ? 'bg-rose-950 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
              : 'bg-[#0D1122] text-slate-400 hover:text-rose-300 border border-violet-950/80'
          }`}
        >
          Urgent / High Risk (2)
        </button>
        <button
          onClick={() => setFilter('commercial')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            filter === 'commercial'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-[#0D1122] text-slate-400 hover:text-cyan-300 border border-violet-950/80'
          }`}
        >
          Commercial & Terms
        </button>
        <button
          onClick={() => setFilter('legal')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            filter === 'legal'
              ? 'bg-violet-950 text-violet-300 border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
              : 'bg-[#0D1122] text-slate-400 hover:text-violet-300 border border-violet-950/80'
          }`}
        >
          Legal & Liabilities
        </button>
      </div>

      {/* Refined Dark Editorial Comparison Rows */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isUrgent = item.reviewStatus === 'Urgent';
          const isAttention = item.reviewStatus === 'Attention';
          const isReviewed = !!reviewedItems[item.id];

          return (
            <div
              key={item.id}
              className={`bg-[#0D1122]/90 border rounded-xl p-6 shadow-xl transition-all group ${
                isReviewed
                  ? 'border-emerald-500/40 bg-[#0A1220]/90'
                  : 'border-violet-950/60 hover:border-violet-600/50'
              }`}
            >
              {/* Category Eyebrow & Status */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 font-mono-code">
                  {item.category}
                </span>

                <div className="flex items-center gap-2">
                  {isReviewed ? (
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>REVIEWED</span>
                    </span>
                  ) : (
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isUrgent
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          : isAttention
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : 'bg-[#141A33] text-slate-300 border-violet-800/40'
                      }`}
                    >
                      {item.reviewStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Variance Shift with Subtle Violet & Cyan Highlights */}
              <div className="mb-3">
                <h3 className="text-base font-bold text-white mb-2">
                  {item.title}
                </h3>

                {/* Refined clean comparison line */}
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <span className="text-slate-400 line-through font-medium bg-[#11162B] px-2.5 py-1 rounded border border-violet-950/80">
                    {item.fromValue}
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                    {item.toValue}
                  </span>
                </div>
              </div>

              {/* Why It Matters */}
              <div className="p-3 rounded-lg bg-[#090C1A] border border-violet-950/60 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-code block mb-1">
                  OPERATIONAL IMPACT & WHY IT MATTERS:
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.whyItMatters}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-violet-950/60 text-xs text-slate-400">
                <span>Governed in <strong className="text-cyan-300 font-mono-code">{item.sectionRef}</strong> · Page {item.pageNumber}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReviewed(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1 rounded hover:bg-[#141A33] transition-colors"
                  >
                    {isReviewed ? (
                      <>
                        <X className="w-3 h-3 text-slate-400" />
                        <span>Undo</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Mark Reviewed</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onInspectClause(item.pageNumber, item.sectionRef)}
                    className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-300 hover:text-white bg-gradient-to-r from-violet-900/40 to-cyan-900/40 hover:from-violet-600 hover:to-cyan-600 border border-cyan-500/30 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  >
                    <span>REVIEW CLAUSE</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
