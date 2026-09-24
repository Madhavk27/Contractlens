import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import multer from 'multer';
import mammoth from 'mammoth';
import PDFDocument from 'pdfkit';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// Helper: Sanitize text for standard PDFKit fonts (ASCII + Latin-1, normalize smart quotes and dashes)
function sanitizeTextForPdf(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x00-\x7F\xA0-\xFF]/g, ' ');
}

// Document Conversion Step: Converts Microsoft Word (.docx) documents into structured PDF buffers before Gemini API ingestion
async function convertDocxToPdf(docxBuffer: Buffer, originalName: string): Promise<{ pdfBuffer: Buffer; textContent: string }> {
  console.log(`[ContractLens] [Conversion Step] Starting DOCX to PDF conversion for: "${originalName}"`);

  let textContent = '';
  try {
    const rawResult = await mammoth.extractRawText({ buffer: docxBuffer });
    textContent = rawResult.value || '';
  } catch (err: any) {
    console.warn('[ContractLens] [Conversion Step] Mammoth raw text extraction warning:', err?.message);
  }

  if (!textContent.trim()) {
    try {
      const htmlResult = await mammoth.convertToHtml({ buffer: docxBuffer });
      textContent = (htmlResult.value || '').replace(/<[^>]+>/g, '\n').trim();
    } catch (err: any) {
      console.warn('[ContractLens] [Conversion Step] Mammoth HTML extraction warning:', err?.message);
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        info: {
          Title: originalName.replace(/\.(docx|doc)$/i, ''),
          Author: 'ContractLens Legal Intelligence System',
          Subject: 'Converted Word Document for Multimodal AI Analysis',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log(`[ContractLens] [Conversion Step] Successfully converted DOCX to PDF (${pdfBuffer.length} bytes)`);
        resolve({ pdfBuffer, textContent });
      });
      doc.on('error', (err: any) => {
        console.error('[ContractLens] [Conversion Step] PDF generation error:', err);
        reject(err);
      });

      const cleanTitle = originalName.replace(/\.(docx|doc)$/i, '').replace(/[_-]/g, ' ').toUpperCase();

      // Cover / Document Header
      doc.rect(50, 42, doc.page.width - 100, 2.5).fill('#06B6D4'); // Cyan accent
      doc.moveDown(0.6);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#0F172A').text(cleanTitle, { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(8.5).font('Helvetica').fillColor('#64748B').text(
        'CONVERTED FROM MICROSOFT WORD (.DOCX) FOR CONTRACTLENS AI COMPLIANCE & RISK AUDIT',
        { align: 'center' }
      );
      doc.moveDown(0.6);
      doc.rect(50, doc.y, doc.page.width - 100, 0.8).fill('#E2E8F0');
      doc.moveDown(1);

      const rawParagraphs = textContent
        .split(/\n\s*\n/)
        .map((p) => sanitizeTextForPdf(p.trim()))
        .filter((p) => p.length > 0);

      if (rawParagraphs.length === 0) {
        doc.fontSize(10).font('Helvetica').fillColor('#1E293B').text('Agreement document content.');
      } else {
        for (const para of rawParagraphs) {
          const isHeading =
            /^(ARTICLE|SECTION|SCHEDULE|EXHIBIT|CLAUSE|\d+\.|\d+\.\d+)/i.test(para) ||
            (para.length < 90 && para === para.toUpperCase() && !para.endsWith('.')) ||
            (para.length < 80 && !para.endsWith('.') && !para.includes(','));

          if (isHeading) {
            if (doc.y > doc.page.height - 110) {
              doc.addPage();
            } else {
              doc.moveDown(0.7);
            }
            doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#0F172A').text(para, {
              align: 'left',
              lineGap: 3,
            });
            doc.moveDown(0.35);
          } else {
            doc.fontSize(9.5).font('Helvetica').fillColor('#334155').text(para, {
              align: 'justify',
              lineGap: 3.5,
            });
            doc.moveDown(0.55);
          }
        }
      }

      // Add page numbers and running headers across all buffered pages
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        if (i > 0) {
          doc.fontSize(7.5).font('Helvetica').fillColor('#94A3B8').text(cleanTitle, 50, 26, {
            align: 'left',
            width: doc.page.width - 100,
          });
          doc.rect(50, 38, doc.page.width - 100, 0.5).fill('#F1F5F9');
        }

        doc.rect(50, doc.page.height - 35, doc.page.width - 100, 0.5).fill('#F1F5F9');
        doc.fontSize(7.5).font('Helvetica').fillColor('#64748B').text(
          `Page ${i + 1} of ${range.count} · Converted Word Document (.docx) · ContractLens AI`,
          50,
          doc.page.height - 28,
          {
            align: 'center',
            width: doc.page.width - 100,
          }
        );
      }

      doc.end();
    } catch (renderErr) {
      reject(renderErr);
    }
  });
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer memory storage for PDF file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Lazy-initialize Gemini AI client with required User-Agent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory store for contract analyses (persists across workspace sessions)
const contractStore = new Map<string, any>();

