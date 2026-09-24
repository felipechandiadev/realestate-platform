// Action para obtener tipos de propiedad con características
'use server';

export interface PropertyTypeWithFeatures {
  id: string;
  name: string;
  hasBedrooms: boolean;
  hasBathrooms: boolean;
  hasParkingSpaces: boolean;
}

export async function getPropertyTypesWithFeatures(): Promise<PropertyTypeWithFeatures[]> {
  try {
    // Public endpoint - no auth required
    const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || process.env.AUTH_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/property-types/features`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch property types with features: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching property types with features:', error);
    return [];
  }
}
