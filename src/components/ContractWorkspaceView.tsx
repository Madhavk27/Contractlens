import React, { useState, useRef, useEffect } from 'react';
import { Contract, ContractObligation, AiPromptQuery, ClauseExplanation, ActionItem } from '../types';
import {
  CONTRACT_DOCUMENT_PAGES,
  AI_PROMPT_QUERIES,
  OBLIGATIONS_LIST,
  ACTION_CENTER_ITEMS,
  CLAUSE_EXPLANATIONS,
  CLAUSE_CONFLICT_DATA
} from '../data/mockData';
import { ExportLegalSignoffModal } from './ExportLegalSignoffModal';
import { FindMyActionsModal } from './FindMyActionsModal';
import { ExecutiveSummaryModal } from './ExecutiveSummaryModal';
import { ExplainClauseModal } from './ExplainClauseModal';
import {
  Sparkles,
  ArrowLeft,
  GitCompare,
  ChevronLeft,
  ChevronRight,
  Send,
  ExternalLink,
  ChevronDown,
  Clock,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  ScanLine,
  FileDown,
  Check,
  FileText,
  HelpCircle,
  ShieldAlert,
  Calendar
} from 'lucide-react';

interface ContractWorkspaceViewProps {
  contract: Contract;
  onBack: () => void;
  onOpenCompare: () => void;
  initialTargetSection?: string;
  initialTargetPage?: number;
  onOpenGeminiChat?: (query?: string) => void;
}