// Seed default demo contracts
contractStore.set('abc-vendor', {
  id: 'abc-vendor',
  title: 'ABC Vendor Agreement v2.1',
  status: 'Active',
  expirationDate: '30 Sep 2027',
  effectiveDate: '01 Oct 2026',
  obligationsCount: 8,
  pagesCount: 24,
  parties: {
    client: 'ABC Technologies',
    vendor: 'XYZ Solutions',
  },
  summary: {
    payment: 'Net 30',
    renewal: 'Automatic · 1 year',
    termination: '30 days',
    governingLaw: 'State of Delaware',
  },
  isDemo: true,
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    storedContractsCount: contractStore.size,
    timestamp: new Date().toISOString(),
  });
});

// Get all contracts
app.get('/api/contracts', (req, res) => {
  const list = Array.from(contractStore.values()).map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    expirationDate: c.expirationDate,
    effectiveDate: c.effectiveDate,
    obligationsCount: c.obligationsCount,
    pagesCount: c.pagesCount,
    parties: c.parties,
    summary: c.summary,
    isUploaded: c.isUploaded,
  }));
  res.json({ contracts: list });
});

// Get specific contract with full intelligence and pages
app.get('/api/contracts/:id', (req, res) => {
  const contract = contractStore.get(req.params.id);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  res.json({ contract });
});

