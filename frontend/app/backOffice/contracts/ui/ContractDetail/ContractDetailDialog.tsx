'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { useAlert } from '@/shared/hooks/useAlert';
import { useSession } from 'next-auth/react';
import {
  updateContractStatus,
  closeContract,
  failContract,
  updatePaymentStatus,
  updateContractAgent,
  getContractById,
  addContractPayment,
  updateContract,
  uploadPaymentDocument,
  uploadContractDocument,
} from '@/features/backoffice/contracts/actions/contracts.action';
import {
  createDocument,
  getContractDocuments,
  deleteDocument,
  updateDocumentRequired,
} from '@/features/backoffice/contracts/actions/documents.action';
import { listAdminsAgents } from '@/features/backoffice/users/actions/users.action';
import {
  PaymentType,
  ContractOperationType,
  ContractStatus,
  FINAL_CONTRACT_STATUSES,
} from '@/shared/types/contracts';
import { getDocumentTypes, type DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';
import { getContractAuditLogs, type AuditLogEntry } from '@/features/backoffice/contracts/actions/audit.action';
import { transformAuditLogsToHistory } from '@/features/backoffice/contracts/utils/audit.utils';
import ContractGeneralSection from './components/ContractGeneralSection';
import ContractPropertySection from './components/ContractPropertySection';
import ContractParticipantsSection from './components/ContractParticipantsSection';
import ContractFinancialSection from './components/ContractFinancialSection';
import ContractPaymentsSection from './components/ContractPaymentsSection';
import ContractDocumentsSection from './components/ContractDocumentsSection';
import { getDocumentTypeName, resolveDocumentId } from './components/ContractDocumentCard';
import ContractHistorySection from './components/ContractHistorySection';
import ContractAddPaymentDialog from './components/ContractAddPaymentDialog';
import ContractUploadPaymentDocumentDialog from './components/ContractUploadPaymentDocumentDialog';
import ContractAddDocumentDialog from './components/ContractAddDocumentDialog';
import ContractUploadContractDocumentDialog from './components/ContractUploadContractDocumentDialog';
import ContractEditFinancialDialog from './components/ContractEditFinancialDialog';

interface ContractDetailDialogProps {
  open: boolean;
  onClose: () => void;
  contractId: string | null;
  onEdit?: (contractId: string) => void;
  onDelete?: (contractId: string) => void;
  onUpdate?: () => void;
}

type SectionType =
  | 'general'
  | 'property'
  | 'participants'
  | 'financial'
  | 'payments'
  | 'documents'
  | 'history';

const sections: Array<{ id: SectionType; label: string; icon: string }> = [
  { id: 'general', label: 'General', icon: 'info' },
  { id: 'property', label: 'Propiedad', icon: 'home' },
  { id: 'participants', label: 'Participantes', icon: 'groups' },
  { id: 'financial', label: 'Financiero', icon: 'attach_money' },
  { id: 'payments', label: 'Pagos', icon: 'payment' },
  { id: 'documents', label: 'Documentos', icon: 'description' },
  { id: 'history', label: 'Historial', icon: 'history' },
];

const FINAL_STATUS_SET = new Set<ContractStatus>(FINAL_CONTRACT_STATUSES);

const isFinalContractStatus = (status?: string | null): boolean => {
  const key = normalizeStatusKey(status);
  if (!key || key === 'ON_HOLD') {
    return false;
  }

  return FINAL_STATUS_SET.has(key as ContractStatus);
};

const statusLabelMap: Record<string, string> = {
  IN_PROCESS: 'En Proceso',
  CLOSED: 'Cerrado',
  FAILED: 'Fallido',
};

const statusColorMap: Record<string, string> = {
  IN_PROCESS: 'bg-blue-100 text-blue-800 border-blue-200',
  CLOSED: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
};

const normalizeStatusKey = (status: string | null | undefined) =>
  typeof status === 'string' ? status.trim().toUpperCase() : '';

const getStatusLabel = (status: string) => {
  const key = normalizeStatusKey(status);
  if (key === 'ON_HOLD') {
    return statusLabelMap.IN_PROCESS;
  }

  return statusLabelMap[key] || status || 'Sin estado';
};

const getStatusColor = (status: string) => {
  const key = normalizeStatusKey(status);
  if (key === 'ON_HOLD') {
    return statusColorMap.IN_PROCESS;
  }

  return statusColorMap[key] || statusColorMap.IN_PROCESS;
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    SELLER: 'Vendedor',
    BUYER: 'Comprador',
    NOTARY: 'Notario',
    REGISTRAR: 'Registrador',
    WITNESS: 'Testigo',
    AGENT: 'Agente',
  };
  return labels[role] || role;
};

const getPaymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    SALE_DOWN_PAYMENT: 'Pie/Cuota Inicial',
    SALE_INSTALLMENT: 'Cuota Mensual',
    SALE_FINAL_PAYMENT: 'Pago Final',
    COMMISSION_INCOME: 'Ingreso por Comisión',
    RENT_PAYMENT: 'Pago de Arriendo',
    DEPOSIT: 'Depósito / Garantía',
    MAINTENANCE_FEE: 'Gastos Comunes',
    UTILITIES: 'Servicios Básicos',
    OTHER: 'Otro',
  };
  return labels[type] || type;
};

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    PENDING_VERIFICATION: 'Pendiente de Verificación',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
  };
  return labels[status] || status;
};

const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
    PENDING_VERIFICATION: 'bg-blue-100 text-blue-800 border-blue-200',
    PAID: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const normalizeKey = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : undefined;
};

