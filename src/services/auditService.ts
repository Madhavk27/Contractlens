import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userUid: string;
  userEmail: string;
  contractId: string;
  contractName: string;
  action: string;
  details?: string;
}

// In-memory cache for fast UI access and offline fallback
const sessionAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-demo-init',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userUid: 'system',
    userEmail: 'security@contractlens.internal',
    contractId: 'abc-vendor',
    contractName: 'ABC Vendor Agreement v2.1',
    action: 'Contract uploaded',
    details: 'Initial verification and baseline analysis completed.',
  },
  {
    id: 'log-demo-ai',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    userUid: 'system',
    userEmail: 'gemini-agent@contractlens.internal',
    contractId: 'abc-vendor',
    contractName: 'ABC Vendor Agreement v2.1',
    action: 'AI analysis completed',
    details: 'Extracted 8 operational obligations and identified 1 commercial clause conflict.',
  },
];

export async function logContractAuditAction(params: {
  userUid: string;
  userEmail?: string;
  contractId: string;
  contractName: string;
  action: string;
  details?: string;
}): Promise<AuditLogEntry> {
  const logEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    userUid: params.userUid,
    userEmail: params.userEmail || 'anonymous',
    contractId: params.contractId,
    contractName: params.contractName,
    action: params.action,
    details: params.details || '',
  };

  // Add to session cache
  sessionAuditLogs.unshift(logEntry);

  // If user is authenticated and not demo, attempt Firestore persistence
  if (params.userUid && params.userUid !== 'system' && params.userUid !== 'anonymous') {
    try {
      const logRef = doc(db, 'contracts', params.contractId, 'auditLogs', logEntry.id);
      await setDoc(logRef, logEntry);
    } catch (err: any) {
      console.debug('[ContractLens Audit] Persistence notification:', err?.message);
    }
  }

  return logEntry;
}

export async function getContractAuditLogs(contractId: string): Promise<AuditLogEntry[]> {
  const localLogs = sessionAuditLogs.filter((l) => l.contractId === contractId);

  try {
    const logsCol = collection(db, 'contracts', contractId, 'auditLogs');
    const q = query(logsCol, orderBy('timestamp', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const remoteLogs: AuditLogEntry[] = [];
      snapshot.forEach((docSnap) => {
        remoteLogs.push(docSnap.data() as AuditLogEntry);
      });
      // Merge unique
      const mergedMap = new Map<string, AuditLogEntry>();
      [...remoteLogs, ...localLogs].forEach((item) => mergedMap.set(item.id, item));
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
  } catch (err: any) {
    console.debug('[ContractLens Audit] Query notification (using session logs):', err?.message);
  }

  return localLogs;
}

export function getAllSessionAuditLogs(): AuditLogEntry[] {
  return [...sessionAuditLogs];
}
