import {
  ActionItem,
  Contract,
  ContractObligation,
  TimelineMilestone,
  ContractDiffItem,
  AiPromptQuery,
  ClauseExplanation,
  ClauseConflict,
  LibrarySearchResult,
  ExtractedContractAnalysis
} from '../types';

export const CONTRACT_EXTRACTED_ANALYSIS: ExtractedContractAnalysis = {
  parties: {
    client: 'ABC Technologies Inc. (Delaware Corp)',
    vendor: 'XYZ Solutions LLC (Delaware LLC)'
  },
  effectiveDate: '01 Oct 2026',
  expirationDate: '30 Sep 2027',
  paymentTerms: 'Section 4.1: Net 30 days from quarterly statement date. (Conflicting Exhibit B references Net 45)',
  renewalTerms: 'Automatic 12-month extension unless written non-renewal notice served ≥ 30 days prior',
  terminationTerms: '30 days written notice for uncured material breach; immediate for insolvency or IP infringement',
  confidentialityTerms: 'Mutual 5-year post-termination duration; trade secrets protected indefinitely',
  slaCommitments: '99.95% monthly infrastructure availability; 15% invoice service credits for degraded uptime',
  reportingRequirements: 'Monthly availability & compliance reporting delivered by 5th business day of each month',
  dataObligations: 'AES-256 / TLS 1.3 encryption; complete data return/deletion certified within 10 business days post-termination',
  liabilityTerms: '12-month aggregate fee cap (~$1,250,000 ARR); uncapped for gross negligence, willful misconduct & IP claims',
  importantDeadlines: [
    { title: 'Monthly Compliance Report', date: '05 Oct 2026', source: 'Section 7.3', page: 11 },
    { title: 'Renewal Opt-Out Notice Cutoff', date: '15 Oct 2026', source: 'Section 8.2', page: 14 },
    { title: 'Q4 Infrastructure Payment', date: '30 Oct 2026', source: 'Section 4.1', page: 7 },
    { title: 'Annual SOC 2 Type II Audit Delivery', date: '15 Dec 2026', source: 'Section 11.1', page: 22 }
  ]
};

export const ACTION_CENTER_ITEMS: ActionItem[] = [
  {
    id: 'action-1',
    title: 'Renewal Notice',
    description: 'Your ABC Vendor Agreement requires renewal notice.',
    daysRemaining: 18,
    dueDate: '15 Oct 2026',
    responsibleParty: 'Client',
    sectionRef: 'Section 8.2',
    pageNumber: 14,
    statusType: 'urgent',
    category: 'urgent',
    contractId: 'abc-vendor',
    contractName: 'ABC Vendor Agreement',
    clauseExcerpt: 'Either party may terminate this Agreement at the conclusion of the Initial Term by delivering written notice of non-renewal not less than thirty (30) days prior to the expiration date.',
    recommendation: 'Deliver formal written notice before October 15, 2026 to prevent automatic 12-month extension at a 15% rate escalation.',
    reviewStatus: 'pending'
  },
  {
    id: 'action-2',
    title: 'Monthly Compliance Report',
    description: 'Vendor report is due soon.',
    daysRemaining: 5,
    dueDate: '05 Oct 2026',
    responsibleParty: 'Vendor',
    sectionRef: 'Section 7.3',
    pageNumber: 11,
    statusType: 'attention',
    category: 'upcoming',
    contractId: 'abc-vendor',
    contractName: 'ABC Vendor Agreement',
    clauseExcerpt: 'Vendor shall furnish to Customer a certified monthly availability and SOC compliance summary within five (5) business days following the conclusion of each calendar month.',
    recommendation: 'Request automated dispatch confirmation from XYZ Solutions account manager.',
    reviewStatus: 'pending'
  },
  {
    id: 'action-3',
    title: 'Potential Payment Conflict',
    description: 'Two different payment terms were found.',
    daysRemaining: 0,
    dueDate: 'Immediate',
    responsibleParty: 'Client',
    sectionRef: 'Section 4.1 and Section 9.2',
    pageNumber: 7,
    statusType: 'conflict',
    category: 'review',
    contractId: 'abc-vendor',
    contractName: 'ABC Vendor Agreement',
    clauseExcerpt: 'Section 4.1 stipulates invoices are payable within thirty (30) days of receipt (Net 30), whereas Section 9.2 states accounts are subject to forty-five (45) day settlement terms (Net 45).',
    recommendation: 'Issue clarification addendum harmonizing terms to Net 45 as agreed in preliminary term sheet.',
    reviewStatus: 'pending'
  }
];

