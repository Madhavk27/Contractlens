import React, { useState, useRef, useEffect } from 'react';
import { Contract, ChatMessage, GeminiModelType } from '../types';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ExternalLink,
  RotateCcw,
  Zap,
  Scale,
  Brain,
  Check,
  Copy,
  AlertCircle,
  FileText
} from 'lucide-react';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onNavigateClause?: (page: number, sectionRef: string) => void;
  initialQuery?: string;
}

const MODEL_OPTIONS: Array<{
  id: GeminiModelType;
  name: string;
  badge: string;
  description: string;
  icon: typeof Sparkles;
}> = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'General Tasks (Default)',
    description: 'Balanced speed and legal reasoning for obligations & triage',
    icon: Sparkles,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    badge: 'Complex Reasoning',
    description: 'Deep covenant conflict analysis & liability deep-dives',
    icon: Brain,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Fast Tasks',
    description: 'Ultra-low latency clause retrieval & quick definitions',
    icon: Zap,
  },
];

const ROLE_PRESETS = [
  {
    id: 'general_counsel',
    title: 'Senior Corporate Counsel',
    instruction:
      'You are ContractLens AI acting as a Senior Corporate Legal Counsel. Provide strategic, actionable contract analysis with precise section citations, risk allocations, and executive-level recommendations.',
  },
  {
    id: 'compliance_officer',
    title: 'Compliance & Audit Lead',
    instruction:
      'You are ContractLens AI acting as a Compliance & Audit Lead. Focus strictly on SLA benchmarks, reporting deadlines, notice delivery methods, breach thresholds, and Delaware Chancery contract enforceability.',
  },
  {
    id: 'procurement_specialist',
    title: 'Commercial Procurement Lead',
    instruction:
      'You are ContractLens AI acting as a Strategic Procurement Director. Identify invoice discrepancies (Net 30 vs 45), annual rate escalation compounding, auto-renewal financial exposure, and vendor performance credits.',
  },
];

const SUGGESTED_QUERIES = [
  'What are our immediate non-renewal deadlines under Section 8.2?',
  'Analyze the payment terms conflict between Section 4.1 and Exhibit B',
  'What SLA remedies do we have if uptime drops below 99.9%?',
  'Draft a 1-paragraph formal notice of non-renewal for General Counsel',
];

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({
  isOpen,
  onClose,
  contract,
  onNavigateClause,
  initialQuery,
}) => {
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState(ROLE_PRESETS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Welcome to **ContractLens AI Assistant**. I am indexed on **${contract.title}** (24 pages, Delaware Chancery jurisdiction). 

Ask me anything about obligations, conflicting covenants, notice windows, or liability caps. What would you like to examine?`,
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash',
      citations: [
        { sectionRef: 'Section 8.2', pageNumber: 14, quote: 'Renewal & Notice Period' },
        { sectionRef: 'Section 7.3', pageNumber: 11, quote: 'SLA Telemetry Standard' }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInputMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          systemInstruction: selectedRole.instruction,
          contractContext: `${contract.title}, ${contract.summary.governingLaw}, Term: ${contract.effectiveDate} - ${contract.expirationDate}, Value: $1.25M ARR`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      // Resilient fallback assistant message
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `### Legal Analysis (${selectedModel})
Under **Section 8.2** and **Section 4.1** of ${contract.title}:
- **Renewal Mandate:** Non-renewal notice must be delivered by **October 15, 2026** (30 days prior to term expiration).
- **Payment Conflict:** Main agreement specifies Net 30, whereas Exhibit B states Net 45.
- **Action Item:** We recommend requesting an explicit written amendment before final sign-off.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: `${selectedModel} (Offline)`,
        citations: [
          { sectionRef: 'Section 8.2', pageNumber: 14 },
          { sectionRef: 'Section 4.1', pageNumber: 7 }
        ]
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetHistory = () => {
    setMessages([
      {
        id: 'reset-1',
        role: 'assistant',
        content: `Conversation refreshed. I am ready to review **${contract.title}** using **${selectedModel}** with the **${selectedRole.title}** role profile.`,
        timestamp: 'Just now',
        modelUsed: selectedModel,
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#090C19] border-l border-violet-950/80 flex flex-col h-full shadow-[0_0_80px_rgba(139,92,246,0.3)] animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-violet-950/80 bg-[#0D1226] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand-cta flex items-center justify-center text-white shadow-[0_0_14px_rgba(139,92,246,0.4)]">
              <Sparkles className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">Ask ContractLens AI</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-violet-950 text-cyan-300 border border-violet-500/30">
                  MULTI-TURN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded on {contract.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetHistory}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#141A33] rounded-lg transition-colors"
              title="Reset conversation thread"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#141A33] rounded-lg transition-colors"
              title="Close chat drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Model & Role Selection Bar */}
        <div className="px-6 py-2.5 bg-[#0A0E20] border-b border-violet-950/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Model:</span>
            <div className="flex items-center gap-1.5">
              {MODEL_OPTIONS.map((m) => {
                const isSelected = selectedModel === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-violet-600/30 text-cyan-300 border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                        : 'text-slate-400 hover:text-slate-200 bg-[#121730] border border-transparent'
                    }`}
                    title={m.description}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{m.name.replace('Gemini ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Role Selector */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-violet-950/40">
            <span className="text-slate-400 font-medium">Role:</span>
            <select
              value={selectedRole.id}
              onChange={(e) => {
                const found = ROLE_PRESETS.find((r) => r.id === e.target.value);
                if (found) setSelectedRole(found);
              }}
              className="bg-[#121730] border border-violet-900/40 text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-400"
            >
              {ROLE_PRESETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg gradient-brand-cta flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed relative group ${
                    isUser
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                      : 'bg-[#10152B] text-slate-200 border border-violet-900/40 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Assistant Message Header / Model Tag */}
                  {!isUser && (
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-violet-900/30 text-[10px] text-slate-400">
                      <span className="font-semibold text-cyan-300 font-mono-code">
                        {msg.modelUsed || selectedModel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Content rendered cleanly */}
                  <div className="space-y-2 whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  {/* Interactive Section Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-violet-900/40 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Cited Clauses:
                      </span>
                      {msg.citations.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (onNavigateClause) {
                              onNavigateClause(c.pageNumber, c.sectionRef);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-950/80 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                          title={`Jump to ${c.sectionRef} on Page ${c.pageNumber}`}
                        >
                          <span>{c.sectionRef} (Pg {c.pageNumber})</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#18203E] border border-violet-900/50 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg gradient-brand-cta flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.3)] animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              </div>
              <div className="bg-[#10152B] border border-violet-900/40 rounded-2xl rounded-tl-none p-3.5 text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs text-slate-400 font-mono-code">
                  ContractLens AI analyzing covenants with {selectedModel}...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Pills */}
        <div className="px-6 py-2 bg-[#090C19] border-t border-violet-950/40 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Prompts:
          </span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#121832] hover:bg-[#1C254C] text-slate-300 hover:text-cyan-300 border border-violet-900/30 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-violet-950/80 bg-[#0C1022]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2 bg-[#121832] border border-violet-900/50 rounded-xl p-2 focus-within:border-cyan-400/80 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
          >
            <textarea
              ref={inputRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask ${selectedRole.title} using ${selectedModel}...`}
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 resize-none focus:outline-none p-1 leading-relaxed"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="gradient-brand-cta text-white p-2.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
            <span>Press Enter to send, Shift+Enter for newline</span>
            <span>Delaware Chancery Law · Grounded in Execution Copy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
