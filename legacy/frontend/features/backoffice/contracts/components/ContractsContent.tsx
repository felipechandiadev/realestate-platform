'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import { ContractsGrid } from './ContractsGrid';
import { CreateContractDialog } from './CreateContractDialog';
import { EditContractDialog } from './EditContractDialog';
import { EditFinancialsDialog } from './EditFinancialsDialog';
import { UploadDocumentDialog } from './UploadDocumentDialog';
import type { Contract } from '@/features/backoffice/contracts/types';

/**
 * Contracts Content Component
 *
 * Main container for contracts management interface
 * Manages multiple dialog states and grid interactions
 * Combines grid, create, edit, and upload dialogs
 *
 * @returns {React.ReactNode} Contracts management interface
 */
export function ContractsContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [financialsDialogOpen, setFinancialsDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  const handleEditContract = useCallback((contract: Contract) => {
    setSelectedContract(contract);
    setEditDialogOpen(true);
  }, []);

  const handleEditFinancials = useCallback((contract: Contract) => {
    setSelectedContract(contract);
    setFinancialsDialogOpen(true);
  }, []);

  const handleUploadDocument = useCallback((contract: Contract) => {
    setSelectedContract(contract);
    setUploadDialogOpen(true);
  }, []);

  const handleRefreshGrid = useCallback(() => {
    setGridRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-600 mt-1">Gestión de contratos de propiedades</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateDialogOpen(true)}
          size="lg"
        >
          + Nuevo Contrato
        </Button>
      </div>

      {/* Quick Actions Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-sm">
          💡 Haz clic en los botones de acciones en la grilla para editar, editar
          montos o cargar documentos de cada contrato.
        </p>
      </div>

      {/* Contracts Grid */}
      <ContractsGrid
        key={gridRefreshTrigger}
        onEdit={handleEditContract}
        onRefresh={handleRefreshGrid}
      />

      {/* Create Contract Dialog */}
      <CreateContractDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleRefreshGrid}
      />

      {/* Edit Contract Dialog */}
      <EditContractDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        contract={selectedContract}
        onSuccess={handleRefreshGrid}
      />

      {/* Edit Financials Dialog */}
      <EditFinancialsDialog
        open={financialsDialogOpen}
        onOpenChange={setFinancialsDialogOpen}
        contract={selectedContract}
        onSuccess={handleRefreshGrid}
      />

      {/* Upload Document Dialog */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        contract={selectedContract}
        onSuccess={handleRefreshGrid}
      />
    </div>
  );
}
