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

import { listAdministrators } from '@/features/users/actions/users.action';
import { AdministratorsContent, type AdministratorType, type AdministratorStatus } from '@/features/users/components/administrators';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdministratorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const sort = params.sort === 'asc' || params.sort === 'desc' ? params.sort : undefined;
  const sortField = typeof params.sortField === 'string' ? params.sortField : undefined;
  const filters = typeof params.filters === 'string' ? params.filters : undefined;
  const page = Number.parseInt(typeof params.page === 'string' ? params.page : '1', 10) || 1;
  const limit = Number.parseInt(typeof params.limit === 'string' ? params.limit : '25', 10) || 25;

  const response = await listAdministrators({
    search,
    sort,
    sortField,
    filters,
    page,
    limit,
    pagination: true,
  });

  if (!response.success || !response.data) {
    return (
      <div className="text-center py-12 text-muted">
        <div className="text-6xl mb-4 text-muted-foreground">⚠️</div>
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
      createdAt: admin.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      lastLogin: new Date().toISOString(),
    };
  });

  return (
    <AdministratorsContent
      initialAdministrators={administrators}
      initialSearch={search}
      totalRows={response.data.total}
    />
  );
}
