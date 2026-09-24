'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Person, verifyPerson, unverifyPerson, uploadDniDocument, getMultimediaUrl } from '@/features/backoffice/contracts/actions/persons.action';
import { Button } from '@/shared/components/ui/Button/Button';
import { useAlert } from '@/providers/AlertContext';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';
import EditPersonForm from './EditPersonForm';

interface PersonDetailViewProps {
  person: Person;
}

export default function PersonDetailView({ person }: PersonDetailViewProps) {
  const router = useRouter();
  const alert = useAlert();
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showUnverifyDialog, setShowUnverifyDialog] = useState(false);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingRear, setIsUploadingRear] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(person.dniCardFront?.url ?? null);
  const [rearImageUrl, setRearImageUrl] = useState<string | null>(person.dniCardRear?.url ?? null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const rearInputRef = useRef<HTMLInputElement>(null);

  // Load existing DNI images on component mount
  useEffect(() => {
    let canceled = false;

    const resolveFront = async () => {
      if (person.dniCardFront?.url) {
        setFrontImageUrl(person.dniCardFront.url);
        return;
      }
      if (person.dniCardFrontId) {
        const url = await getMultimediaUrl(person.dniCardFrontId);
        if (!canceled) {
          setFrontImageUrl(url);
        }
        return;
      }
      if (!canceled) {
        setFrontImageUrl(null);
      }
    };

    const resolveRear = async () => {
      if (person.dniCardRear?.url) {
        setRearImageUrl(person.dniCardRear.url);
        return;
      }
      if (person.dniCardRearId) {
        const url = await getMultimediaUrl(person.dniCardRearId);
        if (!canceled) {
          setRearImageUrl(url);
        }
        return;
      }
      if (!canceled) {
        setRearImageUrl(null);
      }
    };

    resolveFront();
    resolveRear();

    return () => {
      canceled = true;
    };
  }, [person.dniCardFront?.url, person.dniCardFrontId, person.dniCardRear?.url, person.dniCardRearId]);

  const handleVerify = async () => {
    setIsVerifying(true);
    setShowVerifyDialog(false);

    try {
      await verifyPerson(person.id);
      alert.showAlert({
        message: `Persona ${person.name} verificada exitosamente`,
        type: 'success',
        duration: 3000,
      });
      router.refresh();
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

  const handleUploadDniFront = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploadingFront(true);
    try {
      const result = await uploadDniDocument(person.id, files[0], 'front');
      if (result.success) {
        alert.showAlert({
          message: 'DNI frontal subido exitosamente',
          type: 'success',
          duration: 3000,
        });
        // Load the new image URL
        if (result.url) {
          setFrontImageUrl(result.url);
        } else if (result.multimediaId) {
          // Retry fetching URL up to 3 times with delay
          let url: string | null = null;
          for (let i = 0; i < 3; i++) {
            url = await getMultimediaUrl(result.multimediaId);
            if (url) break;
            if (i < 2) await new Promise(resolve => setTimeout(resolve, 500));
          }
          if (url) {
            setFrontImageUrl(url);
          }
        }
        router.refresh();
      } else {
        alert.showAlert({
          message: result.error || 'Error al subir DNI frontal',
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

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadDniFront([files[0]]);
    }
  };

  const handleRearFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadDniRear([files[0]]);
    }
  };

  const handleUploadDniRear = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploadingRear(true);
    try {
      const result = await uploadDniDocument(person.id, files[0], 'rear');
      if (result.success) {
        alert.showAlert({
          message: 'DNI trasero subido exitosamente',
          type: 'success',
          duration: 3000,
        });
        // Load the new image URL
        if (result.url) {
          setRearImageUrl(result.url);
        } else if (result.multimediaId) {
          // Retry fetching URL up to 3 times with delay
          let url: string | null = null;
          for (let i = 0; i < 3; i++) {
            url = await getMultimediaUrl(result.multimediaId);
            if (url) break;
            if (i < 2) await new Promise(resolve => setTimeout(resolve, 500));
          }
          if (url) {
            setRearImageUrl(url);
          }
        }
        router.refresh();
      } else {
        alert.showAlert({
          message: result.error || 'Error al subir DNI trasero',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {person.name || 'Sin nombre'}
            {person.verified && (
              <span className="ml-2 text-blue-500">
                <span className="material-symbols-outlined align-middle">verified</span>
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">{person.email}</p>
        </div>
        <Button
          variant="outlined"
          onClick={() => router.push('/backOffice/contracts/persons')}
        >
          Volver
        </Button>
      </div>

      {/* Información Personal (editable) */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Información Personal</h2>
        <EditPersonForm
          person={person}
          onClose={() => {
            // Reset form to current values
            router.refresh();
          }}
          onSuccess={() => {
            router.refresh();
          }}
        />
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">Fecha de Registro</p>
          <p className="font-medium">
            {new Date(person.createdAt).toLocaleDateString('es-CL')}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Estado de Verificación</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="font-medium">
                {person.verified ? (
                  <span className="text-blue-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Verificado
                  </span>
                ) : (
                  <span className="text-muted-foreground">No verificado</span>
                )}
              </p>
            </div>
            {person.verificationRequest && (
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Solicitud de Verificación</p>
                <p className="font-medium">
                  {new Date(person.verificationRequest).toLocaleDateString('es-CL')}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!person.verified ? (
              <Button
                variant="primary"
                onClick={() => setShowVerifyDialog(true)}
                disabled={isVerifying}
              >
                Verificar Persona
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={() => setShowUnverifyDialog(true)}
                disabled={isVerifying}
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Remover Verificación
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Documentos de Identificación</h2>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Los documentos de identificación (DNI frontal y trasero) permiten verificar la identidad de la persona antes de aprobar su verificación.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* DNI Frontal */}
            <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">DNI Frontal</h3>
            {frontImageUrl ? (
              <div className="space-y-2">
                <img 
                  src={frontImageUrl} 
                  alt="DNI Frontal" 
                  className="w-full max-w-md rounded-lg border border-border"
                />
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFrontFileChange}
                  className="hidden"
                />
                <Button
                  variant="outlined"
                  onClick={() => frontInputRef.current?.click()}
                  disabled={isUploadingFront}
                >
                  {isUploadingFront ? <DotProgress /> : 'Reemplazar DNI Frontal'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-full max-w-md aspect-video rounded-lg flex items-center justify-center border border-dashed border-border">
                  <span className="material-symbols-outlined text-muted-foreground text-4xl">badge</span>
                </div>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFrontFileChange}
                  className="hidden"
                />
                <Button
                  variant="outlined"
                  onClick={() => frontInputRef.current?.click()}
                  disabled={isUploadingFront}
                >
                  {isUploadingFront ? <DotProgress /> : 'Subir DNI Frontal'}
                </Button>
              </div>
            )}
            </div>

            {/* DNI Trasero */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">DNI Trasero</h3>
            {rearImageUrl ? (
              <div className="space-y-2">
                <img 
                  src={rearImageUrl} 
                  alt="DNI Trasero" 
                  className="w-full max-w-md rounded-lg border border-border"
                />
                <input
                  ref={rearInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleRearFileChange}
                  className="hidden"
                />
                <Button
                  variant="outlined"
                  onClick={() => rearInputRef.current?.click()}
                  disabled={isUploadingRear}
                >
                  {isUploadingRear ? <DotProgress /> : 'Reemplazar DNI Trasero'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-full max-w-md aspect-video rounded-lg flex items-center justify-center border border-dashed border-border">
                  <span className="material-symbols-outlined text-muted-foreground text-4xl">badge</span>
                </div>
                <input
                  ref={rearInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleRearFileChange}
                  className="hidden"
                />
                <Button
                  variant="outlined"
                  onClick={() => rearInputRef.current?.click()}
                  disabled={isUploadingRear}
                >
                  {isUploadingRear ? <DotProgress /> : 'Subir DNI Trasero'}
                </Button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de Verificación */}
      {showVerifyDialog && (
        <Dialog
          open={showVerifyDialog}
          onClose={() => setShowVerifyDialog(false)}
          title="Confirmar Verificación"
          size="sm"
          actions={
            <div className="flex gap-2 justify-end">
              <Button variant="outlined" onClick={() => setShowVerifyDialog(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleVerify}>
                Verificar
              </Button>
            </div>
          }
        >
          <p className="text-foreground">
            ¿Está seguro que desea verificar a <strong>{person.name || 'esta persona'}</strong>?
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Esta acción confirmará que ha revisado los documentos de identificación y valida la identidad de la persona.
          </p>
        </Dialog>
      )}

      {/* Diálogo de Desverificación */}
      {showUnverifyDialog && (
        <Dialog
          open={showUnverifyDialog}
          onClose={() => setShowUnverifyDialog(false)}
          title="Remover Verificación"
          size="sm"
          actions={
            <div className="flex gap-2 justify-end">
              <Button variant="outlined" onClick={() => setShowUnverifyDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleUnverify}
                className="bg-red-500 hover:bg-red-600"
              >
                Remover Verificación
              </Button>
            </div>
          }
        >
          <p className="text-foreground">
            ¿Está seguro que desea remover la verificación de <strong>{person.name || 'esta persona'}</strong>?
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Esta acción quitará el estado verificado de la persona.
          </p>
        </Dialog>
      )}

    </div>
  );
}
