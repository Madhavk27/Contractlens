/**
 * ContractLens Diagnostic & Lifecycle Logger
 * Tracks component boot sequence and verifies core data dependencies
 * (RECENT_CONTRACTS, ACTION_CENTER_ITEMS) are loaded and valid before dashboard render.
 */

import { Contract, ActionItem } from '../types';

export interface DiagnosticsReport {
  timestamp: string;
  status: 'healthy' | 'warning' | 'error';
  contractsCount: number;
  actionItemsCount: number;
  primaryContractId?: string;
  dataIntegrity: boolean;
  notes: string[];
}

class DiagnosticLogger {
  private static instance: DiagnosticLogger;
  private logs: Array<{ timestamp: string; phase: string; details: any }> = [];
  private hasReportedHealthy = false;

  private constructor() {
    this.log('INIT', 'Diagnostic logger initialized');
  }

  public static getInstance(): DiagnosticLogger {
    if (!DiagnosticLogger.instance) {
      DiagnosticLogger.instance = new DiagnosticLogger();
    }
    return DiagnosticLogger.instance;
  }

  public log(phase: string, details: any): void {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, phase, details };
    this.logs.push(entry);

    if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
      const prefix = `[ContractLens:Diagnostics:${phase}]`;
      if (typeof details === 'string') {
        console.log(`${prefix} ${details}`);
      } else {
        console.log(prefix, details);
      }
    }
  }

  public verifyDataDependencies(
    contracts: Contract[],
    actionItems: ActionItem[]
  ): DiagnosticsReport {
    const notes: string[] = [];
    let isHealthy = true;

    // Validate Contracts
    if (!Array.isArray(contracts)) {
      notes.push('ERROR: RECENT_CONTRACTS is not an array.');
      isHealthy = false;
    } else if (contracts.length === 0) {
      notes.push('WARNING: RECENT_CONTRACTS is empty.');
      isHealthy = false;
    } else {
      const validContracts = contracts.filter((c) => c && c.id && c.title);
      if (validContracts.length !== contracts.length) {
        notes.push(`WARNING: ${contracts.length - validContracts.length} malformed contract(s) detected.`);
        isHealthy = false;
      } else {
        notes.push(`Loaded ${contracts.length} contract(s) with valid schema.`);
      }
    }

    // Validate Action Items
    if (!Array.isArray(actionItems)) {
      notes.push('ERROR: ACTION_CENTER_ITEMS is not an array.');
      isHealthy = false;
    } else if (actionItems.length === 0) {
      notes.push('WARNING: ACTION_CENTER_ITEMS is empty.');
      isHealthy = false;
    } else {
      const validActions = actionItems.filter((a) => a && a.id && a.title);
      if (validActions.length !== actionItems.length) {
        notes.push(`WARNING: ${actionItems.length - validActions.length} malformed action item(s) detected.`);
        isHealthy = false;
      } else {
        notes.push(`Loaded ${actionItems.length} action item(s) with valid status and urgency.`);
      }
    }

    const report: DiagnosticsReport = {
      timestamp: new Date().toISOString(),
      status: isHealthy ? 'healthy' : 'warning',
      contractsCount: Array.isArray(contracts) ? contracts.length : 0,
      actionItemsCount: Array.isArray(actionItems) ? actionItems.length : 0,
      primaryContractId: contracts?.[0]?.id,
      dataIntegrity: isHealthy,
      notes,
    };

    if (!this.hasReportedHealthy && isHealthy) {
      this.hasReportedHealthy = true;
      this.log('BOOT_READY', {
        contractsAvailable: report.contractsCount,
        actionsAvailable: report.actionItemsCount,
        initialActiveContract: report.primaryContractId,
        readyForDashboardRender: true,
      });
    }

    return report;
  }

  public getHistory(): Array<{ timestamp: string; phase: string; details: any }> {
    return [...this.logs];
  }
}

export const diagnostics = DiagnosticLogger.getInstance();
