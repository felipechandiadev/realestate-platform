/**
 * Property Detail Page (Portal)
 * 
 * Propósito:
 * - Página de detalle de una propiedad específica
 * - Mostrar información completa: fotos, características, precio, ubicación
 * - Facilitar contacto con agente responsable
 * - Integración con favoritos y compartir
 * 
 * Funcionalidad:
 * - Server component con dynamic route [id]
 * - Fetcha propiedad desde endpoint público
 * - Renderiza PropertyDetailClient para interactividad
 * - Galería de imágenes, mapa, features, descripción
 * - Error handling si propiedad no existe
 * - SEO metadata dinámico
 * 
 * Audiencia: Visitantes públicos, clientes potenciales, compradores/arrendatarios
 */

import React from 'react';
import { getPublishedPropertyPublic } from './actions';
import PropertyDetailClient from './PropertyDetailClient';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;

  // Fetch property data on server (public endpoint, no auth required)
  const propertyResult = await getPublishedPropertyPublic(id);

  if (!propertyResult.success || !propertyResult.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Propiedad no encontrada
          </h1>
          {/* Solo mostrar mensaje secundario si es distinto al título */}
          {propertyResult.error && propertyResult.error !== 'Propiedad no encontrada' && (
            <p className="text-muted-foreground">
              {propertyResult.error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Pass data to client component for interactivity
  return <PropertyDetailClient property={propertyResult.data} />;
}
