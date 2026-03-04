'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Badge } from '@/shared/components/ui/Badge/Badge';
import {
  useContractById,
  useDeleteContract,
} from '@/features/backoffice/contracts/hooks';
import { EditContractDialog } from './EditContractDialog';
import { EditFinancialsDialog } from './EditFinancialsDialog';
import { UploadDocumentDialog } from './UploadDocumentDialog';
import { getContractStatusInSpanish } from '../utils/statusTranslation';
import type { Contract } from '@/features/backoffice/contracts/types';

interface ContractDetailViewProps {
  contractId: string;
  onBackClick?: () => void;
}

/**
 * Contract Detail View Component
 *
 * Displays full details of a single contract
 * Allows editing, updating financials, and uploading documents
 *
 * @param {ContractDetailViewProps} props - Component props
 * @returns {React.ReactNode} Contract detail view
 */
export function ContractDetailView({
  contractId,
  onBackClick,
}: ContractDetailViewProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [financialsDialogOpen, setFinancialsDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: contract, isLoading, error, refetch } = useContractById(
    contractId
  );
  const { mutate: deleteContract, isPending: isDeleting } =
    useDeleteContract();

  const handleDelete = () => {
    deleteContract(contractId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onBackClick?.();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-600">Cargando contrato...</div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-900 font-semibold mb-2">
          Error al cargar el contrato
        </h3>
        <p className="text-red-700 mb-4">
          {error instanceof Error ? error.message : 'Contrato no encontrado'}
        </p>
        <Button variant="secondary" onClick={onBackClick}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {contract.partyName}
            </h1>
            <Badge
              label={getContractStatusInSpanish(contract.status || 'PENDING')}
              variant="info"
            />
          </div>
          <p className="text-gray-600 mt-1">
            Contrato ID: {contract.id}
          </p>
        </div>
        <div className="flex gap-2">
          {onBackClick && (
            <Button variant="secondary" onClick={onBackClick}>
              Volver
            </Button>
          )}
          <Button variant="primary" onClick={() => setEditDialogOpen(true)}>
            Editar
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Información General</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Propiedad ID</p>
            <p className="font-semibold">{contract.propertyId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tipo de Contrato</p>
            <p className="font-semibold">{contract.contractType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha Inicio</p>
            <p className="font-semibold">
              {new Date(contract.startDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha Fin</p>
            <p className="font-semibold">
              {contract.endDate && new Date(contract.endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Creado</p>
            <p className="font-semibold">
              {new Date(contract.createdAt).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estado</p>
            <p className="font-semibold">
              {getContractStatusInSpanish(contract.status || 'PENDING')}
            </p>
          </div>
        </div>
        {contract.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">Notas</p>
            <p className="text-gray-900 whitespace-pre-wrap">{contract.notes}</p>
          </div>
        )}
      </Card>

      {/* Financial Info */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Información Financiera</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFinancialsDialogOpen(true)}
          >
            Editar Montos
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Monto</p>
            <p className="text-2xl font-bold text-gray-900">
              {contract.price ? `$${contract.price.toLocaleString()}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Moneda</p>
            <p className="text-xl font-semibold">{contract.currency || 'MXN'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Comisión (%)</p>
            <p className="text-xl font-semibold">
              {contract.commissionPercentage || '0'}%
            </p>
          </div>
        </div>
      </Card>

      {/* Documents Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Documentos</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
          >
            + Cargar Documento
          </Button>
        </div>
        {contract.documents && contract.documents.length > 0 ? (
          <div className="space-y-2">
            {contract.documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <span className="text-gray-900">{doc.name || doc.fileName}</span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Descargar
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">
            No hay documentos adjuntos todavía
          </p>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h2 className="text-lg font-semibold text-red-900 mb-4">Zona de Peligro</h2>
        <p className="text-red-700 text-sm mb-4">
          Esta acción no se puede deshacer. Eliminar este contrato borrará toda
          su información permanentemente.
        </p>
        <Button
          variant="danger"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isDeleting}
        >
          Eliminar Contrato
        </Button>
      </Card>

      {/* Dialogs */}
      <EditContractDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        contract={contract}
        onSuccess={() => {
          setEditDialogOpen(false);
          refetch();
        }}
      />

      <EditFinancialsDialog
        open={financialsDialogOpen}
        onOpenChange={setFinancialsDialogOpen}
        contract={contract}
        onSuccess={() => {
          setFinancialsDialogOpen(false);
          refetch();
        }}
      />

      <UploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        contract={contract}
        onSuccess={() => {
          setUploadDialogOpen(false);
          refetch();
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-96 p-6">
            <h3 className="text-lg font-semibold mb-2">Eliminar Contrato</h3>
            <p className="text-gray-600 mb-6">
              ¿Está seguro? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
                className="flex-1"
              >
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