export const RECENT_CONTRACTS: Contract[] = [
  {
    id: 'abc-vendor',
    title: 'ABC Vendor Agreement',
    status: 'Active',
    effectiveDate: '01 Oct 2026',
    expirationDate: 'Sep 30, 2027',
    obligationsCount: 8,
    pagesCount: 32,
    parties: {
      client: 'ABC Technologies',
      vendor: 'XYZ Solutions'
    },
    summary: {
      payment: 'Net 30',
      renewal: 'Automatic · 1 year',
      termination: '30 days',
      governingLaw: 'State of Delaware'
    },
    extractedAnalysis: CONTRACT_EXTRACTED_ANALYSIS
  },
  {
    id: 'saas-service',
    title: 'SaaS Service Agreement',
    status: 'Active',
    effectiveDate: '15 Jan 2026',
    expirationDate: 'Jan 14, 2027',
    obligationsCount: 5,
    pagesCount: 18,
    parties: {
      client: 'ABC Technologies',
      vendor: 'CloudScale Inc.'
    },
    summary: {
      payment: 'Net 45',
      renewal: 'Manual opt-in',
      termination: '60 days',
      governingLaw: 'State of New York'
    }
  },
  {
    id: 'it-maintenance',
    title: 'IT Maintenance Agreement',
    status: 'Renewal Soon',
    effectiveDate: '16 Oct 2025',
    expirationDate: 'Oct 15, 2026',
    obligationsCount: 6,
    pagesCount: 24,
    parties: {
      client: 'ABC Technologies',
      vendor: 'Apex Infrastructure Group'
    },
    summary: {
      payment: 'Net 30',
      renewal: 'Automatic · 1 year',
      termination: '90 days',
      governingLaw: 'State of California'
    }
  }
];