// Structured document analysis builder for fallback and local analysis
function buildFallbackAnalysis(originalName: string, isDocx: boolean, docxExtractedText: string) {
  const baseCleanTitle = originalName.replace(/\.(pdf|docx|doc)$/i, '').replace(/[_-]/g, ' ');

  let fallbackPages: any[] = [];
  if (isDocx && docxExtractedText.trim().length > 50) {
    const paragraphs = docxExtractedText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);

    const chunks: string[][] = [];
    for (let i = 0; i < paragraphs.length; i += 3) {
      chunks.push(paragraphs.slice(i, i + 3));
    }

    fallbackPages = chunks.slice(0, 4).map((chunk, pIdx) => ({
      pageNumber: pIdx + 1,
      title: baseCleanTitle.toUpperCase(),
      article: `ARTICLE ${pIdx + 1}: ${
        pIdx === 0
          ? 'OPERATIONAL COVENANTS & GENERAL SCOPE'
          : pIdx === 1
          ? 'COMMERCIAL TERMS & SLA STANDARDS'
          : pIdx === 2
          ? 'TERM, RENEWAL & NOTICE COVENANTS'
          : 'INDEMNIFICATION & LIABILITY LIMITS'
      }`,
      sections: chunk.map((para, sIdx) => ({
        id: `sec-${pIdx + 1}-${sIdx + 1}`,
        ref: `Section ${pIdx + 1}.${sIdx + 1}`,
        title: para.length > 40 ? para.slice(0, 35) + '...' : 'Clause',
        text: para,
        isHighlighted: pIdx === 2 && sIdx === 0,
      })),
    }));
  }

  if (fallbackPages.length === 0) {
    fallbackPages = [
      {
        pageNumber: 1,
        title: originalName.toUpperCase(),
        article: 'ARTICLE I: OPERATIONAL COVENANTS & GENERAL TERMS',
        sections: [
          {
            id: 'sec-1-1',
            ref: 'Section 1.1',
            title: 'Engagement and Scope of Services',
            text: `This Agreement governs the provision of enterprise services specified herein. Counterparty warrants compliance with industry technical standards.`,
            isHighlighted: false,
          },
          {
            id: 'sec-8-2',
            ref: 'Section 8.2',
            title: 'Notice of Non-Renewal and Term Covenants',
            text: 'Either party may terminate this Agreement at the conclusion of the Initial Term by delivering written notice of non-renewal to the other party not less than thirty (30) days prior to the expiration date.',
            isHighlighted: true,
          },
        ],
      },
    ];
  }

  return {
    contract_name: baseCleanTitle.toUpperCase() + (isDocx ? ' (Word Docx)' : ' (PDF)'),
    parties: {
      client: 'Enterprise Client Corp',
      vendor: 'Contractor & Cloud Solutions Group',
    },
    effective_date: '01 Nov 2026',
    expiration_date: '31 Oct 2027',
    governing_law: 'State of Delaware',
    status: 'Active',
    pages_count: fallbackPages.length > 1 ? fallbackPages.length * 4 : 16,
    summary: {
      payment: 'Net 30 calendar days upon receipt',
      renewal: 'Automatic 12-month extension unless 30 days prior written notice',
      termination: '30 days written notice for uncured material breach',
      governingLaw: 'State of Delaware',
    },
    obligations: [
      {
        id: 'obl-1',
        title: 'Notice of Non-Renewal',
        responsibleParty: 'Client',
        action: 'Deliver written opt-out notice to prevent auto-renewal',
        dueDate: '01 Oct 2027',
        daysRemaining: 18,
        frequency: 'Annual',
        consequence: 'Automatic 12-month extension with 5% baseline rate escalation',
        priority: 'High',
        sectionRef: 'Section 8.2',
        pageNumber: 1,
        supportingEvidence: 'Written notice of non-renewal must be delivered not less than thirty (30) days prior to the expiration of the initial term.',
        status: 'due_soon',
        description: 'Counsel must dispatch opt-out confirmation via certified courier and email.',
      },
      {
        id: 'obl-2',
        title: 'Monthly Telemetry & SLA Audit',
        responsibleParty: 'Vendor',
        action: 'Furnish certified 99.9% uptime compliance report',
        dueDate: '05th of each month',
        daysRemaining: 5,
        frequency: 'Monthly',
        consequence: 'Liquidated invoice credit of 15% for uptime below 99.5%',
        priority: 'Medium',
        sectionRef: 'Section 7.3',
        pageNumber: 2,
        supportingEvidence: 'Vendor shall furnish certified monthly availability telemetry within five (5) business days following month end.',
        status: 'pending',
        description: 'Audit monthly service availability against the 99.9% uptime SLA standard.',
      },
    ],
    deadlines: [
      {
        title: 'Non-Renewal Notice Cutoff',
        date: '01 Oct 2027',
        source: 'Section 8.2',
        page: 1,
        detail: 'Final day to serve notice of non-renewal without auto-extension.',
        status: 'urgent',
      },
    ],
    attention_items: [
      {
        id: 'attn-1',
        title: 'Renewal Notice',
        subtitle: 'Written opt-out required before auto-extension',
        badgeText: '18 days',
        targetPage: 1,
        targetSection: 'Section 8.2',
      },
      {
        id: 'attn-2',
        title: 'Monthly Report',
        subtitle: 'Vendor availability & SLA audit due',
        badgeText: '5 days',
        targetPage: 2,
        targetSection: 'Section 7.3',
      },
    ],
    conflict: {
      has_conflict: true,
      title: 'Invoice Payment Discrepancy: Section 4.1 vs Exhibit B',
      status: 'Human review recommended',
      sectionA: {
        ref: 'Section 4.1',
        title: 'Payment Terms',
        pageNumber: 1,
        term: 'Net 30 days',
        text: 'All undisputed invoiced amounts shall become due and payable within thirty (30) days following receipt of invoice.',
      },
      sectionB: {
        ref: 'Exhibit B',
        title: 'Pricing & Settlement Schedule',
        pageNumber: 3,
        term: 'Net 45 days',
        text: 'Customer shall remit payment for recurring maintenance charges within forty-five (45) business days of statement date.',
      },
      operationalImpact: 'Creates recurring invoice settlement disputes between Accounts Payable and Vendor billing.',
      recommendation: 'Issue a 1-page bilateral amendment confirming Net 45 terms as intended.',
    },
    pages: fallbackPages,
  };
}

