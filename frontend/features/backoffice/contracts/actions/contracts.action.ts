'use server';

import { env } from '@/lib/env';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContractOperationType, ContractStatus, PaymentType } from '@/shared/types/contracts';
import type { DocumentEntity } from '@/features/backoffice/contracts/actions/documents.action';

interface Contract {
  id: string;
  operation: ContractOperationType;
  status: ContractStatus;
  amount: number;
  currency: 'CLP' | 'UF';
  ufValue?: number;
  commissionPercent: number;
  commissionAmount: number;
  payments?: any[];
  documents?: any[];
  people: any[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  property?: any;
  user?: any;
}

export interface ContractDocumentSummary {
  id: string;
  name: string;
  status?: string;
  required?: boolean;
  uploaded?: boolean;
}

export interface ContractGridRow {
  id: string;
  code?: string;
  operation: ContractOperationType;
  status: ContractStatus;
  amount: number;
  currency: 'CLP' | 'UF';
  ufValue?: number;
  commissionPercent: number;
  commissionAmount: number;
  propertyTitle?: string;
  propertyAddress?: string;
  clientName?: string;
  agentName?: string;
  createdAt: Date;
  endDate?: Date;
  documents?: ContractDocumentSummary[];
}

export interface ListContractsParams {
  sort?: 'asc' | 'desc';
  sortField?: string;
  search?: string;
  filters?: string;
  filtration?: boolean;
  page?: number;
  limit?: number;
  pagination?: boolean;
  operation?: ContractOperationType;
}

export interface ListContractsResult {
  data: ContractGridRow[];
  total: number;
}

const DOCUMENT_STATUS_ALIASES: Record<string, string> = {
  RECIBIDO: 'RECEIVED',
  VALIDADO: 'VALIDATED',
  APROBADO: 'APPROVED',
};

const normalizeContractDocumentStatus = (status?: string | null): string | undefined => {
  if (!status) {
    return undefined;
  }

  const upper = status.toUpperCase();
  return DOCUMENT_STATUS_ALIASES[upper] ?? upper;
};

const mapLegacyContractDocument = (contractId: string) =>
  (document: any, index: number): ContractDocumentSummary => {
    const rawStatus = typeof document?.status === 'string' ? document.status : undefined;
    const status = normalizeContractDocumentStatus(rawStatus);

    const documentIdCandidate =
      (typeof document?.id === 'string' && document.id.trim().length > 0 && document.id.trim()) ||
      (typeof document?.documentId === 'string' && document.documentId.trim().length > 0 && document.documentId.trim()) ||
      `${contractId}-doc-${index}`;

    const resolvedName = (() => {
      const title = typeof document?.title === 'string' ? document.title.trim() : '';
      if (title.length > 0) {
        return title;
      }

      const documentTypeName =
        typeof document?.documentTypeName === 'string'
          ? document.documentTypeName.trim()
          : typeof document?.documentType?.name === 'string'
            ? document.documentType.name.trim()
            : '';
      if (documentTypeName.length > 0) {
        return documentTypeName;
      }

      return `Documento ${index + 1}`;
    })();

    const required = Boolean(document?.required);
    const uploaded = typeof document?.uploaded === 'boolean'
      ? document.uploaded
      : status
        ? status !== 'PENDING'
        : undefined;

    return {
      id: documentIdCandidate,
      name: resolvedName,
      status,
      required,
      uploaded,
    };
  };

const mapDocumentEntityToSummary = (document: DocumentEntity, index: number): ContractDocumentSummary => {
  const status = normalizeContractDocumentStatus(document.status);

  const resolvedName = (() => {
    const title = typeof document.title === 'string' ? document.title.trim() : '';
    if (title.length > 0) {
      return title;
    }

    const documentTypeName =
      typeof document.documentType?.name === 'string' ? document.documentType.name.trim() : '';
    if (documentTypeName.length > 0) {
      return documentTypeName;
    }

    return `Documento ${index + 1}`;
  })();

  return {
    id: document.id,
    name: resolvedName,
    status,
    required: document.required ?? false,
    uploaded: status ? status !== 'PENDING' : undefined,
  };
};

const fetchDocumentsForContracts = async (
  contractIds: string[],
  accessToken: string,
): Promise<Record<string, DocumentEntity[]>> => {
  const uniqueIds = Array.from(new Set(
    contractIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0),
  ));

