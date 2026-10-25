'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Dialog, LoadingState } from '@realestate/ui';
import { useCreatePropertyForm } from '@/app/properties/hooks/useCreatePropertyForm';
import {
  CREATE_PROPERTY_WIZARD_LAST_INDEX,
} from './create-property-wizard-constants';
import {
  CreatePropertyWizard,
  getCreatePropertyStepFieldRows,
} from './CreatePropertyWizard';
import { validateRequiredFields } from './CreatePropertyStepFields';
import { usePropertyUploadQueue } from '../../../upload/usePropertyUploadQueue';
import { UploadQueueList } from '../../../upload/UploadQueueList';

export type CreatePropertyDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  operation?: 'SALE' | 'RENT';
};

/**
 * Crear propiedad en modal. Navegación del asistente (Atrás / Siguiente / Crear)
 * vive en `Dialog.actions`; el cuerpo solo muestra el Stepper y los campos del paso.
 */
export function CreatePropertyDialog({
  open,
  onClose,
  onSuccess,
  operation = 'SALE',
}: CreatePropertyDialogProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<{
    initialLat?: number;
    initialLng?: number;
  } | null>(null);
  /** Propiedad ya creada cuya multimedia se está subiendo en cola. */
  const [uploadPropertyId, setUploadPropertyId] = useState<string | null>(null);
  const uploadQueue = usePropertyUploadQueue();
  const { summary: uploadSummary } = uploadQueue;
  const isUploadPhase = uploadPropertyId !== null;

  const finish = useCallback(() => {
    onSuccess?.();
    onClose();
  }, [onSuccess, onClose]);

  const {
    formData,
    propertyTypes,
    loadingTypes,
    stateOptions,
    loadingStates,
    cityOptions,
    selectedPropertyType,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
  } = useCreatePropertyForm(
    () => {},
    operation,
    (propertyId, pendingFiles) => {
      if (propertyId && pendingFiles.length > 0) {
        setUploadPropertyId(propertyId);
        void uploadQueue.start(propertyId, pendingFiles);
        return;
      }
      finish();
    },
  );

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setStepError(null);
    setDetectedCoords(null);
    setUploadPropertyId(null);
    uploadQueue.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, operation]);

  const geoAttemptedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      geoAttemptedRef.current = false;
      return;
    }
    if (geoAttemptedRef.current) return;
    if (typeof window === 'undefined') return;
    if (!navigator?.geolocation) return;
    if ((formData as { coordinates?: unknown }).coordinates) return;

    geoAttemptedRef.current = true;
    let mounted = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDetectedCoords({ initialLat: lat, initialLng: lng });
        handleChange('coordinates', { lat, lng });
      },
      (err) => {
        console.warn('[CreatePropertyDialog] Geolocation failed:', err?.message || err);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 },
    );

    return () => {
      mounted = false;
    };
  }, [open, formData, handleChange]);

  const getActiveFieldRows = useCallback(() => {
    return getCreatePropertyStepFieldRows(stepIndex, {
      propertyTypes,
      selectedPropertyType,
      stateOptions,
      cityOptions,
      formData: formData as unknown as Record<string, unknown>,
      detectedCoords,
    });
  }, [
    stepIndex,
    propertyTypes,
    selectedPropertyType,
    stateOptions,
    cityOptions,
    formData,
    detectedCoords,
  ]);

  const goNext = useCallback(() => {
    const err = validateRequiredFields(
      getActiveFieldRows(),
      formData as unknown as Record<string, unknown>,
    );
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStepIndex((i) => Math.min(i + 1, CREATE_PROPERTY_WIZARD_LAST_INDEX));
  }, [formData, getActiveFieldRows]);

  const goPrev = useCallback(() => {
    setStepError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const onStepDotClick = useCallback((index: number) => {
    setStepError(null);
    setStepIndex(index);
  }, []);

  const handleCreate = useCallback(async () => {
    const err = validateRequiredFields(
      getActiveFieldRows(),
      formData as unknown as Record<string, unknown>,
    );
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    await handleSubmit();
  }, [formData, getActiveFieldRows, handleSubmit]);

  const navDisabled = loadingTypes || loadingStates || isSubmitting;
  const showNext = stepIndex < CREATE_PROPERTY_WIZARD_LAST_INDEX;
  const title =
    operation === 'RENT' ? 'Crear Propiedad en Arriendo' : 'Crear Propiedad en Venta';

  if (isUploadPhase) {
    return (
      <Dialog
        open={open}
        // No se cierra mientras sube: la propiedad ya existe y quedaría sin fotos.
        onClose={uploadSummary.active ? () => {} : finish}
        title="Subiendo multimedia"
        size="xl"
        scroll="paper"
        maxHeight="90vh"
        actions={
          uploadSummary.active ? (
            <Button variant="primary" disabled loading data-test-id="create-property-upload-wait">
              Subiendo {Math.min(uploadSummary.done + 1, uploadSummary.total)} de {uploadSummary.total}…
            </Button>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {uploadSummary.failed > 0 ? (
                <>
                  <Button variant="outlinedSecondary" onClick={finish} data-test-id="create-property-upload-skip">
                    Finalizar sin los fallidos
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (uploadPropertyId) void uploadQueue.retryFailed(uploadPropertyId);
                    }}
                    data-test-id="create-property-upload-retry"
                  >
                    Reintentar fallidos
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={finish} data-test-id="create-property-upload-finish">
                  Finalizar
                </Button>
              )}
            </div>
          )
        }
        data-test-id="create-property-upload-dialog"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            La propiedad ya fue creada. Los archivos se suben de a uno; espera a que terminen
            antes de cerrar.
          </p>
          <UploadQueueList items={uploadQueue.items} />
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="xl"
      scroll="paper"
      maxHeight="90vh"
      actions={
        <>
          <Button variant="outlinedSecondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outlinedSecondary"
              disabled={navDisabled || stepIndex <= 0}
              onClick={goPrev}
              data-test-id="create-property-wizard-back"
            >
              Atrás
            </Button>
            {showNext ? (
              <Button
                type="button"
                variant="primary"
                disabled={navDisabled}
                onClick={goNext}
                data-test-id="create-property-wizard-next"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  void handleCreate();
                }}
                disabled={navDisabled}
                loading={isSubmitting}
                data-test-id="create-property-wizard-save"
              >
                {isSubmitting ? 'Creando…' : 'Crear Propiedad'}
              </Button>
            )}
          </div>
        </>
      }
      alertArea={
        submitError ? <Alert variant="error">{submitError}</Alert> : null
      }
      data-test-id="create-property-dialog"
    >
      {loadingTypes || loadingStates ? (
        <LoadingState className="flex items-center justify-center py-8" />
      ) : (
        <CreatePropertyWizard
          stepIndex={stepIndex}
          stepError={stepError}
          onStepDotClick={onStepDotClick}
          formData={formData as unknown as Record<string, unknown>}
          onChange={handleChange}
          propertyTypes={propertyTypes}
          selectedPropertyType={selectedPropertyType}
          stateOptions={stateOptions}
          cityOptions={cityOptions}
          detectedCoords={detectedCoords}
        />
      )}
    </Dialog>
  );
}

export default CreatePropertyDialog;
