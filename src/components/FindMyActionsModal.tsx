import React, { useState } from 'react';
import { ActionItem } from '../types';
import {
  Sparkles,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Filter,
  Check,
  Ban
} from 'lucide-react';

interface FindMyActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionItems: ActionItem[];
  onReviewClause: (page: number, sectionRef: string) => void;
  onMarkReviewed: (actionId: string) => void;
  onDismissAction: (actionId: string) => void;
}

export const FindMyActionsModal: React.FC<FindMyActionsModalProps> = ({
  isOpen,
  onClose,
  actionItems,
  onReviewClause,
  onMarkReviewed,
  onDismissAction,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'urgent' | 'upcoming' | 'review'>('all');

  if (!isOpen) return null;

  // Filter items into URGENT, UPCOMING, and REVIEW
  const urgentItems = actionItems.filter((i) => i.statusType === 'urgent' && i.reviewStatus !== 'dismissed');
  const upcomingItems = actionItems.filter((i) => (i.statusType === 'attention' || i.category === 'upcoming') && i.reviewStatus !== 'dismissed');
  const reviewItems = actionItems.filter((i) => (i.statusType === 'conflict' || i.category === 'review') && i.reviewStatus !== 'dismissed');

  const filteredItems = actionItems.filter((i) => {
    if (i.reviewStatus === 'dismissed') return false;
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'urgent') return i.statusType === 'urgent';
    if (activeCategoryFilter === 'upcoming') return i.statusType === 'attention' || i.category === 'upcoming';
    if (activeCategoryFilter === 'review') return i.statusType === 'conflict' || i.category === 'review';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B0E1D] border border-violet-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] glow-subtle-brand space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-violet-950/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_14px_rgba(6,182,212,0.5)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono-code block">
                CONTRACTLENS AI ACTION AGENT
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Find My Actions
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#151B38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Action Inspection Summary Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#080B16] border border-violet-950/80 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Contract Analysis:</span>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setActiveCategoryFilter('urgent')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeCategoryFilter === 'urgent'
                    ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    : 'bg-red-950/50 text-red-300 border border-red-500/30 hover:bg-red-900/50'
                }`}
              >
                {urgentItems.length} urgent
              </button>
              <button
                onClick={() => setActiveCategoryFilter('upcoming')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeCategoryFilter === 'upcoming'
                    ? 'bg-amber-500 text-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-amber-950/50 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50'
                }`}
              >
                {upcomingItems.length} upcoming
              </button>
              <button
                onClick={() => setActiveCategoryFilter('review')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeCategoryFilter === 'review'
                    ? 'bg-yellow-500 text-slate-900 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                    : 'bg-yellow-950/50 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-900/50'
                }`}
              >
                {reviewItems.length} review required
              </button>
            </div>
          </div>

          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
              activeCategoryFilter === 'all'
                ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Show All ({actionItems.filter((i) => i.reviewStatus !== 'dismissed').length})
          </button>
        </div>

        {/* Action Items List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
          {filteredItems.map((item) => {
            const isUrgent = item.statusType === 'urgent';
            const isConflict = item.statusType === 'conflict' || item.category === 'review';
            const isReviewed = item.reviewStatus === 'reviewed';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isReviewed
                    ? 'bg-[#080E16]/80 border-emerald-900/50 opacity-80'
                    : isUrgent
                    ? 'bg-[#150F1A]/90 border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.12)]'
                    : isConflict
                    ? 'bg-[#18151A]/90 border-yellow-500/40 shadow-[0_0_16px_rgba(234,179,8,0.12)]'
                    : 'bg-[#0E1326]/90 border-amber-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        isReviewed
                          ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]'
                          : isUrgent
                          ? 'bg-red-400 shadow-[0_0_8px_#EF4444] animate-pulse'
                          : isConflict
                          ? 'bg-yellow-400 shadow-[0_0_8px_#EAB308]'
                          : 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {item.title}
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md font-mono-code bg-[#141A33] text-cyan-300 border border-cyan-500/20">
                          {item.responsibleParty}
                        </span>
                        {isReviewed && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md font-mono-code bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Reviewed</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full font-mono-code border ${
                        isUrgent
                          ? 'bg-red-950/80 text-red-300 border-red-500/40'
                          : isConflict
                          ? 'bg-yellow-950/80 text-yellow-300 border-yellow-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {item.daysRemaining > 0 ? `${item.daysRemaining} days` : item.dueDate}
                    </span>
                  </div>
                </div>

                {/* Evidence Quote Box */}
                {item.clauseExcerpt && (
                  <div className="bg-[#080B16] border border-violet-950/60 rounded-lg p-2.5 text-xs text-slate-300 italic font-mono-code border-l-2 border-l-cyan-400">
                    "{item.clauseExcerpt}"
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-violet-950/60 text-xs">
                  <span className="text-slate-400">
                    Source: <strong className="text-cyan-300 font-mono-code">{item.sectionRef}</strong> · Page {item.pageNumber}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isReviewed ? (
                      <button
                        onClick={() => onMarkReviewed(item.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 border border-transparent hover:border-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Reviewed</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    )}

                    <button
                      onClick={() => onDismissAction(item.id)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#141A33] transition-colors"
                    >
                      Dismiss
                    </button>

                    <button
                      onClick={() => {
                        onReviewClause(item.pageNumber, item.sectionRef);
                        onClose();
                      }}
                      className="gradient-brand-cta text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    >
                      <span>Review</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-violet-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Click <strong>Review</strong> to navigate directly to the highlighted contract clause.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141A33] hover:bg-[#1E2548] text-xs font-bold text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