// Complete 8 Obligations matching specification
export const OBLIGATIONS_LIST: ContractObligation[] = [
  {
    id: 'obl-1',
    title: 'Renewal Notice',
    action: 'Deliver written non-renewal notice',
    responsibleParty: 'Client',
    dueDate: '15 Oct 2026',
    daysRemaining: 18,
    frequency: 'Annual',
    consequence: 'Automatic 12-month renewal extension with 15% rate escalation if notice is not delivered',
    priority: 'High',
    sectionRef: 'Section 8.2',
    pageNumber: 14,
    supportingEvidence: 'Either party may terminate this Agreement at the end of the then-current Initial Term or Renewal Term by delivering written notice of non-renewal to the other party not less than thirty (30) days prior to the expiration of such term.',
    status: 'due_soon',
    description: 'Written notification required if opting out of 1-year automated renewal. Notice must be certified courier or email.'
  },
  {
    id: 'obl-2',
    title: 'Monthly Compliance Report',
    action: 'Furnish certified monthly uptime & SLA telemetry',
    responsibleParty: 'Vendor',
    dueDate: '05 Oct 2026',
    daysRemaining: 5,
    frequency: 'Monthly',
    consequence: 'Client entitled to 15% liquidated invoice credit if report delayed past 5 business days',
    priority: 'Medium',
    sectionRef: 'Section 7.3',
    pageNumber: 11,
    supportingEvidence: 'Vendor shall furnish to Customer a certified monthly availability and SOC compliance summary within five (5) business days following the conclusion of each calendar month.',
    status: 'due_soon',
    description: 'Submission of service availability, uptime percentage (99.95%), and incident root-cause logs.'
  },
  {
    id: 'obl-3',
    title: 'Quarterly Infrastructure Payment',
    action: 'Remit quarterly capacity license payment',
    responsibleParty: 'Client',
    dueDate: '30 Oct 2026',
    daysRemaining: 30,
    frequency: 'Quarterly',
    consequence: '1.5% compounding late payment fee per month applied to delinquent balances',
    priority: 'Medium',
    sectionRef: 'Section 4.1',
    pageNumber: 7,
    supportingEvidence: 'All undisputed invoiced amounts shall become due and payable within thirty (30) days following receipt of the invoice by Customer (Net 30).',
    status: 'pending',
    description: 'Net 30 payment for Q4 platform infrastructure reservation and hosting capacity.'
  },
  {
    id: 'obl-4',
    title: 'SOC 2 Type II Security Audit',
    action: 'Provide current independent auditor security report',
    responsibleParty: 'Vendor',
    dueDate: '15 Dec 2026',
    daysRemaining: 76,
    frequency: 'Annual',
    consequence: 'Right to terminate for cause and audit escrow holdback if Trust Services report fails validation',
    priority: 'High',
    sectionRef: 'Section 11.1',
    pageNumber: 22,
    supportingEvidence: 'Vendor shall provide an annual SOC 2 Type II independent audit report covering Security, Confidentiality, and Availability Trust Principles.',
    status: 'pending',
    description: 'Vendor must provide current independent auditor report verifying Trust Services Criteria.'
  },
  {
    id: 'obl-5',
    title: 'Customer Data Deletion & Certification',
    action: 'Return data assets and certify cryptographic sanitization',
    responsibleParty: 'Vendor',
    dueDate: '10 Days Post-Term',
    daysRemaining: 375,
    frequency: 'One-time',
    consequence: 'Statutory indemnity under GDPR/CCPA plus $5,000/day liquidated penalty for lingering residual backups',
    priority: 'High',
    sectionRef: 'Section 13.4',
    pageNumber: 28,
    supportingEvidence: 'Within ten (10) business days following expiration or termination, Vendor shall destroy or return all Customer Data and provide written officer certification.',
    status: 'pending',
    description: 'Mandatory cryptographic deletion of all hosted customer database records and backups.'
  },
  {
    id: 'obl-6',
    title: 'Quarterly Service Review',
    action: 'Conduct executive joint steering committee review',
    responsibleParty: 'Shared',
    dueDate: '30 Oct 2026',
    daysRemaining: 30,
    frequency: 'Quarterly',
    consequence: 'Executive escalation to VP of Infrastructure if roadmap reviews are missed',
    priority: 'Low',
    sectionRef: 'Section 5.4',
    pageNumber: 9,
    supportingEvidence: 'The parties shall convene quarterly to review technical roadmap alignment, SLA compliance metrics, and unresolved support tickets.',
    status: 'pending',
    description: 'Joint steering committee review of SLA metrics and support ticket escalations.'
  },
  {
    id: 'obl-7',
    title: 'Cyber Insurance Verification',
    action: 'Maintain and verify $10M active cyber insurance policy',
    responsibleParty: 'Vendor',
    dueDate: '01 Nov 2026',
    daysRemaining: 42,
    frequency: 'Annual',
    consequence: 'Suspension of remote administrator root access until current Certificate of Insurance is approved',
    priority: 'Medium',
    sectionRef: 'Section 12.3',
    pageNumber: 26,
    supportingEvidence: 'Vendor shall maintain comprehensive commercial cyber liability insurance with aggregate limits not less than $10,000,000 throughout the Term.',
    status: 'pending',
    description: 'Submission of formal Certificate of Insurance naming Client as additional insured.'
  },
  {
    id: 'obl-8',
    title: 'Data Protection Impact Assessment',
    action: 'Execute formal privacy & cryptographic cipher assessment',
    responsibleParty: 'Vendor',
    dueDate: '15 Sep 2026',
    daysRemaining: -5,
    frequency: 'One-time',
    consequence: 'Pre-condition to processing sensitive customer PII',
    priority: 'Medium',
    sectionRef: 'Section 13.2',
    pageNumber: 27,
    supportingEvidence: 'Vendor has verified encryption standards at rest (AES-256) and in transit (TLS 1.3) through third-party penetration tests.',
    status: 'completed',
    description: 'Verification of encryption standards at rest (AES-256) and in transit (TLS 1.3).'
  }
];

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    date: '01 Oct 2026',
    title: 'Contract begins',
    status: 'completed',
    detail: 'Effective commencement of Master Services Agreement v2.1.',
    sectionRef: 'Section 8.1',
    pageNumber: 14
  },
  {
    date: '05 Oct 2026',
    title: 'Monthly compliance report',
    status: 'urgent',
    detail: 'Vendor must furnish certified SOC 2 & uptime compliance ledger.',
    sectionRef: 'Section 7.3',
    pageNumber: 11,
    obligationId: 'obl-2'
  },
  {
    date: '15 Oct 2026',
    title: 'Renewal notice cutoff',
    status: 'urgent',
    detail: 'Firm deadline to dispatch opt-out notice to avoid automatic renewal.',
    sectionRef: 'Section 8.2',
    pageNumber: 14,
    obligationId: 'obl-1'
  },
  {
    date: '30 Oct 2026',
    title: 'Quarterly payment',
    status: 'upcoming',
    detail: 'Net 30 invoice settlement for Q4 infrastructure reservation.',
    sectionRef: 'Section 4.1',
    pageNumber: 7,
    obligationId: 'obl-3'
  },
  {
    date: '15 Dec 2026',
    title: 'SOC 2 security audit',
    status: 'upcoming',
    detail: 'Annual independent verification of Trust Services criteria.',
    sectionRef: 'Section 11.1',
    pageNumber: 22,
    obligationId: 'obl-4'
  },
  {
    date: '30 Sep 2027',
    title: 'Contract expires',
    status: 'upcoming',
    detail: 'Conclusion of Initial Term unless extended in writing.',
    sectionRef: 'Section 8.1',
    pageNumber: 14
  }
];

