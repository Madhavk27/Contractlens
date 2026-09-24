import React, { useState } from 'react';
import { Contract, ContractObligation, ActionItem, LegalSignoffData } from '../types';
import {
  FileDown,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Scale,
  Sparkles
} from 'lucide-react';

interface ExportLegalSignoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  obligations: ContractObligation[];
  actionItems: ActionItem[];
}

export const ExportLegalSignoffModal: React.FC<ExportLegalSignoffModalProps> = ({
  isOpen,
  onClose,
  contract,
  obligations,
  actionItems,
}) => {
  const [copied, setCopied] = useState(false);
  const [signoffData, setSignoffData] = useState<LegalSignoffData>({
    counselName: 'Elena Rostova, Esq.',
    counselTitle: 'Lead Corporate Counsel & Legal Ops Director',
    organization: 'Global Enterprise Holdings LLC',
    barNumber: 'DE Bar #49102-CH',
    signoffDecision: 'approved_with_conditions',
    conditions: 'Execution conditional on dispatching formal non-renewal opt-out notice for Section 8.2 by October 10, 2026, and signing 1-page addendum harmonizing Net 45 payment terms.',
    signoffDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    digitalFingerprint: 'SHA256: 7f83b1654a9d20c388ef11b7d5904b3a1678ec398a'
  });

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const markdown = `# EXECUTIVE LEGAL SIGN-OFF BRIEF & CONTRACT AUDIT
**Document ID:** CON-2026-88A-SIGNOFF
**Target Agreement:** ${contract.title}
**Date of Audit:** ${signoffData.signoffDate}
**Jurisdiction:** ${contract.summary.governingLaw}
**Reviewing Counsel:** ${signoffData.counselName} (${signoffData.barNumber})
**Sign-off Status:** ${signoffData.signoffDecision.toUpperCase().replace(/_/g, ' ')}

---

## 1. COMMERCIAL PROFILE & CONTRACT SUMMARY
- **Parties:** ${contract.parties.client} (Client) ↔ ${contract.parties.vendor} (Vendor)
- **Effective Term:** ${contract.effectiveDate} to ${contract.expirationDate}
- **Baseline Value:** $1,250,000 ARR
- **Payment Terms:** ${contract.summary.payment}
- **Renewal Provision:** ${contract.summary.renewal}
- **Termination:** ${contract.summary.termination}

---

## 2. FLAGGED HIGH-PRIORITY RISKS & ACTION ITEMS
${actionItems.map(item => `### [${item.statusType.toUpperCase()}] ${item.title}
- **Governing Reference:** ${item.sectionRef} (Page ${item.pageNumber})
- **Deadline / Trigger:** ${item.dueDate} (${item.daysRemaining} days remaining)
- **Responsible Party:** ${item.responsibleParty}
- **Impact & Clause:** "${item.clauseExcerpt}"
- **Counsel Recommendation:** ${item.recommendation}
`).join('\n')}

---

## 3. KEY CONTRACTUAL OBLIGATIONS AUDIT
${obligations.map(obl => `- [${obl.status.toUpperCase()}] **${obl.title}** (${obl.sectionRef}, Pg ${obl.pageNumber}) — Due: ${obl.dueDate} | Obligor: ${obl.responsibleParty} | Freq: ${obl.frequency}`).join('\n')}

---

## 4. FORMAL LEGAL COUNSEL SIGN-OFF
- **Decision:** ${signoffData.signoffDecision.replace(/_/g, ' ').toUpperCase()}
- **Conditions / Stipulations:** ${signoffData.conditions || 'None'}
- **Executed By:** ${signoffData.counselName}, ${signoffData.counselTitle}
- **Verification Hash:** ${signoffData.digitalFingerprint}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtmlReport = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Legal Sign-Off Brief - ${contract.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; line-height: 1.6; color: #111827; margin: 40px; background: #fff; }
    .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 28px; }
    .title { font-size: 26px; font-weight: 800; color: #1e1b4b; margin: 0; }
    .subtitle { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 28px; }
    .meta-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .meta-val { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px; }
    h2 { font-size: 16px; font-weight: 700; color: #312e81; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 32px; text-transform: uppercase; letter-spacing: 0.5px; }
    .risk-card { border: 1px solid #e2e8f0; border-left: 4px solid #ef4444; padding: 14px 18px; margin-bottom: 12px; border-radius: 4px; background: #fff; }
    .risk-card.attention { border-left-color: #f59e0b; }
    .risk-card.conflict { border-left-color: #6366f1; }
    .risk-title { font-weight: 700; font-size: 14px; color: #0f172a; display: flex; justify-content: space-between; }
    .risk-desc { font-size: 13px; color: #334155; margin-top: 6px; }
    .quote-box { background: #f1f5f9; font-style: italic; padding: 8px 12px; font-size: 12px; color: #475569; border-radius: 4px; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .signoff-box { border: 2px solid #4f46e5; border-radius: 8px; padding: 20px; margin-top: 36px; background: #faf5ff; }
    .sign-lines { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 28px; }
    .sign-line { border-top: 1px solid #334155; padding-top: 6px; font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <div class="subtitle">ContractLens Intelligence · Formal Legal Sign-Off Brief</div>
    <h1 class="title">${contract.title}</h1>
    <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">Audited & Prepared for General Counsel Review · Ref: CON-2026-88A</div>
  </div>

  <div class="meta-grid">
    <div>
      <div class="meta-label">Client</div>
      <div class="meta-val">${contract.parties.client}</div>
    </div>
    <div>
      <div class="meta-label">Vendor</div>
      <div class="meta-val">${contract.parties.vendor}</div>
    </div>
    <div>
      <div class="meta-label">Initial Term</div>
      <div class="meta-val">${contract.effectiveDate} – ${contract.expirationDate}</div>
    </div>
    <div>
      <div class="meta-label">Governing Law</div>
      <div class="meta-val">${contract.summary.governingLaw}</div>
    </div>
  </div>

  <h2>Flagged Critical Risks & Attention Items</h2>
  ${actionItems.map(item => `
    <div class="risk-card ${item.statusType}">
      <div class="risk-title">
        <span>${item.title}</span>
        <span style="font-size: 12px; font-weight: 600; color: #64748b;">${item.sectionRef} (Pg ${item.pageNumber}) · Due: ${item.dueDate}</span>
      </div>
      <div class="risk-desc">${item.description}</div>
      <div class="quote-box">"${item.clauseExcerpt}"</div>
      <div style="margin-top: 6px; font-size: 12px; color: #1e1b4b; font-weight: 600;">Recommendation: ${item.recommendation}</div>
    </div>
  `).join('')}

  <h2>Key Contractual Obligations & Compliance Schedule</h2>
  <table>
    <thead>
      <tr>
        <th>Obligation</th>
        <th>Obligor</th>
        <th>Due Date</th>
        <th>Reference</th>
        <th>Frequency</th>
        <th>Audit Status</th>
      </tr>
    </thead>
    <tbody>
      ${obligations.map(obl => `
        <tr>
          <td><strong>${obl.title}</strong></td>
          <td>${obl.responsibleParty}</td>
          <td>${obl.dueDate}</td>
          <td>${obl.sectionRef} (Pg ${obl.pageNumber})</td>
          <td>${obl.frequency}</td>
          <td><span style="font-weight: 700; color: ${obl.status === 'due_soon' ? '#dc2626' : '#2563eb'}">${obl.status.toUpperCase()}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="signoff-box">
    <div style="font-size: 14px; font-weight: 800; color: #3730a3; text-transform: uppercase; letter-spacing: 0.5px;">
      Legal Counsel Sign-off & Audit Clearance
    </div>
    <div style="margin-top: 8px; font-size: 13px; color: #1e1b4b;">
      <strong>Reviewing Counsel:</strong> ${signoffData.counselName} (${signoffData.barNumber})<br/>
      <strong>Determination:</strong> ${signoffData.signoffDecision.replace(/_/g, ' ').toUpperCase()}<br/>
      <strong>Contingencies / Notes:</strong> ${signoffData.conditions || 'None'}
    </div>

    <div class="sign-lines">
      <div class="sign-line">
        <strong>Authorized Legal Counsel Signature</strong><br/>
        Date: ${signoffData.signoffDate}
      </div>
      <div class="sign-line">
        <strong>VP of Procurement & Commercial Operations</strong><br/>
        Digital Hash: ${signoffData.digitalFingerprint}
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Legal_SignOff_Brief_${contract.id}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0B0F1F] border border-violet-900/60 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(139,92,246,0.25)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-violet-950/80 bg-[#0E1326] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Executive Legal Sign-Off Brief
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase tracking-wider bg-violet-950/80 text-violet-300 border border-violet-500/30">
                  PDF EXPORT READY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Structured contract intelligence audit, obligations clearance, and risk matrix
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#141A33] hover:bg-[#1C2548] border border-violet-900/40 rounded-lg transition-colors"
              title="Copy markdown text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY MARKDOWN'}</span>
            </button>

            <button
              onClick={handleDownloadHtmlReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#141A33] hover:bg-[#1C2548] border border-violet-900/40 rounded-lg transition-colors"
              title="Download standalone HTML report"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>DOWNLOAD HTML/PDF</span>
            </button>

            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="gradient-brand-cta text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.35)] flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-200" />
              <span>PRINT / SAVE AS PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#141A33] rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two column split: Left = Interactive Sign-Off Controls, Right = Live Document Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#070913]">
          {/* Left Column: Legal Review Controls (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-[#0D1226] border border-violet-950/70 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Legal Reviewer Profile
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Reviewing Counsel Name</label>
                  <input
                    type="text"
                    value={signoffData.counselName}
                    onChange={(e) => setSignoffData({ ...signoffData, counselName: e.target.value })}
                    className="w-full bg-[#131936] border border-violet-900/50 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Title & Organization</label>
                  <input
                    type="text"
                    value={signoffData.counselTitle}
                    onChange={(e) => setSignoffData({ ...signoffData, counselTitle: e.target.value })}
                    className="w-full bg-[#131936] border border-violet-900/50 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Bar ID & Jurisdiction</label>
                  <input
                    type="text"
                    value={signoffData.barNumber}
                    onChange={(e) => setSignoffData({ ...signoffData, barNumber: e.target.value })}
                    className="w-full bg-[#131936] border border-violet-900/50 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-mono-code"
                  />
                </div>
              </div>
            </div>

            {/* Decision Controls */}
            <div className="bg-[#0D1226] border border-violet-950/70 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-violet-400" />
                Sign-off Determination
              </h3>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#131936] border border-violet-900/30 cursor-pointer hover:border-violet-500/50">
                  <input
                    type="radio"
                    name="signoff_decision"
                    checked={signoffData.signoffDecision === 'approved'}
                    onChange={() => setSignoffData({ ...signoffData, signoffDecision: 'approved' })}
                    className="accent-cyan-400"
                  />
                  <span className="font-semibold text-emerald-300">Approved Without Conditions</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#131936] border border-violet-900/30 cursor-pointer hover:border-violet-500/50">
                  <input
                    type="radio"
                    name="signoff_decision"
                    checked={signoffData.signoffDecision === 'approved_with_conditions'}
                    onChange={() => setSignoffData({ ...signoffData, signoffDecision: 'approved_with_conditions' })}
                    className="accent-cyan-400"
                  />
                  <span className="font-semibold text-amber-300">Approved with Conditions</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#131936] border border-violet-900/30 cursor-pointer hover:border-violet-500/50">
                  <input
                    type="radio"
                    name="signoff_decision"
                    checked={signoffData.signoffDecision === 'rejected'}
                    onChange={() => setSignoffData({ ...signoffData, signoffDecision: 'rejected' })}
                    className="accent-cyan-400"
                  />
                  <span className="font-semibold text-rose-300">Escalate / Reject</span>
                </label>
              </div>

              <div className="mt-3">
                <label className="block text-slate-400 text-xs mb-1 font-medium">Contingencies / Stipulations</label>
                <textarea
                  rows={4}
                  value={signoffData.conditions}
                  onChange={(e) => setSignoffData({ ...signoffData, conditions: e.target.value })}
                  className="w-full bg-[#131936] border border-violet-900/50 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
                  placeholder="State necessary modifications or formal notice directives..."
                />
              </div>
            </div>

            {/* Quick Audit Metadata */}
            <div className="bg-[#0D1226]/60 border border-violet-950/40 rounded-xl p-4 text-[11px] text-slate-400 space-y-1.5 font-mono-code">
              <div>AUDIT REF: CON-2026-88A-REV2</div>
              <div>HASH: {signoffData.digitalFingerprint.slice(0, 24)}...</div>
              <div>TIMESTAMP: {new Date().toISOString()}</div>
            </div>
          </div>

          {/* Right Column: Live Executive Document Brief Preview (lg:col-span-8) */}
          <div className="lg:col-span-8">
            <div
              id="printable-legal-brief"
              className="bg-white text-slate-900 rounded-xl p-8 sm:p-10 shadow-2xl border border-slate-200 text-xs leading-relaxed printable-document"
            >
              {/* Document Header Bar */}
              <div className="border-b-2 border-indigo-700 pb-5 mb-6 flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                    CONTRACTLENS INTELLIGENCE · FORMAL LEGAL SIGN-OFF BRIEF
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-1">
                    {contract.title}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Pre-Renewal Compliance Audit, Obligation Schedule & Risk Matrix
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono-code font-bold text-[10px]">
                    REF: CON-2026-88A
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Date: {signoffData.signoffDate}
                  </div>
                </div>
              </div>

              {/* Commercial Meta Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-slate-800">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Client Entity</div>
                  <div className="font-semibold text-xs text-slate-900 mt-0.5">{contract.parties.client}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Vendor Entity</div>
                  <div className="font-semibold text-xs text-slate-900 mt-0.5">{contract.parties.vendor}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Term Window</div>
                  <div className="font-semibold text-xs text-slate-900 mt-0.5">
                    {contract.effectiveDate} – {contract.expirationDate}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Jurisdiction</div>
                  <div className="font-semibold text-xs text-slate-900 mt-0.5">{contract.summary.governingLaw}</div>
                </div>
              </div>

              {/* SECTION 1: FLAGGED RISKS & ATTENTION ITEMS */}
              <div className="mb-6">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  1. High-Priority Attention Items & Risk Triage
                </h2>

                <div className="space-y-3">
                  {actionItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border text-xs ${
                        item.statusType === 'urgent'
                          ? 'border-rose-200 bg-rose-50/50'
                          : item.statusType === 'attention'
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-blue-200 bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.statusType === 'urgent'
                                ? 'bg-rose-600'
                                : item.statusType === 'attention'
                                ? 'bg-amber-600'
                                : 'bg-blue-600'
                            }`}
                          />
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono-code text-slate-600 font-semibold">
                          {item.sectionRef} (Pg {item.pageNumber}) · Due: {item.dueDate} ({item.daysRemaining}d left)
                        </span>
                      </div>
                      <p className="text-slate-700 mt-1">{item.description}</p>
                      <div className="mt-1.5 p-2 bg-white/80 border border-slate-200/80 rounded font-serif italic text-[11px] text-slate-600">
                        "{item.clauseExcerpt}"
                      </div>
                      <div className="mt-1.5 text-[11px] text-indigo-950 font-semibold">
                        Action Required: {item.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: SCHEDULE OF CONTRACTUAL OBLIGATIONS */}
              <div className="mb-6">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  2. Key Contractual Obligations Schedule
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                        <th className="py-2 px-2.5">Obligation Description</th>
                        <th className="py-2 px-2.5">Obligor</th>
                        <th className="py-2 px-2.5">Due Date</th>
                        <th className="py-2 px-2.5">Clause Reference</th>
                        <th className="py-2 px-2.5">Frequency</th>
                        <th className="py-2 px-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {obligations.map((obl) => (
                        <tr key={obl.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-semibold text-slate-900">{obl.title}</td>
                          <td className="py-2 px-2.5">{obl.responsibleParty}</td>
                          <td className="py-2 px-2.5 font-medium">{obl.dueDate}</td>
                          <td className="py-2 px-2.5 font-mono-code text-[10px]">{obl.sectionRef} (Pg {obl.pageNumber})</td>
                          <td className="py-2 px-2.5 text-slate-600">{obl.frequency}</td>
                          <td className="py-2 px-2.5 text-right font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
                                obl.status === 'due_soon'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {obl.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: FORMAL LEGAL SIGN-OFF BLOCK */}
              <div className="border-2 border-indigo-600 bg-indigo-50/40 rounded-xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" />
                    <span className="font-bold text-xs uppercase tracking-wider text-indigo-950">
                      General Counsel Legal Clearance & Decision
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 text-indigo-900 border border-indigo-300">
                    {signoffData.signoffDecision.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-3 text-[11px] text-slate-800">
                  <div>
                    <span className="font-bold text-slate-600">Reviewing Attorney:</span>{' '}
                    <span className="font-semibold text-slate-900">{signoffData.counselName}</span> ({signoffData.barNumber})
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Department:</span>{' '}
                    <span className="font-semibold text-slate-900">{signoffData.counselTitle}</span>
                  </div>
                </div>

                {signoffData.conditions && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-950 mb-4">
                    <strong>Contingencies & Covenants:</strong> {signoffData.conditions}
                  </div>
                )}

                {/* Signature Lines */}
                <div className="grid grid-cols-2 gap-8 pt-4 mt-2 border-t border-indigo-200/80">
                  <div>
                    <div className="h-9 flex items-end pb-1 text-xs font-serif italic text-indigo-900 border-b border-slate-700">
                      {signoffData.counselName}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">
                      Lead Legal Counsel Signature · Date: {signoffData.signoffDate}
                    </div>
                  </div>

                  <div>
                    <div className="h-9 flex items-end pb-1 text-xs font-serif italic text-indigo-900 border-b border-slate-700">
                      Verified Electronic Audit Signature
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 mt-1 font-mono-code">
                      Fingerprint: {signoffData.digitalFingerprint.slice(0, 28)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-violet-950/80 bg-[#0E1326] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono-code text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ready for executive legal signature or corporate procurement archiving</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="gradient-brand-cta text-white px-4 py-1.5 font-bold uppercase tracking-wider rounded-lg text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-200" />
              <span>Print to PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
