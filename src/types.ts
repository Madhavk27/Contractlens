export type NavigationTab = 'contracts' | 'actions' | 'compare';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  daysRemaining: number;
  dueDate: string;
  responsibleParty: 'Client' | 'Vendor' | 'Shared';
  sectionRef: string;
  pageNumber: number;
  statusType: 'urgent' | 'attention' | 'conflict';
  category?: 'urgent' | 'upcoming' | 'review';
  contractId: string;
  contractName: string;
  clauseExcerpt: string;
  recommendation: string;
  reviewStatus?: 'pending' | 'reviewed' | 'dismissed';
}

export interface ExtractedContractAnalysis {
  parties: { client: string; vendor: string };
  effectiveDate: string;
  expirationDate: string;
  paymentTerms: string;
  renewalTerms: string;
  terminationTerms: string;
  confidentialityTerms: string;
  slaCommitments: string;
  reportingRequirements: string;
  dataObligations: string;
  liabilityTerms: string;
  importantDeadlines: Array<{ title: string; date: string; source: string; page: number }>;
}

export interface Contract {
  id: string;
  title: string;
  status: 'Active' | 'Renewal Soon' | 'In Review';
  expirationDate: string;
  effectiveDate: string;
  obligationsCount: number;
  pagesCount: number;
  parties: {
    client: string;
    vendor: string;
  };
  summary: {
    payment: string;
    renewal: string;
    termination: string;
    governingLaw: string;
  };
  extractedAnalysis?: ExtractedContractAnalysis;
  fileName?: string;
  fileFormat?: 'pdf' | 'docx';
  extractedText?: string;
  isUploaded?: boolean;
  geminiFileUri?: string;
  pages?: Record<number, {
    title: string;
    article: string;
    sections: Array<{
      id: string;
      ref: string;
      title: string;
      text: string;
      isHighlighted?: boolean;
    }>;
  }>;
  obligations?: ContractObligation[];
  actionItems?: ActionItem[];
  deadlines?: TimelineMilestone[];
  attentionItems?: Array<{
    id: string;
    title: string;
    subtitle: string;
    badgeText: string;
    badgeColor?: string;
    targetPage: number;
    targetSection: string;
  }>;
  conflictData?: ClauseConflict;
  clauseExplanations?: Record<string, ClauseExplanation>;
}

export interface ContractObligation {
  id: string;
  title: string;
  responsibleParty: 'Client' | 'Vendor' | 'Shared';
  action: string;
  dueDate: string;
  daysRemaining: number;
  frequency: string;
  consequence?: string;
  priority: 'High' | 'Medium' | 'Low';
  sectionRef: string;
  pageNumber: number;
  supportingEvidence: string;
  status: 'due_soon' | 'pending' | 'review' | 'completed';
  description: string;
}

export interface TimelineMilestone {
  date: string;
  title: string;
  status: 'completed' | 'urgent' | 'upcoming';
  detail: string;
  sectionRef?: string;
  pageNumber?: number;
  obligationId?: string;
}

export interface ContractDiffItem {
  id: string;
  category: string;
  title: string;
  fromValue: string;
  toValue: string;
  whyItMatters: string;
  operationalImpact?: string;
  reviewStatus: 'Review Recommended' | 'Attention' | 'Urgent' | 'Reviewed';
  statusColor: 'amber' | 'blue' | 'red' | 'emerald';
  sectionRef: string;
  pageNumber: number;
}

export interface ClauseExplanation {
  sectionRef: string;
  sectionTitle: string;
  pageNumber: number;
  whatItSays: string;
  whoItAffects: 'Client' | 'Vendor' | 'Both';
  whatItRequires: string;
  importantDate?: string;
  potentialReview?: string;
  evidenceQuote: string;
}

export interface ClauseConflict {
  id: string;
  title: string;
  status: 'Human review recommended' | 'Reviewed' | 'Dismissed';
  sectionA: {
    ref: string;
    title: string;
    pageNumber: number;
    text: string;
    term: string;
  };
  sectionB: {
    ref: string;
    title: string;
    pageNumber: number;
    text: string;
    term: string;
  };
  operationalImpact: string;
  recommendation: string;
}

export interface ContractOperationalHealth {
  status: 'ACTIVE' | 'RENEWAL SOON' | 'IN REVIEW';
  obligationsCount: number;
  upcomingDeadlinesCount: number;
  reviewItemsCount: number;
  renewalApproachingCount: number;
}

export interface LibrarySearchResult {
  contractId: string;
  contractName: string;
  relevantResult: string;
  deadlineOrDate: string;
  status: string;
  sourceSection: string;
  sourcePage: number;
  matchScore?: number;
}

export interface AiPromptQuery {
  question: string;
  answer: string;
  sourceSection: string;
  sourcePage: number;
  highlightText: string;
}

export type GeminiModelType = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  citations?: Array<{
    sectionRef: string;
    pageNumber: number;
    quote?: string;
  }>;
}

export interface LegalSignoffData {
  counselName: string;
  counselTitle: string;
  organization: string;
  barNumber: string;
  signoffDecision: 'approved' | 'approved_with_conditions' | 'rejected' | 'pending';
  conditions?: string;
  signoffDate: string;
  digitalFingerprint: string;
}

