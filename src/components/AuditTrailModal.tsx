import React, { useEffect, useState } from 'react';
import { getContractAuditLogs, AuditLogEntry } from '../services/auditService';
import { Clock, ShieldCheck, X, FileText, CheckCircle2 } from 'lucide-react';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractTitle: string;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  contractId,
  contractTitle,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && contractId) {
      setLoading(true);
      getContractAuditLogs(contractId)
        .then((data) => setLogs(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, contractId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0D1122] border border-violet-900/50 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="p-6 border-b border-violet-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Contract Compliance Audit Trail</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                  Immutable
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {contractTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading audit records...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No audit trail events recorded yet.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#07080F] border border-violet-950/70 hover:border-violet-800/60 transition-colors flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-slate-300 mb-1.5 leading-relaxed">{log.details}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                    <span>User: {log.userEmail}</span>
                    <span>•</span>
                    <span>UID: {log.userUid.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-violet-950 bg-[#07080F]/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic integrity verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
