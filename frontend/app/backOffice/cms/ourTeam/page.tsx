/**
 * CMS Our Team / Team Members Management Page
 * 
 * Propósito:
 * - Gestionar equipo visible en sección pública "Nuestro Equipo"
 * - Administrar perfiles de empleados destacados
 * - Búsqueda de miembros del equipo
 * - Cargar fotos y bios de empleados
 * - Acciones: crear, editar, eliminar miembros
 * 
 * Funcionalidad:
 * - Server component: recibe searchParams (search)
 * - Fetcha miembros del equipo desde getTeamMembers action
 * - Renderiza TeamMemberList con listado y búsqueda
 * - Manejo de errores y estados de carga
 * 
 * Audiencia: Administradores, Editores de contenido corporativo
 */

import React from 'react';
import { getTeamMembers } from '@/features/backoffice/cms/actions/ourTeam.action';
import TeamMemberList from './ui/TeamMemberList';

export default async function OurTeamPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params?.search || '';
  const result = await getTeamMembers(search);
  const initialMembers = result.success && result.data ? result.data : [];

  return (
    <main className="p-4">
      <TeamMemberList 
        initialMembers={initialMembers}
        initialSearch={search}
      />
    </main>
  );
}
