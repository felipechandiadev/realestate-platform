'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { getContractRentPayments, getContractDetails, uploadPaymentProof } from '@/features/backoffice/contracts/actions/contracts.action';
import Alert from '@/shared/components/ui/Alert/Alert';
import Card from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import Badge from '@/shared/components/ui/Badge/Badge';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import { useAlert } from '@/shared/hooks/useAlert';

export default function ContractPaymentsPage() {
  const params = useParams();
  const contractId = params.id as string;
  const { user, status } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [contract, setContract] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File | null>(null);

  const loadData = useCallback(async () => {
    if (contractId) {
      try {
        setLoading(true);
        const [contractData, paymentsData] = await Promise.all([
          getContractDetails(contractId),
          getContractRentPayments(contractId)
        ]);
        setContract(contractData);
        setPayments(paymentsData);
      } catch (err) {
        setError('No pudimos cargar la información de tus pagos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }, [contractId]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    } else if (status === 'unauthenticated') {
      router.push('/portal');
    }
  }, [status, loadData, router]);

  const handleOpenUploadModal = (payment: any) => {
    setSelectedPayment(payment);
    setUploadedFiles(null);
    setIsModalOpen(true);
  };

  const handleUpload = async () => {
    if (!uploadedFiles || !selectedPayment) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFiles);

      const result = await uploadPaymentProof(contractId, selectedPayment.id, formData);

      if (result.success) {
        showAlert({ 
          message: 'Comprobante subido correctamente. Pendiente de verificación.', 
          type: 'success' 
        });
        setIsModalOpen(false);
        loadData(); // Reload to show new status
      } else {
        showAlert({ 
          message: result.error || 'Error al subir el comprobante', 
          type: 'error' 
        });
      }
    } catch (err) {
      showAlert({ message: 'Ocurrió un error inesperado', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Pagado</Badge>;
      case 'PENDING_VERIFICATION':
        return <Badge variant="info">Pendiente de Verificación</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">Cancelado</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="warning">Pendiente</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">{error}</Alert>
        <Button onClick={() => router.back()} className="mt-4">Volver</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="text" 
          onClick={() => router.back()} 
          className="p-2 !rounded-full"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pagos de Arriendo</h1>
          <p className="text-muted-foreground">
            {contract?.property?.title || 'Contrato'} - Código: {contract?.code}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {payments.length === 0 ? (
          <Alert variant="info">No hay pagos de arriendo programados para este contrato.</Alert>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary">
                    $ {payment.amount.toLocaleString('es-CL')}
                  </span>
                  {getStatusBadge(payment.status)}
                </div>
                <p className="text-sm font-medium">
                  Vencimiento: {formatDate(payment.date)}
                </p>
                {payment.description && (
                  <p className="text-xs text-muted-foreground italic">
                    {payment.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && (
                  <Button 
                    onClick={() => handleOpenUploadModal(payment)}
                    className="flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    Informar pago
                  </Button>
                )}
                {payment.status === 'PENDING_VERIFICATION' && (
                   <span className="text-xs text-muted-foreground flex items-center gap-1">
                     <span className="material-symbols-outlined text-sm text-info">info</span>
                     Comprobante enviado
                   </span>
                )}
                {payment.status === 'PAID' && payment.paidAt && (
                   <span className="text-xs text-green-600 font-medium">
                     Pagado el {formatDate(payment.paidAt)}
                   </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => !isUploading && setIsModalOpen(false)}
        title="Informar Pago de Arriendo"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sube el comprobante de transferencia o depósito para el pago de 
            <span className="font-bold text-foreground mx-1">
              $ {selectedPayment?.amount.toLocaleString('es-CL')}
            </span> 
            con vencimiento el {selectedPayment && formatDate(selectedPayment.date)}.
          </p>

          <FileUploader
            onFileSelect={(file) => setUploadedFiles(file)}
            maxSize={5 * 1024 * 1024}
            accept="image/*,application/pdf"
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outlined" 
              onClick={() => setIsModalOpen(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={isUploading || !uploadedFiles}
              className="min-w-[120px]"
            >
              {isUploading ? <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div> : 'Enviar comprobante'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
