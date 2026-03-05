import type { AuditLogEntry } from '../actions/audit.action';

export interface AuditLogChange {
  field: string;
  previousValue: unknown;
  newValue: unknown;
}

/**
 * Transform audit log entries to contract history format
 */
export function transformAuditLogsToHistory(logs: AuditLogEntry[]): Array<{
  id: string;
  timestamp: string;
  userId: string | null;
  action: string;
  changes: AuditLogChange[];
  metadata?: Record<string, unknown> | null;
}> {
  return logs.map((log) => {
    const changes: AuditLogChange[] = [];

    // Extract changes from oldValues and newValues
    if (log.oldValues || log.newValues) {
      const oldKeys = Object.keys(log.oldValues || {});
      const newKeys = Object.keys(log.newValues || {});
      const allKeys = [...new Set([...oldKeys, ...newKeys])];

      allKeys.forEach((key) => {
        const previousValue = log.oldValues?.[key];
        const newValue = log.newValues?.[key];

        // Only add if there's an actual change
        if (previousValue !== newValue) {
          changes.push({
            field: key,
            previousValue,
            newValue,
          });
        }
      });
    }

    return {
      id: log.id,
      timestamp: log.createdAt,
      userId: log.userId,
      action: log.action,
      changes,
      metadata: log.metadata,
    };
  });
}