export const CLAUSE_CONFLICT_DATA: ClauseConflict = {
  id: 'conflict-payment-1',
  title: 'Potential Payment Period Conflict',
  status: 'Human review recommended',
  sectionA: {
    ref: 'Section 4.1',
    title: 'Invoicing and Payment Terms',
    pageNumber: 7,
    term: 'Net 30 days',
    text: 'Vendor shall invoice Customer on the first day of each calendar quarter. All undisputed invoiced amounts shall become due and payable within thirty (30) days following receipt of the invoice by Customer (Net 30).'
  },
  sectionB: {
    ref: 'Section 9.2',
    title: 'Account Settlement and Disputed Charges',
    pageNumber: 7,
    term: 'Net 45 days',
    text: 'Customer shall have the right to audit and remit payment on reconciliation accounts within forty-five (45) days of receipt (Net 45). In the event of a good faith dispute regarding any charge, Customer may withhold payment.'
  },
  operationalImpact: 'Creates recurring invoice settlement disputes between accounts payable and vendor billing departments.',
  recommendation: 'Issue 1-page bilateral amendment confirming Net 45 terms as intended in the executive term sheet.'
};

export const CLAUSE_EXPLANATIONS: Record<string, ClauseExplanation> = {
  'Section 8.2': {
    sectionRef: 'Section 8.2',
    sectionTitle: 'Notice of Non-Renewal',
    pageNumber: 14,
    whatItSays: 'Either party can terminate this agreement at the end of the term by giving written notice at least 30 days prior. Notice must be sent by certified courier or email to legal counsel.',
    whoItAffects: 'Both',
    whatItRequires: 'Dispatch formal written notice of non-renewal before October 15, 2026 if you do not want the contract to renew.',
    importantDate: '15 Oct 2026 (18 days remaining)',
    potentialReview: 'Failure to give notice locks the company into another full 12 months with a 15% rate hike.',
    evidenceQuote: 'Either party may terminate this Agreement at the end of the then-current Initial Term or Renewal Term by delivering written notice of non-renewal to the other party not less than thirty (30) days prior to the expiration of such term.'
  },
  'Section 7.3': {
    sectionRef: 'Section 7.3',
    sectionTitle: 'Monthly Compliance Reporting',
    pageNumber: 11,
    whatItSays: 'The vendor must send an availability and compliance summary within 5 business days after each month ends, including details on any outage exceeding 15 minutes.',
    whoItAffects: 'Vendor',
    whatItRequires: 'Vendor must generate and deliver uptime telemetry; Client must verify availability met 99.95% threshold.',
    importantDate: '05 Oct 2026 (5 days remaining)',
    potentialReview: 'If uptime is below 99.5%, Client is entitled to liquidated invoice service credits.',
    evidenceQuote: 'Vendor shall furnish to Customer a certified monthly availability and SOC compliance summary within five (5) business days following the conclusion of each calendar month.'
  },
  'Section 4.1': {
    sectionRef: 'Section 4.1',
    sectionTitle: 'Invoicing and Payment Terms',
    pageNumber: 7,
    whatItSays: 'Vendor invoices quarterly for reserved capacity. Client must pay undisputed invoices within 30 days of receipt.',
    whoItAffects: 'Client',
    whatItRequires: 'Client Accounts Payable must settle invoice within 30 days of receipt.',
    importantDate: '30 Oct 2026',
    potentialReview: 'Conflicts directly with Section 9.2 which grants a 45-day reconciliation settlement window.',
    evidenceQuote: 'All undisputed invoiced amounts shall become due and payable within thirty (30) days following receipt of the invoice by Customer (Net 30).'
  },
  'Section 9.2': {
    sectionRef: 'Section 9.2',
    sectionTitle: 'Account Settlement & Disputed Charges',
    pageNumber: 7,
    whatItSays: 'Customer has the right to audit and remit payment within 45 days (Net 45) and withhold disputed sums in good faith.',
    whoItAffects: 'Client',
    whatItRequires: 'Audit charges within 45 days; issue dispute notice if discrepancies exist.',
    importantDate: '45 days from statement receipt',
    potentialReview: 'Direct inconsistency with Section 4.1 (Net 30). Human review recommended.',
    evidenceQuote: 'Customer shall have the right to audit and remit payment on reconciliation accounts within forty-five (45) days of receipt (Net 45).'
  },
  'Section 8.1': {
    sectionRef: 'Section 8.1',
    sectionTitle: 'Initial Term & Renewal',
    pageNumber: 14,
    whatItSays: 'Agreement starts Oct 1, 2026 and ends Sep 30, 2027. Afterwards, it automatically extends for 1-year periods unless non-renewal notice is delivered.',
    whoItAffects: 'Both',
    whatItRequires: 'Track term milestones and diarize non-renewal notice window.',
    importantDate: '30 Sep 2027 (Expiration)',
    potentialReview: 'Automatic rollover mechanism creates silent financial liabilities if untracked.',
    evidenceQuote: 'This Agreement shall commence on the Effective Date (October 1, 2026) and continue in full force and effect until September 30, 2027.'
  },
  'Section 11.1': {
    sectionRef: 'Section 11.1',
    sectionTitle: 'SOC 2 Type II Security Audit',
    pageNumber: 22,
    whatItSays: 'Vendor must furnish an annual third-party SOC 2 Type II audit verifying Trust Services criteria for cloud systems.',
    whoItAffects: 'Vendor',
    whatItRequires: 'Vendor must commission and supply CPA-certified audit report by Dec 15.',
    importantDate: '15 Dec 2026',
    potentialReview: 'Failure to provide report constitutes material breach permitting immediate contract termination.',
    evidenceQuote: 'Vendor shall provide an annual SOC 2 Type II independent audit report covering Security, Confidentiality, and Availability Trust Principles.'
  },
  'Section 13.4': {
    sectionRef: 'Section 13.4',
    sectionTitle: 'Customer Data Deletion & Certification',
    pageNumber: 28,
    whatItSays: 'Upon termination, vendor must destroy or return all customer data within 10 business days and provide an officer-signed certification.',
    whoItAffects: 'Vendor',
    whatItRequires: 'Cryptographic wiping of backups and delivery of compliance certificate.',
    importantDate: '10 business days post-termination',
    potentialReview: 'High regulatory impact under privacy regulations if data retention is violated.',
    evidenceQuote: 'Within ten (10) business days following expiration or termination, Vendor shall destroy or return all Customer Data and provide written officer certification.'
  }
};

