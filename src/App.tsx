import React, { useState, useEffect } from 'react';
import { NavigationTab, Contract, ActionItem } from './types';
import { RECENT_CONTRACTS, ACTION_CENTER_ITEMS } from './data/mockData';
import { diagnostics } from './utils/diagnosticLogger';
import { TopNavigation } from './components/TopNavigation';
import { DashboardView } from './components/DashboardView';
import { ContractWorkspaceView } from './components/ContractWorkspaceView';
import { ObligationsView } from './components/ObligationsView';
import { CompareView } from './components/CompareView';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { AIProcessingOverlay } from './components/AIProcessingOverlay';
import { GeminiChatDrawer } from './components/GeminiChatDrawer';
import { Sparkles } from 'lucide-react';

// Pre-render dependency verification
const initialDiagnostics = diagnostics.verifyDataDependencies(RECENT_CONTRACTS, ACTION_CENTER_ITEMS);

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('contracts');
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>(RECENT_CONTRACTS);
  const [activeContract, setActiveContract] = useState<Contract>(RECENT_CONTRACTS[0]);

  // Deep-linking / Contextual Clause Targeting for Workspace
  const [targetSection, setTargetSection] = useState<string | undefined>('Section 8.2');
  const [targetPage, setTargetPage] = useState<number | undefined>(14);

  // Gemini Chatbot State
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined);

  // Upload & AI Processing states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isRealUpload, setIsRealUpload] = useState(false);
  const [uploadStage, setUploadStage] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [processingFileName, setProcessingFileName] = useState('ABC Vendor Agreement v2.1.pdf');

  // Notifications
  const [notificationsCount, setNotificationsCount] = useState(3);

  // Track initialization lifecycle
  useEffect(() => {
    diagnostics.log('APP_MOUNTED', {
      tab: currentTab,
      workspaceOpen: isWorkspaceOpen,
      activeContractId: activeContract?.id,
      diagnosticsReportStatus: initialDiagnostics.status,
      contractsLoaded: contracts.length,
      actionItemsLoaded: ACTION_CENTER_ITEMS.length,
    });
  }, []);

  // Navigation handlers
  const handleSelectTab = (tab: NavigationTab) => {
    diagnostics.log('NAVIGATION_TAB_SELECT', { tab });
    setCurrentTab(tab);
    if (tab === 'contracts') {
      // If user clicks Contracts in top nav, go to Dashboard
      setIsWorkspaceOpen(false);
    }
  };

  const handleSelectContract = (contract: Contract) => {
    diagnostics.log('CONTRACT_SELECT', { contractId: contract.id, title: contract.title });
    setActiveContract(contract);

    if (contract.pages && Object.keys(contract.pages).length > 0) {
      const pageNumbers = Object.keys(contract.pages).map(Number).sort((a, b) => a - b);
      const firstPage = pageNumbers[0] || 1;
      const firstSection = contract.pages[firstPage]?.sections?.[0]?.ref || 'Section 1.1';
      setTargetPage(firstPage);
      setTargetSection(firstSection);
    } else {
      setTargetSection('Section 8.2');
      setTargetPage(14);
    }

    setIsWorkspaceOpen(true);
    setCurrentTab('contracts');
  };

  const handleSelectAction = (action: ActionItem) => {
    const matchingContract = contracts.find((c) => c.id === action.contractId) || contracts[0];
    setActiveContract(matchingContract);
    setTargetSection(action.sectionRef.split(' ')[0] ? action.sectionRef : 'Section 8.2');
    setTargetPage(action.pageNumber);
    setIsWorkspaceOpen(true);
    setCurrentTab('contracts');
  };

  const handleOpenContractClause = (page: number, sectionRef: string) => {
    setTargetPage(page);
    setTargetSection(sectionRef);
    setIsWorkspaceOpen(true);
    setCurrentTab('contracts');
  };

  const runUploadPipeline = async (file: File) => {
    setUploadError(null);
    setUploadStage(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Advance to Ingesting into Gemini Files API
      setUploadStage(1);

      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        body: formData,
      });

      // Advance to Analyzing clauses & structure
      setUploadStage(2);

      if (!response.ok) {
        let errDetail = 'Failed to analyze contract document.';
        try {
          const errJson = await response.json();
          if (errJson.error) errDetail = errJson.error;
        } catch (_) {}
        setUploadError(errDetail);
        return;
      }

      // Advance to Extracting obligations
      setUploadStage(3);

      const data = await response.json();
      if (!data.success || !data.contract) {
        setUploadError(data.error || 'Invalid analysis response returned by server.');
        return;
      }

      // Advance to Checking inconsistencies & Verifying evidence
      setUploadStage(4);
      await new Promise((r) => setTimeout(r, 400));
      setUploadStage(5);

      const uploadedContract: Contract = data.contract;

      // Persist in local contract list and set as active
      setContracts((prev) => [uploadedContract, ...prev.filter((c) => c.id !== uploadedContract.id)]);
      setActiveContract(uploadedContract);

      const firstAttention = uploadedContract.attentionItems?.[0];
      if (firstAttention) {
        setTargetPage(firstAttention.targetPage);
        setTargetSection(firstAttention.targetSection);
      } else if (uploadedContract.pages && Object.keys(uploadedContract.pages).length > 0) {
        const pageNumbers = Object.keys(uploadedContract.pages).map(Number).sort((a, b) => a - b);
        const p1 = pageNumbers[0] || 1;
        setTargetPage(p1);
        setTargetSection(uploadedContract.pages[p1]?.sections?.[0]?.ref || 'Section 1.1');
      }

      setNotificationsCount((prev) => prev + 1);

      // Trigger completion
      await new Promise((r) => setTimeout(r, 300));
      setUploadStage(6);
    } catch (err: any) {
      console.error('[ContractLens] Upload pipeline error:', err);
      setUploadError(err.message || 'Network error while analyzing contract document.');
    }
  };

  const handleStartAnalysis = (fileOrDemo: File | 'demo') => {
    setIsUploadOpen(false);

    if (fileOrDemo === 'demo') {
      setIsRealUpload(false);
      setUploadError(null);
      setProcessingFileName('ABC Vendor Agreement v2.1.pdf');
      setActiveContract(RECENT_CONTRACTS[0]);
      setTargetPage(14);
      setTargetSection('Section 8.2');
      setIsAiProcessing(true);
    } else {
      setIsRealUpload(true);
      setPendingFile(fileOrDemo);
      setProcessingFileName(fileOrDemo.name);
      setIsAiProcessing(true);
      runUploadPipeline(fileOrDemo);
    }
  };

  const handleProcessingComplete = () => {
    setIsAiProcessing(false);
    setIsWorkspaceOpen(true);
    setCurrentTab('contracts');
  };

  const handleRetryUpload = () => {
    if (pendingFile) {
      runUploadPipeline(pendingFile);
    }
  };

  const handleCloseOverlay = () => {
    setIsAiProcessing(false);
    setUploadError(null);
  };

  const handleOpenAskAi = (query?: string) => {
    setChatInitialQuery(query);
    setIsGeminiChatOpen(true);
  };

  const handleChatNavigateClause = (page: number, sectionRef: string) => {
    setTargetPage(page);
    setTargetSection(sectionRef);
    setIsWorkspaceOpen(true);
    setCurrentTab('contracts');
  };

  return (
    <div className="min-h-screen bg-[#07080F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Compact Top Navigation (Clean, spacious, no heavy sidebars) */}
      <TopNavigation
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAskAi={handleOpenAskAi}
        onOpenUpload={() => setIsUploadOpen(true)}
        notificationsCount={notificationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* CONTRACTS TAB */}
        {currentTab === 'contracts' && (
          <>
            {isWorkspaceOpen ? (
              <ContractWorkspaceView
                contract={activeContract}
                onBack={() => setIsWorkspaceOpen(false)}
                onOpenCompare={() => setCurrentTab('compare')}
                initialTargetSection={targetSection}
                initialTargetPage={targetPage}
                onOpenGeminiChat={handleOpenAskAi}
              />
            ) : (
              <DashboardView
                actionItems={ACTION_CENTER_ITEMS}
                recentContracts={contracts}
                onSelectAction={handleSelectAction}
                onSelectContract={handleSelectContract}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}
          </>
        )}

        {/* ACTIONS / OBLIGATIONS TAB */}
        {currentTab === 'actions' && (
          <ObligationsView
            onOpenContractClause={handleOpenContractClause}
          />
        )}

        {/* COMPARE VERSIONS TAB */}
        {currentTab === 'compare' && (
          <CompareView
            onBackToWorkspace={isWorkspaceOpen ? () => setCurrentTab('contracts') : undefined}
            onInspectClause={handleOpenContractClause}
          />
        )}
      </main>

      {/* Upload Modal with Demo Contract option */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onStartAnalysis={handleStartAnalysis}
      />

      {/* Authentication Modal */}
      <AuthModal />

      {/* AI Processing Transition Overlay */}
      {isAiProcessing && (
        <AIProcessingOverlay
          fileName={processingFileName}
          isRealUpload={isRealUpload}
          stageIndex={uploadStage}
          error={uploadError}
          onRetry={handleRetryUpload}
          onClose={handleCloseOverlay}
          onComplete={handleProcessingComplete}
        />
      )}

      {/* Floating Gemini Chatbot Trigger Button */}
      {!isGeminiChatOpen && (
        <button
          id="floating-ask-gemini-btn"
          onClick={() => handleOpenAskAi()}
          className="fixed bottom-6 right-6 z-40 gradient-brand-cta text-white px-4 py-2.5 rounded-full shadow-[0_0_24px_rgba(139,92,246,0.45)] flex items-center gap-2 hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider border border-white/20 cursor-pointer"
          title="Open ContractLens AI Multi-turn Chatbot"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span>ASK CONTRACTLENS AI</span>
        </button>
      )}

      {/* Multi-turn Gemini Chatbot Drawer */}
      <GeminiChatDrawer
        isOpen={isGeminiChatOpen}
        onClose={() => setIsGeminiChatOpen(false)}
        contract={activeContract}
        onNavigateClause={handleChatNavigateClause}
        initialQuery={chatInitialQuery}
      />
    </div>
  );
}
