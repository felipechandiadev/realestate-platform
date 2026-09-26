'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { getUserFavoriteProperties } from '@/features/shared/users/actions/users.action';
import { Alert } from "@realestate/ui";
import { Card } from "@realestate/ui";
import PropertyCard from '../ui/PropertyCard';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, LogIn } from 'lucide-react';
import { Button } from '@realestate/ui';

export default function FavoritesPage() {
  const { user, status } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadFavorites() {
      // Usamos el ID de la sesión actual si está disponible
      const currentUserId = user?.id;
      
      console.log('[FavoritesPage] Attempting to load favorites. Status:', status, 'UserID:', currentUserId);

      if (currentUserId) {
        try {
          setLoading(true);
          setError(null);
          const result = await getUserFavoriteProperties(currentUserId);
          console.log('[FavoritesPage] Received properties:', result.length);
          
          // Convert properties to the format expected by PropertyCard
          const mappedFavorites = result.map((p: any) => ({
            ...p,
            currencyPrice: p.currencyPrice || p.currency, // Handle mapping differences if any
          }));
          setFavorites(mappedFavorites);
        } catch (err) {
          console.error('[FavoritesPage] Error loading favorites:', err);
          setError('No pudimos cargar tus propiedades favoritas. Por favor, intenta de nuevo más tarde.');
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        console.log('[FavoritesPage] User is unauthenticated, stopping load');
        setLoading(false);
      } else {
        console.log('[FavoritesPage] Still waiting for user session...');
      }
    }

    loadFavorites();
  }, [user?.id, status]);

  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={40} aria-label="Cargando" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="p-10 text-center flex flex-col items-center">
          <LogIn className="text-primary mb-4" size={48} />
          <h1 className="text-2xl font-bold text-foreground mb-2">Inicia sesión</h1>
          <p className="text-muted-foreground mb-6">
            Debes iniciar sesión para ver tus favoritos.
          </p>
          <Button onClick={() => window.dispatchEvent(new Event('portal:open-login'))}>
            Ingresar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mis Favoritos</h1>
        <p className="text-muted-foreground mt-2">Accede rápidamente a las propiedades que más te interesan.</p>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {favorites.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
          <Heart className="text-muted-foreground mb-4" size={64} />
          <h3 className="text-xl font-medium text-foreground mb-2">Aún no tienes favoritos</h3>
          <p className="text-muted-foreground max-w-md">
            Explora nuestras propiedades y marca las que te gusten para verlas aquí más tarde.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
              href={`/properties/property/${property.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