export const DIFF_COMPARISONS: ContractDiffItem[] = [
  {
    id: 'diff-1',
    category: 'PAYMENT',
    title: 'Payment Terms Settlement',
    fromValue: 'Net 30',
    toValue: 'Net 45',
    whyItMatters: 'Extends vendor working capital window by 15 days, impacting quarterly cash flow predictability.',
    operationalImpact: 'Provides client additional 15 days to process invoice reconciliation; requires updating ERP vendor terms.',
    reviewStatus: 'Review Recommended',
    statusColor: 'amber',
    sectionRef: 'Section 4.1 & 9.2',
    pageNumber: 7
  },
  {
    id: 'diff-2',
    category: 'TERMINATION NOTICE',
    title: 'Notice of Non-Renewal Window',
    fromValue: '30 days',
    toValue: '60 days',
    whyItMatters: 'Earlier planning is required before termination. Failure to notify 60 days in advance locks in renewal.',
    operationalImpact: 'Advance notification calendar must be moved earlier by 30 full days to prevent unwanted renewal.',
    reviewStatus: 'Review Recommended',
    statusColor: 'amber',
    sectionRef: 'Section 8.2',
    pageNumber: 14
  },
  {
    id: 'diff-3',
    category: 'RENEWAL PERIOD',
    title: 'Automated Renewal Extension',
    fromValue: '1 year',
    toValue: '2 years',
    whyItMatters: 'Doubles financial lock-in commitment without an interim renegotiation milestone.',
    operationalImpact: 'Extends minimum committed spend from $1.25M to $2.5M upon automatic rollover.',
    reviewStatus: 'Attention',
    statusColor: 'amber',
    sectionRef: 'Section 8.1',
    pageNumber: 14
  },
  {
    id: 'diff-4',
    category: 'LIABILITY',
    title: 'Consequential Damages Carveout',
    fromValue: 'Standard mutual waiver',
    toValue: 'New clause added (Uncapped)',
    whyItMatters: 'New clause exposes Client to unlimited indemnification for third-party cloud data claims.',
    operationalImpact: 'Creates catastrophic un-insurable exposure; legal counsel must reject or restore standard liability cap.',
    reviewStatus: 'Urgent',
    statusColor: 'red',
    sectionRef: 'Section 12.4',
    pageNumber: 25
  }
];