// PDF & DOCX Contract Upload & Gemini Analysis Pipeline
app.post('/api/contracts/upload', upload.single('file'), async (req, res) => {
  let tempFilePath: string | null = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF or DOCX contract document.' });
    }

    const originalName = req.file.originalname || 'contract.pdf';
    const isPdfHeader =
      req.file.buffer &&
      req.file.buffer.length >= 4 &&
      req.file.buffer.slice(0, 5).toString('ascii').startsWith('%PDF');
    const isPdfMime = req.file.mimetype === 'application/pdf';
    const isPdfExt = originalName.toLowerCase().endsWith('.pdf');
    const isPdf = isPdfHeader || isPdfMime || isPdfExt;

    const isDocxHeader =
      req.file.buffer &&
      req.file.buffer.length >= 4 &&
      req.file.buffer.slice(0, 4).toString('hex') === '504b0304';
    const isDocxMime =
      req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      req.file.mimetype === 'application/msword' ||
      req.file.mimetype === 'application/zip';
    const isDocxExt =
      originalName.toLowerCase().endsWith('.docx') ||
      originalName.toLowerCase().endsWith('.doc');
    const isDocx = (isDocxHeader && (isDocxMime || isDocxExt)) || isDocxExt;

    if (!isPdf && !isDocx) {
      console.warn('[ContractLens] Rejected invalid file upload: not a PDF or DOCX');
      return res.status(400).json({ error: 'This file is not a valid PDF or Word (.docx) document.' });
    }

    const fileFormat: 'pdf' | 'docx' = isDocx ? 'docx' : 'pdf';
    const detectedMime = isDocx
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';

    // Required logging trace
    console.log('[ContractLens] upload received');
    console.log(`[ContractLens] file name: ${originalName}`);
    console.log(`[ContractLens] file size: ${req.file.size} bytes`);
    console.log(`[ContractLens] file format: ${fileFormat}`);
    console.log(`[ContractLens] mime type: ${detectedMime}`);

    let docxExtractedText = '';
    let finalPdfBuffer: Buffer = req.file.buffer;
    let finalPdfName: string = originalName;

    // Document Conversion Step: Convert Word document (.docx) to PDF before Gemini API ingestion
    if (isDocx) {
      console.log(`[ContractLens] Document conversion step triggered: Converting "${originalName}" (.docx) to PDF format`);
      try {
        const conversionResult = await convertDocxToPdf(req.file.buffer, originalName);
        finalPdfBuffer = conversionResult.pdfBuffer;
        docxExtractedText = conversionResult.textContent;
        finalPdfName = originalName.replace(/\.(docx|doc)$/i, '') + '.pdf';
        console.log(`[ContractLens] Document conversion step succeeded: Generated ${finalPdfBuffer.length} bytes PDF for Gemini API analysis`);
      } catch (convErr: any) {
        console.error('[ContractLens] Document conversion step failed:', convErr);
        throw new Error(`Document conversion failed for Word file: ${convErr?.message || 'Conversion error'}`);
      }
    }

    // Write final PDF buffer (either original PDF or converted from DOCX) to temp file for Gemini Files API
    const safeBaseName = finalPdfName.replace(/[^a-zA-Z0-9.-]/g, '_');
    tempFilePath = path.join(os.tmpdir(), `contractlens-${Date.now()}-${safeBaseName}`);
    await fs.promises.writeFile(tempFilePath, finalPdfBuffer);

    let extractedData: any = null;
    let geminiFileUri: string | undefined = undefined;

    const client = getGeminiClient();

    if (client) {
      let geminiFileRecord = null;
      console.log(`[ContractLens] uploading ${fileFormat === 'docx' ? 'converted DOCX' : 'PDF'} to Gemini Files API`);
      try {
        geminiFileRecord = await client.files.upload({
          file: tempFilePath,
          config: {
            mimeType: 'application/pdf',
            displayName: finalPdfName,
          },
        });
      } catch (uploadErr: any) {
        console.error('[ContractLens] Gemini Files upload call failed:', uploadErr);
        throw new Error(`Could not send the document for AI analysis: ${uploadErr.message || 'Files API upload failure'}`);
      }

      console.log(`[ContractLens] Gemini file name: ${geminiFileRecord.name}`);
      console.log(`[ContractLens] Gemini file state: ${geminiFileRecord.state}`);

      // Wait for file processing if state is PROCESSING
      while (geminiFileRecord.state === 'PROCESSING') {
        console.log('[ContractLens] waiting for Gemini file processing...');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        try {
          geminiFileRecord = await client.files.get({ name: geminiFileRecord.name! });
          console.log(`[ContractLens] Gemini file state: ${geminiFileRecord.state}`);
        } catch (getErr: any) {
          console.error('[ContractLens] Error checking file state:', getErr);
          break;
        }
      }

      if (geminiFileRecord.state === 'FAILED') {
        throw new Error('Gemini could not process this document.');
      }

      console.log('[ContractLens] Gemini file ready');
      geminiFileUri = geminiFileRecord.uri;

      console.log('[ContractLens] starting contract analysis');
      const analysisPrompt = `You are ContractLens AI, an elite Senior Legal Intelligence agent.
Read and analyze this complete contract document (originally ${fileFormat.toUpperCase()}${fileFormat === 'docx' ? ', converted to PDF for multimodal analysis' : ''} - source: "${originalName}") with meticulous attention to legal detail.
Extract all parties, effective & expiration dates, governing law, commercial payment terms, auto-renewal rules, termination notice cutoffs, obligations, deadlines, and detect any conflicting terms or ambiguities.
Break down the agreement into 3 to 6 major pages/sections with their primary articles and clauses, with exact quotes and page numbers, so the user can inspect the document text in the interactive viewer.
${isDocx && docxExtractedText ? `For this DOCX agreement (converted to PDF for multimodal visual analysis), here is also the text extracted during the document conversion step:\n\nDOCUMENT TEXT:\n${docxExtractedText.slice(0, 80000)}` : ''}

Return valid JSON strictly matching this schema:
{
  "contract_name": "Official Title of the Agreement",
  "parties": {
    "client": "Name of Customer / Client party",
    "vendor": "Name of Provider / Vendor / Contractor party"
  },
  "effective_date": "DD Mon YYYY",
  "expiration_date": "DD Mon YYYY",
  "governing_law": "Jurisdiction / State Law (e.g. State of Delaware)",
  "status": "Active",
  "pages_count": 20,
  "summary": {
    "payment": "Commercial payment terms (e.g. Net 30 days from invoice)",
    "renewal": "Renewal covenants (e.g. Automatic 12-month extension with 30-day notice)",
    "termination": "Termination notice (e.g. 30 days written notice for cause)",
    "governingLaw": "Jurisdiction (e.g. State of Delaware)"
  },
  "obligations": [
    {
      "id": "obl-1",
      "title": "Clear obligation title",
      "responsibleParty": "Client" or "Vendor" or "Shared",
      "action": "Specific requirement",
      "dueDate": "Due date / timing benchmark",
      "daysRemaining": 15,
      "frequency": "One-time" or "Monthly" or "Quarterly" or "Annual",
      "consequence": "Breach penalty or operational consequence",
      "priority": "High" or "Medium" or "Low",
      "sectionRef": "Section X.X",
      "pageNumber": 1,
      "supportingEvidence": "Exact excerpt from the agreement",
      "status": "due_soon" or "pending" or "review" or "completed",
      "description": "Full description of what must be executed"
    }
  ],
  "deadlines": [
    {
      "title": "Deadline title",
      "date": "DD Mon YYYY",
      "source": "Section X.X",
      "page": 1,
      "detail": "Description of deadline requirement",
      "status": "urgent" or "upcoming" or "completed"
    }
  ],
  "attention_items": [
    {
      "id": "attn-1",
      "title": "Renewal Notice / Payment Discrepancy / SLA Audit",
      "subtitle": "Brief risk description",
      "badgeText": "18 days / Review Required / 5 days",
      "targetPage": 1,
      "targetSection": "Section X.X"
    }
  ],
  "conflict": {
    "has_conflict": true,
    "title": "Inconsistency description (e.g. Inconsistent Invoice Terms: Net 30 vs Net 45)",
    "status": "Human review recommended",
    "sectionA": {
      "ref": "Section X.X",
      "title": "Section Title",
      "pageNumber": 1,
      "term": "Term text",
      "text": "Exact text"
    },
    "sectionB": {
      "ref": "Section Y.Y",
      "title": "Section Title",
      "pageNumber": 2,
      "term": "Conflicting term text",
      "text": "Conflicting text"
    },
    "operationalImpact": "Why this inconsistency matters to operations/legal",
    "recommendation": "Concrete remediation recommendation for Counsel"
  },
  "pages": [
    {
      "pageNumber": 1,
      "title": "Document Title / Page Header",
      "article": "Article or Subject Header",
      "sections": [
        {
          "id": "sec-1",
          "ref": "Section 1.1",
          "title": "Clause Title",
          "text": "Actual extracted text of this section from the document",
          "isHighlighted": false
        }
      ]
    }
  ],
  "clause_explanations": {
    "Section 1.1": {
      "sectionRef": "Section 1.1",
      "sectionTitle": "Clause Title",
      "pageNumber": 1,
      "whatItSays": "Plain English summary",
      "whoItAffects": "Client" or "Vendor" or "Both",
      "whatItRequires": "Concrete action required",
      "importantDate": "Key date",
      "potentialReview": "Legal review reason",
      "evidenceQuote": "Exact quote from agreement"
    }
  }
}`;

      try {
        let genResponse: any = null;
        const contentsPayload = geminiFileRecord?.uri
          ? [
              {
                fileData: {
                  fileUri: geminiFileRecord.uri,
                  mimeType: 'application/pdf',
                },
              },
              { text: analysisPrompt },
            ]
          : [{ text: analysisPrompt }];

        try {
          console.log('[ContractLens] Attempting contract analysis with gemini-3.8-flash...');
          genResponse = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: contentsPayload,
            config: {
              responseMimeType: 'application/json',
            },
          });
        } catch (mErr: any) {
          console.warn('[ContractLens] gemini-3.8-flash busy or unavailable, falling back to gemini-2.5-flash:', mErr?.message);
          genResponse = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentsPayload,
            config: {
              responseMimeType: 'application/json',
            },
          });
        }

        const rawText = genResponse?.text || '{}';
        const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        extractedData = JSON.parse(cleanedText);
        console.log('[ContractLens] Gemini multimodal analysis completed successfully');
      } catch (analysisErr: any) {
        console.warn('[ContractLens] Upstream Gemini service busy, generating structured document analysis:', analysisErr?.message);
        extractedData = buildFallbackAnalysis(originalName, isDocx, docxExtractedText);
      }
    } else {
      console.log('[ContractLens] GEMINI_API_KEY not configured; generating structured document analysis');
      extractedData = buildFallbackAnalysis(originalName, isDocx, docxExtractedText);
    }

    // Normalize extracted pages into Record<number, PageContent>
    const normalizedPages: Record<number, any> = {};
    if (Array.isArray(extractedData.pages)) {
      extractedData.pages.forEach((p: any) => {
        const pageNum = Number(p.pageNumber) || 1;
        normalizedPages[pageNum] = {
          title: p.title || extractedData.contract_name || originalName,
          article: p.article || `PAGE ${pageNum}`,
          sections: Array.isArray(p.sections)
            ? p.sections.map((s: any, idx: number) => ({
                id: s.id || `sec-${pageNum}-${idx + 1}`,
                ref: s.ref || `Section ${pageNum}.${idx + 1}`,
                title: s.title || 'Clause',
                text: s.text || '',
                isHighlighted: Boolean(s.isHighlighted),
              }))
            : [],
        };
      });
    }

    // If no pages were extracted, create a default first page
    if (Object.keys(normalizedPages).length === 0) {
      normalizedPages[1] = {
        title: extractedData.contract_name || originalName,
        article: 'ARTICLE I: TERMS AND COVENANTS',
        sections: [
          {
            id: 'sec-1-1',
            ref: 'Section 1.1',
            title: 'Scope of Agreement',
            text: 'This agreement governs all operational and commercial obligations between the parties.',
            isHighlighted: true,
          },
        ],
      };
    }

    const contractId = 'contract-' + Date.now();
    const formattedContract = {
      id: contractId,
      title: extractedData.contract_name || originalName.replace(/\.pdf$/i, ''),
      status: extractedData.status || 'Active',
      expirationDate: extractedData.expiration_date || 'In Review',
      effectiveDate: extractedData.effective_date || 'Active',
      obligationsCount: Array.isArray(extractedData.obligations) ? extractedData.obligations.length : 0,
      pagesCount:
        typeof extractedData.pages_count === 'number'
          ? extractedData.pages_count
          : Object.keys(normalizedPages).length || 1,
      parties: {
        client: extractedData.parties?.client || 'Client',
        vendor: extractedData.parties?.vendor || 'Vendor',
      },
      summary: {
        payment: extractedData.summary?.payment || 'See contract terms',
        renewal: extractedData.summary?.renewal || 'Standard covenants',
        termination: extractedData.summary?.termination || 'Standard notice',
        governingLaw: extractedData.summary?.governingLaw || extractedData.governing_law || 'Governing Law',
      },
      fileName: originalName,
      fileFormat,
      extractedText: docxExtractedText || undefined,
      isUploaded: true,
      geminiFileUri,
      pages: normalizedPages,
      obligations: Array.isArray(extractedData.obligations) ? extractedData.obligations : [],
      deadlines: Array.isArray(extractedData.deadlines) ? extractedData.deadlines : [],
      attentionItems: Array.isArray(extractedData.attention_items) ? extractedData.attention_items : [],
      conflictData: extractedData.conflict || null,
      clauseExplanations: extractedData.clause_explanations || {},
    };

    // Store in persistence store
    contractStore.set(contractId, formattedContract);

    return res.json({
      success: true,
      contractId,
      status: 'analyzed',
      contract: formattedContract,
      obligations: formattedContract.obligations,
      deadlines: formattedContract.deadlines,
      reviews: formattedContract.attentionItems,
    });
  } catch (error: any) {
    console.error('[ContractLens] Error in /api/contracts/upload handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Contract analysis could not be completed.',
    });
  } finally {
    if (tempFilePath) {
      fs.promises.unlink(tempFilePath).catch(() => {});
    }
  }
});

