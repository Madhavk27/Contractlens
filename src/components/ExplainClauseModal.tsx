import React from 'react';
import { ClauseExplanation } from '../types';
import {
  Sparkles,
  X,
  FileText,
  UserCheck,
  Calendar,
  AlertTriangle,
  Quote,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface ExplainClauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  clauseExplanation: ClauseExplanation | null;
  onAskFollowUp?: (query: string) => void;
}

export const ExplainClauseModal: React.FC<ExplainClauseModalProps> = ({
  isOpen,
  onClose,
  clauseExplanation,
  onAskFollowUp,
}) => {
  if (!isOpen || !clauseExplanation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B0E1D] border border-violet-500/40 rounded-2xl max-w-xl w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] glow-subtle-brand space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-violet-950/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono-code block">
                EXPLAIN THIS CLAUSE · AI ANALYSIS
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{clauseExplanation.sectionRef}</span>
                <span className="text-xs text-slate-400 font-normal">({clauseExplanation.sectionTitle})</span>
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

        {/* Source citation pill */}
        <div className="flex items-center gap-2 text-xs bg-[#080B16] border border-violet-950/80 px-3 py-1.5 rounded-lg text-slate-300">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Source: <strong className="text-cyan-300 font-mono-code">{clauseExplanation.sectionRef}</strong> on Page {clauseExplanation.pageNumber}</span>
        </div>

        {/* Structured Explanation Grid */}
        <div className="space-y-3.5 text-sm max-h-[55vh] overflow-y-auto pr-1 no-scrollbar">
          {/* WHAT IT SAYS */}
          <div className="p-3.5 rounded-xl bg-[#0F142A]/80 border border-violet-950/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono-code">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>WHAT IT SAYS (PLAIN LANGUAGE)</span>
            </span>
            <p className="text-slate-200 leading-relaxed text-sm">
              {clauseExplanation.whatItSays}
            </p>
          </div>

          {/* WHO IT AFFECTS & WHAT IT REQUIRES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0F142A]/80 border border-violet-950/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-mono-code">
                <UserCheck className="w-3 h-3 text-indigo-400" />
                <span>WHO IT AFFECTS</span>
              </span>
              <p className="text-slate-200 font-semibold text-sm">
                {clauseExplanation.whoItAffects}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F142A]/80 border border-violet-950/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono-code">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>IMPORTANT DATE</span>
              </span>
              <p className="text-slate-200 font-semibold text-sm">
                {clauseExplanation.importantDate || 'None specified'}
              </p>
            </div>
          </div>

          {/* WHAT IT REQUIRES */}
          <div className="p-3.5 rounded-xl bg-[#0F142A]/80 border border-violet-950/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono-code">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>WHAT IT REQUIRES</span>
            </span>
            <p className="text-slate-200 leading-relaxed text-sm">
              {clauseExplanation.whatItRequires}
            </p>
          </div>

          {/* POTENTIAL REVIEW */}
          {clauseExplanation.potentialReview && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono-code">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>POTENTIAL REVIEW ITEM</span>
              </span>
              <p className="text-amber-200/90 leading-relaxed text-xs">
                {clauseExplanation.potentialReview}
              </p>
            </div>
          )}

          {/* EVIDENCE QUOTE */}
          <div className="p-3.5 rounded-xl bg-[#080A14] border border-violet-950/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono-code">
              <Quote className="w-3 h-3 text-slate-400" />
              <span>SUPPORTING CLAUSE TEXT</span>
            </span>
            <blockquote className="text-xs text-slate-300 italic font-mono-code pl-2 border-l-2 border-cyan-500/40">
              "{clauseExplanation.evidenceQuote}"
            </blockquote>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-2 border-t border-violet-950/80 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Informational Notice:</strong> ContractLens provides plain-language operational summaries and does not provide binding legal conclusions. Consult qualified legal counsel for definitive interpretations.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              if (onAskFollowUp) {
                onAskFollowUp(`Explain how ${clauseExplanation.sectionRef} impacts our legal obligations in detail.`);
              }
              onClose();
            }}
            className="text-xs font-bold uppercase tracking-wider text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ASK AI FOLLOW-UP</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141A33] hover:bg-[#1E2548] text-xs font-bold text-slate-200 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
