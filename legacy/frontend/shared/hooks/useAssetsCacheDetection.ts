'use client';

import { useEffect, useState } from 'react';

/**
 * Detecta si los assets están en cache
 * Con Lucide React (SVG), ya no dependemos de fuentes externas
 * Solo espera tiempo mínimo para que splash screen sea visible
 * 
 * Guarda el resultado en sessionStorage para que persista durante navegación cliente
 * 
 * @returns { isReady: boolean, isLoading: boolean, isFromCache: boolean }
 * 
 * isReady = true cuando:
 * - Cache fue detectado (sin espera) O
 * - Pasó 1 segundo mínimo (splash screen elegante)
 */
export function useAssetsCacheDetection() {
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  useEffect(() => {
    const checkCache = async () => {
      const startTime = Date.now();
      const minWaitMs = 1000; // Mínimo 1 segundo para splash screen elegante
      const CACHE_DETECTION_KEY = 'app_assets_from_cache';

      try {
        // Verificar si ya detectamos cache en esta sesión
        const cachedResult = sessionStorage.getItem(CACHE_DETECTION_KEY);
        if (cachedResult !== null) {
          // Usar resultado guardado de sesiones anteriores en esta app
          const allFromCache = cachedResult === 'true';
          setIsFromCache(allFromCache);
          
          // Si está en cache, espera mínima (300ms)
          // Si no está en cache, espera estándar (1000ms)
          const waitMs = allFromCache ? 300 : minWaitMs;
          const elapsedMs = Date.now() - startTime;
          
          if (elapsedMs < waitMs) {
            await new Promise(resolve => setTimeout(resolve, waitMs - elapsedMs));
          }
          
          setIsReady(true);
          return;
        }

        // Detectar si assets están en cache (transfer size = 0)
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const allFromCache = resources.length > 0 && resources.every(r => r.transferSize === 0);
        setIsFromCache(allFromCache);

        // Guardar en sessionStorage para navegación posterior
        sessionStorage.setItem(CACHE_DETECTION_KEY, String(allFromCache));

        // Si está en cache, mostrar loader más corto
        // Si no está en cache, esperar al menos 1 segundo para splash elegante
        const waitMs = allFromCache ? 300 : minWaitMs;
        const elapsedMs = Date.now() - startTime;
        
        if (elapsedMs < waitMs) {
          await new Promise(resolve => setTimeout(resolve, waitMs - elapsedMs));
        }

        setIsReady(true);
      } catch (error) {
        console.error('[useAssetsCacheDetection] Error:', error);
        
        // Fallback: esperar 1 segundo mínimo
        const elapsedMs = Date.now() - startTime;
        if (elapsedMs < minWaitMs) {
          await new Promise(resolve => setTimeout(resolve, minWaitMs - elapsedMs));
        }
        
        setIsReady(true);
      }
    };

    // Pequeño delay para que performance API registre recursos
    const timer = setTimeout(() => {
      checkCache();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    isFromCache,
    isReady: isReady ?? false,
    isLoading: isReady === null,
  };
}