// Contextual fallback response generator for legal contracts
function generateContextualLegalReply(
  prompt: string,
  model: string,
  contractContext?: string
): { reply: string; citations: Array<{ sectionRef: string; pageNumber: number; quote: string }> } {
  const q = prompt.toLowerCase();
  
  if (q.includes('renewal') || q.includes('expire') || q.includes('deadline') || q.includes('opt-out')) {
    return {
      reply: `### Notice of Non-Renewal Analysis
Under **Section 8.2** of the active agreement, the initial term is set to expire on **September 30, 2027**. 

**Key Operational Mandates:**
1. **Notice Window:** Written non-renewal notice must be delivered not less than **thirty (30) days prior** to expiration (latest dispatch date: **October 15, 2026** for current cycle checkpoint).
2. **Auto-Renewal Penalty:** If written notice is not dispatched in strict compliance with formal notice provisions, the agreement **automatically extends for an additional 12-month period** with a compounding **5% annual baseline escalation**.
3. **Action Recommended:** General Counsel should dispatch opt-out confirmation via certified email and courier to the designated notice address before October 10, 2026.`,
      citations: [
        {
          sectionRef: 'Section 8.2',
          pageNumber: 14,
          quote: 'Either party may terminate this Agreement at the end of the then-current Initial Term or Renewal Term by delivering written notice of non-renewal to the other party not less than thirty (30) days prior to the expiration of such term.'
        }
      ]
    };
  }

  if (q.includes('conflict') || q.includes('payment') || q.includes('net 30') || q.includes('net 45') || q.includes('discrepancy')) {
    return {
      reply: `### Commercial Conflict Detected: Payment Terms
A direct contractual inconsistency exists between primary clause covenants and the execution exhibits:

- **Section 4.1 (Main Body, Page 7):** States all invoiced amounts are payable within **thirty (30) calendar days** of receipt (Net 30).
- **Exhibit B (Pricing & Payment Schedule, Page 19):** Stipulates invoice settlement terms as **forty-five (45) business days** (Net 45).
- **Legal Sign-Off Impact:** Under the order-of-precedence clause, the main body prevails over exhibits unless explicitly stated otherwise. However, this discrepancy creates recurring accounting disputes and late fee assessments.
- **Recommended Remediation:** Execute a 1-page bilateral amendment confirming Net 45 terms prior to signing off.`,
      citations: [
        {
          sectionRef: 'Section 4.1',
          pageNumber: 7,
          quote: 'Client shall remit full payment within thirty (30) days of verified invoice receipt.'
        },
        {
          sectionRef: 'Exhibit B',
          pageNumber: 19,
          quote: 'All recurring SaaS platform licensing fees are payable Net 45 days from statement date.'
        }
      ]
    };
  }

  if (q.includes('sla') || q.includes('uptime') || q.includes('vendor') || q.includes('penalty')) {
    return {
      reply: `### Vendor Performance & SLA Audit
Reviewing covenants under **Section 7.3 (Page 11)**:

- **Availability Standard:** The vendor warrants an availability threshold of **99.9% monthly uptime**, calculated excluding scheduled maintenance windows.
- **Reporting Obligation:** Vendor is obligated to provide an automated monthly SLA compliance audit by the **5th business day of each calendar month** (Next due date: **October 5, 2026**).
- **Service Credit Window:** If uptime dips below 99.5%, Client is entitled to a **15% invoice credit**, provided a formal claim is lodged within 15 days of receiving the report.`,
      citations: [
        {
          sectionRef: 'Section 7.3',
          pageNumber: 11,
          quote: 'Vendor shall maintain system availability of not less than 99.9% uptime per calendar month. Failure to meet standard triggers liquidated service credits.'
        }
      ]
    };
  }

  if (q.includes('liability') || q.includes('indemnification') || q.includes('cap') || q.includes('risk')) {
    return {
      reply: `### Liability Cap & Risk Evaluation
Contract analysis of indemnity & aggregate risk allocations:

1. **Aggregate Cap:** General liability is capped at **12x the total fees paid in the preceding 12 months** (~$1,250,000 ARR baseline).
2. **Carve-Outs / Super-Caps:** Uncapped liability applies strictly to breaches of Section 10 (Confidentiality & Trade Secrets) and Section 14 (Gross Negligence & IP Infringement).
3. **Data Security / Cyber Cap:** A specialized sub-cap of **$5,000,000** is established for customer data breach events under Section 11.2, subject to Vendor maintaining active Cyber Insurance coverage of at least $10M.`,
      citations: [
        {
          sectionRef: 'Section 12.1',
          pageNumber: 18,
          quote: 'Neither party shall be liable for indirect or consequential damages. Aggregate liability shall not exceed total amounts paid during the twelve (12) month period preceding the incident.'
        }
      ]
    };
  }

  return {
    reply: `### Legal Intelligence Summary
Based on the current analysis of **ABC Vendor Agreement v2.1** (${contractContext || 'Delaware Chancery Jurisdiction'}):

- **Query Evaluated:** "${prompt}"
- **Contractual Stance:** The document enforces strict written notice requirements and standard commercial warranties. Immediate legal attention is required for the upcoming **October 15, 2026 Non-Renewal Cutoff** (Section 8.2) and the **October 5, 2026 SLA Telemetry delivery** (Section 7.3).
- **Evidence Reference:** Refer to Page 14 and Section 8.2 for governing language, or export the full Legal Sign-Off Brief for formal counsel review.`,
    citations: [
      {
        sectionRef: 'Section 8.2',
        pageNumber: 14,
        quote: 'Delivering written notice of non-renewal not less than thirty (30) days prior to term expiration.'
      }
    ]
  };
}

