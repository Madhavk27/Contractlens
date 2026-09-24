import React, { useState } from 'react';
import { ContractObligation, TimelineMilestone } from '../types';
import { OBLIGATIONS_LIST, TIMELINE_MILESTONES } from '../data/mockData';
import { ChevronDown, ExternalLink, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface ObligationsViewProps {
  onOpenContractClause: (page: number, sectionRef: string) => void;
}

export const ObligationsView: React.FC<ObligationsViewProps> = ({
  onOpenContractClause,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Due Soon' | 'Review' | 'Completed'>('All');
  const [expandedId, setExpandedId] = useState<string | null>('obl-1');

  const filteredObligations = OBLIGATIONS_LIST.filter((item) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Due Soon') return item.status === 'due_soon';
    if (activeFilter === 'Review') return item.status === 'review' || item.status === 'pending';
    if (activeFilter === 'Completed') return item.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-14 space-y-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
          <span>PORTFOLIO COVENANTS & COMPLIANCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 uppercase">
          Your Obligations
        </h1>
        <p className="text-sm text-slate-300">
          Tracking critical contractual covenants, recurring compliance tasks, and non-renewal notice cutoffs.
        </p>

        {/* Subtle Filter Chips */}
        <div className="flex items-center gap-2 mt-6 border-b border-violet-950/60 pb-3">
          {(['All', 'Due Soon', 'Review', 'Completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                activeFilter === filter
                  ? 'gradient-brand-cta text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-[#11162B]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Expandable Rows */}
      <section className="space-y-3.5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
          <span>CONTRACTUAL COMMITMENTS ({filteredObligations.length})</span>
          <span className="text-[11px] font-mono-code text-cyan-400">STATUS AUDIT ACTIVE</span>
        </h2>

        <div className="bg-[#0D1122]/90 border border-violet-950/60 rounded-xl divide-y divide-violet-950/50 overflow-hidden shadow-xl">
          {filteredObligations.map((item) => {
            const isExpanded = expandedId === item.id;
            const isUrgent = item.status === 'due_soon';
            const isDone = item.status === 'completed';

            return (
              <div key={item.id} className="transition-colors">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="px-6 py-4.5 hover:bg-[#131830]/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      {isUrgent && (
                        <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
                      )}
                      {isDone && (
                        <span className="inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                      )}
                      {!isUrgent && !isDone && (
                        <span className="inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          {item.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#141A33] border border-violet-800/40 text-slate-300 font-mono-code">
                          {item.responsibleParty}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md font-mono-code border ${
                          item.priority === 'High'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                            : item.priority === 'Medium'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {item.priority} Priority
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono-code flex-wrap">
                        <span>DUE {item.dueDate}</span>
                        <span>·</span>
                        {item.daysRemaining > 0 ? (
                          <span className={item.daysRemaining <= 18 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                            {item.daysRemaining} DAYS REMAINING
                          </span>
                        ) : item.daysRemaining === 0 ? (
                          <span className="text-rose-400 font-bold">DUE TODAY</span>
                        ) : (
                          <span className="text-emerald-400">SATISFIED</span>
                        )}
                        <span>·</span>
                        <span className="text-cyan-400">{item.sectionRef}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline uppercase font-mono-code">
                      {item.frequency}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-[#090C19] border-t border-violet-950/60 text-xs space-y-3">
                    <p className="text-slate-300 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>

                    {/* Consequence if stated */}
                    {item.consequence && (
                      <div className="p-2.5 rounded-lg bg-[#140F1D] border border-amber-500/30 text-amber-200/90 text-xs">
                        <strong className="text-amber-400 font-mono-code uppercase text-[10px] block mb-0.5">
                          CONSEQUENCE IF MISSED:
                        </strong>
                        {item.consequence}
                      </div>
                    )}

                    {/* Supporting Evidence Quote */}
                    {item.supportingEvidence && (
                      <div className="p-2.5 rounded-lg bg-[#070912] border border-violet-950/60 text-slate-300 italic font-mono-code text-xs border-l-2 border-l-cyan-400">
                        "{item.supportingEvidence}"
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-slate-400 border-t border-violet-950/40">
                      <span>Source: <strong className="text-cyan-300 font-mono-code">{item.sectionRef}</strong> · Page {item.pageNumber}</span>

                      <button
                        onClick={() => onOpenContractClause(item.pageNumber, item.sectionRef)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider bg-[#12172F] px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-400"
                      >
                        <span>INSPECT IN DOCUMENT</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FUTURISTIC TIMELINE */}
      <section>
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
            <span>TIMELINE RUNWAY</span>
            <span className="text-cyan-400 font-mono-code">2026 – 2027</span>
          </h2>
          <p className="text-sm text-slate-300">
            Chronological obligation progression across the fiscal term.
          </p>
        </div>

        {/* Visual Timeline (Line: subtle electric blue/purple, Important: cyan glow, Urgent: amber/red) */}
        <div className="bg-[#0D1122]/90 border border-violet-950/60 rounded-xl p-8 shadow-xl">
          <div className="relative pl-6 border-l-2 border-gradient-timeline border-indigo-600/40 space-y-10">
            {TIMELINE_MILESTONES.map((milestone, idx) => {
              const isUrgent = milestone.status === 'urgent';
              const isCompleted = milestone.status === 'completed';

              return (
                <div
                  key={idx}
                  onClick={() => onOpenContractClause(milestone.pageNumber || 14, milestone.sectionRef || 'Section 8.2')}
                  className="relative group cursor-pointer p-3 -ml-3 rounded-xl hover:bg-[#131830]/70 transition-all border border-transparent hover:border-violet-800/40"
                >
                  {/* Timeline status indicator dot with glow */}
                  <div
                    className={`absolute -left-[22px] top-4 w-3.5 h-3.5 rounded-full ring-4 ring-[#0D1122] transition-transform group-hover:scale-125 ${
                      isUrgent
                        ? 'bg-rose-500 shadow-[0_0_12px_#F43F5E]'
                        : isCompleted
                        ? 'bg-emerald-400 shadow-[0_0_12px_#10B981]'
                        : 'bg-cyan-400 shadow-[0_0_12px_#22D3EE]'
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-cyan-300 font-mono-code w-28 uppercase">
                        {milestone.date}
                      </span>
                      <span className="text-sm font-bold text-white tracking-tight uppercase group-hover:text-cyan-200 transition-colors">
                        {milestone.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {milestone.sectionRef && (
                        <span className="text-xs text-slate-400 font-mono-code">
                          {milestone.sectionRef}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 pl-0 sm:pl-31">
                    {milestone.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
