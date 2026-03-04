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
 * - Renderiza AdminList con datos y búsqueda
 * - Validación de respuesta y manejo de errores
 * 
 * Audiencia: Superadministradores, Directores, Gerentes de sistemas
 */

import { listAdministrators } from '@/features/backoffice/users/actions/users.action';
import AdminList from './ui/AdminList';
import type { AdministratorType, AdministratorStatus } from './ui/types';

type AdministratorsPageSearchParams = {
    search?: string | string[];
};

export default async function AdministratorsPage({
    searchParams,
}: {
    searchParams?: Promise<AdministratorsPageSearchParams>;
}) {
    const params = searchParams ? await searchParams : undefined;

    const search = typeof params?.search === 'string' ? params.search : Array.isArray(params?.search) ? (params?.search[0] || '') : '';
    const response = await listAdministrators({ search });

    if (!response.success || !response.data) {
        return <div>Error al cargar la lista de administradores.</div>;
    }

    const administrators = response.data.data.map(admin => {
        const validStatuses: AdministratorStatus[] = ['ACTIVE', 'INVITED', 'INACTIVE', 'SUSPENDED'];
        const status: AdministratorStatus = validStatuses.includes(admin.status as AdministratorStatus)
            ? (admin.status as AdministratorStatus)
            : 'INACTIVE';

        return {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            status,
            role: 'Administrator', // Valor predeterminado
            permissions: [], // Valor predeterminado
            personalInfo: {
                phone: admin.personalInfo?.phone || '',
                lastName: admin.personalInfo?.lastName || '',
                avatarUrl: admin.personalInfo?.avatarUrl || null,
                firstName: admin.personalInfo?.firstName || '',
            },
            createdAt: new Date().toISOString(), // Valor predeterminado
            updatedAt: new Date().toISOString(), // Valor predeterminado
            deletedAt: null, // Valor predeterminado
            lastLogin: new Date().toISOString(), // Valor predeterminado
        };
    });

    return (
        <div className="p-4">
            <AdminList administrators={administrators} />
        </div>
    );
}