const normalizeDocumentEntity = (document: any, fallbackContractCode?: string) => {
  if (!document || typeof document !== 'object') {
    return document;
  }

  const normalized: Record<string, any> = { ...document };

  if (typeof normalized.isRequired === 'boolean' && typeof normalized.required !== 'boolean') {
    normalized.required = normalized.isRequired;
  }

  if (typeof normalized.required !== 'boolean') {
    const requiredCandidate = normalized.required;
    if (typeof requiredCandidate === 'string') {
      const normalizedValue = requiredCandidate.trim().toLowerCase();
      if (normalizedValue === 'true') {
        normalized.required = true;
      } else if (normalizedValue === 'false') {
        normalized.required = false;
      }
    } else if (typeof requiredCandidate === 'number') {
      normalized.required = requiredCandidate === 1;
    } else if (typeof requiredCandidate !== 'boolean') {
      normalized.required = false;
    }
  }

  if (!normalized.documentTypeName && normalized.documentType?.name) {
    normalized.documentTypeName = normalized.documentType.name;
  }

  if (!normalized.documentTypeId && normalized.documentType?.id) {
    normalized.documentTypeId = normalized.documentType.id;
  }

  if (!normalized.personName && normalized.person?.name) {
    normalized.personName = normalized.person.name;
  }

  if (!normalized.personDni && normalized.person?.dni) {
    normalized.personDni = normalized.person.dni;
  }

  if (!normalized.uploadedByName && normalized.uploadedBy?.name) {
    normalized.uploadedByName = normalized.uploadedBy.name;
  }

  if (!normalized.uploadedByName && normalized.uploadedBy?.email) {
    normalized.uploadedByName = normalized.uploadedBy.email;
  }

  if (!normalized.contractCode) {
    if (typeof normalized.contract?.code === 'string') {
      normalized.contractCode = normalized.contract.code;
    } else if (fallbackContractCode) {
      normalized.contractCode = fallbackContractCode;
    }
  }

  if (typeof normalized.status === 'string' && typeof normalized.uploaded === 'undefined') {
    normalized.uploaded = normalized.status !== 'PENDING';
  }

  if (!normalized.updatedAt && normalized.createdAt) {
    normalized.updatedAt = normalized.createdAt;
  }

  return normalized;
};

type NormalizedContractDocument = ReturnType<typeof normalizeDocumentEntity>;

const mergeContractDocuments = (
  contractData: any,
  primaryDocuments?: any[] | null,
  secondaryDocuments?: any[] | null,
) => {
  const primaryRaw = Array.isArray(primaryDocuments) ? primaryDocuments : [];
  const hasPrimaryDocuments = primaryRaw.length > 0;
  const baseDocumentsRaw = !hasPrimaryDocuments && Array.isArray(contractData?.documents)
    ? contractData.documents
    : [];
  const secondaryRaw = Array.isArray(secondaryDocuments) ? secondaryDocuments : [];
  const contractCode = typeof contractData?.code === 'string' ? contractData.code : undefined;

  const normalize = (doc: any): NormalizedContractDocument =>
    normalizeDocumentEntity(doc, contractCode);

  const baseNormalized: NormalizedContractDocument[] = baseDocumentsRaw.map(normalize);
  const primaryNormalized: NormalizedContractDocument[] = primaryRaw.map(normalize);
  const secondaryNormalized: NormalizedContractDocument[] = secondaryRaw.map(normalize);

  const primaryById = new Map<string, NormalizedContractDocument>();
  const primaryByDocId = new Map<string, NormalizedContractDocument>();
  const primaryByType = new Map<string, NormalizedContractDocument[]>();

  primaryNormalized.forEach((doc) => {
    const docIdKey = normalizeKey(doc.id);
    if (docIdKey) {
      primaryById.set(docIdKey, doc);
    }
    const docDocumentIdKey = normalizeKey(doc.documentId);
    if (docDocumentIdKey) {
      primaryByDocId.set(docDocumentIdKey, doc);
    }
    const docTypeKey = normalizeKey(doc.documentTypeId);
    if (docTypeKey) {
      const list = primaryByType.get(docTypeKey) ?? [];
      list.push(doc);
      primaryByType.set(docTypeKey, list);
    }
  });

  const usedPrimaryDocs = new Set<NormalizedContractDocument>();

  const mergedBase = baseNormalized.map((baseDoc: NormalizedContractDocument) => {
    let candidate: NormalizedContractDocument | undefined;

    const baseDocDocumentIdKey = normalizeKey(baseDoc.documentId);
    if (!candidate && baseDocDocumentIdKey && primaryById.has(baseDocDocumentIdKey)) {
      candidate = primaryById.get(baseDocDocumentIdKey);
    }

    const baseDocIdKey = normalizeKey(baseDoc.id);
    if (!candidate && baseDocIdKey && primaryById.has(baseDocIdKey)) {
      candidate = primaryById.get(baseDocIdKey);
    }

    const baseDocTypeKey = normalizeKey(baseDoc.documentTypeId);
    if (!candidate && baseDocTypeKey) {
      const list = primaryByType.get(baseDocTypeKey) ?? [];
      candidate = list.find((doc) => !usedPrimaryDocs.has(doc));
    }

    if (!candidate && baseDocDocumentIdKey && primaryByDocId.has(baseDocDocumentIdKey)) {
      candidate = primaryByDocId.get(baseDocDocumentIdKey);
    }

    if (!candidate) {
      return baseDoc;
    }

    usedPrimaryDocs.add(candidate);

    const mergedDoc = {
      ...baseDoc,
      ...candidate,
    } as Record<string, any>;

    const candidateDocumentId =
      (typeof candidate.documentId === 'string' && candidate.documentId.trim().length > 0
        ? candidate.documentId.trim()
        : undefined) ||
      (typeof candidate.id === 'string' && candidate.id.trim().length > 0
        ? candidate.id.trim()
        : undefined);

    if (candidateDocumentId) {
      mergedDoc.documentId = candidateDocumentId;
      if (!mergedDoc.id) {
        mergedDoc.id = candidateDocumentId;
      }
    }

    if (typeof candidate.multimediaId === 'string' && candidate.multimediaId.trim().length > 0) {
      mergedDoc.multimediaId = candidate.multimediaId.trim();
    }

    if (candidate.multimedia) {
      mergedDoc.multimedia = candidate.multimedia;
    }

    if (!mergedDoc.url && typeof candidate.url === 'string' && candidate.url.trim().length > 0) {
      mergedDoc.url = candidate.url.trim();
    }

    if (!mergedDoc.fileUrl && typeof candidate.fileUrl === 'string' && candidate.fileUrl.trim().length > 0) {
      mergedDoc.fileUrl = candidate.fileUrl.trim();
    }

    if (!mergedDoc.multimediaUrl && typeof candidate.multimediaUrl === 'string' && candidate.multimediaUrl.trim().length > 0) {
      mergedDoc.multimediaUrl = candidate.multimediaUrl.trim();
    }

    if (!mergedDoc.uploadedByName) {
      if (typeof candidate.uploadedByName === 'string' && candidate.uploadedByName.trim().length > 0) {
        mergedDoc.uploadedByName = candidate.uploadedByName.trim();
      } else if (candidate.uploadedBy?.name) {
        mergedDoc.uploadedByName = candidate.uploadedBy.name;
      } else if (candidate.uploadedBy?.email) {
        mergedDoc.uploadedByName = candidate.uploadedBy.email;
      }
    }

    mergedDoc.required = typeof candidate.required === 'boolean'
      ? candidate.required
      : (typeof baseDoc.required === 'boolean' ? baseDoc.required : false);

    mergedDoc.title = candidate.title || baseDoc.title;
    mergedDoc.notes = candidate.notes ?? baseDoc.notes;
    mergedDoc.personId = candidate.personId || baseDoc.personId;
    mergedDoc.personName = candidate.personName || baseDoc.personName;
    mergedDoc.person = candidate.person || baseDoc.person;
    mergedDoc.documentTypeId = candidate.documentTypeId || baseDoc.documentTypeId;
    mergedDoc.documentTypeName = candidate.documentTypeName || baseDoc.documentTypeName;
    mergedDoc.documentType = candidate.documentType || baseDoc.documentType;
    mergedDoc.contractCode = candidate.contractCode || baseDoc.contractCode || contractCode;

    const hasFile = Boolean(
      candidate.multimediaId ||
        candidate.multimedia?.url ||
        candidate.uploaded ||
        mergedDoc.multimediaId ||
        mergedDoc.multimedia?.url,
    );

    if (hasFile) {
      mergedDoc.uploaded = true;
      mergedDoc.status = candidate.status || mergedDoc.status || 'UPLOADED';
    } else {
      mergedDoc.uploaded = mergedDoc.uploaded ?? false;
      mergedDoc.status = mergedDoc.status || candidate.status || 'PENDING';
    }

    return mergedDoc;
  });

  const leftoverPrimary = primaryNormalized.filter((doc) => !usedPrimaryDocs.has(doc));
  const combined = [...mergedBase, ...leftoverPrimary, ...secondaryNormalized];

  const finalDocuments: any[] = [];
  const seen = new Set<string>();
  let fallbackCounter = 0;

  const register = (doc: any) => {
    if (!doc) {
      return;
    }

    const identifiers: string[] = [];

    if (typeof doc.id === 'string') {
      identifiers.push(`id:${doc.id}`);
    }

    if (typeof doc.documentId === 'string') {
      identifiers.push(`documentId:${doc.documentId}`);
    }

    if (typeof doc.multimediaId === 'string') {
      identifiers.push(`multimedia:${doc.multimediaId}`);
    }

    if (
      typeof doc.documentTypeId === 'string' &&
      typeof doc.id !== 'string' &&
      typeof doc.documentId !== 'string' &&
      typeof doc.multimediaId !== 'string'
    ) {
      identifiers.push(`type:${doc.documentTypeId}`);
    }

    if (!identifiers.length) {
      identifiers.push(`fallback:${fallbackCounter}`);
      fallbackCounter += 1;
    }

    if (identifiers.some((identifier) => seen.has(identifier))) {
      return;
    }

    identifiers.forEach((identifier) => seen.add(identifier));
    finalDocuments.push(doc);
  };

  combined.forEach(register);

  return finalDocuments;
};

