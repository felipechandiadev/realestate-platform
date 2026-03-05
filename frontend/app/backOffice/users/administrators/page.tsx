/**
 * Administrators Management Page
 * 
 * Propósito:
 * - Gestionar usuarios administradores del sistema
 * - Visualizar perfiles de admins (nombre, email, rol, permisos)
 * - Búsqueda y filtrado de administradores
 * - Acciones: crear, editar, desactivar administradores
 * - Control de accesos y permisos
 * 
 * Funcionalidad:
 * - Server component: recibe searchParams (search)
 * - Fetcha lista de administradores desde listAdministrators action
 * - Renderiza AdministratorsContent con datos pre-cargados
 * - Suspense boundary automático con loading.tsx
 * 
 * Audiencia: Superadministradores, Directores, Gerentes de sistemas
 */

import { listAdministrators } from '@/features/backoffice/users/actions/users.action';
import { AdministratorsContent, type AdministratorType, type AdministratorStatus } from '@/features/backoffice/users/components/administrators';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdministratorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const response = await listAdministrators({ search });

  if (!response.success || !response.data) {
    return (
      <div className="text-center py-12 text-muted">
        <span className="material-symbols-outlined text-6xl mb-4 block">
          error_outline
        </span>
        <p className="text-lg font-medium mb-2 text-foreground">
          Error al cargar la lista de administradores
        </p>
        <p className="text-sm">
          Por favor, intenta recargar la página.
        </p>
      </div>
    );
  }

  const administrators: AdministratorType[] = response.data.data.map(admin => {
    const validStatuses: AdministratorStatus[] = ['ACTIVE', 'INVITED', 'INACTIVE', 'SUSPENDED'];
    const status: AdministratorStatus = validStatuses.includes(admin.status as AdministratorStatus)
      ? (admin.status as AdministratorStatus)
      : 'INACTIVE';

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      status,
      role: 'Administrator',
      permissions: [],
      personalInfo: {
        phone: admin.personalInfo?.phone || '',
        lastName: admin.personalInfo?.lastName || '',
        avatarUrl: admin.personalInfo?.avatarUrl || null,
        firstName: admin.personalInfo?.firstName || '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      lastLogin: new Date().toISOString(),
    };
  });

  return <AdministratorsContent initialAdministrators={administrators} initialSearch={search} />;
}