export const AI_PROMPT_QUERIES: AiPromptQuery[] = [
  {
    question: 'What do I need to do before renewal?',
    answer: 'A renewal notice must be delivered 30 days before contract expiration (by October 15, 2026). If notice is not sent in writing, the agreement automatically renews for an additional 12 months under Section 8.2.',
    sourceSection: 'Section 8.2',
    sourcePage: 14,
    highlightText: 'Either party may terminate this Agreement at the end of the then-current Term by delivering written notice of non-renewal to the other party not less than thirty (30) days prior to the expiration of such term.'
  },
  {
    question: 'What are the payment obligations?',
    answer: 'Under Section 4.1, quarterly invoices are due within 30 days (Net 30). However, Section 9.2 also references Net 45 reconciliation settlement. Clarification is required.',
    sourceSection: 'Section 4.1 · Page 7',
    sourcePage: 7,
    highlightText: 'All undisputed invoiced amounts shall become due and payable within thirty (30) days following receipt of the invoice by Customer (Net 30).'
  },
  {
    question: 'Can either party terminate early?',
    answer: 'Under Section 8.3, either party may terminate immediately for uncured material breach after giving 30 calendar days notice to cure. Under Section 8.2, non-renewal requires 30 days written notice.',
    sourceSection: 'Section 8.3 · Page 14',
    sourcePage: 14,
    highlightText: 'Either party may immediately terminate this Agreement upon written notice if the other party materially breaches any representation and fails to cure within thirty (30) days.'
  },
  {
    question: 'Show all vendor obligations',
    answer: 'Vendor (XYZ Solutions) is obligated to: (1) Deliver monthly compliance & uptime reports by the 5th business day (Section 7.3); (2) Maintain 99.95% availability (Section 7.1); (3) Deliver annual SOC 2 Type II audit by Dec 15 (Section 11.1); (4) Destroy customer data within 10 days post-termination (Section 13.4).',
    sourceSection: 'Section 7.3 · Page 11',
    sourcePage: 11,
    highlightText: 'Vendor shall furnish to Customer a certified monthly availability and SOC compliance summary within five (5) business days.'
  },
  {
    question: 'Which clauses need review?',
    answer: 'Two clauses require human review: (1) Section 8.2 due to the impending 18-day non-renewal notification deadline; (2) The commercial payment conflict between Section 4.1 (Net 30) and Section 9.2 (Net 45).',
    sourceSection: 'Section 4.1 and Section 8.2',
    sourcePage: 14,
    highlightText: 'Section 4.1 specifies Net 30 payment, while Section 9.2 references Net 45 settlement.'
  },
  {
    question: 'What changed from the previous version?',
    answer: 'Key changes from v1.0 to v2.1: Payment terms moved from Net 30 to Net 45 (Section 4.1), Termination notice lengthened from 30 to 60 days (Section 8.2), Renewal term doubled from 1 to 2 years (Section 8.1), and a new uncapped liability clause was introduced (Section 12.4).',
    sourceSection: 'Sections 4.1, 8.2, 12.4',
    sourcePage: 14,
    highlightText: 'Earlier planning is required before termination. Automatic renewal term duration doubled.'
  }
];

