'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, { type DataGridColumn } from '@/shared/components/ui/DataGrid/DataGrid';
import type { Person } from '@/features/backoffice/contracts/actions/persons.action';
import { useAlert } from '@/providers/AlertContext';
import { deletePerson } from '@/features/backoffice/contracts/actions/persons.action';
import { Button } from '@/shared/components/ui/Button/Button';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import CreatePersonForm from './CreatePersonForm';
import PersonDocumentsList from './PersonDocumentsList';
import DeleteBaseForm from '@/shared/components/ui/BaseForm/DeleteBaseForm';

type PersonsDataGridProps = {
  rows: Person[];
  totalRows?: number;
  title?: string;
};

export default function PersonsDataGrid({ rows, totalRows, title }: PersonsDataGridProps) {
  const alert = useAlert();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleExportExcel = async () => {
    alert.showAlert({
      message: 'La exportación a Excel para personas estará disponible próximamente',
      type: 'info',
      duration: 4000,
    });
  };
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [personToVerify, setPersonToVerify] = useState<Person | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<string[]>([]);

  const formatDateTime = (value?: string) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleDeleteClick = (person: Person) => {
    setPersonToDelete(person);
    setShowDeleteDialog(true);
    setDeleteErrors([]);
  };

  const handleDeleteConfirm = async () => {
    if (!personToDelete) return;

    setIsDeleting(personToDelete.id);
    setDeleteErrors([]);

    try {
      await deletePerson(personToDelete.id);
      alert.showAlert({
        message: `Persona ${personToDelete.name || 'Sin nombre'} eliminada exitosamente`,
        type: 'success',
        duration: 3000,
      });
      router.refresh();
      setShowDeleteDialog(false);
      setPersonToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert.showAlert({
        message: `Error al eliminar persona: ${errorMessage}`,
        type: 'error',
        duration: 5000,
      });
      setDeleteErrors([`No fue posible eliminar a la persona. Detalle: ${errorMessage}`]);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setPersonToDelete(null);
    setDeleteErrors([]);
  };

  const columns: DataGridColumn[] = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 200,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => {
        return row.name || 'Sin nombre';
      },
    },
    {
      field: 'userRole',
      headerName: 'Rol',
      flex: 0.6,
      minWidth: 110,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => {
        if (row.isFromUser) {
          const roleLabels: Record<string, string> = {
            ADMIN: 'Admin',
            AGENT: 'Agente',
            COMMUNITY: 'Comunidad',
          };
          return roleLabels[row.userRole as string] || row.userRole || '';
        }
        return row.user?.role ? ({
          ADMIN: 'Admin',
          AGENT: 'Agente',
          COMMUNITY: 'Comunidad',
        } as Record<string, string>)[row.user.role] : '';
      },
    },
    {
      field: 'dni',
      headerName: 'DNI',
      flex: 0.8,
      minWidth: 130,
      sortable: true,
      filterable: true,
    },
    {
      field: 'verified',
      headerName: 'Verificado',
      flex: 0.5,
      minWidth: 100,
      sortable: true,
      filterable: true,
      align: 'center',
      renderCell: ({ row }) => {
        return row.verified ? (
          <div className="flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-500 text-xl" title="Verificado">verified</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="material-symbols-outlined text-muted-foreground text-xl" title="No verificado">cancel</span>
          </div>
        );
      },
    },
    {
      field: 'verificationRequest',
      headerName: 'Solicitud Verificación',
      flex: 0.8,
      minWidth: 140,
      sortable: true,
      filterable: true,
      align: 'center',
      renderCell: ({ row }) => {
        if (row.verificationRequest) {
          const date = new Date(row.verificationRequest);
          return (
            <div className="flex items-center justify-center gap-1" title={date.toLocaleDateString('es-CL')}>
              <span className="material-symbols-outlined text-orange-500 text-xl">schedule</span>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground">-</span>
          </div>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Fecha Registro',
      type: 'date',
      renderType: 'dateString',
      flex: 0.8,
      minWidth: 140,
      sortable: true,
      filterable: true,
      renderCell: ({ row }) => formatDateTime(row.createdAt),
    },
    {
      field: 'documents',
      headerName: 'Documentos',
      flex: 1,
      minWidth: 180,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <PersonDocumentsList personId={row.id} compact />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1.1,
      minWidth: 220,
      sortable: false,
      filterable: false,
      actionComponent: ({ row }) => (
        <div className="flex items-center gap-2">
          <IconButton
            icon="more_horiz"
            variant="text"
            onClick={() => {
              router.push(`/backOffice/contracts/persons/${row.id}`);
            }}
            title="Ver detalles"
          />
          {!row.isFromUser && (
            <IconButton
              icon="delete"
              variant="text"
              onClick={() => handleDeleteClick(row)}
              disabled={isDeleting === row.id}
              className="text-red-500 hover:text-red-600"
              title="Eliminar"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataGrid
        columns={columns}
        rows={rows}
        totalRows={totalRows ?? rows.length}
        height="80vh"
        data-test-id="persons-grid"
        limit={25}
        title={''}
        onAddClick={() => setShowCreateDialog(true)}
        onExportExcel={handleExportExcel}
      />

      {showDeleteDialog && personToDelete && (
        <Dialog
          open={showDeleteDialog}
          onClose={handleDeleteCancel}
          title=""
          size="sm"
        >
          <DeleteBaseForm
            message={`¿Está seguro que desea eliminar a "${personToDelete.name || 'esta persona'}"?`}
            subtitle="Esta acción no se puede deshacer."
            onSubmit={() => { void handleDeleteConfirm(); }}
            isSubmitting={isDeleting === personToDelete.id}
            submitLabel="Eliminar"
            cancelButton
            cancelButtonText="Cancelar"
            onCancel={handleDeleteCancel}
            errors={deleteErrors}
            title="Eliminar persona"
          />
        </Dialog>
      )}

      {showVerificationDialog && personToVerify && (
        <Dialog
          open={showVerificationDialog}
          onClose={() => {
            setShowVerificationDialog(false);
            setPersonToVerify(null);
          }}
          title="Proceso de Verificación de Identidad"
          size="md"
          actions={
            <div className="flex gap-2 justify-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setShowVerificationDialog(false);
                  setPersonToVerify(null);
                }}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowVerificationDialog(false);
                  router.push(`/backOffice/contracts/persons/${personToVerify.id}`);
                }}
              >
                Ir a Página de Verificación
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <span className="material-symbols-outlined text-4xl text-primary">badge</span>
              <div>
                <p className="font-semibold text-foreground">{personToVerify.name || 'Sin nombre'}</p>
                <p className="text-sm text-muted-foreground">DNI: {personToVerify.dni || 'No registrado'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-500 mt-1">verified</span>
                <div>
                  <p className="font-medium text-foreground">Estado de Verificación</p>
                  <p className="text-sm text-muted-foreground">
                    {personToVerify.verified ? (
                      <span className="text-blue-500 font-medium">✓ Verificado</span>
                    ) : (
                      <span className="text-muted-foreground">No verificado</span>
                    )}
                  </p>
                </div>
              </div>

              {personToVerify.verificationRequest && (
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-orange-500 mt-1">schedule</span>
                  <div>
                    <p className="font-medium text-foreground">Solicitud Pendiente</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(personToVerify.verificationRequest).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-purple-500 mt-1">description</span>
                <div>
                  <p className="font-medium text-foreground">Documentos de Identidad</p>
                  <p className="text-sm text-muted-foreground">
                    Para completar el proceso de verificación, debe revisar y validar los documentos de identificación (DNI frontal y trasero) en la página de detalles.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Nota:</strong> Haga clic en &quot;Ir a Página de Verificación&quot; para acceder a los documentos y completar el proceso de verificación de identidad.
              </p>
            </div>
          </div>
        </Dialog>
      )}

      {showCreateDialog && (
        <Dialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          title="Crear Nueva Persona"
          size="lg"
        >
          <CreatePersonForm
            onClose={() => setShowCreateDialog(false)}
            onSuccess={() => {
              router.refresh();
            }}
          />
        </Dialog>
      )}
    </>
  );
}