  if (uniqueIds.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    uniqueIds.map(async (contractId) => {
      try {
        const response = await fetch(`${env.backendApiUrl}/document?contractId=${contractId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          console.error(`Error fetching documents for contract ${contractId}: ${response.status}`);
          return [contractId, []] as const;
        }

        const payload = await response.json();
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        const filtered = items.filter((doc: DocumentEntity | undefined) => {
          if (!doc) {
            return false;
          }

          if (typeof doc.contractId === 'string' && doc.contractId.length > 0) {
            return doc.contractId === contractId;
          }

          const contractRef = doc.contract as { id?: string } | undefined;
          return typeof contractRef?.id === 'string' && contractRef.id === contractId;
        }) as DocumentEntity[];

        return [contractId, filtered] as const;
      } catch (error) {
        console.error(`Error fetching documents for contract ${contractId}:`, error);
        return [contractId, []] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
};

export async function listContracts(params: ListContractsParams = {}): Promise<ListContractsResult> {
  // Try to get session, but don't fail if it's not available
  let accessToken: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    accessToken = session?.accessToken;
  } catch (error) {
    console.warn('[listContracts] Could not get session:', error);
  }

  const {
    sort,
    sortField,
    search,
    filters,
    filtration,
    page = 1,
    limit = 25,
    pagination = true,
    operation,
  } = params;

  const queryParams = new URLSearchParams({
    fields:
      'id,code,operation,status,amount,currency,ufValue,commissionPercent,commissionAmount,createdAt,endDate,property,user,documents,documents.documentType',
    sort: sort || '',
    sortField: sortField || '',
    search: search || '',
    filters: filters || '',
    filtration: filtration ? 'true' : 'false',
    page: page.toString(),
    limit: limit.toString(),
    pagination: pagination ? 'true' : 'false',
  });

  if (operation) {
    queryParams.append('operation', operation);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add authorization header if we have a token
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = `${env.backendApiUrl}/contracts?${queryParams}`;
  console.log('[listContracts] Fetching from:', url);

  const response = await fetch(url, { headers });

  if (!response.ok) {
    let errorMessage = `Error al obtener contratos: ${response.status} ${response.statusText}`;
    let errorBody = '';
    
    try {
      errorBody = await response.text();
      if (errorBody) {
        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (parseError) {
          // Si no puede parsear JSON, usa el body como está
          errorMessage = errorBody || errorMessage;
        }
      }
    } catch (readError) {
      console.warn('[listContracts] Error reading response body:', readError);
    }
    
    const errorDetails = {
      status: response.status,
      statusText: response.statusText,
      url,
      message: errorMessage,
      responseBody: errorBody.substring(0, 200), // primeros 200 caracteres
    };

    console.error('[listContracts] Error response:', errorDetails);
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Extract total from response (backend returns { data, total } when paginated)
  const total = data?.total ?? 0;
  
  // Get the raw contracts array
  const rawContracts: any[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  const baseRows = rawContracts.map((contract) => {
    const participantDisplayName = (participant: any): string | undefined => {
      if (!participant) {
        return undefined;
      }

      const candidates = [
        participant?.person?.name,
        participant?.personName,
        participant?.person?.username,
        participant?.person?.email,
        participant?.person?.personalInfo?.firstName && participant?.person?.personalInfo?.lastName
          ? `${participant.person.personalInfo.firstName} ${participant.person.personalInfo.lastName}`
          : undefined,
      ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

      return candidates[0];
    };

    const documents = Array.isArray(contract.documents) ? contract.documents : [];
    const normalizedDocuments = documents.map(mapLegacyContractDocument(contract.id));

    const propertyAddress = [contract.property?.address, contract.property?.city]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join(', ');

    const tenantOrBuyer = Array.isArray(contract.people)
      ? contract.people.find((participant: any) => participant?.role === 'BUYER' || participant?.role === 'TENANT')
      : undefined;
    const clientName = participantDisplayName(tenantOrBuyer);

    const agentName = contract.user
      ? (
          `${contract.user.personalInfo?.firstName || contract.user.firstName || ''} ${contract.user.personalInfo?.lastName || contract.user.lastName || ''}`
            .trim() || contract.user.username || contract.user.email
        )
      : 'No asignado';

    return {
      contractId: contract.id as string,
      row: {
        id: contract.id,
        code: contract.code,
        operation: contract.operation,
        status: contract.status,
        amount: contract.amount,
        currency: contract.currency,
        ufValue: contract.ufValue,
        commissionPercent: contract.commissionPercent,
        commissionAmount: contract.commissionAmount,
        propertyTitle: contract.property?.title,
        propertyAddress,
        clientName,
        agentName,
        createdAt: new Date(contract.createdAt),
        endDate: contract.endDate ? new Date(contract.endDate) : undefined,
        documents: normalizedDocuments,
      } satisfies ContractGridRow,
    };
  });

  const contractIds = baseRows
    .map((entry) => entry.contractId)
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);

  const documentsByContract = contractIds.length > 0 && accessToken
    ? await fetchDocumentsForContracts(contractIds, accessToken)
    : {};

  const gridRows = baseRows.map(({ contractId, row }) => {
    const mappedDocuments = (documentsByContract[contractId] ?? [])
      .map((document, index) => mapDocumentEntityToSummary(document, index));

    if (mappedDocuments.length === 0) {
      return row;
    }

    return {
      ...row,
      documents: mappedDocuments,
    };
  });

  return {
    data: gridRows,
    total,
  };
}

export async function getSaleContractsGrid(params: ListContractsParams = {}): Promise<ListContractsResult> {
  return listContracts({ ...params, operation: ContractOperationType.COMPRAVENTA });
}

export async function getRentContractsGrid(params: ListContractsParams = {}): Promise<ListContractsResult> {
  return listContracts({ ...params, operation: ContractOperationType.ARRIENDO });
}

export async function getContractById(contractId: string): Promise<{ success: boolean; contract?: any; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/contracts/${contractId}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al obtener contrato' };
    }

    const contract = await response.json();
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener contrato' };
  }
}

export async function createContract(data: {
  operation: ContractOperationType;
  propertyId: string;
  userId: string;
  amount: number;
  currency?: 'CLP' | 'UF';
  ufValue?: number;
  commissionPercent: number;
  description?: string;
  people: Array<{
    personId: string;
    role: string;
  }>;
  payments?: Array<{
    amount: number;
    date: string;
    type: PaymentType;
    description?: string;
    isAgencyRevenue?: boolean;
  }>;
  documents?: Array<{
    documentTypeId: string;
    required: boolean;
  }>;
}): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/contracts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al crear contrato' };
    }

    const contract = await response.json();
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear contrato' };
  }
}

export async function addContractPayment(
  contractId: string,
  data: {
    amount: number;
    date: string;
    type: PaymentType;
    description?: string;
    isAgencyRevenue?: boolean;
  },
): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/contracts/${contractId}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { success: false, error: error.message || 'Error al agregar pago' };
    }

    const contract = await response.json();
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al agregar pago' };
  }
}

export async function getContract(id: string): Promise<Contract> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${env.backendApiUrl}/contracts/${id}`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener contrato: ${response.statusText}`);
  }

  return response.json();
}

export async function updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${env.backendApiUrl}/contracts/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar contrato');
  }

  return response.json();
}

export async function deleteContract(id: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${env.backendApiUrl}/contracts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar contrato');
  }
}

export async function closeContract(
  id: string,
  endDate: string,
  documents: any[] = []
): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/contracts/${id}/close`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endDate, documents }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al cerrar contrato' };
    }

    const contract = await response.json();
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al cerrar contrato' };
  }
}

export async function failContract(
  id: string,
  endDate: string
): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/contracts/${id}/fail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endDate }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al marcar contrato como fallido' };
    }

    const contract = await response.json();
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al marcar contrato como fallido' };
  }
}

