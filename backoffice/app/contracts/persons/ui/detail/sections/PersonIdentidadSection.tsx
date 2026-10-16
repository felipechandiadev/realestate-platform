'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, IdCard } from 'lucide-react';
import {
  type Person,
  verifyPerson,
  unverifyPerson,
  uploadDniDocument,
  getMultimediaUrl,
} from '@/features/contracts/actions/persons.action';
import { Button, Dialog, DotProgress } from '@realestate/ui';
import { useAlert } from '@/providers/AlertContext';

type PersonIdentidadSectionProps = {
  person: Person;
};

export function PersonIdentidadSection({ person }: PersonIdentidadSectionProps) {
  const router = useRouter();
  const alert = useAlert();
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showUnverifyDialog, setShowUnverifyDialog] = useState(false);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingRear, setIsUploadingRear] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(
    person.dniCardFront?.url ?? null,
  );
  const [rearImageUrl, setRearImageUrl] = useState<string | null>(
    person.dniCardRear?.url ?? null,
  );
  const frontInputRef = useRef<HTMLInputElement>(null);
  const rearInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let canceled = false;

    const resolveFront = async () => {
      if (person.dniCardFront?.url) {
        setFrontImageUrl(person.dniCardFront.url);
        return;
      }
      if (person.dniCardFrontId) {
        const url = await getMultimediaUrl(person.dniCardFrontId);
        if (!canceled) setFrontImageUrl(url);
        return;
      }
      if (!canceled) setFrontImageUrl(null);
    };

    const resolveRear = async () => {
      if (person.dniCardRear?.url) {
        setRearImageUrl(person.dniCardRear.url);
        return;
      }
      if (person.dniCardRearId) {
        const url = await getMultimediaUrl(person.dniCardRearId);
        if (!canceled) setRearImageUrl(url);
        return;
      }
      if (!canceled) setRearImageUrl(null);
    };

    void resolveFront();
    void resolveRear();

    return () => {
      canceled = true;
    };
  }, [
    person.dniCardFront?.url,
    person.dniCardFrontId,
    person.dniCardRear?.url,
    person.dniCardRearId,
  ]);

  const resolveUploadedUrl = async (
    result: { url?: string; multimediaId?: string },
  ): Promise<string | null> => {
    if (result.url) return result.url;
    if (!result.multimediaId) return null;
    for (let i = 0; i < 3; i++) {
      const url = await getMultimediaUrl(result.multimediaId);
      if (url) return url;
      if (i < 2) await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setShowVerifyDialog(false);
    try {
      const verified = await verifyPerson(person.id);
      alert.showAlert({
        message: `Persona ${person.name} verificada exitosamente`,
        type: 'success',
        duration: 3000,
      });
      if (verified?.id && verified.id !== person.id) {
        router.replace(`/contracts/persons/${verified.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert.showAlert({
        message: `Error al verificar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnverify = async () => {
    setIsVerifying(true);
    setShowUnverifyDialog(false);
    try {
      await unverifyPerson(person.id);
      alert.showAlert({
        message: `Verificación de ${person.name} removida`,
        type: 'success',
        duration: 3000,
      });
      router.refresh();
    } catch (error) {
      alert.showAlert({
        message: `Error al desverificar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUploadDniFront = async (file: File) => {
    setIsUploadingFront(true);
    try {
      const result = await uploadDniDocument(person.id, file, 'front');
      if (result.success) {
        alert.showAlert({
          message: 'Foto de frente subida exitosamente',
          type: 'success',
          duration: 3000,
        });
        const url = await resolveUploadedUrl(result);
        if (url) setFrontImageUrl(url);
        router.refresh();
      } else {
        alert.showAlert({
          message: result.error || 'Error al subir la foto de frente',
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      alert.showAlert({
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploadingFront(false);
    }
  };

  const handleUploadDniRear = async (file: File) => {
    setIsUploadingRear(true);
    try {
      const result = await uploadDniDocument(person.id, file, 'rear');
      if (result.success) {
        alert.showAlert({
          message: 'Foto reverso subida exitosamente',
          type: 'success',
          duration: 3000,
        });
        const url = await resolveUploadedUrl(result);
        if (url) setRearImageUrl(url);
        router.refresh();
      } else {
        alert.showAlert({
          message: result.error || 'Error al subir la foto reverso',
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      alert.showAlert({
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploadingRear(false);
    }
  };

  return (
    <section className="space-y-8" data-test-id="person-detail-identidad-section">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Estado de verificación</h2>
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-[10rem] flex-1">
            <p className="text-sm text-muted-foreground">Estado</p>
            <p className="font-medium">
              {person.verified ? (
                <span className="inline-flex items-center gap-1.5 text-blue-500">
                  <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
                  Verificado
                </span>
              ) : (
                <span className="text-muted-foreground">No verificado</span>
              )}
            </p>
          </div>
          {person.verificationRequest ? (
            <div className="min-w-[10rem] flex-1">
              <p className="text-sm text-muted-foreground">Solicitud de verificación</p>
              <p className="font-medium text-foreground">
                {new Date(person.verificationRequest).toLocaleDateString('es-CL')}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {!person.verified ? (
            <Button
              variant="primary"
              onClick={() => setShowVerifyDialog(true)}
              disabled={isVerifying}
            >
              Verificar persona
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setShowUnverifyDialog(true)}
              disabled={isVerifying}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Remover verificación
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Fotos de identidad</h2>
        <p className="text-sm text-muted-foreground">
          Revisa las fotos de frente y reverso antes de aprobar la verificación.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <IdPhotoSlot
            title="Foto de frente"
            imageUrl={frontImageUrl}
            inputRef={frontInputRef}
            uploading={isUploadingFront}
            onPick={() => frontInputRef.current?.click()}
            onFile={(file) => void handleUploadDniFront(file)}
          />
          <IdPhotoSlot
            title="Foto reverso"
            imageUrl={rearImageUrl}
            inputRef={rearInputRef}
            uploading={isUploadingRear}
            onPick={() => rearInputRef.current?.click()}
            onFile={(file) => void handleUploadDniRear(file)}
          />
        </div>
      </div>

      <Dialog
        open={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
        title="Confirmar verificación"
        size="sm"
        actions={
          <div className="flex justify-end gap-2">
            <Button variant="outlined" onClick={() => setShowVerifyDialog(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void handleVerify()}>
              Verificar
            </Button>
          </div>
        }
      >
        <p className="text-foreground">
          ¿Está seguro que desea verificar a <strong>{person.name || 'esta persona'}</strong>?
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta acción confirma que revisaste las fotos de identidad.
        </p>
      </Dialog>

      <Dialog
        open={showUnverifyDialog}
        onClose={() => setShowUnverifyDialog(false)}
        title="Remover verificación"
        size="sm"
        actions={
          <div className="flex justify-end gap-2">
            <Button variant="outlined" onClick={() => setShowUnverifyDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleUnverify()}
              className="bg-red-500 hover:bg-red-600"
            >
              Remover verificación
            </Button>
          </div>
        }
      >
        <p className="text-foreground">
          ¿Está seguro que desea remover la verificación de{' '}
          <strong>{person.name || 'esta persona'}</strong>?
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta acción quitará el estado verificado de la persona.
        </p>
      </Dialog>
    </section>
  );
}

function IdPhotoSlot({
  title,
  imageUrl,
  inputRef,
  uploading,
  onPick,
  onFile,
}: {
  title: string;
  imageUrl: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  onPick: () => void;
  onFile: (file: File) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="w-full max-w-md rounded-lg border border-border"
        />
      ) : (
        <div className="flex aspect-video w-full max-w-md items-center justify-center rounded-lg border border-dashed border-border">
          <IdCard className="h-12 w-12 text-muted-foreground" aria-hidden />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      <Button variant="outlined" onClick={onPick} disabled={uploading}>
        {uploading ? (
          <DotProgress size={12} count={3} variant="wave" />
        ) : imageUrl ? (
          `Reemplazar ${title.toLowerCase()}`
        ) : (
          `Subir ${title.toLowerCase()}`
        )}
      </Button>
    </div>
  );
}
