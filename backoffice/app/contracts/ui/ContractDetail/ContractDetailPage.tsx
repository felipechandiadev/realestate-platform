'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconButton, LoadingState } from '@realestate/ui';
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
} from '@/features/contracts/actions/contracts.action';
import {
  createDocument,
  getContractDocuments,
  deleteDocument,
  updateDocumentRequired,
} from '@/features/contracts/actions/documents.action';
import { listAdminsAgents } from '@/features/users/actions/users.action';
import {
  PaymentType,
  ContractOperationType,
  ContractStatus,
  FINAL_CONTRACT_STATUSES,
} from '@/shared/types/contracts';
import { getDocumentTypes, type DocumentType } from '@/features/contracts/actions/documentTypes.action';
import { getContractAuditLogs, type AuditLogEntry } from '@/features/contracts/actions/audit.action';
import { transformAuditLogsToHistory } from '@/features/contracts/utils/audit.utils';
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
import { ContractDetailSectionNav } from './ContractDetailSectionNav';
import {
  CONTRACT_DETAIL_TABS,
  type ContractDetailSectionId,
  contractDetailSectionFromHash,
} from './contract-detail-section.types';

export type ContractDetailHeader = {
  code?: string | null;
  status?: string | null;
};

type ContractDetailPageProps = {
  contractId: string;
  listBasePath: '/contracts/sales' | '/contracts/rent';
  initialHeader?: ContractDetailHeader;
};

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

