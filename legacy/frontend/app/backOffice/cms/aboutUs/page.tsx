/**
 * CMS About Us / Company Info Page
 * 
 * Propósito:
 * - Editar información pública de la empresa
 * - Gestionar biografía empresarial
 * - Definir y mantener misión y visión
 * - Subir y gestionar multimedia (logos, fotos corporativas)
 * 
 * Funcionalidad:
 * - Client component: formularios interactivos
 * - Carga y actualiza datos de sección "Sobre Nosotros"
 * - Upload de multimedia via MultimediaUpdater
 * - Validación y notificación de cambios exitosos
 * 
 * Audiencia: Administradores, Gerentes, Editores corporativos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { Button } from '@/shared/components/ui/Button/Button';
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';
import MultimediaUpdater from '@/shared/components/ui/FileUploader/MultimediaUpdater';
import { getAboutUs, updateAboutUs, createDefaultAboutUs } from '@/features/backoffice/cms/actions/aboutUs.action';
import { useAlert } from '@/shared/hooks/useAlert';

interface AboutUsData {
  bio: string;
  mision: string;
  vision: string;
  multimediaUrl?: string;
}

export default function AboutUsPage() {
  const { showAlert } = useAlert();
  const [data, setData] = useState<AboutUsData>({
    bio: '',
    mision: '',
    vision: '',
    multimediaUrl: '',
  });

  // Estado para multimedia file
  const [multimediaFile, setMultimediaFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setErrors([]);
    const result = await getAboutUs();
    console.log('[AboutUsPage] loadData result:', result);
    
    if (result.success && result.data) {
      const normalized = Array.isArray(result.data) ? result.data[0] : result.data;
      console.log('[AboutUsPage] normalized data:', normalized);
      if (normalized) {
        setData(normalized);
      } else {
        console.warn('[AboutUsPage] normalized data is null/undefined');
        setErrors(['No se encontraron datos de "Sobre Nosotros". Completa el formulario y guarda.']);
      }
    } else {
      console.error('[AboutUsPage] loadData failed:', result.error);
      setErrors([result.error || 'Error cargando datos']);
    }
    setIsLoading(false);
  };

  const handleMultimediaChange = (file: File | null) => {
    setMultimediaFile(file);
  };

  const handleSubmit = async () => {
    setErrors([]);
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('bio', data.bio);
      formData.append('mision', data.mision);
      formData.append('vision', data.vision);

      if (multimediaFile) {
        formData.append('multimedia', multimediaFile);
      }

      const result = await updateAboutUs(formData);

      if (result.success) {
        showAlert({
          message: 'Cambios guardados exitosamente',
          type: 'success',
          duration: 3000,
        });
        await loadData();
        setMultimediaFile(null);
      } else {
        const errorMsg = result.error || 'Error al guardar';
        setErrors([errorMsg]);
        showAlert({
          message: errorMsg,
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error interno del servidor';
      setErrors([errorMsg]);
      showAlert({
        message: errorMsg,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <DotProgress />
      </div>
    );
  }

  if (!data.bio && !data.mision && !data.vision) {
    return (
      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
          <p className="text-blue-900 mb-4">
            No hay datos de "Sobre Nosotros" registrados aún.
          </p>
          <Button 
            onClick={async () => {
              setIsLoading(true);
              const result = await createDefaultAboutUs();
              if (result.success) {
                showAlert({
                  message: 'Datos por defecto creados. Recargando...',
                  type: 'success',
                  duration: 2000,
                });
                await new Promise(r => setTimeout(r, 2000));
                await loadData();
              } else {
                showAlert({
                  message: result.error || 'Error al crear datos',
                  type: 'error',
                  duration: 5000,
                });
                setIsLoading(false);
              }
            }}
          >
            Crear datos por defecto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sobre Nosotros</h1>
          <p className="text-muted-foreground mt-1">Edita la información pública de la empresa</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index} className="text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {/* Multimedia */}
        <div>
          <MultimediaUpdater
            currentUrl={data.multimediaUrl}
            currentType={data.multimediaUrl?.includes('.mp4') || data.multimediaUrl?.includes('.webm') || data.multimediaUrl?.includes('.ogg') ? 'video' : 'image'}
            onFileChange={handleMultimediaChange}
            buttonText="Cambiar multimedia"
            labelText="Multimedia"
            acceptedTypes={['image/*', 'video/*']}
            maxSize={100}
            aspectRatio="16:9"
            previewSize="xl"
            variant="banner"
          />
        </div>

        {/* Bio */}
        <TextField
          label="Quiénes somos (Bio)"
          value={data.bio}
          onChange={(e) => setData(prev => ({ ...prev, bio: e.target.value }))}
          rows={6}
          required
          placeholder="Describe quiénes son..."
        />

        {/* Misión */}
        <TextField
          label="Misión"
          value={data.mision}
          onChange={(e) => setData(prev => ({ ...prev, mision: e.target.value }))}
          rows={4}
          required
          placeholder="Describe la misión..."
        />

        {/* Visión */}
        <TextField
          label="Visión"
          value={data.vision}
          onChange={(e) => setData(prev => ({ ...prev, vision: e.target.value }))}
          rows={4}
          required
          placeholder="Describe la visión..."
        />

        {/* Botón guardar */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <DotProgress />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
