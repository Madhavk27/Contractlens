import React, { useState } from 'react';
import { ActionItem, Contract, LibrarySearchResult } from '../types';
import { CONTRACT_LIBRARY_SEARCH_ITEMS } from '../data/mockData';
import {
  ChevronRight,
  ArrowRight,
  UploadCloud,
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface DashboardViewProps {
  actionItems: ActionItem[];
  recentContracts: Contract[];
  onSelectAction: (action: ActionItem) => void;
  onSelectContract: (contract: Contract) => void;
  onOpenUpload: () => void;
  onMarkReviewed?: (actionId: string) => void;
  onDismissAction?: (actionId: string) => void;
}

const SEARCH_SUGGESTIONS = [
  'Which contracts renew in the next 60 days?',
  'Which contracts use Net 30 payment terms?',
  'Show contracts with termination notices longer than 30 days.',
  'Which contracts have unresolved review items?',
  'Which vendor contracts expire this quarter?',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  actionItems,
  recentContracts,
  onSelectAction,
  onSelectContract,
  onOpenUpload,
  onMarkReviewed,
  onDismissAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LibrarySearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Contract operational health calculations
  const unresolvedActions = actionItems.filter((i) => i.reviewStatus !== 'dismissed' && i.reviewStatus !== 'reviewed');
  const reviewedCount = actionItems.filter((i) => i.reviewStatus === 'reviewed').length;

  const handleRunSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    setSearchQuery(query);
    if (!q) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      let results = [...CONTRACT_LIBRARY_SEARCH_ITEMS];

      if (q.includes('60 days') || q.includes('renew')) {
        results = CONTRACT_LIBRARY_SEARCH_ITEMS.filter((item) =>
          item.contractId === 'abc-vendor' || item.contractId === 'it-maintenance'
        );
      } else if (q.includes('net 30') || q.includes('payment')) {
        results = CONTRACT_LIBRARY_SEARCH_ITEMS.filter((item) =>
          item.relevantResult.toLowerCase().includes('net 30') || item.relevantResult.toLowerCase().includes('payment')
        );
      } else if (q.includes('termination') || q.includes('longer than 30')) {
        results = CONTRACT_LIBRARY_SEARCH_ITEMS.filter((item) =>
          item.contractId === 'saas-service' || item.contractId === 'it-maintenance'
        );
      } else if (q.includes('review') || q.includes('unresolved')) {
        results = CONTRACT_LIBRARY_SEARCH_ITEMS.filter((item) =>
          item.status.toLowerCase().includes('review') || item.contractId === 'abc-vendor'
        );
      } else if (q.includes('quarter') || q.includes('expire')) {
        results = CONTRACT_LIBRARY_SEARCH_ITEMS.filter((item) =>
          item.deadlineOrDate.includes('2026')
        );
      } else {
        // Generic fuzzy keyword match
        results = CONTRACT_LIBRARY_SEARCH_ITEMS.filter((item) =>
          item.contractName.toLowerCase().includes(q) ||
          item.relevantResult.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
        );
      }

      setSearchResults(results.length > 0 ? results : CONTRACT_LIBRARY_SEARCH_ITEMS.slice(0, 2));
      setIsSearching(false);
    }, 250);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      {/* Hero Section */}
      <section>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <p className="text-xs font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2 font-mono-code">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
            CONTRACT INTEL PORTFOLIO
          </p>

          {/* Operational Contract Status Indicators (Feature 9) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider font-mono-code bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE</span>
            </span>
            <span className="text-[11px] font-mono-code text-slate-300 bg-[#0D1122] border border-violet-950/70 px-2.5 py-0.5 rounded-full">
              8 obligations
            </span>
            <span className="text-[11px] font-mono-code text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              4 upcoming
            </span>
            <span className="text-[11px] font-mono-code text-yellow-300 bg-yellow-950/40 border border-yellow-500/30 px-2.5 py-0.5 rounded-full">
              {unresolvedActions.length} review items
            </span>
            <span className="text-[11px] font-mono-code text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              1 renewal approaching
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          {unresolvedActions.length > 0 ? (
            <>
              {unresolvedActions.length} ITEMS NEED YOUR{' '}
              <span className="text-gradient-hero drop-shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                ATTENTION.
              </span>
            </>
          ) : (
            <>
              ALL CONTRACT ACTIONS{' '}
              <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                REVIEWED & SAFE.
              </span>
            </>
          )}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-normal max-w-2xl leading-relaxed">
          ContractLens actively monitors critical covenants, detects conflicting terms, and extracts deadlines from business contracts.
        </p>
      </section>

      {/* FEATURE 10: CONTRACT LIBRARY AI SEARCH */}
      <section className="bg-[#0B0E1D]/90 border border-violet-500/40 rounded-2xl p-6 shadow-2xl glow-subtle-brand space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-200">
              SEARCH CONTRACT LIBRARY
            </h2>
          </div>
          <span className="text-[10px] uppercase font-mono-code text-cyan-400">
            Natural Language Agent
          </span>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunSearch(searchQuery);
          }}
          className="relative flex items-center"
        >
          <Search className="w-4 h-4 text-cyan-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value) setSearchResults(null);
            }}
            placeholder="Ask anything across all stored contracts (e.g. 'Which contracts renew in next 60 days?')..."
            className="w-full bg-[#070914] border border-violet-950/80 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 rounded-xl py-3 pl-11 pr-24 text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 px-3 py-1.5 rounded-lg gradient-brand-cta text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all"
          >
            {isSearching ? 'SEARCHING...' : 'SEARCH'}
          </button>
        </form>

        {/* Suggested Quick Question Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-500 text-[11px] whitespace-nowrap font-mono-code">Quick queries:</span>
          {SEARCH_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleRunSearch(suggestion)}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-[#0D1124] hover:bg-[#141A33] border border-violet-950/70 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all text-[11px]"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        {searchResults && (
          <div className="pt-3 border-t border-violet-950/70 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Found <strong>{searchResults.length} matching contract results</strong> for "{searchQuery}"</span>
              <button
                onClick={() => {
                  setSearchResults(null);
                  setSearchQuery('');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Clear Results
              </button>
            </div>

            <div className="space-y-2.5">
              {searchResults.map((res, idx) => {
                const matchedContract = recentContracts.find((c) => c.id === res.contractId) || recentContracts[0];

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#090C1A] border border-violet-900/50 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-white">{res.contractName}</span>
                        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#141A33] text-cyan-300 border border-cyan-500/30">
                          {res.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {res.relevantResult}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-code">
                        <span>Date: <strong className="text-amber-300">{res.deadlineOrDate}</strong></span>
                        <span>·</span>
                        <span>Source: <strong className="text-cyan-400">{res.sourceSection}</strong> (Page {res.sourcePage})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectContract(matchedContract)}
                      className="self-start sm:self-center whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#141A33] hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-600 text-slate-200 hover:text-white border border-violet-800/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <span>Open Contract</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ACTION CENTER */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span>ACTION CENTER</span>
            <span className="text-[11px] font-mono-code text-cyan-400/80 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
              {unresolvedActions.length} ACTIVE
            </span>
            {reviewedCount > 0 && (
              <span className="text-[11px] font-mono-code text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{reviewedCount} REVIEWED</span>
              </span>
            )}
          </h2>
          <span className="text-xs text-slate-400">
            Autonomous priority triage
          </span>
        </div>

        {/* Elegant Wide Interactive Action Rows */}
        <div className="space-y-3.5">
          {actionItems.map((item) => {
            const isRed = item.statusType === 'urgent';
            const isAmber = item.statusType === 'attention';
            const isConflict = item.statusType === 'conflict';
            const isReviewed = item.reviewStatus === 'reviewed';
            const isDismissed = item.reviewStatus === 'dismissed';

            if (isDismissed) return null;

            return (
              <div
                key={item.id}
                onClick={() => onSelectAction(item)}
                className={`group relative border rounded-xl p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-lg glow-active-row flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
                  isReviewed
                    ? 'bg-[#090D18]/80 border-emerald-950/60 opacity-75'
                    : 'bg-[#0D1122]/90 border-violet-950/60 hover:border-violet-500/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Indicator Dot with subtle aura */}
                  <div className="pt-1 flex-shrink-0">
                    {isReviewed ? (
                      <span className="inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 shadow-[0_0_10px_#10B981]" />
                    ) : isRed ? (
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 shadow-[0_0_10px_#F43F5E]"></span>
                      </span>
                    ) : isAmber ? (
                      <span className="inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 shadow-[0_0_10px_#F59E0B]"></span>
                    ) : (
                      <span className="inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 shadow-[0_0_10px_#EAB308]"></span>
                    )}
                  </div>

                  {/* Row Details */}
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors uppercase">
                        {item.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.contractName}
                      </span>
                      {isReviewed && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md font-mono-code bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Reviewed</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 mt-1 mb-3 leading-normal font-normal">
                      {item.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                      {item.daysRemaining > 0 ? (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded border font-mono-code ${
                            isRed
                              ? 'text-rose-300 bg-rose-950/40 border-rose-500/30'
                              : 'text-amber-300 bg-amber-950/40 border-amber-500/30'
                          }`}
                        >
                          {item.daysRemaining} days remaining
                        </span>
                      ) : (
                        <span className="font-semibold text-yellow-300 bg-yellow-950/40 border border-yellow-500/30 px-2 py-0.5 rounded font-mono-code">
                          Immediate Action
                        </span>
                      )}

                      <span className="text-slate-600">·</span>
                      <span className="font-medium text-slate-200">{item.responsibleParty}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-cyan-400/90 font-mono-code">{item.sectionRef}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action & Review Workflow Buttons (Feature 14) */}
                <div className="flex items-center gap-2 sm:self-center pl-7 sm:pl-0 flex-shrink-0 flex-wrap">
                  {!isReviewed && onMarkReviewed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkReviewed(item.id);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 border border-transparent hover:border-emerald-500/30 transition-all flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Reviewed</span>
                    </button>
                  )}

                  {!isReviewed && onDismissAction && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismissAction(item.id);
                      }}
                      className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-[#141A33] transition-colors"
                    >
                      Dismiss
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAction(item);
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wide uppercase rounded-lg transition-all ${
                      isConflict
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:brightness-110'
                        : isRed
                        ? 'bg-rose-600/90 text-white hover:bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : 'bg-[#141A33] text-slate-200 hover:text-white hover:bg-violet-900/50 border border-violet-800/40'
                    }`}
                  >
                    <span>{isConflict ? 'INVESTIGATE →' : 'REVIEW →'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT CONTRACTS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            RECENT CONTRACTS
          </h2>
          <button
            onClick={onOpenUpload}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload agreement
          </button>
        </div>

        <div className="bg-[#0D1122]/90 border border-violet-950/60 rounded-xl divide-y divide-violet-950/40 overflow-hidden shadow-xl">
          {recentContracts.map((contract) => (
            <div
              key={contract.id}
              onClick={() => onSelectContract(contract)}
              className="group px-6 py-4.5 hover:bg-[#131830]/80 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#141A33] border border-violet-800/30 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-all">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {contract.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        contract.status === 'Active'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {contract.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        contract.fileFormat === 'docx' || contract.fileName?.toLowerCase().endsWith('.docx')
                          ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30'
                          : 'bg-violet-950/50 text-violet-300 border border-violet-500/30'
                      }`}
                    >
                      {contract.fileFormat === 'docx' || contract.fileName?.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono-code">
                    Expires {contract.expirationDate} · {contract.obligationsCount} obligations · {contract.parties.client} ↔ {contract.parties.vendor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400 group-hover:text-cyan-400 transition-colors">
                <span className="text-xs hidden sm:inline text-slate-400">
                  Open workspace
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