export default function ContractDetailPage({
  contractId,
  listBasePath,
  initialHeader,
}: ContractDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<ContractDetailSectionId>('general');
  const [header, setHeader] = useState<ContractDetailHeader>(
    initialHeader ?? { code: null, status: null },
  );
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const notifyUpdate = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (initialHeader) {
      setHeader(initialHeader);
    }
  }, [initialHeader]);

  useEffect(() => {
    const fromHash = contractDetailSectionFromHash(window.location.hash);
    if (fromHash) {
      setActiveSection(fromHash);
    }
  }, []);

  const selectSection = useCallback((id: ContractDetailSectionId) => {
    setActiveSection(id);
    const nextHash = `#${id}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
    }
  }, []);

  const goBack = useCallback(() => {
    const returnTo = searchParams.get('returnTo')?.trim();
    if (returnTo && returnTo.startsWith(listBasePath)) {
      router.push(returnTo);
      return;
    }
    router.push(listBasePath);
  }, [listBasePath, router, searchParams]);

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
    agentsList: typeof agents = agents,
  ) => {
    if (!contractData) {
      return null;
    }

    const resolvedUserId =
      (typeof contractData.user?.id === 'string' && contractData.user.id) ||
      (typeof contractData.userId === 'string' && contractData.userId) ||
      null;

    const agentMatch = resolvedUserId
      ? agentsList.find((agent) => agent.id === resolvedUserId)
      : undefined;

    const resolvedUser = contractData.user
      ? contractData.user
      : agentMatch
        ? {
            id: agentMatch.id,
            firstName: agentMatch.firstName,
            lastName: agentMatch.lastName,
            email: agentMatch.email,
            role: agentMatch.role,
          }
        : null;

    const userDisplayName = resolvedUser
      ? `${resolvedUser.personalInfo?.firstName || resolvedUser.firstName || agentMatch?.firstName || ''} ${resolvedUser.personalInfo?.lastName || resolvedUser.lastName || agentMatch?.lastName || ''}`.trim() +
        ` (${(resolvedUser.role || agentMatch?.role) === 'ADMINISTRATOR' || (resolvedUser.role || agentMatch?.role) === 'ADMIN' ? 'Admin' : 'Agente'})`
      : agentMatch?.displayName || '';

    return {
      ...contractData,
      userId: resolvedUserId,
      user: resolvedUser
        ? {
            ...resolvedUser,
            id: resolvedUserId,
            displayName: userDisplayName || agentMatch?.displayName || resolvedUserId,
          }
        : null,
      payments: normalizeContractPayments(contractData.payments),
      documents: mergeContractDocuments(contractData, documentEntities, fallbackDocuments),
    };
  };

  useEffect(() => {
    if (contractId) {
      fetchContractDetails();
      fetchAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  // API returns userId without nested user; hydrate Select label once agents load.
  useEffect(() => {
    if (!contract?.userId || contract.user?.id || agents.length === 0) {
      return;
    }

    setContract((prev: any) => {
      if (!prev?.userId || prev.user?.id) {
        return prev;
      }

      return mapContractData(prev, undefined, prev.documents ?? null, agents);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, contract?.userId, contract?.user?.id]);

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
    if (!contractId || activeSection !== 'history') {
      return;
    }

    void fetchAuditLogs();
  }, [contractId, activeSection, fetchAuditLogs]);

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
        setHeader({
          code: contractResult.contract.code ?? null,
          status: contractResult.contract.status ?? null,
        });

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
      if (result.success && Array.isArray(result.data)) {
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
    setUploadingPaymentDocument(false);
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
    setUploadingContractDocument(false);
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
    setCreatingContractDocument(false);
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
        notifyUpdate();
        return;
      }

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
      setCreatingContractDocument(false);
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
        notifyUpdate();
        return;
      }

      {
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
      setUploadingContractDocument(false);
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
        notifyUpdate();
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
      notifyUpdate();
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
        notifyUpdate();
        return;
      }

      {
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
      setUploadingPaymentDocument(false);
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
        notifyUpdate();
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
        const agentMatch = agents.find((agent) => agent.id === newUserId);
        setContract((prev: any) => {
          if (!prev) {
            return prev;
          }

          return mapContractData(
            {
              ...(result.contract ?? prev),
              userId: newUserId,
              user: agentMatch
                ? {
                    id: agentMatch.id,
                    firstName: agentMatch.firstName,
                    lastName: agentMatch.lastName,
                    email: agentMatch.email,
                    role: agentMatch.role,
                  }
                : prev.user,
            },
            undefined,
            prev.documents ?? null,
            agents,
          );
        });

        showAlert({ message: 'Agente asignado actualizado correctamente', type: 'success', duration: 3000 });
        await fetchContractDetails();
        notifyUpdate();
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

      notifyUpdate();
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
    setAddingPayment(false);
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
        notifyUpdate();
        return;
      }

      showAlert({ message: result.error || 'Error al agregar pago', type: 'error', duration: 3000 });
      setAddingPayment(false);
    } catch (error: any) {
      showAlert({ message: error.message || 'Error al agregar pago', type: 'error', duration: 3000 });
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
    setUpdatingFinancialData(false);
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
      notifyUpdate();
    } catch (error: any) {
      showAlert({
        message: error?.message || 'Error al actualizar los montos del contrato',
        type: 'error',
        duration: 4000,
      });
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
            {loadingAuditLogs ? (
              <LoadingState label="Cargando historial" />
            ) : (
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

  const displayCode =
    (contract?.code as string | undefined)?.trim() ||
    header.code?.trim() ||
    'Sin código';
  const displayStatus =
    (contract?.status as string | undefined) ?? header.status ?? undefined;

  return (
    <>
      <div
        className="mx-auto w-full max-w-4xl space-y-3 px-0 py-2 sm:space-y-6 sm:px-6 sm:py-6"
        data-test-id="contract-detail-root"
      >
        <header className="border-b border-border pb-2 sm:pb-4" data-test-id="contract-detail-header">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
            <IconButton
              icon="ArrowLeft"
              variant="action"
              size="sm"
              onClick={goBack}
              ariaLabel="Volver al listado de contratos"
              data-test-id="contract-detail-back"
            />
            <h1
              className="min-w-0 text-xl font-bold tracking-tight text-foreground sm:text-3xl"
              title={displayCode}
            >
              {loading && !displayCode ? 'Cargando…' : displayCode}
            </h1>
            {displayStatus ? (
              <span
                className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusColor(displayStatus)}`}
              >
                {getStatusLabel(displayStatus)}
              </span>
            ) : null}
          </div>
          <p
            className="mt-1.5 hidden font-mono text-xs text-muted-foreground sm:mt-3 sm:block"
            data-test-id="contract-detail-id"
          >
            ID: {contractId}
          </p>
        </header>

        <ContractDetailSectionNav
          tabs={CONTRACT_DETAIL_TABS}
          activeId={activeSection}
          onSelect={selectSection}
        />

        <div
          id={`contract-section-panel-${activeSection}`}
          role="tabpanel"
          aria-labelledby={`contract-section-tab-${activeSection}`}
          className="min-h-[16rem]"
          data-test-id="contract-detail-section-panel"
          data-active-section={activeSection}
        >
          {loading && !contract ? (
            <LoadingState className="flex h-64 items-center justify-center" />
          ) : contract ? (
            renderActiveSection()
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <p>No se encontró información del contrato.</p>
            </div>
          )}
        </div>
      </div>

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