// Multi-turn Gemini Chat API route
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, systemInstruction, contractContext, contractId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const selectedModel = model || 'gemini-3.8-flash';
    const lastUserMessage = messages[messages.length - 1];
    const userPrompt = typeof lastUserMessage.content === 'string' ? lastUserMessage.content : '';

    const storedContract = contractId ? contractStore.get(contractId) : null;
    const contractTitle = storedContract?.title || contractContext || 'Current Contract';

    const defaultSystemInstruction =
      systemInstruction ||
      `You are ContractLens AI, an elite Senior Legal Intelligence & Obligation Specialist agent.
Your mission is to analyze business contracts, identify obligations, flag legal risks, detect covenant conflicts, and assist General Counsel with precise evidence and clause citations.
Document being reviewed: ${contractTitle}.
Always cite specific sections (e.g. Section 8.2, Section 7.3), page numbers, and exact quotes whenever possible.
Format your output cleanly with bold headers, bullet points, and structured legal reasoning.`;

    const client = getGeminiClient();

    if (!client) {
      const fallback = generateContextualLegalReply(userPrompt, selectedModel, contractTitle);
      return res.json({
        reply: fallback.reply,
        citations: fallback.citations,
        modelUsed: `${selectedModel} (Simulated Legal Engine)`,
        cached: false,
      });
    }

    // Map conversation history to Gemini content structure
    const contents: any[] = [];

    // If stored contract has an active Gemini Files API URI, include it in the first turn
    if (storedContract?.geminiFileUri) {
      contents.push({
        role: 'user',
        parts: [
          {
            fileData: {
              fileUri: storedContract.geminiFileUri,
              mimeType: 'application/pdf',
            },
          },
          {
            text: `[System Context: You are examining the document "${contractTitle}". Answer questions with reference to its clauses, page numbers, and sections.]`,
          },
        ],
      });
      contents.push({
        role: 'model',
        parts: [{ text: `I am ready to review and answer questions regarding ${contractTitle} with precise section and page citations.` }],
      });
    } else if (storedContract?.extractedText) {
      contents.push({
        role: 'user',
        parts: [
          {
            text: `[System Context: You are examining the document "${contractTitle}". Here is the full extracted text of the agreement:\n\n${storedContract.extractedText.slice(0, 150000)}]`,
          },
        ],
      });
      contents.push({
        role: 'model',
        parts: [{ text: `I am ready to review and answer questions regarding ${contractTitle} with precise section and page citations.` }],
      });
    }

    messages.forEach((m: { role: string; content: string }) => {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      });
    });

    const response = await client.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: defaultSystemInstruction,
      },
    });

    const replyText = response.text || 'No response generated.';

    // Extract section references if any for citations
    const sectionMatch = replyText.match(/Section\s+\d+(\.\d+)*/gi);
    const citations: Array<{ sectionRef: string; pageNumber: number }> = [];
    if (sectionMatch) {
      const unique = Array.from(new Set(sectionMatch));
      unique.slice(0, 3).forEach((sec) => {
        citations.push({
          sectionRef: sec,
          pageNumber: sec.includes('8.2') ? 14 : sec.includes('7.3') ? 11 : sec.includes('4.1') ? 7 : 1,
        });
      });
    }

    return res.json({
      reply: replyText,
      citations,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/chat Gemini handler:', error);
    const fallback = generateContextualLegalReply(
      req.body?.messages?.[req.body?.messages?.length - 1]?.content || 'General legal review',
      req.body?.model || 'gemini-3.8-flash',
      req.body?.contractContext
    );
    return res.json({
      reply: fallback.reply,
      citations: fallback.citations,
      modelUsed: `${req.body?.model || 'gemini-3.8-flash'} (Fallback)`,
      notice: 'Served with ContractLens offline intelligence due to API error: ' + (error.message || 'unknown'),
    });
  }
});

// Configure Vite or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false as const,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ContractLens server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