const createLocalPaymentId = (seed: string) => {
  const cryptoApi = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;

  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return `payment-${seed}-${Math.random().toString(16).slice(2)}`;
};

const normalizeContractPayments = (payments: any[] | undefined) => {
  if (!payments || payments.length === 0) {
    return [];
  }

  return payments.map((payment: any, index: number) => {
    const status = payment?.status || 'PENDING';
    const fallbackSeed = `${payment?.type || 'payment'}-${payment?.date || index}-${index}`;

    return {
      ...payment,
      status,
      __clientId: payment?.id || payment?.__clientId || createLocalPaymentId(fallbackSeed),
    };
  });
};

const sanitizePaymentsForPersist = (payments: any[] | undefined) => {
  if (!payments || payments.length === 0) {
    return [];
  }

  return payments.map(({ __clientId, ...rest }) => rest);
};

export default function ContractDetailDialog({
  open,
  onClose,
  contractId,
  onEdit,
  onDelete,
  onUpdate,
}: ContractDetailDialogProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('general');
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [addingPayment, setAddingPayment] = useState(false);
  const { showAlert } = useAlert();
  const { data: session } = useSession();
  const [showUploadDocumentDialog, setShowUploadDocumentDialog] = useState(false);
  const [selectedPaymentForUpload, setSelectedPaymentForUpload] = useState<any | null>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [uploadingPaymentDocument, setUploadingPaymentDocument] = useState(false);
  const [showAddContractDocumentDialog, setShowAddContractDocumentDialog] = useState(false);
  const [creatingContractDocument, setCreatingContractDocument] = useState(false);
  const [showUploadContractDocumentDialog, setShowUploadContractDocumentDialog] = useState(false);
  const [selectedContractDocumentForUpload, setSelectedContractDocumentForUpload] = useState<any | null>(null);
  const [uploadingContractDocument, setUploadingContractDocument] = useState(false);
  const [deletingContractDocumentId, setDeletingContractDocumentId] = useState<string | null>(null);
  const [togglingRequiredDocumentId, setTogglingRequiredDocumentId] = useState<string | null>(null);
  const [showEditFinancialDialog, setShowEditFinancialDialog] = useState(false);
  const [updatingFinancialData, setUpdatingFinancialData] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  const isContractFinal = useMemo(
    () => isFinalContractStatus(contract?.status),
    [contract?.status],
  );

  useEffect(() => {
    if (!isContractFinal) {
      return;
    }

    setShowAddPaymentDialog(false);
    setShowEditFinancialDialog(false);
    setShowAddContractDocumentDialog(false);
  }, [isContractFinal]);

  const mapContractData = (
    contractData: any,
    documentEntities?: any[] | null,
    fallbackDocuments?: any[] | null,
  ) => {
    if (!contractData) {
      return null;
    }

    const userDisplayName = contractData.user
      ? `${contractData.user.personalInfo?.firstName || contractData.user.firstName || ''} ${contractData.user.personalInfo?.lastName || contractData.user.lastName || ''}`.trim() +
        ` (${contractData.user.role === 'ADMINISTRATOR' ? 'Admin' : 'Agente'})`
      : '';

    return {
      ...contractData,
      user: contractData.user
        ? {
            ...contractData.user,
            displayName: userDisplayName,
          }
        : null,
      payments: normalizeContractPayments(contractData.payments),
      documents: mergeContractDocuments(contractData, documentEntities, fallbackDocuments),
    };
  };

  useEffect(() => {
    if (open && contractId) {
      fetchContractDetails();
      fetchAgents();
    } else {
      setContract(null);
      setAuditLogs([]);
      setActiveSection('general');
      setShowAddPaymentDialog(false);
      setAddingPayment(false);
      setShowUploadDocumentDialog(false);
      setSelectedPaymentForUpload(null);
      setUploadingPaymentDocument(false);
      setShowAddContractDocumentDialog(false);
      setCreatingContractDocument(false);
      setShowUploadContractDocumentDialog(false);
      setSelectedContractDocumentForUpload(null);
      setUploadingContractDocument(false);
      setDeletingContractDocumentId(null);
      setTogglingRequiredDocumentId(null);
      setShowEditFinancialDialog(false);
      setUpdatingFinancialData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contractId]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const agentsResponse = await listAdminsAgents({ limit: 100 });

      if (agentsResponse.success && agentsResponse.data) {
        const formattedAgents = agentsResponse.data.data.map((user: any) => ({
          id: user.id,
          firstName: user.personalInfo?.firstName || '',
          lastName: user.personalInfo?.lastName || '',
          email: user.email || user.username || '',
          role: user.role,
          displayName:
            `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim() +
            ` (${user.role === 'ADMINISTRATOR' ? 'Admin' : 'Agente'})`,
        }));

        setAgents(formattedAgents);
      } else {
        setAgents([]);
      }
    } catch (error) {
      setAgents([]);
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchAuditLogs = useCallback(async () => {
    if (!contractId) return;

    setLoadingAuditLogs(true);
    try {
      const result = await getContractAuditLogs(contractId);
      
      if (result.success && result.data) {
        setAuditLogs(result.data);
      } else {
        console.warn('No se pudieron cargar los audit logs:', result.error);
        // No mostramos alert aquí para no ser intrusivos
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoadingAuditLogs(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (!open || !contractId || activeSection !== 'history') {
      return;
    }

    void fetchAuditLogs();
  }, [open, contractId, activeSection, fetchAuditLogs]);

  const fetchContractDetails = async () => {
    if (!contractId) return;

    setLoading(true);
    try {
      const [contractResult, documentsResult] = await Promise.all([
        getContractById(contractId),
        getContractDocuments(contractId),
      ]);

      if (contractResult.success && contractResult.contract) {
        if (!documentsResult.success && documentsResult?.error) {
          showAlert({
            message: documentsResult.error,
            type: 'warning',
            duration: 4000,
          });
        }

        const documentList = documentsResult.success ? documentsResult.data ?? [] : undefined;

        const fallbackDocuments = documentsResult.success ? null : contract?.documents ?? null;

        setContract(
          mapContractData(
            contractResult.contract,
            documentList,
            fallbackDocuments,
          ),
        );

        // Load audit logs in background (don't block on this)
        void fetchAuditLogs();
      } else {
        showAlert({
          message: contractResult.error || 'Error al cargar contrato',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      showAlert({ message: 'Error al cargar contrato', type: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const ensureDocumentTypes = useCallback(async () => {
    if (loadingDocumentTypes || documentTypes.length > 0) {
      return;
    }

    setLoadingDocumentTypes(true);
    try {
      const result = await getDocumentTypes();
      if (result.success && result.data) {
        setDocumentTypes(result.data);
      } else {
        showAlert({
          message: result.error || 'No se pudieron cargar los tipos de documento',
          type: 'error',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error loading document types:', error);
      showAlert({
        message: 'No se pudieron cargar los tipos de documento',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setLoadingDocumentTypes(false);
    }
  }, [documentTypes, loadingDocumentTypes, showAlert]);

  const sessionUserId = useMemo(() => {
    if (!session || !session.user || typeof session.user !== 'object') {
      return undefined;
    }
    return (session.user as { id?: string }).id;
  }, [session]);

  const handleAttachDocument = useCallback((payment: any) => {
    if (!payment?.id) {
      showAlert({
        message: 'Debes guardar el pago antes de adjuntar un documento',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    setSelectedPaymentForUpload(payment);
    setShowUploadDocumentDialog(true);
    void ensureDocumentTypes();
  }, [ensureDocumentTypes, showAlert]);

  const handleAttachContractDocument = useCallback((document: any) => {
    if (document?.paymentId && Array.isArray(contract?.payments)) {
      const relatedPayment = contract.payments.find((payment: any) => payment.id === document.paymentId);
      if (relatedPayment) {
        handleAttachDocument(relatedPayment);
        return;
      }
    }

    setSelectedContractDocumentForUpload(document);
    setShowUploadContractDocumentDialog(true);
    void ensureDocumentTypes();
  }, [contract?.payments, ensureDocumentTypes, handleAttachDocument]);

  const handleOpenAddContractDocument = useCallback(() => {
    if (isContractFinal) {
      showAlert({
        message: 'No puedes registrar nuevos documentos en un contrato cerrado o fallido',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    void ensureDocumentTypes();
    setShowAddContractDocumentDialog(true);
  }, [ensureDocumentTypes, isContractFinal, showAlert]);

  const handleCloseAddContractDocumentDialog = useCallback(() => {
    if (creatingContractDocument) {
      return;
    }
    setShowAddContractDocumentDialog(false);
  }, [creatingContractDocument]);

  const handleCloseUploadDocumentDialog = useCallback(() => {
    if (uploadingPaymentDocument) {
      return;
    }
    setShowUploadDocumentDialog(false);
    setSelectedPaymentForUpload(null);
  }, [uploadingPaymentDocument]);

  const handleCloseUploadContractDocumentDialog = useCallback(() => {
    if (uploadingContractDocument) {
      return;
    }
    setShowUploadContractDocumentDialog(false);
    setSelectedContractDocumentForUpload(null);
  }, [uploadingContractDocument]);

  const handleCreateContractDocument = async ({
    documentTypeId,
    title,
    notes,
    personId,
  }: {
    documentTypeId: string;
    title: string;
    notes?: string;
    personId?: string;
  }) => {
    if (!contractId) {
      showAlert({
        message: 'No se encontró el contrato asociado',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    if (!sessionUserId) {
      showAlert({
        message: 'No se pudo identificar al usuario actual',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    if (isContractFinal) {
      showAlert({
        message: 'No puedes registrar nuevos documentos en un contrato cerrado o fallido',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    setCreatingContractDocument(true);
    try {
      const result = await createDocument({
        documentTypeId,
        title,
        notes,
        personId,
        contractId,
        uploadedById: sessionUserId,
        status: 'PENDING',
        required: true,
      });

      if (result.success) {
        showAlert({
          message: 'Documento registrado correctamente',
          type: 'success',
          duration: 3000,
        });
        setShowAddContractDocumentDialog(false);
        await fetchContractDetails();
        onUpdate?.();
      } else {
        const errorMessage = result.error || 'Error al registrar documento';
        
        // Provide more helpful message for common errors
        if (errorMessage.toLowerCase().includes('usuario no encontrado')) {
          showAlert({
            message: 'Tu sesión tiene datos inconsistentes. Por favor, cierra sesión y vuelve a iniciar sesión.',
            type: 'error',
            duration: 6000,
          });
        } else {
          showAlert({
            message: errorMessage,
            type: 'error',
            duration: 4000,
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al registrar documento';
      
      if (errorMessage.toLowerCase().includes('usuario no encontrado')) {
        showAlert({
          message: 'Tu sesión tiene datos inconsistentes. Por favor, cierra sesión y vuelve a iniciar sesión.',
          type: 'error',
          duration: 6000,
        });
      } else {
        showAlert({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        });
      }
    } finally {
      setCreatingContractDocument(false);
    }
  };

  const handleUploadContractDocument = async ({
    documentTypeId,
    title,
    notes,
    file,
    documentId,
  }: {
    documentTypeId: string;
    title: string;
    notes?: string;
    file: File;
    documentId?: string;
  }) => {
    if (!contractId) {
      showAlert({
        message: 'No se encontró el contrato asociado',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    if (!sessionUserId) {
      showAlert({
        message: 'No se pudo identificar al usuario actual',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    setUploadingContractDocument(true);
    try {
      const result = await uploadContractDocument(contractId, file, {
        title,
        documentTypeId,
        uploadedById: sessionUserId,
        notes,
        seoTitle: title,
        documentId,
      });

      if (result.success) {
        showAlert({
          message: 'Documento adjuntado correctamente',
          type: 'success',
          duration: 3000,
        });

        setShowUploadContractDocumentDialog(false);
        setSelectedContractDocumentForUpload(null);

        await fetchContractDetails();
        onUpdate?.();
      } else {
        const errorMessage = result.error || 'Error al adjuntar documento';
        
        if (errorMessage.toLowerCase().includes('usuario no encontrado')) {
          showAlert({
            message: 'Tu sesión tiene datos inconsistentes. Por favor, cierra sesión y vuelve a iniciar sesión.',
            type: 'error',
            duration: 6000,
          });
        } else {
          showAlert({
            message: errorMessage,
            type: 'error',
            duration: 4000,
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al adjuntar documento';
      
      if (errorMessage.toLowerCase().includes('usuario no encontrado')) {
        showAlert({
          message: 'Tu sesión tiene datos inconsistentes. Por favor, cierra sesión y vuelve a iniciar sesión.',
          type: 'error',
          duration: 6000,
        });
      } else {
        showAlert({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        });
      }
    } finally {
      setUploadingContractDocument(false);
    }
  };

  const handleDeleteContractDocument = async (document: any) => {
    if (!document) {
      showAlert({
        message: 'No se pudo identificar el documento a eliminar',
        type: 'error',
        duration: 4000,
      });
      return { success: false, error: 'Documento inválido' };
    }

    if (!contractId) {
      showAlert({
        message: 'No se encontró el contrato asociado',
        type: 'error',
        duration: 4000,
      });
      return { success: false, error: 'Contrato no disponible' };
    }

    if (isContractFinal) {
      showAlert({
        message: 'No puedes eliminar documentos en un contrato cerrado o fallido',
        type: 'warning',
        duration: 4000,
      });
      return { success: false, error: 'Contrato bloqueado' };
    }

    const resolvedDocumentId = resolveDocumentId(document);
    if (!resolvedDocumentId) {
      showAlert({
        message: 'No se pudo obtener el identificador del documento',
        type: 'error',
        duration: 4000,
      });
      return { success: false, error: 'Identificador de documento no encontrado' };
    }

    setDeletingContractDocumentId(resolvedDocumentId);

    const documentLabel = getDocumentTypeName(document);

    try {
      const result = await deleteDocument(resolvedDocumentId);

      if (result.success) {
        showAlert({
          message: `Documento "${documentLabel}" eliminado correctamente`,
          type: 'success',
          duration: 3000,
        });

        await fetchContractDetails();
        onUpdate?.();
        return { success: true };
      }

      const errorMessage = result.error || 'Error al eliminar el documento';
      showAlert({ message: errorMessage, type: 'error', duration: 4000 });
      return { success: false, error: errorMessage };
    } catch (error: any) {
      const errorMessage = error?.message || 'Error inesperado al eliminar el documento';
      showAlert({ message: errorMessage, type: 'error', duration: 4000 });
      return { success: false, error: errorMessage };
    } finally {
      setDeletingContractDocumentId(null);
    }
  };

  const handleToggleContractDocumentRequired = async (document: any) => {
    if (!document) {
      showAlert({
        message: 'No se pudo identificar el documento a actualizar',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    const resolvedDocumentId = resolveDocumentId(document);
    if (!resolvedDocumentId) {
      showAlert({
        message: 'No se pudo obtener el identificador del documento',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    const nextRequired = !Boolean(document?.required);
    const documentLabel = getDocumentTypeName(document);

    setTogglingRequiredDocumentId(resolvedDocumentId);

    try {
      const result = await updateDocumentRequired(resolvedDocumentId, nextRequired);

      if (!result.success) {
        const errorMessage = result.error || 'Error al actualizar requisito del documento';
        showAlert({ message: errorMessage, type: 'error', duration: 4000 });
        return;
      }

      showAlert({
        message: nextRequired
          ? `Documento "${documentLabel}" marcado como requerido`
          : `Documento "${documentLabel}" marcado como opcional`,
        type: 'success',
        duration: 3000,
      });

      await fetchContractDetails();
      onUpdate?.();
    } catch (error: any) {
      showAlert({
        message: error?.message || 'Error inesperado al actualizar requisito',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setTogglingRequiredDocumentId(null);
    }
  };

  const handleUploadPaymentDocument = async ({
    documentTypeId,
    title,
    notes,
    file,
    personId,
  }: {
    documentTypeId: string;
    title: string;
    notes?: string;
    file: File;
    personId?: string;
  }) => {
    if (!contractId || !selectedPaymentForUpload?.id) {
      showAlert({
        message: 'No se encontró el pago asociado',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    if (!sessionUserId) {
      showAlert({
        message: 'No se pudo identificar al usuario actual',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    setUploadingPaymentDocument(true);
    try {
      const result = await uploadPaymentDocument(contractId, selectedPaymentForUpload.id, file, {
        title,
        documentTypeId,
        uploadedById: sessionUserId,
        notes,
        personId,
      });

      if (result.success) {
        showAlert({
          message: 'Documento adjuntado correctamente',
          type: 'success',
          duration: 3000,
        });
        setShowUploadDocumentDialog(false);
        setSelectedPaymentForUpload(null);
        await fetchContractDetails();
        onUpdate?.();
      } else {
        const errorMessage = result.error || 'Error al adjuntar documento';
        
        if (errorMessage.toLowerCase().includes('usuario no encontrado')) {
          showAlert({
            message: 'Tu sesión tiene datos inconsistentes. Por favor, cierra sesión y vuelve a iniciar sesión.',
            type: 'error',
            duration: 6000,
          });
        } else {
          showAlert({
            message: errorMessage,
            type: 'error',
            duration: 4000,
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al adjuntar documento';
      
      if (errorMessage.toLowerCase().includes('usuario no encontrado')) {
        showAlert({
          message: 'Tu sesión tiene datos inconsistentes. Por favor, cierra sesión y vuelve a iniciar sesión.',
          type: 'error',
          duration: 6000,
        });
      } else {
        showAlert({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        });
      }
    } finally {
      setUploadingPaymentDocument(false);
    }
  };

  const paymentTypeOptions = useMemo(() => {
    if (!contract?.operation) {
      return [
        { id: PaymentType.OTHER, label: 'Otro' },
      ];
    }

    if (contract.operation === ContractOperationType.COMPRAVENTA) {
      return [
        { id: PaymentType.SALE_DOWN_PAYMENT, label: 'Pie/Cuota Inicial' },
        { id: PaymentType.SALE_INSTALLMENT, label: 'Cuota Mensual' },
        { id: PaymentType.SALE_FINAL_PAYMENT, label: 'Pago Final' },
        { id: PaymentType.COMMISSION_INCOME, label: 'Ingreso por Comisión' },
        { id: PaymentType.OTHER, label: 'Otro' },
      ];
    }

    return [
      { id: PaymentType.RENT_PAYMENT, label: 'Pago de Arriendo' },
      { id: PaymentType.DEPOSIT, label: 'Depósito / Garantía' },
      { id: PaymentType.MAINTENANCE_FEE, label: 'Gastos Comunes' },
      { id: PaymentType.UTILITIES, label: 'Servicios Básicos' },
      { id: PaymentType.OTHER, label: 'Otro' },
    ];
  }, [contract?.operation]);

  const resolveActorName = useMemo(() => {
    const nameMap = new Map<string, string>();

    if (contract?.user?.id) {
      const userDisplayName =
        contract.user.displayName ||
        `${contract.user.personalInfo?.firstName || ''} ${contract.user.personalInfo?.lastName || ''}`.trim() ||
        contract.user.email ||
        contract.user.username ||
        contract.user.id;
      nameMap.set(contract.user.id, userDisplayName);
    }

    agents.forEach((agent) => {
      if (typeof agent.id === 'string' && agent.id.length > 0) {
        const displayName = agent.displayName || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email || agent.id;
        nameMap.set(agent.id, displayName);
      }
    });

    if (Array.isArray(contract?.people)) {
      contract.people.forEach((participant: any) => {
        if (!participant?.personId || typeof participant.personId !== 'string') {
          return;
        }
        const roleLabel = getRoleLabel(participant.role || '');
        const shortId = participant.personId.length > 10 ? `${participant.personId.slice(0, 8)}…` : participant.personId;
        const label = roleLabel ? `${roleLabel} (${shortId})` : shortId;
        nameMap.set(participant.personId, label);
      });
    }

    return (userId: string | null | undefined): string => {
      if (!userId) {
        return 'Sistema';
      }

      if (typeof userId === 'string' && nameMap.has(userId)) {
        return nameMap.get(userId)!;
      }

      if (typeof userId === 'string') {
        const truncatedId = userId.length > 10 ? `${userId.slice(0, 8)}…` : userId;
        return `Usuario ${truncatedId}`;
      }

      return 'Usuario desconocido';
    };
  }, [contract, agents]);

  const handleUpdateContractStatus = async (newStatus: string) => {
    if (!contractId || updating || addingPayment) return;

    const nextStatusKey = normalizeStatusKey(newStatus);

    if (!statusLabelMap[nextStatusKey]) {
      showAlert({
        message: 'El estado seleccionado no es válido',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    if (isContractFinal) {
      const currentStatusKey = normalizeStatusKey(contract?.status);
      if (currentStatusKey !== nextStatusKey) {
        showAlert({
          message: 'No puedes modificar el estado de un contrato cerrado o fallido',
          type: 'warning',
          duration: 4000,
        });
        return;
      }
    }

    setUpdating(true);
    try {
      // Determine which endpoint to use based on target status
      let result;
      const endDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

      if (nextStatusKey === 'CLOSED') {
        result = await closeContract(contractId, endDate, contract?.documents ?? []);
      } else if (nextStatusKey === 'FAILED') {
        result = await failContract(contractId, endDate);
      } else {
        // Fallback to updateContractStatus for other status changes
        result = await updateContractStatus(contractId, newStatus as any);
      }

      if (result.success && result.contract) {
        setContract(mapContractData(result.contract, undefined, contract?.documents ?? null));
        void fetchAuditLogs();
        showAlert({ message: 'Estado del contrato actualizado correctamente', type: 'success', duration: 3000 });
        onUpdate?.();
      } else {
        showAlert({ message: result.error || 'Error al actualizar estado', type: 'error', duration: 3000 });
      }
    } catch (error: any) {
      showAlert({ message: error.message || 'Error al actualizar estado', type: 'error', duration: 3000 });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateContractAgent = async (newUserId: string) => {
    if (!contractId || updating || !newUserId || addingPayment) return;

    setUpdating(true);
    try {
      const result = await updateContractAgent(contractId, newUserId);

      if (result.success) {
        showAlert({ message: 'Agente asignado actualizado correctamente', type: 'success', duration: 3000 });
        await fetchContractDetails();

        if (onUpdate) {
          onUpdate();
        }
      } else {
        showAlert({ message: result.error || 'Error al actualizar agente', type: 'error', duration: 3000 });
      }
    } catch (error: any) {
      showAlert({ message: error.message || 'Error al actualizar agente', type: 'error', duration: 3000 });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (
    payment: any,
    index: number,
    newStatus: 'PENDING' | 'PAID' | 'CANCELLED',
  ) => {
    if (!contractId || updating || addingPayment) return;

    if (payment?.status === newStatus) {
      return;
    }

    const paymentId = payment?.id;

    setUpdating(true);
    try {
      if (paymentId) {
        const result = await updatePaymentStatus(contractId, paymentId, newStatus);

        if (result.success && result.payment) {
          setContract((prev: any) => {
            if (!prev) return prev;

            const updatedPayments = (prev.payments || []).map((item: any) =>
              item.id === paymentId ? { ...item, status: result.payment!.status } : item,
            );

            return {
              ...prev,
              payments: normalizeContractPayments(updatedPayments),
            };
          });

          showAlert({ message: 'Estado del pago actualizado correctamente', type: 'success', duration: 3000 });
        } else {
          showAlert({ message: result.error || 'Error al actualizar estado del pago', type: 'error', duration: 3000 });
        }
      } else {
        const currentPayments = contract?.payments || [];
        const updatedPayments = currentPayments.map((item: any, idx: number) =>
          idx === index ? { ...item, status: newStatus } : item,
        );

        const payload = sanitizePaymentsForPersist(updatedPayments);
        const updatedContract = await updateContract(contractId, { payments: payload });

        if (updatedContract) {
          setContract(mapContractData(updatedContract, undefined, contract?.documents ?? null));
        }
        showAlert({ message: 'Estado del pago actualizado correctamente', type: 'success', duration: 3000 });
      }

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      showAlert({ message: error.message || 'Error al actualizar estado del pago', type: 'error', duration: 3000 });
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenAddPaymentDialog = () => {
    if (isContractFinal) {
      showAlert({
        message: 'No puedes agregar nuevos pagos a un contrato cerrado o fallido',
        type: 'warning',
        duration: 4000,
      });
      return;
    }
    setShowAddPaymentDialog(true);
  };

  const handleCloseAddPaymentDialog = () => {
    if (!addingPayment) {
      setShowAddPaymentDialog(false);
    }
  };

  const handleCreatePayment = async (paymentData: {
    amount: number;
    date: string;
    type: PaymentType;
    description?: string;
    isAgencyRevenue: boolean;
  }) => {
    if (!contractId) return;

    if (isContractFinal) {
      showAlert({
        message: 'No puedes agregar nuevos pagos a un contrato cerrado o fallido',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    setAddingPayment(true);
    try {
      const result = await addContractPayment(contractId, paymentData);

      if (result.success && result.contract) {
        showAlert({ message: 'Pago agregado correctamente', type: 'success', duration: 3000 });
        setShowAddPaymentDialog(false);
        await fetchContractDetails();
        onUpdate?.();
      } else {
        showAlert({ message: result.error || 'Error al agregar pago', type: 'error', duration: 3000 });
      }
    } catch (error: any) {
      showAlert({ message: error.message || 'Error al agregar pago', type: 'error', duration: 3000 });
    } finally {
      setAddingPayment(false);
    }
  };

  const handleOpenEditFinancialDialog = () => {
    if (isContractFinal) {
      showAlert({
        message: 'No puedes modificar los montos de un contrato cerrado o fallido',
        type: 'warning',
        duration: 4000,
      });
      return;
    }
    setShowEditFinancialDialog(true);
  };

  const handleCloseEditFinancialDialog = () => {
    if (!updatingFinancialData) {
      setShowEditFinancialDialog(false);
    }
  };

  const handleUpdateFinancialData = async ({
    amount,
    commissionPercent,
  }: {
    amount: number;
    commissionPercent: number;
  }) => {
    if (!contractId) {
      showAlert({
        message: 'No se encontró el contrato asociado',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    if (!contract) {
      showAlert({
        message: 'No se pudo cargar la información del contrato',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    if (isContractFinal) {
      showAlert({
        message: 'No puedes modificar los montos de un contrato cerrado o fallido',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    const currency: 'CLP' | 'UF' = contract.currency ?? 'CLP';
    const currentUfValue = typeof contract.ufValue === 'number' ? contract.ufValue : undefined;

    if (!Number.isFinite(amount) || amount <= 0) {
      showAlert({
        message: 'Ingresa un monto válido mayor a 0',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    if (currency === 'UF' && (!currentUfValue || currentUfValue <= 0)) {
      showAlert({
        message: 'Debes registrar el valor de la UF para recalcular la comisión',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    if (!Number.isFinite(commissionPercent) || commissionPercent <= 0) {
      showAlert({
        message: 'Ingresa un porcentaje de comisión válido',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    const payload: Record<string, any> = {
      amount,
      commissionPercent,
    };

    if (currency === 'UF' && typeof currentUfValue === 'number') {
      payload.ufValue = currentUfValue;
    }

    setUpdatingFinancialData(true);
    try {
      await updateContract(contractId, payload);

      showAlert({
        message: 'Montos financieros actualizados correctamente',
        type: 'success',
        duration: 3000,
      });

      setShowEditFinancialDialog(false);
      await fetchContractDetails();
      onUpdate?.();
    } catch (error: any) {
      showAlert({
        message: error?.message || 'Error al actualizar los montos del contrato',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setUpdatingFinancialData(false);
    }
  };

  const renderActiveSection = () => {
    if (!contract) return null;

    switch (activeSection) {
      case 'general':
        return (
          <ContractGeneralSection
            contract={contract}
            agents={agents}
            updating={updating}
            loadingAgents={loadingAgents}
            onStatusChange={handleUpdateContractStatus}
            onAgentChange={handleUpdateContractAgent}
            statusLocked={isContractFinal}
          />
        );
      case 'property':
        return <ContractPropertySection property={contract.property ?? null} />;
      case 'participants':
        return (
          <ContractParticipantsSection
            participants={contract.people}
            getRoleLabel={getRoleLabel}
          />
        );
      case 'financial':
        return (
          <ContractFinancialSection
            contract={contract}
            onEditFinancial={handleOpenEditFinancialDialog}
            editDisabled={isContractFinal || loading || updatingFinancialData}
            editLoading={updatingFinancialData}
          />
        );
      case 'payments':
        return (
          <ContractPaymentsSection
            payments={contract.payments}
            updating={updating || addingPayment}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onAttachDocument={handleAttachDocument}
            onAddPayment={handleOpenAddPaymentDialog}
            canAddPayment={!isContractFinal}
            currency={contract.currency}
            getPaymentTypeLabel={getPaymentTypeLabel}
            getPaymentStatusLabel={getPaymentStatusLabel}
            getPaymentStatusColor={getPaymentStatusColor}
          />
        );
      case 'documents':
        return (
          <ContractDocumentsSection
            documents={contract.documents}
            onAttachDocument={handleAttachContractDocument}
            onAddDocument={!isContractFinal ? handleOpenAddContractDocument : undefined}
            addDocumentDisabled={
              isContractFinal || creatingContractDocument || loadingDocumentTypes
            }
            onDeleteDocument={!isContractFinal ? handleDeleteContractDocument : undefined}
            deletingDocumentId={deletingContractDocumentId}
            onToggleRequired={handleToggleContractDocumentRequired}
            togglingRequiredDocumentId={togglingRequiredDocumentId}
          />
        );
      case 'history':
        const transformedHistory = transformAuditLogsToHistory(auditLogs);
        return (
          <>
            {loadingAuditLogs && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span>Cargando historial...</span>
                </div>
              </div>
            )}
            {!loadingAuditLogs && (
              <ContractHistorySection
                history={transformedHistory}
                resolveActorName={resolveActorName}
              />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} title="Detalles del Contrato" size="xl" showCloseButton>
        <div>
          <header className="w-full px-6 py-5 border-b">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Contrato</p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                    <span className="text-sm text-muted-foreground">Cargando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">{contract?.code || 'Sin código'}</h3>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {contractId && (
                  <p className="text-xs font-mono text-muted-foreground">ID: {contractId}</p>
                )}
                {contract?.status && (
                  <span className={`rounded-lg px-4 py-2 text-sm font-medium ${getStatusColor(contract.status)}`}>
                    {getStatusLabel(contract.status)}
                  </span>
                )}
              </div>
            </div>
          </header>

          <section className="grid gap-6 py-6 grid-cols-[auto_1fr]">
            <aside className="flex min-h-[200px] flex-col gap-4 py-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                    title={section.label}
                  >
                    <span className="material-symbols-outlined text-base flex-shrink-0">{section.icon}</span>
                    <span className="hidden sm:inline">{section.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <main className="py-4">
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                </div>
              ) : contract ? (
                <div className="w-full">
                  {renderActiveSection()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                  <span className="material-symbols-outlined text-4xl mb-2">description</span>
                  <p>No se encontró información del contrato.</p>
                </div>
              )}
            </main>
          </section>
        </div>
      </Dialog>

      <ContractEditFinancialDialog
        open={showEditFinancialDialog && !isContractFinal}
        onClose={handleCloseEditFinancialDialog}
        onSubmit={handleUpdateFinancialData}
        loading={updatingFinancialData}
        currency={(contract?.currency as 'CLP' | 'UF') ?? 'CLP'}
        ufValue={contract?.ufValue ?? null}
        defaultAmount={typeof contract?.amount === 'number' ? contract.amount : null}
        defaultCommissionPercent={typeof contract?.commissionPercent === 'number' ? contract.commissionPercent : null}
      />

      <ContractAddPaymentDialog
        open={showAddPaymentDialog && !isContractFinal}
        onClose={handleCloseAddPaymentDialog}
        onSubmit={handleCreatePayment}
        loading={addingPayment}
        currency={contract?.currency}
        paymentTypeOptions={paymentTypeOptions}
      />

      <ContractUploadPaymentDocumentDialog
        open={showUploadDocumentDialog}
        onClose={handleCloseUploadDocumentDialog}
        payment={selectedPaymentForUpload}
        documentTypes={documentTypes}
        loadingDocumentTypes={loadingDocumentTypes}
        submitting={uploadingPaymentDocument}
        onSubmit={handleUploadPaymentDocument}
        getPaymentTypeLabel={getPaymentTypeLabel}
        currency={contract?.currency ?? 'CLP'}
        participants={contract?.people ?? []}
        getRoleLabel={getRoleLabel}
      />

      <ContractAddDocumentDialog
        open={showAddContractDocumentDialog && !isContractFinal}
        onClose={handleCloseAddContractDocumentDialog}
        documentTypes={documentTypes}
        loadingDocumentTypes={loadingDocumentTypes}
        submitting={creatingContractDocument}
        onSubmit={handleCreateContractDocument}
        participants={contract?.people ?? []}
        getRoleLabel={getRoleLabel}
      />

      <ContractUploadContractDocumentDialog
        open={showUploadContractDocumentDialog}
        onClose={handleCloseUploadContractDocumentDialog}
        document={selectedContractDocumentForUpload}
        documentTypes={documentTypes}
        loadingDocumentTypes={loadingDocumentTypes}
        submitting={uploadingContractDocument}
        onSubmit={handleUploadContractDocument}
      />
    </>
  );
}