export async function updateContractStatus(id: string, status: ContractStatus): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/contracts/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al actualizar estado del contrato' };
    }

    const contract = await response.json();
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar estado del contrato' };
  }
}

export async function updatePaymentStatus(contractId: string, paymentId: string, status: 'PENDING' | 'PAID' | 'CANCELLED'): Promise<{ success: boolean; payment?: any; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/contracts/${contractId}/payments/${paymentId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al actualizar estado del pago' };
    }

    const payment = await response.json();
    return { success: true, payment };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar estado del pago' };
  }
}

export async function uploadPaymentDocument(
  contractId: string,
  paymentId: string,
  file: File,
  data: {
    title: string;
    documentTypeId: string;
    uploadedById: string;
    notes?: string;
    personId?: string;
  }
): Promise<{ success: boolean; document?: any; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('documentTypeId', data.documentTypeId);
    formData.append('paymentId', paymentId);
    formData.append('contractId', contractId);
    formData.append('uploadedById', data.uploadedById);
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    if (data.personId) {
      formData.append('personId', data.personId);
    }

    // Use the correct upload endpoint
    const response = await fetch(`${env.backendApiUrl}/contracts/upload-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al subir documento' };
    }

    const document = await response.json();
    return { success: true, document };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al subir documento' };
  }
}

export async function uploadContractDocument(
  contractId: string,
  file: File,
  data: {
    title: string;
    documentTypeId: string;
    uploadedById: string;
    notes?: string;
    seoTitle?: string;
    documentId?: string;
  },
): Promise<{ success: boolean; document?: any; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('documentTypeId', data.documentTypeId);
    formData.append('contractId', contractId);
    formData.append('uploadedById', data.uploadedById);
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    if (data.seoTitle) {
      formData.append('seoTitle', data.seoTitle);
    }
    if (data.documentId) {
      formData.append('documentId', data.documentId);
    }

    const response = await fetch(`${env.backendApiUrl}/contracts/upload-document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error al adjuntar documento: ${response.status}`,
      };
    }

    const result = await response.json();
    return { success: true, document: result?.document ?? result };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Error al adjuntar documento',
    };
  }
}

export async function updateContractAgent(
  contractId: string,
  userId: string
): Promise<{ success: boolean; contract?: any; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/contracts/${contractId}/agent`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al actualizar agente' };
    }

    const contract = await response.json();
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar agente' };
  }
}

