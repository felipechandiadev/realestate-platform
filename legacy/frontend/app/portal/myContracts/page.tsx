/**
 * My Contracts Page (Portal - User Dashboard)
 * 
 * Propósito:
 * - Dashboard personal de contratos del usuario autenticado
 * - Ver contratos en los que el usuario es parte (comprador, vendedor, arrendatario)
 * - Descargar documentos de contratos
 * - Tracking de estado de contratos
 * 
 * Funcionalidad:
 * - Client component: requiere autenticación (useAuth)
 * - Fetcha contratos del usuario desde getUserContracts
 * - Grid de Cards con información de contrato y propiedad asociada
 * - Formateo de fechas localizadas (es-CL)
 * - Estados visuales: badges por estado de contrato
 * - Loading y error states
 * - Link a detalles de contrato y acciones
 * 
 * Audiencia: Usuarios registrados involucrados en transacciones
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { getUserContracts } from '@/features/backoffice/contracts/actions/contracts.action';
import Alert from '@/shared/components/ui/Alert/Alert';
import Card from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import Link from 'next/link';

export default function MyContractsPage() {
  const { user, status } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: string | Date) => {
    try {
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(new Date(date));
    } catch (e) {
      return 'Fecha no disponible';
    }
  };

  useEffect(() => {
    async function loadContracts() {
      if (user?.id) {
        try {
          const result = await getUserContracts(user.id);
          setContracts(result);
        } catch (err) {
          setError('No pudimos cargar tus contratos. Por favor, intenta de nuevo más tarde.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      loadContracts();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [user?.id, status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="warning">Debes iniciar sesión para ver tus contratos.</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mis Contratos</h1>
        <p className="text-muted-foreground mt-2">Revisa el estado de tus operaciones de arriendo o compraventa.</p>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {contracts.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">description</span>
          <h3 className="text-xl font-medium text-foreground mb-2">Aún no tienes contratos registrados</h3>
          <p className="text-muted-foreground max-w-md">
            Aquí aparecerá el historial de tus contratos firmados o en proceso con nosotros.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map((contract) => {
            // Un usuario puede ver "Mis pagos de arriendo" si el contrato es de ARRIENDO
            // y su rol en el contrato es TENANT (Arrendatario)
            const isArriendo = contract.operation === 'ARRIENDO';
            const userIsTenant = contract.people?.some((p: any) => 
               p.role === 'TENANT' && (p.personId === user?.personId || p.person?.userId === user?.id)
            );

            return (
              <Card key={contract.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground uppercase">{contract.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      contract.status === 'CLOSED' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {contract.status === 'CLOSED' ? 'Cerrado' : 'En Proceso'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{contract.property?.title || 'Contrato Inmobiliario'}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{contract.property?.address || 'Sin dirección registrada'}</p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-primary">analytics</span>
                      <span className="capitalize">{contract.operation.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
                      <span>Creado el {formatDate(contract.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium italic">
                      <span className="material-symbols-outlined text-base text-primary">payments</span>
                      <span>{contract.currency === 'UF' ? `UF ${contract.amount}` : `$ ${contract.amount.toLocaleString('es-CL')}`}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 md:border-l md:pl-4 min-w-[180px] justify-end">
                  {isArriendo && (
                    <Link href={`/portal/myContracts/${contract.id}/payments`}>
                      <Button variant="outlined" size="sm" className="whitespace-nowrap flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">receipt_long</span>
                        Mis pagos de arriendo
                      </Button>
                    </Link>
                  )}
                  <span className="material-symbols-outlined text-muted-foreground opacity-20 hidden md:block">contract</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
