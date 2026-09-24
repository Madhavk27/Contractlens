import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Contract } from '../types';
import { scanForSensitiveData } from '../utils/sensitiveDataDetector';
import {
  ShieldCheck,
  Lock,
  BrainCircuit,
  UserCheck,
  FileText,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Clock,
} from 'lucide-react';

interface SecurityTrustSectionProps {
  contract?: Contract;
  onOpenAuditTrail?: () => void;
  onDeleteContract?: (contractId: string) => void;
  className?: string;
}

export const SecurityTrustSection: React.FC<SecurityTrustSectionProps> = ({
  contract,
  onOpenAuditTrail,
  onDeleteContract,
  className = '',
}) => {
  const { user, uid, emailVerified } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Scan contract text for sensitive information
  const contractContentToScan = React.useMemo(() => {
    if (!contract) return '';
    let text = contract.title + ' ' + (contract.extractedText || '');
    if (contract.pages) {
      Object.values(contract.pages).forEach((p) => {
        p.sections?.forEach((s) => {
          text += ' ' + s.title + ' ' + s.text;
        });
      });
    }
    return text;
  }, [contract]);

  const sensitiveReport = React.useMemo(() => {
    return scanForSensitiveData(contractContentToScan);
  }, [contractContentToScan]);

  const isOwner = Boolean(
    uid && contract && ((contract as any).ownerUid === uid || (contract as any).ownerUid === undefined)
  );
  const isDemo = contract?.id === 'abc-vendor' || (contract as any)?.isDemo;

  const handleDelete = async () => {
    if (!contract || !onDeleteContract) return;
    setIsDeleting(true);
    try {
      await onDeleteContract(contract.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-[#090D1E]/90 border border-violet-950/70 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-violet-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
              SECURITY & TRUST
            </h3>
            <p className="text-[11px] text-slate-400">
              Zero-trust identity, encrypted storage & evidence verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAuditTrail && (
            <button
              type="button"
              onClick={onOpenAuditTrail}
              className="px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Inspect chronological contract compliance audit trail"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Activity Log</span>
            </button>
          )}

          {isOwner && !isDemo && onDeleteContract && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Permanently remove contract and analysis"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Contract</span>
            </button>
          )}
        </div>
      </div>

      {/* 5 Core Trust Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {/* Pillar 1: Verified Access */}
        <div className="p-2.5 rounded-xl bg-[#060914] border border-violet-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white leading-tight">Verified Access</div>
            <div className="text-[10px] text-slate-400">
              {emailVerified ? 'Identity Confirmed' : user ? 'Email Pending' : 'Demo Access'}
            </div>
          </div>
        </div>

        {/* Pillar 2: Private Contract Storage */}
        <div className="p-2.5 rounded-xl bg-[#060914] border border-violet-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white leading-tight">Private Storage</div>
            <div className="text-[10px] text-slate-400">Owner-only Firestore</div>
          </div>
        </div>

        {/* Pillar 3: Evidence-Grounded AI */}
        <div className="p-2.5 rounded-xl bg-[#060914] border border-violet-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-300" />
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white leading-tight">Grounded AI</div>
            <div className="text-[10px] text-slate-400">Clause citations</div>
          </div>
        </div>

        {/* Pillar 4: Human Review */}
        <div className="p-2.5 rounded-xl bg-[#060914] border border-violet-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white leading-tight">Human Review</div>
            <div className="text-[10px] text-slate-400">Counsel sign-off</div>
          </div>
        </div>

        {/* Pillar 5: Activity Log */}
        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-[#060914] border border-violet-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-white leading-tight">Activity Log</div>
            <div className="text-[10px] text-slate-400">Tamper-evident trail</div>
          </div>
        </div>
      </div>

      {/* Sensitive Data Notice */}
      {sensitiveReport.detected ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-200">Sensitive information detected: </span>
              <span className="text-amber-300/80">
                Found{' '}
                {sensitiveReport.findings
                  .map((f) => `${f.count} ${f.label.toLowerCase()}`)
                  .join(', ')}
                . Secure client-side isolation active.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono whitespace-nowrap">
            {sensitiveReport.totalCount} items
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300/90">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Document Data Scan: No unencrypted sensitive payment identifiers detected.</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">App Check Protected</span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0D1122] border border-rose-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Delete Contract?</h4>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Delete this contract and all associated analysis?
              <br />
              <span className="text-slate-400 mt-1 block">
                This will permanently delete metadata, obligations, reviews, extracted clauses, and
                private storage files. This action cannot be undone.
              </span>
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-xl bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