/**
 * Obtiene los contratos de un usuario específico
 */
export async function getUserContracts(userId: string, params: ListContractsParams = {}): Promise<ContractGridRow[]> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('No autorizado');
  }

  const queryParams = new URLSearchParams({
    fields: 'id,code,operation,status,amount,currency,ufValue,createdAt,endDate,property',
    sort: params.sort || '',
    sortField: params.sortField || '',
    page: (params.page || 1).toString(),
    limit: (params.limit || 25).toString(),
    pagination: 'true',
  });

  const response = await fetch(`${env.backendApiUrl}/contracts/user/${userId}?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener contratos del usuario: ${response.status}`);
  }

  const result = await response.json();
  return Array.isArray(result) ? result : result.data;
}

/**
 * Obtiene los pagos de arriendo de un contrato específico
 */
export async function getContractRentPayments(contractId: string): Promise<any[]> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${env.backendApiUrl}/contracts/${contractId}/payments/RENT_PAYMENT`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 } // No cache for payments
  });

  if (!response.ok) {
    throw new Error('Error al cargar los pagos del contrato');
  }

  return response.json();
}

/**
 * Obtiene los detalles básicos de un contrato
 */
export async function getContractDetails(contractId: string): Promise<any> {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;
  
    if (!accessToken) {
      throw new Error('No autorizado');
    }
  
    const response = await fetch(`${env.backendApiUrl}/contracts/${contractId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Error al cargar los detalles del contrato');
    }
  
    return response.json();
}

/**
 * Sube un comprobante de pago para un pago de arriendo
 */
export async function uploadPaymentProof(
  contractId: string,
  paymentId: string,
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(
      `${env.backendApiUrl}/contracts/${contractId}/payments/${paymentId}/proof`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || 'Error al subir el comprobante' 
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error in uploadPaymentProof:', error);
    return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}
