/**
 * Lightweight client & server sensitive-data detector
 * Identifies emails, phone numbers, bank account numbers, IBANs, routing numbers, and payment cards
 * purely locally without transmitting data to third parties.
 */

export interface SensitiveDataFinding {
  type: 'email' | 'phone' | 'bank_account' | 'payment_card' | 'tax_id';
  label: string;
  count: number;
}

export interface SensitiveDataReport {
  detected: boolean;
  totalCount: number;
  findings: SensitiveDataFinding[];
  summaryText: string;
}

export function scanForSensitiveData(text: string): SensitiveDataReport {
  if (!text || typeof text !== 'string') {
    return { detected: false, totalCount: 0, findings: [], summaryText: 'No sensitive data detected' };
  }

  const findings: SensitiveDataFinding[] = [];
  let totalCount = 0;

  // 1. Email addresses (e.g., jane.doe@acmecorp.com)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
  const emails = text.match(emailRegex) || [];
  if (emails.length > 0) {
    findings.push({
      type: 'email',
      label: 'Email addresses',
      count: emails.length,
    });
    totalCount += emails.length;
  }

  // 2. Phone numbers (e.g., +1-800-555-0199, (555) 123-4567, 555-123-4567)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const phones = text.match(phoneRegex) || [];
  if (phones.length > 0) {
    findings.push({
      type: 'phone',
      label: 'Direct contact phone numbers',
      count: phones.length,
    });
    totalCount += phones.length;
  }

  // 3. Bank / Routing / IBAN references (e.g., IBAN GB82, Routing #, Account #, SWIFT/BIC)
  const bankRegex = /\b(?:IBAN\s*[A-Z]{2}\d{2}[A-Z0-9]{4,30}|Routing\s*(?:Number|#)?\s*[:#]?\s*\d{9}|Account\s*(?:Number|#)?\s*[:#]?\s*\d{6,17}|ABA\s*#?\s*\d{9}|SWIFT\s*[:#]?\s*[A-Z]{6}[A-Z0-9]{2,5})\b/gi;
  const bankMatches = text.match(bankRegex) || [];
  if (bankMatches.length > 0) {
    findings.push({
      type: 'bank_account',
      label: 'Bank account / routing identifiers',
      count: bankMatches.length,
    });
    totalCount += bankMatches.length;
  }

  // 4. Payment card references (13-19 digits, masked or segmented)
  const cardRegex = /\b(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,4}|\*{4}[-\s]?\*{4}[-\s]?\*{4}[-\s]?\d{4})\b/g;
  const cardMatches = text.match(cardRegex) || [];
  if (cardMatches.length > 0) {
    findings.push({
      type: 'payment_card',
      label: 'Payment / card identifiers',
      count: cardMatches.length,
    });
    totalCount += cardMatches.length;
  }

  // 5. Tax ID / SSN / EIN references (e.g. SSN ###-##-#### or EIN ##-#######)
  const taxIdRegex = /\b(?:\d{3}-\d{2}-\d{4}|\d{2}-\d{7})\b/g;
  const taxMatches = text.match(taxIdRegex) || [];
  if (taxMatches.length > 0) {
    findings.push({
      type: 'tax_id',
      label: 'Tax ID / SSN / EIN identifiers',
      count: taxMatches.length,
    });
    totalCount += taxMatches.length;
  }

  const detected = totalCount > 0;
  const summaryText = detected
    ? `Sensitive information detected (${totalCount} instance${totalCount === 1 ? '' : 's'})`
    : 'No sensitive data detected';

  return {
    detected,
    totalCount,
    findings,
    summaryText,
  };
}