export const CONTRACT_DOCUMENT_PAGES: Record<number, {
  title: string;
  article: string;
  sections: Array<{
    id: string;
    ref: string;
    title: string;
    text: string;
    isHighlighted?: boolean;
  }>;
}> = {
  14: {
    title: 'MASTER SERVICES AGREEMENT',
    article: 'ARTICLE VIII: TERM, TERMINATION AND RENEWAL',
    sections: [
      {
        id: 'sec-8-1',
        ref: 'Section 8.1',
        title: 'Initial Term & Renewal',
        text: 'This Agreement shall commence on the Effective Date (October 1, 2026) and continue in full force and effect until September 30, 2027 (the "Initial Term"), unless terminated earlier in accordance with the provisions hereof. Upon expiration of the Initial Term, this Agreement shall automatically renew for successive periods of one (1) year each (each, a "Renewal Term"), unless either party provides timely written notice of its election not to renew.'
      },
      {
        id: 'sec-8-2',
        ref: 'Section 8.2',
        title: 'Notice of Non-Renewal',
        text: 'Either party may terminate this Agreement at the end of the then-current Initial Term or Renewal Term by delivering written notice of non-renewal to the other party not less than thirty (30) days prior to the expiration of such term. All notices shall be delivered via certified courier or electronic transmission to the designated corporate counsel of the respective party.',
        isHighlighted: true
      },
      {
        id: 'sec-8-3',
        ref: 'Section 8.3',
        title: 'Termination for Cause',
        text: 'Either party may immediately terminate this Agreement upon written notice if the other party materially breaches any representation, warranty, or covenant contained herein and fails to cure such breach within thirty (30) calendar days following written receipt of detailed notice specifying the nature of such breach.'
      },
      {
        id: 'sec-8-4',
        ref: 'Section 8.4',
        title: 'Effect of Expiration or Termination',
        text: 'Upon expiration or termination of this Agreement for any reason, Vendor shall promptly deliver to Customer all Customer Confidential Information, work product, and data assets in a standard machine-readable format within ten (10) business days.'
      }
    ]
  },
  11: {
    title: 'MASTER SERVICES AGREEMENT',
    article: 'ARTICLE VII: SERVICE LEVELS AND COMPLIANCE MONITORING',
    sections: [
      {
        id: 'sec-7-1',
        ref: 'Section 7.1',
        title: 'Service Availability Commitment',
        text: 'Vendor warrants that the Hosted Cloud Infrastructure shall maintain a monthly Service Level Availability of at least ninety-nine point ninety-five percent (99.95%), measured twenty-four (24) hours per day, seven (7) days per week, excluding scheduled maintenance windows.'
      },
      {
        id: 'sec-7-2',
        ref: 'Section 7.2',
        title: 'Downtime Remedies and Service Credits',
        text: 'In the event Vendor fails to meet the Service Availability Commitment in any given calendar month, Customer shall be entitled to liquidated service credits against future invoices calculated at five percent (5%) for each full hour of unplanned downtime.'
      },
      {
        id: 'sec-7-3',
        ref: 'Section 7.3',
        title: 'Monthly Compliance Reporting',
        text: 'Vendor shall furnish to Customer a certified monthly availability and SOC compliance summary within five (5) business days following the conclusion of each calendar month. Reports must include root-cause analysis for any incident exceeding fifteen (15) minutes of degraded performance.',
        isHighlighted: true
      }
    ]
  },
  7: {
    title: 'MASTER SERVICES AGREEMENT',
    article: 'ARTICLE IV & IX: FINANCIAL CONSIDERATIONS & SETTLEMENT',
    sections: [
      {
        id: 'sec-4-1',
        ref: 'Section 4.1',
        title: 'Invoicing and Payment Terms',
        text: 'Vendor shall invoice Customer on the first day of each calendar quarter for reserved platform capacity. All undisputed invoiced amounts shall become due and payable within thirty (30) days following receipt of the invoice by Customer (Net 30).',
        isHighlighted: true
      },
      {
        id: 'sec-9-2',
        ref: 'Section 9.2',
        title: 'Account Settlement and Disputed Charges',
        text: 'Customer shall have the right to audit and remit payment on reconciliation accounts within forty-five (45) days of receipt (Net 45). In the event of a good faith dispute regarding any charge, Customer may withhold payment of the disputed portion pending resolution.',
        isHighlighted: true
      }
    ]
  },
  22: {
    title: 'MASTER SERVICES AGREEMENT',
    article: 'ARTICLE XI: DATA SECURITY AND AUDIT RIGHTS',
    sections: [
      {
        id: 'sec-11-1',
        ref: 'Section 11.1',
        title: 'SOC 2 Type II Security Audit',
        text: 'Vendor shall provide an annual SOC 2 Type II independent audit report covering Security, Confidentiality, and Availability Trust Principles conducted by an accredited independent accounting firm. Reports must be delivered not later than December 15 of each calendar year.',
        isHighlighted: true
      },
      {
        id: 'sec-11-2',
        ref: 'Section 11.2',
        title: 'Data Breach Notification & Security Standards',
        text: 'Vendor maintains an information security program meeting ISO 27001 standards. In the event of any confirmed or suspected unauthorized access to Customer Data, Vendor shall notify Customer within twenty-four (24) hours of confirmation.'
      }
    ]
  },
  28: {
    title: 'MASTER SERVICES AGREEMENT',
    article: 'ARTICLE XIII & XIV: DATA RETENTION & CONFIDENTIALITY',
    sections: [
      {
        id: 'sec-13-4',
        ref: 'Section 13.4',
        title: 'Customer Data Deletion & Certification',
        text: 'Within ten (10) business days following expiration or termination of this Agreement, Vendor shall permanently destroy or return all Customer Data in its possession and furnish to Customer written officer certification attesting to complete cryptographic wiping of all residual backups.',
        isHighlighted: true
      },
      {
        id: 'sec-14-1',
        ref: 'Section 14.1',
        title: 'Confidentiality Obligations',
        text: 'Each party agrees to hold the other party Confidential Information in strict confidence and not to disclose such information to any third party for a period of five (5) years following termination, provided that Trade Secrets shall remain protected in perpetuity.'
      }
    ]
  }
};

