import React, { useState } from 'react';
import { AnimatedLogo } from './AnimatedLogo';
import { UploadCloud, X, Sparkles, AlertCircle, FileText, FileCode } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAnalysis: (fileOrDemo: File | 'demo') => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onStartAnalysis,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoClick = () => {
    setValidationError(null);
    onStartAnalysis('demo');
  };

  const handleFileProcess = (file: File) => {
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');
    const isDocx =
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.doc');

    if (!isPdf && !isDocx) {
      setValidationError('Please upload a valid PDF (.pdf) or Word document (.docx).');
      return;
    }

    setValidationError(null);
    onStartAnalysis(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07080F]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0E1D] border border-violet-500/40 rounded-2xl max-w-xl w-full p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] glow-subtle-brand relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Animated Logo */}
        <div className="flex justify-center mb-6">
          <AnimatedLogo size="hero" showWordmark={false} isLooping={true} />
        </div>

        {/* Heading & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
          Upload a contract.
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-5 leading-relaxed">
          Turn a long agreement into clear actions, deadlines and decisions.
        </p>

        {/* Supported Format Indicators */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/60 border border-violet-700/50 text-violet-200">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            PDF (.pdf)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 border border-cyan-700/50 text-cyan-200">
            <FileCode className="w-3.5 h-3.5 text-cyan-300" />
            Word (.docx)
          </span>
        </div>

        {validationError && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Large Drag-and-Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileProcess(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center mb-6 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : 'border-violet-950/80 hover:border-violet-600/60 bg-[#090C19]/80'
          }`}
        >
          <UploadCloud className="w-10 h-10 text-violet-400 mb-3" />
          <p className="text-sm font-semibold text-slate-200 mb-1">
            Drag and drop your contract PDF or DOCX here
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Supports standard PDF agreements or Word (.docx) documents up to 50MB
          </p>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 bg-[#141A33] hover:bg-violet-900/50 border border-violet-800/40 rounded-lg shadow-sm transition-colors">
            <span>Browse PDF / DOCX</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleDemoClick}
            className="w-full sm:w-auto gradient-brand-cta text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_18px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>TRY DEMO CONTRACT</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