export const ContractWorkspaceView: React.FC<ContractWorkspaceViewProps> = ({
  contract,
  onBack,
  onOpenCompare,
  initialTargetSection,
  initialTargetPage,
  onOpenGeminiChat,
}) => {
  const availablePages =
    contract.pages && Object.keys(contract.pages).length > 0
      ? contract.pages
      : CONTRACT_DOCUMENT_PAGES;
  const pageNumbers = Object.keys(availablePages)
    .map(Number)
    .sort((a, b) => a - b);
  const defaultPage =
    initialTargetPage && availablePages[initialTargetPage]
      ? initialTargetPage
      : (pageNumbers[0] || 1);

  const [currentPage, setCurrentPage] = useState<number>(defaultPage);
  const [highlightedSectionRef, setHighlightedSectionRef] = useState<string | null>(
    initialTargetSection || (availablePages[defaultPage]?.sections?.[0]?.ref ?? 'Section 8.2')
  );
  const [activeAttentionFilter, setActiveAttentionFilter] = useState<string | null>(
    initialTargetSection ? initialTargetSection : 'renewal'
  );

  useEffect(() => {
    const currentAvailable =
      contract.pages && Object.keys(contract.pages).length > 0
        ? contract.pages
        : CONTRACT_DOCUMENT_PAGES;
    const currentNumbers = Object.keys(currentAvailable)
      .map(Number)
      .sort((a, b) => a - b);
    const targetP =
      initialTargetPage && currentAvailable[initialTargetPage]
        ? initialTargetPage
        : (currentNumbers[0] || 1);
    setCurrentPage(targetP);
    setHighlightedSectionRef(
      initialTargetSection || (currentAvailable[targetP]?.sections?.[0]?.ref ?? 'Section 1.1')
    );
  }, [contract.id, initialTargetPage, initialTargetSection]);

  // New Modals State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState<boolean>(false);
  const [isExecSummaryOpen, setIsExecSummaryOpen] = useState<boolean>(false);
  const [activeExplanation, setActiveExplanation] = useState<ClauseExplanation | null>(null);

  // Clause Conflict State (Feature 8 & 14)
  const [conflictReviewStatus, setConflictReviewStatus] = useState<'unreviewed' | 'reviewed' | 'dismissed'>('unreviewed');
  const [actionItemsState, setActionItemsState] = useState<ActionItem[]>(ACTION_CENTER_ITEMS);

  // Obligations list
  const obligationsToDisplay: ContractObligation[] =
    contract.obligations && contract.obligations.length > 0
      ? contract.obligations
      : OBLIGATIONS_LIST;

  // Expandable obligations state
  const [expandedObligationId, setExpandedObligationId] = useState<string | null>(
    obligationsToDisplay[0]?.id || 'obl-1'
  );

  // AI Command Bar State
  const [inputValue, setInputValue] = useState('');
  const [activeAiResponse, setActiveAiResponse] = useState<AiPromptQuery | null>({
    question: 'WHAT DO I NEED TO DO BEFORE RENEWAL?',
    answer:
      contract.isUploaded
        ? 'Based on your uploaded contract, renewal terms and notice requirements are highlighted. See the active section for exact notice windows and conditions.'
        : 'A renewal notice must be delivered 30 days before contract expiration (by October 15, 2026). If written opt-out is not dispatched, the agreement automatically renews for an additional 12 months under Section 8.2.',
    sourceSection: initialTargetSection || availablePages[defaultPage]?.sections?.[0]?.ref || 'Section 8.2',
    sourcePage: defaultPage,
    highlightText:
      availablePages[defaultPage]?.sections?.[0]?.text ||
      'Either party may terminate this Agreement at the end of the then-current Initial Term or Renewal Term by delivering written notice of non-renewal to the other party.',
  });
  const [isAiResponding, setIsAiResponding] = useState(false);

  const documentContainerRef = useRef<HTMLDivElement>(null);
  const highlightedClauseRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted clause when it changes
  useEffect(() => {
    if (highlightedClauseRef.current) {
      highlightedClauseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentPage, highlightedSectionRef]);

  const handleNavigateSource = (page: number, sectionRef: string) => {
    setCurrentPage(page);
    setHighlightedSectionRef(sectionRef);
    setTimeout(() => {
      if (highlightedClauseRef.current) {
        highlightedClauseRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const handleAskPrompt = (query: AiPromptQuery) => {
    setIsAiResponding(true);
    setInputValue(query.question);

    setTimeout(() => {
      setActiveAiResponse(query);
      setIsAiResponding(false);
    }, 350);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const queryText = inputValue.trim();
    setIsAiResponding(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          contractId: contract.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.text) {
          setActiveAiResponse({
            question: queryText.toUpperCase(),
            answer: data.text,
            sourceSection: data.sourceSection || (data.sourcePage ? `Page ${data.sourcePage}` : undefined),
            sourcePage: data.sourcePage || currentPage,
            highlightText: data.evidence || undefined,
          });
          setIsAiResponding(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Workspace AI query fallback to local intent matcher:', err);
    }

    // Fallback to local semantic patterns if offline or demo
    const lower = queryText.toLowerCase();
    if (lower.includes('renewal') || lower.includes('renew')) {
      setActiveAiResponse(AI_PROMPT_QUERIES[0]);
    } else if (lower.includes('review') || lower.includes('conflict') || lower.includes('clause')) {
      setActiveAiResponse(AI_PROMPT_QUERIES[1]);
    } else if (lower.includes('change') || lower.includes('previous') || lower.includes('version')) {
      setActiveAiResponse(AI_PROMPT_QUERIES[2]);
    } else if (lower.includes('vendor') || lower.includes('obligation')) {
      setActiveAiResponse(AI_PROMPT_QUERIES[3]);
    } else {
      setActiveAiResponse({
        question: queryText.toUpperCase(),
        answer: `According to ${contract.title}, the clause governing your query is indexed under the active contractual stipulations. Formal written notice and standard covenants apply.`,
        sourceSection: highlightedSectionRef || 'General Terms',
        sourcePage: currentPage,
        highlightText: 'Notice must be delivered in accordance with formal contract stipulations.'
      });
    }
    setIsAiResponding(false);
  };

  const pageContent = availablePages[currentPage] || availablePages[pageNumbers[0]] || CONTRACT_DOCUMENT_PAGES[14];
  const conflictData = contract.conflictData !== undefined ? contract.conflictData : CLAUSE_CONFLICT_DATA;

  const attentionItemsList =
    contract.attentionItems && contract.attentionItems.length > 0
      ? contract.attentionItems
      : [
          {
            id: 'renewal',
            title: 'Renewal Notice',
            subtitle: 'Written opt-out required before auto-extension',
            badgeText: '18 days',
            badgeColor: 'rose',
            targetPage: 14,
            targetSection: 'Section 8.2',
          },
          {
            id: 'monthly',
            title: 'Monthly Report',
            subtitle: 'Vendor availability & SLA audit due',
            badgeText: '5 days',
            badgeColor: 'amber',
            targetPage: 11,
            targetSection: 'Section 7.3',
          },
          {
            id: 'conflict',
            title: 'Payment Conflict',
            subtitle: 'Inconsistency: Net 30 vs Net 45',
            badgeText: 'Review Required',
            badgeColor: 'yellow',
            targetPage: 7,
            targetSection: 'Section 4.1',
          },
        ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#07080F]">
      {/* Workspace Dark Header */}
      <div className="bg-[#0B0E1D]/90 backdrop-blur-xl border-b border-violet-950/60 px-6 py-4 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBack}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#141A33] rounded-lg transition-colors"
              title="Back to Contracts"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {contract.title}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE ●
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  contract.fileFormat === 'docx' || contract.fileName?.toLowerCase().endsWith('.docx')
                    ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
                    : 'bg-violet-950/70 text-violet-300 border-violet-500/40'
                }`}>
                  {contract.fileFormat === 'docx' || contract.fileName?.toLowerCase().endsWith('.docx') ? 'Word (.docx)' : 'PDF'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {contract.pagesCount} pages · Last analyzed just now · Verified against Delaware Chancery rules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Feature 3: Find My Actions Trigger */}
            <button
              id="btn-find-my-actions"
              onClick={() => setIsActionsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:text-white bg-gradient-to-r from-violet-950/80 via-indigo-950/80 to-cyan-950/80 hover:from-violet-900 hover:to-cyan-900 rounded-xl transition-all border border-cyan-500/50 shadow-[0_0_14px_rgba(6,182,212,0.25)] hover:scale-[1.02]"
              title="Find my actions: Urgent, upcoming deadlines and review items"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>FIND MY ACTIONS</span>
            </button>

            {/* Feature 12: Executive Summary Brief Trigger */}
            <button
              id="btn-executive-summary"
              onClick={() => setIsExecSummaryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white bg-[#0E162C] hover:bg-[#162347] rounded-xl transition-all border border-violet-800/50 hover:border-cyan-500/40"
              title="Generate business executive brief"
            >
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              <span>EXECUTIVE BRIEF</span>
            </button>

            {/* Export to PDF Button for Legal Sign-Off */}
            <button
              id="btn-export-to-pdf"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:text-white bg-[#0E162C] hover:bg-[#162347] rounded-xl transition-all border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:scale-[1.02]"
              title="Export structured legal sign-off brief to PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">EXPORT PDF</span>
            </button>

            {/* Primary CTA with violet → blue → cyan signature gradient */}
            <button
              id="btn-ask-contractlens"
              onClick={() => {
                if (onOpenGeminiChat) {
                  onOpenGeminiChat(inputValue || undefined);
                } else {
                  const input = document.getElementById('contractlens-ai-input');
                  if (input) input.focus();
                }
              }}
              className="gradient-brand-cta text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_18px_rgba(139,92,246,0.35)] flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>ASK AI</span>
            </button>

            <button
              onClick={onOpenCompare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-[#11162B] hover:bg-[#18203E] rounded-xl transition-colors border border-violet-900/40"
            >
              <GitCompare className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">COMPARE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Area */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pb-36">
        {/* LEFT: CONTRACT DOCUMENT VIEWER (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Document Toolbar */}
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-slate-400">DOCUMENT VIEWER:</span>
              <span className="text-cyan-300 font-mono-code font-semibold">PAGE {currentPage} / {contract.pagesCount}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0D1122] p-1 rounded-lg border border-violet-950/70">
              <button
                onClick={() => {
                  const currentIdx = pageNumbers.indexOf(currentPage);
                  if (currentIdx > 0) {
                    const prevPage = pageNumbers[currentIdx - 1];
                    handleNavigateSource(prevPage, availablePages[prevPage]?.sections?.[0]?.ref || '');
                  }
                }}
                disabled={pageNumbers.indexOf(currentPage) <= 0}
                className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 py-0.5 text-[11px] font-mono-code text-slate-300">
                Pg {currentPage}
              </span>
              <button
                onClick={() => {
                  const currentIdx = pageNumbers.indexOf(currentPage);
                  if (currentIdx < pageNumbers.length - 1) {
                    const nextPage = pageNumbers[currentIdx + 1];
                    handleNavigateSource(nextPage, availablePages[nextPage]?.sections?.[0]?.ref || '');
                  }
                }}
                disabled={pageNumbers.indexOf(currentPage) >= pageNumbers.length - 1}
                className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document Sheet (Slightly lighter dark surface with crisp readability) */}
          <div
            ref={documentContainerRef}
            className="contract-paper-dark rounded-xl p-8 sm:p-12 min-h-[640px] text-slate-100 relative transition-all"
          >
            {/* Header watermarking */}
            <div className="border-b border-violet-950/80 pb-4 mb-8 flex items-center justify-between text-xs text-slate-400 font-mono-code uppercase tracking-wider">
              <span className="text-cyan-400/90">{pageContent.title}</span>
              <span>REF: CON-2026-88A</span>
            </div>

            <div className="max-w-prose mx-auto">
              <h2 className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-6 text-center">
                {pageContent.article}
              </h2>

              <div className="space-y-6 font-contract text-[17px] leading-[1.75] text-slate-200">
                {pageContent.sections.map((section) => {
                  const isHighlighted = highlightedSectionRef === section.ref || section.isHighlighted;
                  const isSpecificTarget = highlightedSectionRef === section.ref;

                  return (
                    <div
                      key={section.id}
                      ref={isSpecificTarget ? highlightedClauseRef : null}
                      onClick={() => setHighlightedSectionRef(section.ref)}
                      className={`p-3.5 -mx-3.5 rounded-lg transition-all cursor-pointer ${
                        isSpecificTarget
                          ? 'clause-highlight-dark'
                          : isHighlighted
                          ? 'bg-violet-950/30 hover:bg-violet-950/50'
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 font-sans gap-2">
                        <span className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                          <span className="text-cyan-400 font-mono-code">{section.ref}</span>
                          <span className="text-slate-300">— {section.title}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          {isSpecificTarget && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.3)] flex items-center gap-1">
                              <ScanLine className="w-2.5 h-2.5" />
                              EVIDENCE DETECTED
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const exp = CLAUSE_EXPLANATIONS[section.ref] || {
                                sectionRef: section.ref,
                                sectionTitle: section.title,
                                pageNumber: currentPage,
                                whatItSays: section.text,
                                whoItAffects: 'Both Parties',
                                whatItRequires: 'Strict adherence to operational covenants under Delaware legal jurisdiction.',
                                importantDate: 'Operational lifecycle',
                                potentialReview: 'Standard governance review recommended prior to annual cycle.',
                                evidenceQuote: section.text
                              };
                              setActiveExplanation(exp);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-white bg-violet-950/80 hover:bg-violet-900 px-2.5 py-0.5 rounded-md border border-violet-800/60 transition-colors shadow-sm"
                            title="AI Explain clause in plain English"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Explain</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 font-normal">
                        {section.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Page footer */}
              <div className="mt-14 pt-4 border-t border-violet-950/80 flex items-center justify-between text-xs text-slate-400 font-mono-code">
                <span>CONFIDENTIAL — INTERNAL COUNSEL</span>
                <span>PAGE {currentPage} / {contract.pagesCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: AI INTELLIGENCE & METRICS (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-7">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>CONTRACT INTELLIGENCE</span>
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous extraction connected directly to source citations
            </p>
          </div>

          {/* 3 THINGS NEED ATTENTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span>3 THINGS NEED ATTENTION</span>
            </h3>

            <div className="space-y-2.5">
              {attentionItemsList.map((item) => {
                const isActive = activeAttentionFilter === item.id;
                const dotColor =
                  item.badgeColor === 'rose'
                    ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E]'
                    : item.badgeColor === 'amber'
                    ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
                    : 'bg-yellow-400 shadow-[0_0_8px_#EAB308]';
                const badgeColorClasses =
                  item.badgeColor === 'rose'
                    ? 'text-rose-300 bg-rose-950/60 border-rose-500/30'
                    : item.badgeColor === 'amber'
                    ? 'text-amber-300 bg-amber-950/60 border-amber-500/30'
                    : 'text-yellow-300 bg-yellow-950/60 border-yellow-500/30';
                const activeCardClasses = isActive
                  ? item.badgeColor === 'rose'
                    ? 'bg-[#15112B] border-rose-500/40 shadow-[0_0_16px_rgba(244,63,94,0.18)]'
                    : item.badgeColor === 'amber'
                    ? 'bg-[#1A1622] border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.18)]'
                    : 'bg-[#1B1922] border-yellow-500/40 shadow-[0_0_16px_rgba(234,179,8,0.18)]'
                  : 'bg-[#0D1122]/90 border-violet-950/60 hover:border-violet-700/50';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveAttentionFilter(item.id);
                      handleNavigateSource(item.targetPage, item.targetSection);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${activeCardClasses}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase">{item.title}</h4>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${badgeColorClasses}`}>
                        {item.badgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FEATURE 8: CLAUSE CONFLICT DETECTION CARD */}
          {conflictData && conflictReviewStatus !== 'dismissed' && (
            <div className="bg-[#111427]/90 border border-yellow-500/40 rounded-xl p-5 shadow-[0_0_20px_rgba(234,179,8,0.12)] space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 font-mono-code block">
                      CLAUSE CONFLICT DETECTED
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {conflictData.title}
                    </h4>
                  </div>
                </div>

                {conflictReviewStatus === 'reviewed' ? (
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>REVIEWED</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300 bg-yellow-950/60 border border-yellow-500/40 px-2 py-0.5 rounded-full">
                    {conflictData.status}
                  </span>
                )}
              </div>

              {/* Side-by-Side Comparison of Conflicting Clauses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div
                  onClick={() => handleNavigateSource(conflictData.sectionA.pageNumber, conflictData.sectionA.ref)}
                  className="p-3 rounded-lg bg-[#090C1A] border border-violet-950/80 hover:border-cyan-500/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-300 font-mono-code">{conflictData.sectionA.ref}</span>
                    <span className="text-[10px] font-bold text-slate-400">Pg {conflictData.sectionA.pageNumber}</span>
                  </div>
                  <span className="font-semibold text-white block mb-1">{conflictData.sectionA.term}</span>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {conflictData.sectionA.text}
                  </p>
                </div>

                <div
                  onClick={() => handleNavigateSource(conflictData.sectionB.pageNumber, conflictData.sectionB.ref)}
                  className="p-3 rounded-lg bg-[#090C1A] border border-violet-950/80 hover:border-yellow-500/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-yellow-300 font-mono-code">{conflictData.sectionB.ref}</span>
                    <span className="text-[10px] font-bold text-slate-400">Pg {conflictData.sectionB.pageNumber}</span>
                  </div>
                  <span className="font-semibold text-white block mb-1">{conflictData.sectionB.term}</span>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {conflictData.sectionB.text}
                  </p>
                </div>
              </div>

              {/* Operational Impact */}
              <div className="text-xs space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-code">
                  OPERATIONAL IMPACT:
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {conflictData.operationalImpact}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-violet-950/70 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigateSource(conflictData.sectionA.pageNumber, conflictData.sectionA.ref)}
                    className="text-cyan-300 hover:text-white font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span>Inspect Clauses</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {conflictReviewStatus !== 'reviewed' && (
                    <button
                      onClick={() => setConflictReviewStatus('reviewed')}
                      className="px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:text-white bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Reviewed</span>
                    </button>
                  )}
                  <button
                    onClick={() => setConflictReviewStatus('dismissed')}
                    className="text-slate-400 hover:text-slate-200 text-[11px] px-2 py-1 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONTRACT OVERVIEW (Clean typography & separators) */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              CONTRACT OVERVIEW
            </h3>

            <div className="bg-[#0D1122]/90 border border-violet-950/60 rounded-xl p-5 divide-y divide-violet-950/50">
              <div className="py-2.5 flex items-center justify-between text-sm first:pt-0">
                <span className="text-slate-400">Parties</span>
                <span className="font-semibold text-slate-200 text-right">
                  {contract.parties.client} · {contract.parties.vendor}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-slate-400">Effective</span>
                <span className="font-semibold text-slate-200">{contract.effectiveDate}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-slate-400">Expires</span>
                <span className="font-semibold text-slate-200">{contract.expirationDate}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-slate-400">Payment</span>
                <span className="font-semibold text-cyan-300 font-mono-code">{contract.summary.payment}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-slate-400">Renewal</span>
                <span className="font-semibold text-slate-200">{contract.summary.renewal}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-sm last:pb-0">
                <span className="text-slate-400">Termination</span>
                <span className="font-semibold text-slate-200">{contract.summary.termination}</span>
              </div>
            </div>
          </div>

          {/* KEY OBLIGATIONS */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              KEY OBLIGATIONS
            </h3>

            <div className="bg-[#0D1122]/90 border border-violet-950/60 rounded-xl divide-y divide-violet-950/50 overflow-hidden">
              {obligationsToDisplay.slice(0, 4).map((obl) => {
                const isExpanded = expandedObligationId === obl.id;

                return (
                  <div key={obl.id} className="transition-colors">
                    <button
                      onClick={() => setExpandedObligationId(isExpanded ? null : obl.id)}
                      className="w-full text-left px-5 py-3.5 flex items-center justify-between hover:bg-[#131830]/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          obl.status === 'due_soon'
                            ? 'bg-amber-400 shadow-[0_0_6px_#F59E0B]'
                            : obl.status === 'completed'
                            ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]'
                            : 'bg-slate-500'
                        }`} />
                        <div>
                          <span className="text-sm font-semibold text-slate-200">{obl.title}</span>
                          <span className="text-xs text-slate-400 ml-2 font-mono-code">({obl.responsibleParty})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{obl.dueDate}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 text-xs bg-[#0B0E1B] border-t border-violet-950/60">
                        <p className="text-slate-300 leading-relaxed mb-3">
                          {obl.description}
                        </p>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Reference: <strong className="text-cyan-300 font-mono-code">{obl.sectionRef}</strong></span>
                          <button
                            onClick={() => handleNavigateSource(obl.pageNumber, obl.sectionRef)}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Inspect clause</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DISTINCTIVE AI FLOATING COMMAND BAR */}
      <div className="fixed bottom-6 left-0 right-0 z-30 px-6 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto space-y-3">
          {/* Contextual AI response card (appears ABOVE the command bar) */}
          {activeAiResponse && (
            <div className="bg-[#0B0E1D]/95 backdrop-blur-xl border border-violet-500/40 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] glow-subtle-brand animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">CONTRACTLENS AGENT</span>
                </div>
                <button
                  onClick={() => setActiveAiResponse(null)}
                  className="text-xs text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed mb-3">
                {activeAiResponse.answer}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-violet-950/80 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="uppercase text-[10px] tracking-wider font-bold">SOURCE:</span>
                  <span className="font-semibold text-cyan-300 font-mono-code">{activeAiResponse.sourceSection} · Page {activeAiResponse.sourcePage}</span>
                </div>

                {/* Source button with cyan-blue highlighting */}
                <button
                  onClick={() => handleNavigateSource(activeAiResponse.sourcePage, activeAiResponse.sourceSection)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-200 bg-gradient-to-r from-violet-600/60 to-cyan-600/60 hover:from-violet-600 hover:to-cyan-500 px-3 py-1.5 rounded-lg border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
                >
                  <span>VIEW SOURCE</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Suggested Prompts Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {AI_PROMPT_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskPrompt(q)}
                className="whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#0D1122]/90 hover:bg-[#141A33] text-slate-300 hover:text-cyan-300 rounded-full border border-violet-950/70 hover:border-cyan-500/40 shadow-md transition-all hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]"
              >
                {q.question}
              </button>
            ))}
          </div>

          {/* Main Floating Input Bar with subtle purple-blue-cyan border glow */}
          <form
            onSubmit={handleCustomSubmit}
            className="bg-[#0B0E1D]/95 backdrop-blur-xl border border-violet-500/40 hover:border-cyan-500/50 rounded-2xl p-2.5 pl-4 flex items-center gap-3 glow-command-bar focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
            <input
              id="contractlens-ai-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ASK CONTRACTLENS ANYTHING..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none tracking-wide"
            />
            <button
              type="submit"
              disabled={isAiResponding || !inputValue.trim()}
              className="gradient-brand-cta disabled:opacity-30 disabled:hover:scale-100 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            >
              {isAiResponding ? (
                <span>ANALYZING...</span>
              ) : (
                <>
                  <span>ASK</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Structured Legal Sign-Off Brief Modal for PDF Export */}
      <ExportLegalSignoffModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        contract={contract}
        obligations={obligationsToDisplay}
        actionItems={actionItemsState}
      />

      {/* Feature 3: Find My Actions Modal */}
      <FindMyActionsModal
        isOpen={isActionsModalOpen}
        onClose={() => setIsActionsModalOpen(false)}
        actionItems={actionItemsState}
        onReviewClause={(page: number, sectionRef: string) => {
          setIsActionsModalOpen(false);
          handleNavigateSource(page, sectionRef);
        }}
        onMarkReviewed={(id: string) => {
          setActionItemsState((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, reviewStatus: 'reviewed' as const } : item
            )
          );
        }}
        onDismissAction={(id: string) => {
          setActionItemsState((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, reviewStatus: 'dismissed' as const } : item
            )
          );
        }}
      />

      {/* Feature 12: Executive Summary Modal */}
      <ExecutiveSummaryModal
        isOpen={isExecSummaryOpen}
        onClose={() => setIsExecSummaryOpen(false)}
        contract={contract}
        obligations={obligationsToDisplay}
        actionItems={actionItemsState}
        onOpenClause={(page: number, sectionRef: string) => {
          setIsExecSummaryOpen(false);
          handleNavigateSource(page, sectionRef);
        }}
      />

      {/* Feature Clause Explanation Modal */}
      <ExplainClauseModal
        isOpen={!!activeExplanation}
        onClose={() => setActiveExplanation(null)}
        clauseExplanation={activeExplanation}
        onAskFollowUp={(query: string) => {
          setActiveExplanation(null);
          if (onOpenGeminiChat) {
            onOpenGeminiChat(query);
          } else {
            setInputValue(query);
            handleCustomSubmit({ preventDefault: () => {} } as any);
          }
        }}
      />
    </div>
  );
};