// Cross-contract library search dataset
export const CONTRACT_LIBRARY_SEARCH_ITEMS: LibrarySearchResult[] = [
  {
    contractId: 'it-maintenance',
    contractName: 'IT Maintenance Agreement',
    relevantResult: 'Renews in 25 days (Oct 15, 2026). Automatic 1-year renewal unless 90-day non-renewal notice was delivered.',
    deadlineOrDate: 'Oct 15, 2026',
    status: 'Renewal Soon',
    sourceSection: 'Section 6.1 · Termination Notice',
    sourcePage: 9,
    matchScore: 98
  },
  {
    contractId: 'abc-vendor',
    contractName: 'ABC Vendor Agreement',
    relevantResult: 'Renewal notice cutoff is in 18 days (Oct 15, 2026). Auto-renews for 1 year if unaddressed.',
    deadlineOrDate: '15 Oct 2026',
    status: 'Active · Urgent Cutoff',
    sourceSection: 'Section 8.2 · Page 14',
    sourcePage: 14,
    matchScore: 95
  },
  {
    contractId: 'abc-vendor',
    contractName: 'ABC Vendor Agreement',
    relevantResult: 'Payment terms: Section 4.1 specifies Net 30, but conflicts with Section 9.2 (Net 45).',
    deadlineOrDate: 'Net 30 / Net 45',
    status: 'Review Required',
    sourceSection: 'Section 4.1 · Page 7',
    sourcePage: 7,
    matchScore: 92
  },
  {
    contractId: 'saas-service',
    contractName: 'SaaS Service Agreement',
    relevantResult: 'Termination notice requires 60 days advance notice. Settlement terms are Net 45.',
    deadlineOrDate: 'Jan 14, 2027',
    status: 'Active',
    sourceSection: 'Section 9.4 · Page 12',
    sourcePage: 12,
    matchScore: 89
  },
  {
    contractId: 'it-maintenance',
    contractName: 'IT Maintenance Agreement',
    relevantResult: 'Termination notice requires 90 days advance notice prior to expiration.',
    deadlineOrDate: 'Oct 15, 2026',
    status: 'Renewal Soon',
    sourceSection: 'Section 8.3 · Page 14',
    sourcePage: 14,
    matchScore: 88
  }
];

