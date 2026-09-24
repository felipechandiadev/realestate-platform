/**
 * Our Team Page (Portal)
 * 
 * Propósito:
 * - Presentar equipo de profesionales inmobiliarios
 * - Mostrar perfiles públicos con fotos y bios
 * - Generar confianza mostrando experiencia del equipo
 * - Facilitar contacto con agentes específicos
 * 
 * Funcionalidad:
 * - Server component que fetcha miembros públicos del equipo
 * - Renderiza grid de perfiles con TeamMembersDisplay
 * - Información: nombre, cargo, foto, bio, redes sociales
 * - Fallback si no hay miembros disponibles
 * 
 * Audiencia: Visitantes públicos, clientes potenciales
 */

import React from 'react';
import { getPublicTeamMembers } from '@/features/backoffice/cms/actions/ourTeam.action';
import TeamMembersDisplay from './ui/TeamMembersDisplay';

export default async function OurTeamPage() {
  const result = await getPublicTeamMembers();
  const members = result.success && result.data ? result.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Nuestro Equipo
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Conoce a los profesionales que hacen posible nuestra visión inmobiliaria
        </p>
      </div>

      {/* Team Members Grid - Client Component */}
      <TeamMembersDisplay members={members} />
    </div>
  );
}
