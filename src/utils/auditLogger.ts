import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuditLogEntry, UserRole } from '../types';

export async function logAuditEvent(params: {
  userId: string;
  userEmail?: string | null;
  userRole?: UserRole;
  action: string;
  category: AuditLogEntry['category'];
  resource: string;
  status: AuditLogEntry['status'];
  details?: string;
}): Promise<AuditLogEntry> {
  const newLog: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId: params.userId,
    userEmail: params.userEmail || undefined,
    userRole: params.userRole || 'member',
    action: params.action,
    category: params.category,
    resource: params.resource,
    status: params.status,
    details: params.details,
    ipAddress: '127.0.0.1 (Isolated Container Ingress)'
  };

  try {
    const auditCol = collection(db, 'auditLogs');
    await addDoc(auditCol, {
      ...newLog,
      serverTime: serverTimestamp()
    });
  } catch (err) {
    // If firestore write is rejected due to guest role or offline, fallback to memory storage
    console.debug('Audit log recorded locally:', newLog);
  }

  // Also maintain in window / localStorage for instant reactivity in Admin Dashboard
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingRaw = window.localStorage.getItem('reflectai_audit_logs');
      const existing: AuditLogEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [newLog, ...existing].slice(0, 100);
      window.localStorage.setItem('reflectai_audit_logs', JSON.stringify(updated));
    }
  } catch {}

  return newLog;
}

export function getLocalAuditLogs(): AuditLogEntry[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingRaw = window.localStorage.getItem('reflectai_audit_logs');
      if (existingRaw) return JSON.parse(existingRaw);
    }
  } catch {}
  return [];
}
