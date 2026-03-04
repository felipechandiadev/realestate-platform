'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import Select from '@/shared/components/ui/Select/Select';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import { useAlert } from '@/providers/AlertContext';
import { env } from '@/lib/env';
import { useSession } from 'next-auth/react';

type DNISide = 'FRONT' | 'REAR';

type UploadDNIDialogProps = {
  open: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  onSuccess: () => void;
};

export default function UploadDNIDialog({
  open,
  onClose,
  personId,
  personName,
  onSuccess,
}: UploadDNIDialogProps) {
  const alert = useAlert();
  const { data: session } = useSession();
  const accessToken = (session as (typeof session & { accessToken?: string }) | null)?.accessToken;
  const [loading, setLoading] = useState(false);

  // Form state
  const [dniSide, setDniSide] = useState<DNISide | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dniSide) {
      alert.showAlert({
        message: 'Debe seleccionar el lado del DNI',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (!file) {
      alert.showAlert({
        message: 'Debe seleccionar un archivo de imagen',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (!accessToken) {
      alert.showAlert({
        message: 'Sesión expirada. Inicia sesión nuevamente.',
        type: 'error',
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dniSide', dniSide);
      formData.append('personId', personId);
      formData.append('status', 'UPLOADED');

      const response = await fetch(`${env.backendApiUrl}/document/upload-dni`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const sideLabel = dniSide === 'FRONT' ? 'frontal' : 'trasero';
        alert.showAlert({
          message: `DNI ${sideLabel} cargado exitosamente`,
          type: 'success',
          duration: 3000,
        });
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al subir DNI');
      }
    } catch (error) {
      console.error('Error submitting DNI:', error);
      alert.showAlert({
        message: 'Error al procesar el DNI',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDniSide(null);
      setFile(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Cargar DNI"
      size="md"
      actions={
        <div className="flex gap-2 justify-end">
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !dniSide || !file}
          >
            {loading ? 'Cargando...' : 'Cargar DNI'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Person Info */}
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">DNI para:</p>
          <p className="font-semibold text-foreground">{personName}</p>
        </div>

        {/* DNI Side Selector */}
        <div>
          <Select
            label="Lado del DNI"
            options={[
              { id: 'FRONT', label: 'Frontal' },
              { id: 'REAR', label: 'Trasero' }
            ]}
            value={dniSide}
            onChange={(id) => setDniSide(id as DNISide)}
            placeholder="Seleccione el lado del DNI"
            required
            disabled={loading}
            name="dniSide"
          />
        </div>

        {/* File Uploader */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Imagen del DNI <span className="text-red-500">*</span>
          </label>
          <FileUploader
            onFileSelect={(selectedFile: File | null) => setFile(selectedFile)}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB para DNI
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Solo se aceptan imágenes (JPG, PNG, etc.)
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-500 text-lg">info</span>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Requisitos de imagen:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Imagen clara y legible</li>
                <li>Máximo 5MB</li>
                <li>Formatos: JPG, PNG, etc.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
