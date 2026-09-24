import React, { useEffect, useState } from 'react';
import { AnimatedLogo } from './AnimatedLogo';
import { Check, Sparkles, FileText, CheckCircle2, AlertTriangle, RotateCcw, X } from 'lucide-react';

interface AIProcessingOverlayProps {
  fileName?: string;
  isRealUpload?: boolean;
  stageIndex?: number;
  error?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
  onComplete: () => void;
}

const AGENT_STEPS = [
  'Uploading PDF to server',
  'Ingesting into Gemini Files API',
  'Analyzing clauses & structure',
  'Extracting obligations & covenants',
  'Checking inconsistencies & deadlines',
  'Verifying evidence citations',
];

const AGENT_METRICS = [
  { label: 'Pipeline', value: 'Gemini 3.8' },
  { label: 'Ingestion', value: 'Files API' },
  { label: 'Verification', value: 'Grounding' },
];

export const AIProcessingOverlay: React.FC<AIProcessingOverlayProps> = ({
  fileName = 'ABC Vendor Agreement v2.1.pdf',
  isRealUpload = false,
  stageIndex,
  error,
  onRetry,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompletedState, setIsCompletedState] = useState(false);

  const isDocx = fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc');

  const AGENT_STEPS = isDocx
    ? [
        'Uploading Word document to server',
        'Converting DOCX to PDF format',
        'Ingesting into Gemini Files API',
        'Extracting obligations & covenants',
        'Checking inconsistencies & deadlines',
        'Verifying evidence citations',
      ]
    : [
        'Uploading PDF to server',
        'Ingesting into Gemini Files API',
        'Analyzing clauses & structure',
        'Extracting obligations & covenants',
        'Checking inconsistencies & deadlines',
        'Verifying evidence citations',
      ];

  const agentMetrics = [
    { label: 'Format', value: isDocx ? 'Word (.docx)' : 'PDF' },
    { label: 'Pipeline', value: 'Gemini 3.8' },
    { label: 'Verification', value: 'Grounding' },
  ];

  useEffect(() => {
    if (error) return;

    if (isRealUpload) {
      if (typeof stageIndex === 'number') {
        setCurrentStepIndex(stageIndex);
        if (stageIndex >= AGENT_STEPS.length) {
          setIsCompletedState(true);
          const timer = setTimeout(onComplete, 800);
          return () => clearTimeout(timer);
        }
      }
      return;
    }

    // Demo Mode simulated progression
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < AGENT_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsCompletedState(true);
          setTimeout(onComplete, 850);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete, isRealUpload, stageIndex, error, AGENT_STEPS.length]);

  // Color progression for steps: violet → blue → cyan
  const getStepColor = (idx: number) => {
    if (idx < 2) return 'text-violet-400 bg-violet-950/60 border-violet-500/40';
    if (idx < 4) return 'text-indigo-400 bg-indigo-950/60 border-indigo-500/40';
    return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07080F]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="max-w-md w-full space-y-7">
        {/* Animated Brand Identity */}
        <div className="flex justify-center">
          <AnimatedLogo size="hero" showWordmark={false} isLooping={!error} />
        </div>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-bold tracking-widest text-cyan-400 uppercase font-mono-code mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>CONTRACTLENS AGENT</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">
            {error
              ? 'Analysis Error'
              : isCompletedState
              ? 'Analysis Complete'
              : 'Analyzing Contract...'}
          </h2>
          <p className="text-xs text-slate-400 font-mono-code truncate px-4 flex items-center justify-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{fileName}</span>
          </p>
        </div>

        {/* Error Card if failure occurs */}
        {error ? (
          <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-5 text-left space-y-3 shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-200">Could not complete PDF analysis</h4>
                <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-[#141A33] hover:bg-[#1A2244] rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Violet → Blue → Cyan Progress Bar */}
            <div className="w-full bg-[#11162B] h-1.5 rounded-full overflow-hidden border border-violet-950/60">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-400 transition-all duration-300 shadow-[0_0_12px_#22D3EE]"
                style={{
                  width: `${
                    isCompletedState
                      ? 100
                      : Math.min(100, Math.max(10, ((currentStepIndex + 1) / AGENT_STEPS.length) * 100))
                  }%`,
                }}
              />
            </div>

            {/* Clean Checklist Progression */}
            <div className="bg-[#0B0E1D] border border-violet-950/80 rounded-xl p-5 space-y-2.5 text-left shadow-2xl">
              {AGENT_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex || isCompletedState;
                const isCurrent = idx === currentStepIndex && !isCompletedState;

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 text-xs transition-opacity duration-200 ${
                      isCompleted || isCurrent ? 'opacity-100' : 'opacity-25'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isCompleted
                          ? getStepColor(idx)
                          : isCurrent
                          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-400'
                          : 'border-slate-800 bg-[#090C19] text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>

                    <span
                      className={`font-semibold tracking-wide ${
                        isCurrent
                          ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                          : isCompleted
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {step}
                    </span>

                    {isCurrent && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Agent Metrics Ledger Bar */}
            <div className="grid grid-cols-3 gap-2 text-left">
              {agentMetrics.map((m, idx) => (
                <div key={idx} className="bg-[#0D1122]/80 border border-violet-950/60 rounded-lg p-2.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono-code block">{m.label}</span>
                  <span className="text-xs font-bold text-cyan-300">{m.value}</span>
                </div>
              ))}
            </div>

            {isCompletedState && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 py-2 px-4 rounded-xl shadow-[0_0_16px_rgba(16,185,129,0.2)] animate-in fade-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ANALYSIS COMPLETE · OPENING WORKSPACE</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

